<?php

declare(strict_types=1);

namespace Clinic;

/**
 * Demo data: three practitioners, their hours and appointment types, the staff accounts,
 * and a few weeks of patients and appointments around today.
 */
final class Seed
{
    public const PASSWORD = 'demo1234';
    public const RECEPTION = 'accueil@centre-elamel.dz';
    public const DOCTOR = 'dr.mansouri@centre-elamel.dz';

    private const FIRST = ['Amine', 'Lina', 'Walid', 'Meriem', 'Sofiane', 'Imene', 'Rayan', 'Yasmine', 'Bilal', 'Asma', 'Hichem', 'Nour', 'Islam', 'Feriel', 'Anis', 'Rania', 'Mehdi', 'Khadidja', 'Oussama', 'Selma', 'Riad', 'Chaima', 'Fares', 'Manel', 'Adel', 'Ines', 'Zakaria', 'Hadjer', 'Nassim', 'Douaa', 'Ayoub', 'Sabrina', 'Younes', 'Amel', 'Haithem', 'Wissal', 'Samir', 'Maroua', 'Akram', 'Djihane', 'Mohamed', 'Fatima', 'Omar', 'Aicha', 'Karim', 'Nadia'];
    private const LAST = ['Bouzid', 'Hamdi', 'Saidi', 'Mebarki', 'Rahmani', 'Benkhaled', 'Ziani', 'Chabane', 'Belkacem', 'Aouadi', 'Gherbi', 'Lounis', 'Merabet', 'Brahimi', 'Djebbar', 'Kaci', 'Boukhalfa', 'Ferhat', 'Slimani', 'Bensalem'];

    public static function practitioners(): array
    {
        return [
            [
                'slug' => 'dr-belaid', 'name' => 'Dr Amira Belaïd', 'specialty' => 'general', 'room' => 'Cabinet 1', 'color' => '#2563eb', 'slot_minutes' => 20,
                'title' => ['fr' => 'Médecin généraliste', 'ar' => 'طبيبة عامة', 'en' => 'General practitioner'],
                'bio' => ['fr' => 'Consultations adultes et enfants, suivi des maladies chroniques (tension, diabète), certificats médicaux.', 'ar' => 'فحوصات للكبار والأطفال، متابعة الأمراض المزمنة (الضغط والسكري)، شهادات طبية.', 'en' => 'Consultations for adults and children, follow-up of chronic conditions (blood pressure, diabetes), medical certificates.'],
                'types' => [
                    ['consultation', ['fr' => 'Consultation', 'ar' => 'فحص طبي', 'en' => 'Consultation'], 20, 2000],
                    ['suivi', ['fr' => 'Suivi tension ou diabète', 'ar' => 'متابعة الضغط أو السكري', 'en' => 'Blood pressure or diabetes follow-up'], 20, 1500],
                    ['certificat', ['fr' => 'Certificat médical', 'ar' => 'شهادة طبية', 'en' => 'Medical certificate'], 20, 1000],
                ],
                // 0 = Sunday … 6 = Saturday; closed on Friday
                'hours' => [6 => [['08:30', '12:00'], ['13:30', '16:30']], 0 => [['08:30', '12:00'], ['13:30', '16:30']], 1 => [['08:30', '12:00'], ['13:30', '16:30']], 2 => [['08:30', '12:00'], ['13:30', '16:30']], 3 => [['08:30', '12:00'], ['13:30', '16:30']], 4 => [['08:30', '12:00']]],
            ],
            [
                'slug' => 'dr-mansouri', 'name' => 'Dr Karim Mansouri', 'specialty' => 'dentist', 'room' => 'Cabinet 2', 'color' => '#0d9488', 'slot_minutes' => 15,
                'title' => ['fr' => 'Chirurgien-dentiste', 'ar' => 'جراح أسنان', 'en' => 'Dentist'],
                'bio' => ['fr' => 'Soins dentaires, détartrage, urgences douleur. Un créneau d\'urgence est gardé chaque jour.', 'ar' => 'علاج الأسنان وإزالة الجير والحالات الاستعجالية. يُحجز موعد للطوارئ كل يوم.', 'en' => 'Dental care, scaling, emergencies for pain. One emergency slot is kept every day.'],
                'types' => [
                    ['consultation', ['fr' => 'Consultation', 'ar' => 'فحص', 'en' => 'Check-up'], 15, 1500],
                    ['detartrage', ['fr' => 'Détartrage', 'ar' => 'إزالة الجير', 'en' => 'Scaling'], 30, 3000],
                    ['soin', ['fr' => 'Soin d\'une carie', 'ar' => 'علاج تسوس', 'en' => 'Cavity filling'], 45, 4000],
                    ['urgence', ['fr' => 'Urgence douleur', 'ar' => 'استعجال ألم', 'en' => 'Toothache emergency'], 15, 2000],
                ],
                'hours' => [6 => [['09:00', '12:30']], 0 => [['09:00', '12:30'], ['14:00', '17:00']], 1 => [['09:00', '12:30'], ['14:00', '17:00']], 2 => [['09:00', '12:30'], ['14:00', '17:00']], 3 => [['09:00', '12:30'], ['14:00', '17:00']], 4 => [['09:00', '12:30'], ['14:00', '17:00']]],
            ],
            [
                'slug' => 'dr-haddad', 'name' => 'Dr Lina Haddad', 'specialty' => 'pediatrics', 'room' => 'Cabinet 3', 'color' => '#db2777', 'slot_minutes' => 15,
                'title' => ['fr' => 'Pédiatre', 'ar' => 'طبيبة أطفال', 'en' => 'Pediatrician'],
                'bio' => ['fr' => 'Suivi du nourrisson et de l\'enfant, vaccinations du calendrier national, consultations d\'urgence.', 'ar' => 'متابعة الرضيع والطفل، التلقيحات حسب الرزنامة الوطنية، فحوصات استعجالية.', 'en' => 'Infant and child follow-up, national vaccination schedule, urgent consultations.'],
                'types' => [
                    ['consultation', ['fr' => 'Consultation', 'ar' => 'فحص طبي', 'en' => 'Consultation'], 30, 2500],
                    ['vaccination', ['fr' => 'Vaccination', 'ar' => 'تلقيح', 'en' => 'Vaccination'], 15, 1000],
                    ['nourrisson', ['fr' => 'Suivi du nourrisson', 'ar' => 'متابعة الرضيع', 'en' => 'Infant check-up'], 30, 2000],
                ],
                'hours' => [6 => [['08:00', '12:00'], ['14:00', '17:00']], 0 => [['08:00', '12:00'], ['14:00', '17:00']], 1 => [['08:00', '12:00'], ['14:00', '17:00']], 2 => [['08:00', '12:00'], ['14:00', '17:00']], 3 => [['08:00', '12:00'], ['14:00', '17:00']]],
            ],
        ];
    }

