<?php

declare(strict_types=1);

namespace Clinic\Tests;

use Clinic\Clock;
use Clinic\Seed;

final class DeskTest extends ApiTestCase
{
    public function testSignInAndRoles(): void
    {
        $this->assertSame(401, $this->call('POST', '/api/auth/login', ['email' => Seed::RECEPTION, 'password' => 'nope'])[0]);
        $this->assertSame(401, $this->call('GET', '/api/staff/agenda')[0]);
        $this->assertSame(401, $this->call('GET', '/api/staff/agenda', [], 'forged.token')[0]);
        $doctor = $this->login(Seed::DOCTOR);
        $this->assertSame(403, $this->call('GET', '/api/staff/stats', [], $doctor)[0]);
        $this->assertSame(403, $this->call('POST', '/api/staff/closures', [], $doctor)[0]);
        $this->assertSame('doctor', $this->call('GET', '/api/auth/me', [], $doctor)[1]['user']['role']);
    }

    public function testTokensExpire(): void
    {
        $token = $this->login(Seed::RECEPTION);
        Clock::freeze('2026-10-27 10:06');
        $this->assertSame(401, $this->call('GET', '/api/staff/agenda', [], $token)[0]);
    }

    public function testDayAgendaForReceptionAndForADoctor(): void
    {
        $this->book(['practitioner' => 'dr-mansouri', 'type' => 'detartrage', 'date' => '2026-10-26', 'time' => '14:00']);
        $this->book(['date' => '2026-10-26', 'time' => '13:30', 'patient' => ['phone' => '0770112233', 'name' => 'Amel Kaci']]);

        [, $day] = $this->call('GET', '/api/staff/agenda?date=2026-10-26', [], $this->login(Seed::RECEPTION));
        $this->assertCount(3, $day['practitioners']);
        $this->assertSame(2, $day['counts']['total']);
        $this->assertSame('13:30', $day['practitioners'][0]['hours'][1]['start']);
        $this->assertSame('Amel Kaci', $day['practitioners'][0]['appointments'][0]['patient']['name']);

        [, $mine] = $this->call('GET', '/api/staff/agenda?date=2026-10-26', [], $this->login(Seed::DOCTOR));
        $this->assertSame(['dr-mansouri'], array_column($mine['practitioners'], 'slug'), 'a doctor only sees their own agenda');
    }

    public function testArrivalsNoShowsAndNotes(): void
    {
        [, $a] = $this->book(['date' => '2026-10-26', 'time' => '11:10']);
        $id = (int) $this->db->value('SELECT id FROM appointments WHERE ref = ?', [$a['ref']]);
        $reception = $this->login(Seed::RECEPTION);
        [$status, $row] = $this->call('PATCH', "/api/staff/appointments/$id", ['status' => 'arrived'], $reception);
        $this->assertSame(200, $status);
        $this->assertSame('arrived', $row['status']);
        $this->assertSame(400, $this->call('PATCH', "/api/staff/appointments/$id", ['status' => 'teleported'], $reception)[0]);

        // A doctor can't touch another practitioner's patients
        $this->assertSame(403, $this->call('PATCH', "/api/staff/appointments/$id", ['status' => 'done'], $this->login(Seed::DOCTOR))[0]);

        [, $later] = $this->book(['time' => '09:30', 'patient' => ['phone' => '0550998877']]);
        $laterId = (int) $this->db->value('SELECT id FROM appointments WHERE ref = ?', [$later['ref']]);
        $this->assertSame(409, $this->call('PATCH', "/api/staff/appointments/$laterId", ['status' => 'no_show'], $reception)[0], 'tomorrow can\'t be a no-show yet');
        [, $noted] = $this->call('PATCH', "/api/staff/appointments/$laterId", ['note' => '  Allergie pénicilline  '], $reception);
        $this->assertSame('Allergie pénicilline', $noted['note']);
    }

    public function testWalkInsAndPhoneBookingsAtTheDesk(): void
    {
        $reception = $this->login(Seed::RECEPTION);
        [, $slots] = $this->call('GET', '/api/staff/availability?practitioner=dr-haddad&type=vaccination&date=2026-10-26', [], $reception);
        $this->assertSame('10:00', $slots['slots'][0], 'the desk can book right now, unlike patients online');
        [$status, $walkIn] = $this->call('POST', '/api/staff/appointments', [
            'practitioner' => 'dr-haddad', 'type' => 'vaccination', 'date' => '2026-10-26', 'time' => '10:00', 'source' => 'walk_in',
            'patient' => ['name' => 'Rayan Ziani', 'phone' => '0699887766', 'birth_year' => 2024],
        ], $reception);
        $this->assertSame(201, $status);
        $this->assertSame('arrived', $walkIn['status']);
        $this->assertSame(0, (int) $this->db->value('SELECT COUNT(*) FROM sms_outbox'), 'no SMS for someone standing at the desk');
        $this->assertSame(403, $this->call('POST', '/api/staff/appointments', [], $this->login(Seed::DOCTOR))[0]);
    }

