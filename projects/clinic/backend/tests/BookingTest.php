<?php

declare(strict_types=1);

namespace Clinic\Tests;

use Clinic\Clock;

final class BookingTest extends ApiTestCase
{
    public function testPractitionersComeWithTheirAppointmentTypesAndHours(): void
    {
        [$status, $list] = $this->call('GET', '/api/practitioners');
        $this->assertSame(200, $status);
        $this->assertSame(['dr-belaid', 'dr-mansouri', 'dr-haddad'], array_column($list, 'slug'));
        $dentist = $list[1];
        $this->assertSame(['consultation', 'detartrage', 'soin', 'urgence'], array_column($dentist['types'], 'code'));
        $this->assertSame('Chirurgien-dentiste', $dentist['title']['fr']);
        $this->assertNotContains(5, array_column($dentist['hours'], 'weekday'), 'closed on Friday');
    }

    public function testSlotsFollowOpeningHoursTheGridAndTheOneHourNotice(): void
    {
        [, $res] = $this->call('GET', '/api/availability?practitioner=dr-belaid&type=consultation&from=2026-10-26&days=7');
        $days = array_column($res['days'], 'slots', 'date');
        // Monday 10:05: the first online slot is at least an hour later, on the 20-minute grid
        $this->assertSame('11:10', $days['2026-10-26'][0]);
        $this->assertSame('11:30', $days['2026-10-26'][1]);
        $this->assertContains('13:30', $days['2026-10-26']);
        $this->assertNotContains('12:00', $days['2026-10-26'], 'lunch break');
        $this->assertSame([], $days['2026-10-30'], 'closed on Friday');
        $this->assertSame('08:30', $days['2026-10-29'][0]);
        $this->assertSame('11:30', end($days['2026-10-29']), 'Thursday: mornings only');
    }

    public function testLongAppointmentsMustFitBeforeClosing(): void
    {
        [, $res] = $this->call('GET', '/api/availability?practitioner=dr-mansouri&type=soin&from=2026-10-27&days=1');
        $slots = $res['days'][0]['slots'];
        $this->assertSame('11:45', $slots[array_search('11:45', $slots, true)]);
        $this->assertNotContains('12:00', $slots, 'a 45-minute filling started at 12:00 would end after 12:30');
    }

    public function testNationalHolidayClosesTheWholeClinic(): void
    {
        foreach (['dr-belaid', 'dr-mansouri', 'dr-haddad'] as $slug) {
            [, $res] = $this->call('GET', "/api/availability?practitioner=$slug&type=consultation&from=2026-11-01&days=1");
            $this->assertSame([], $res['days'][0]['slots'], "$slug on 1 November");
        }
    }

    public function testBookingConfirmsBySmsAndTakesTheSlot(): void
    {
        [$status, $a] = $this->book(['patient' => ['lang' => 'ar']]);
        $this->assertSame(201, $status);
        $this->assertMatchesRegularExpression('/^EA-[A-Z0-9]{6}$/', $a['ref']);
        $this->assertSame('2026-10-27T09:10', $a['starts_at']);
        $this->assertSame('2026-10-27T09:30', $a['ends_at']);
        $this->assertSame('•••• 4567', $a['patient']['phone'], 'the full phone number is not returned');

        $sms = $this->db->one('SELECT * FROM sms_outbox');
        $this->assertSame('0661234567', $sms['phone']);
        $this->assertStringContainsString('تم تأكيد موعدك', $sms['body'], 'in the patient\'s language');
        $this->assertStringContainsString($a['ref'], $sms['body']);

        [, $res] = $this->call('GET', '/api/availability?practitioner=dr-belaid&type=consultation&from=2026-10-27&days=1');
        $this->assertNotContains('09:10', $res['days'][0]['slots']);
        [$again] = $this->book(['patient' => ['phone' => '0770000000']]);
        $this->assertSame(409, $again, 'the same slot can\'t be booked twice');
    }

    public function testAppointmentsCantOverlapAcrossTypes(): void
    {
        $this->book(['practitioner' => 'dr-mansouri', 'type' => 'soin', 'time' => '09:00']);   // 09:00–09:45
        [, $res] = $this->call('GET', '/api/availability?practitioner=dr-mansouri&type=consultation&from=2026-10-27&days=1');
        $this->assertSame('09:45', $res['days'][0]['slots'][0]);
    }

    public function testValidationMessages(): void
    {
        $this->assertSame('Please enter a valid mobile number (05, 06 or 07 + 8 digits)', $this->book(['patient' => ['phone' => '0212345678']])[1]['error']);
        $this->assertSame("Please enter the patient's full name", $this->book(['patient' => ['name' => 'A']])[1]['error']);
        $this->assertSame('Please accept to receive SMS about this appointment', $this->book(['consent' => false])[1]['error']);
        $this->assertSame('Please enter a valid birth year', $this->book(['patient' => ['birth_year' => 1800]])[1]['error']);
        $this->assertSame(409, $this->book(['time' => '12:10'])[0], 'outside opening hours');
        $this->assertSame(409, $this->book(['date' => '2026-10-26', 'time' => '10:30'])[0], 'less than an hour ahead');
        $this->assertSame(404, $this->book(['practitioner' => 'dr-nobody'])[0]);
    }

    public function testInternationalFormatIsAcceptedAndPatientsAreRecognized(): void
    {
        $this->book(['patient' => ['phone' => '+213 661 23 45 67']]);
        $this->book(['time' => '09:30', 'patient' => ['phone' => '0661234567', 'name' => 'Sara Mansouri-Belkacem']]);
        $this->assertSame(1, (int) $this->db->value('SELECT COUNT(*) FROM patients'));
        $this->assertSame('Sara Mansouri-Belkacem', $this->db->value('SELECT name FROM patients'));
        [$status, $err] = $this->book(['time' => '09:50']);
        $this->assertSame(409, $status);
        $this->assertSame('You already have 2 upcoming appointments', $err['error']);
    }

    public function testPatientsFindAndCancelWithTheirPhoneNumber(): void
    {
        [, $a] = $this->book();
        $this->assertSame(404, $this->call('POST', "/api/appointments/{$a['ref']}/lookup", ['phone' => '0550000000'])[0]);
        [$status, $found] = $this->call('POST', '/api/appointments/' . strtolower($a['ref']) . '/lookup', ['phone' => '0661234567']);
        $this->assertSame(200, $status);
        $this->assertTrue($found['can_cancel']);

        [$status, $cancelled] = $this->call('POST', "/api/appointments/{$a['ref']}/cancel", ['phone' => '0661 23 45 67']);
        $this->assertSame(200, $status);
        $this->assertSame('cancelled', $cancelled['status']);
        $this->assertSame('cancel', $this->db->value('SELECT kind FROM sms_outbox ORDER BY id DESC LIMIT 1'));
        [, $res] = $this->call('GET', '/api/availability?practitioner=dr-belaid&type=consultation&from=2026-10-27&days=1');
        $this->assertContains('09:10', $res['days'][0]['slots'], 'the slot is free again');
        $this->assertSame(409, $this->call('POST', "/api/appointments/{$a['ref']}/cancel", ['phone' => '0661234567'])[0]);
    }

    public function testNoOnlineCancellationInTheLastTwoHours(): void
    {
        [, $a] = $this->book();
        Clock::freeze('2026-10-27 07:30');
        [$status, $err] = $this->call('POST', "/api/appointments/{$a['ref']}/cancel", ['phone' => '0661234567']);
        $this->assertSame(409, $status);
        $this->assertStringContainsString('call the clinic', $err['error']);
    }
}