    public static function run(Db $db, bool $withHistory = true): array
    {
        $now = Clock::now();
        $ids = [];
        foreach (self::practitioners() as $p) {
            $id = $db->insert('practitioners', ['slug' => $p['slug'], 'name' => $p['name'], 'specialty' => $p['specialty'], 'title' => Db::json($p['title']), 'bio' => Db::json($p['bio']), 'room' => $p['room'], 'color' => $p['color'], 'slot_minutes' => $p['slot_minutes'], 'active' => 1]);
            $ids[$p['slug']] = $id;
            foreach ($p['types'] as [$code, $label, $minutes, $price]) {
                $db->insert('appointment_types', ['practitioner_id' => $id, 'code' => $code, 'label' => Db::json($label), 'minutes' => $minutes, 'price_da' => $price]);
            }
            foreach ($p['hours'] as $weekday => $ranges) {
                foreach ($ranges as [$start, $end]) {
                    $db->insert('schedules', ['practitioner_id' => $id, 'weekday' => $weekday, 'start_time' => $start, 'end_time' => $end]);
                }
            }
        }
        $hash = password_hash(self::PASSWORD, PASSWORD_DEFAULT);
        $db->insert('users', ['name' => 'Samira Rahal', 'email' => self::RECEPTION, 'password_hash' => $hash, 'role' => 'reception', 'practitioner_id' => null]);
        $db->insert('users', ['name' => 'Karim Mansouri', 'email' => self::DOCTOR, 'password_hash' => $hash, 'role' => 'doctor', 'practitioner_id' => $ids['dr-mansouri']]);
        // National holiday: 1 November (Revolution Day), closed for the whole clinic
        $nov1 = Clock::parse($now->format('Y') . '-11-01');
        if ($nov1 < $now->modify('-1 day')) {
            $nov1 = $nov1->modify('+1 year');
        }
        $db->insert('closures', ['practitioner_id' => null, 'starts_at' => Clock::sql($nov1), 'ends_at' => Clock::sql($nov1->modify('+1 day')), 'reason' => 'Fête de la Révolution']);

        $count = $withHistory ? self::history($db, $ids, $now) : 0;
        return ['practitioners' => count($ids), 'appointments' => $count];
    }