    public function testAbsencesBlockSlotsAndListPatientsToCall(): void
    {
        $this->book(['practitioner' => 'dr-mansouri', 'type' => 'consultation', 'date' => '2026-10-28', 'time' => '09:00']);
        $reception = $this->login(Seed::RECEPTION);
        $mansouri = (int) $this->db->value("SELECT id FROM practitioners WHERE slug = 'dr-mansouri'");
        [$status, $res] = $this->call('POST', '/api/staff/closures', ['practitioner_id' => $mansouri, 'starts_at' => '2026-10-28 00:00', 'ends_at' => '2026-10-29 00:00', 'reason' => 'Congrès'], $reception);
        $this->assertSame(201, $status);
        $this->assertSame('Sara Mansouri', $res['to_call'][0]['name']);
        [, $avail] = $this->call('GET', '/api/availability?practitioner=dr-mansouri&type=consultation&from=2026-10-28&days=1');
        $this->assertSame([], $avail['days'][0]['slots']);
        $this->assertSame(400, $this->call('POST', '/api/staff/closures', ['starts_at' => '2026-10-29 10:00', 'ends_at' => '2026-10-29 09:00'], $reception)[0]);
        $this->assertSame(200, $this->call('DELETE', "/api/staff/closures/{$res['id']}", [], $reception)[0]);
        [, $avail] = $this->call('GET', '/api/availability?practitioner=dr-mansouri&type=consultation&from=2026-10-28&days=1');
        $this->assertNotEmpty($avail['days'][0]['slots']);
    }

    public function testRemindersAreSentOnceForTomorrow(): void
    {
        $this->book();
        $this->book(['date' => '2026-10-28', 'patient' => ['phone' => '0550112233']]);
        $reception = $this->login(Seed::RECEPTION);
        $this->assertSame(1, $this->call('POST', '/api/staff/reminders', [], $reception)[1]['sent']);
        $this->assertSame(0, $this->call('POST', '/api/staff/reminders', [], $reception)[1]['sent']);
        [, $outbox] = $this->call('GET', '/api/staff/sms', [], $reception);
        $this->assertSame(['reminder', 'confirm', 'confirm'], array_column($outbox, 'kind'));
        $this->assertStringContainsString('demain 27/10 à 09:10', $outbox[0]['body']);
    }

    public function testPatientSearchAndHistory(): void
    {
        $this->book();
        $reception = $this->login(Seed::RECEPTION);
        [, $found] = $this->call('GET', '/api/staff/patients?q=0661', [], $reception);
        $this->assertSame('Sara Mansouri', $found[0]['name']);
        $this->assertSame(1, $found[0]['visits']);
        [, $patient] = $this->call('GET', "/api/staff/patients/{$found[0]['id']}", [], $reception);
        $this->assertSame('Dr Amira Belaïd', $patient['history'][0]['practitioner']);
        $this->assertSame('Consultation', $patient['history'][0]['type']['fr']);
    }

    public function testStatistics(): void
    {
        // Two appointments last week: one seen, one no-show
        foreach ([['2026-10-20 09:00', 'done', 'online'], ['2026-10-20 09:20', 'no_show', 'phone']] as $i => [$at, $status, $source]) {
            $pid = $this->db->insert('patients', ['name' => "P$i", 'phone' => "055000000$i", 'email' => '', 'birth_year' => null, 'lang' => 'fr', 'created_at' => '2026-10-01 10:00:00']);
            $this->db->insert('appointments', ['ref' => "EA-TEST0$i", 'practitioner_id' => 1, 'type_id' => 1, 'patient_id' => $pid, 'starts_at' => "$at:00",
                'ends_at' => Clock::sql(Clock::parse($at)->modify('+20 minutes')), 'status' => $status, 'source' => $source, 'created_at' => '2026-10-15 10:00:00']);
        }
        [, $stats] = $this->call('GET', '/api/staff/stats?days=30', [], $this->login(Seed::RECEPTION));
        $this->assertSame(2, $stats['appointments']);
        $this->assertSame(50, $stats['no_show_rate']);
        $this->assertSame(50, $stats['online_share']);
        $this->assertCount(30, $stats['per_day']);
        $this->assertSame(2, array_column($stats['per_day'], 'count', 'date')['2026-10-20']);
        $this->assertSame('2026-10-25', end($stats['per_day'])['date'], 'up to yesterday');
        $this->assertSame([2, 0, 0], array_column($stats['practitioners'], 'appointments'));
        $this->assertSame(0, $stats['practitioners'][0]['occupancy'], '40 minutes out of a month of opening hours');
    }

    public function testMigrationsCanRunAgain(): void
    {
        $this->db->migrate();
        $this->assertSame(3, (int) $this->db->value('SELECT COUNT(*) FROM practitioners'));
    }

    public function testDemoHistorySeedFillsTheAgendaConsistently(): void
    {
        $this->db->run('DELETE FROM sms_outbox');
        foreach (['appointments', 'closures', 'users', 'schedules', 'appointment_types', 'patients', 'practitioners'] as $table) {
            $this->db->run("DELETE FROM $table");
        }
        $result = Seed::run($this->db);
        $this->assertGreaterThan(150, $result['appointments']);
        $overlaps = $this->db->value("SELECT COUNT(*) FROM appointments a JOIN appointments b ON a.practitioner_id = b.practitioner_id AND a.id < b.id
            AND a.status <> 'cancelled' AND b.status <> 'cancelled' AND a.starts_at < b.ends_at AND b.starts_at < a.ends_at");
        $this->assertSame(0, (int) $overlaps, 'no double bookings in the demo data');
        $this->assertSame(0, (int) $this->db->value("SELECT COUNT(*) FROM appointments WHERE status IN ('done', 'no_show') AND ends_at > ?", [Clock::sql(Clock::now())]));
    }
}