    /** About three weeks of past appointments and the next two weeks partly booked */
    private static function history(Db $db, array $ids, \DateTimeImmutable $now): int
    {
        mt_srand(20261024);
        $patients = [];
        foreach (self::FIRST as $i => $first) {
            $phone = '0' . [5, 6, 7][$i % 3] . str_pad((string) (mt_rand(10000000, 99999999)), 8, '0', STR_PAD_LEFT);
            $patients[] = $db->insert('patients', ['name' => $first . ' ' . self::LAST[($i * 7) % count(self::LAST)], 'phone' => $phone, 'email' => '', 'birth_year' => mt_rand(1950, 2022), 'lang' => ['fr', 'ar', 'fr', 'en'][$i % 4], 'created_at' => Clock::sql($now->modify('-' . mt_rand(30, 400) . ' days'))]);
        }
        $types = [];
        foreach ($db->all('SELECT * FROM appointment_types') as $t) {
            $types[$t['practitioner_id']][] = $t;
        }
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $total = 0;
        $today = Clock::parse($now->format('Y-m-d'));
        foreach ($ids as $pid) {
            $p = $db->one('SELECT * FROM practitioners WHERE id = ?', [$pid]);
            for ($d = $today->modify('-21 days'); $d <= $today->modify('+13 days'); $d = $d->modify('+1 day')) {
                $future = $d > $today;
                $fill = $future ? max(0.15, 0.75 - 0.05 * (int) $today->diff($d)->days) : 0.8;
                // Use the staff view of the grid so past days can be filled too
                $type = $types[$pid][0];
                $grid = self::grid($db, $p, $d, (int) $type['minutes']);
                foreach ($grid as $time) {
                    if (mt_rand() / mt_getrandmax() > $fill) {
                        continue;
                    }
                    $t = $types[$pid][mt_rand(0, count($types[$pid]) - 1)];
                    $start = Clock::parse($d->format('Y-m-d') . ' ' . $time);
                    $end = $start->modify('+' . $t['minutes'] . ' minutes');
                    $overlap = $db->value("SELECT 1 FROM appointments WHERE practitioner_id = ? AND status <> 'cancelled' AND starts_at < ? AND ends_at > ?", [$pid, Clock::sql($end), Clock::sql($start)]);
                    $closed = $db->value('SELECT 1 FROM closures WHERE (practitioner_id = ? OR practitioner_id IS NULL) AND starts_at < ? AND ends_at > ?', [$pid, Clock::sql($end), Clock::sql($start)]);
                    if ($overlap || $closed || !self::fits($db, $p, $start, $end)) {
                        continue;
                    }
                    $isPast = $end <= $now;
                    $isNow = $start <= $now && $end > $now;
                    $roll = mt_rand(1, 100);
                    $status = $isPast ? ($roll <= 9 ? 'no_show' : 'done') : ($isNow ? 'arrived' : 'booked');
                    if ($d->format('Y-m-d') === $today->format('Y-m-d') && !$isPast && !$isNow && $roll <= 20) {
                        $status = 'arrived';
                    }
                    if ($d->format('Y-m-d') === $today->format('Y-m-d') && $start > $now->modify('+30 minutes')) {
                        $status = 'booked';
                    }
                    $ref = 'EA-';
                    for ($i = 0; $i < 6; $i++) {
                        $ref .= $alphabet[mt_rand(0, strlen($alphabet) - 1)];
                    }
                    $created = $start->modify('-' . mt_rand(1, 12) . ' days');
                    $db->insert('appointments', [
                        'ref' => $ref, 'practitioner_id' => $pid, 'type_id' => $t['id'], 'patient_id' => $patients[mt_rand(0, count($patients) - 1)],
                        'starts_at' => Clock::sql($start), 'ends_at' => Clock::sql($end), 'status' => $status,
                        'source' => ['online', 'online', 'online', 'phone', 'walk_in'][mt_rand(0, 4)], 'note' => null,
                        'created_at' => Clock::sql($created < $now ? $created : $now), 'cancelled_at' => null,
                        'reminder_sent_at' => $isPast ? Clock::sql($start->modify('-1 day')) : null,
                    ]);
                    $total++;
                }
            }
        }
        // A few cancellations, so the history looks real
        $db->run("UPDATE appointments SET status = 'cancelled', cancelled_at = created_at WHERE id % 23 = 0 AND status = 'booked'");
        return $total;
    }

    private static function grid(Db $db, array $p, \DateTimeImmutable $day, int $minutes): array
    {
        $times = [];
        foreach ($db->all('SELECT start_time, end_time FROM schedules WHERE practitioner_id = ? AND weekday = ?', [$p['id'], (int) $day->format('w')]) as $h) {
            for ($t = Clock::parse($day->format('Y-m-d') . ' ' . $h['start_time']); $t->modify("+$minutes minutes") <= Clock::parse($day->format('Y-m-d') . ' ' . $h['end_time']); $t = $t->modify('+' . $p['slot_minutes'] . ' minutes')) {
                $times[] = $t->format('H:i');
            }
        }
        return $times;
    }

    private static function fits(Db $db, array $p, \DateTimeImmutable $start, \DateTimeImmutable $end): bool
    {
        foreach ($db->all('SELECT start_time, end_time FROM schedules WHERE practitioner_id = ? AND weekday = ?', [$p['id'], (int) $start->format('w')]) as $h) {
            if ($start->format('H:i') >= $h['start_time'] && $end->format('H:i') <= $h['end_time']) {
                return true;
            }
        }
        return false;
    }
}
