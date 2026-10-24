<?php

declare(strict_types=1);

namespace Clinic;

/**
 * Booking, looking up and cancelling appointments, for patients online and for the reception.
 */
final class Bookings
{
    public const MAX_UPCOMING = 2;        // per patient, to keep slots for everyone
    public const CANCEL_NOTICE_HOURS = 2; // online cancellation until 2 hours before

    public function __construct(
        private readonly Db $db,
        private readonly Catalog $catalog,
        private readonly Availability $availability,
        private readonly Sms $sms,
    ) {
    }

    /** Normalizes Algerian mobile numbers: "+213 661 23 45 67" -> "0661234567" */
    public static function phone(string $raw): string
    {
        $p = preg_replace('/[\s.\-()]/', '', $raw);
        $p = preg_replace('/^(\+|00)213/', '0', $p);
        if (!preg_match('/^0[5-7]\d{8}$/', $p)) {
            throw new HttpError(400, 'Please enter a valid mobile number (05, 06 or 07 + 8 digits)');
        }
        return $p;
    }

    public static function patientInput(array $in): array
    {
        $name = trim(preg_replace('/\s+/', ' ', (string) ($in['name'] ?? '')));
        if (mb_strlen($name) < 3 || mb_strlen($name) > 120) {
            throw new HttpError(400, 'Please enter the patient\'s full name');
        }
        $email = strtolower(trim((string) ($in['email'] ?? '')));
        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new HttpError(400, 'Please enter a valid email');
        }
        $year = $in['birth_year'] ?? null;
        if ($year !== null && $year !== '' && (!is_numeric($year) || $year < 1900 || $year > (int) Clock::now()->format('Y'))) {
            throw new HttpError(400, 'Please enter a valid birth year');
        }
        $lang = in_array($in['lang'] ?? 'fr', ['fr', 'ar', 'en'], true) ? $in['lang'] ?? 'fr' : 'fr';
        return ['name' => $name, 'phone' => self::phone((string) ($in['phone'] ?? '')), 'email' => $email, 'birth_year' => $year === null || $year === '' ? null : (int) $year, 'lang' => $lang];
    }

    /**
     * Books a slot. The check that it is still free and the insert happen in one transaction,
     * with the practitioner row locked on MySQL, so two patients can't get the same slot.
     */
    public function book(array $in, string $source = 'online', bool $staff = false): array
    {
        $practitioner = $this->catalog->practitionerBySlug((string) ($in['practitioner'] ?? ''));
        $type = $this->catalog->type((int) $practitioner['id'], (string) ($in['type'] ?? ''));
        $patientIn = self::patientInput($in['patient'] ?? []);
        if (!$staff && empty($in['consent'])) {
            throw new HttpError(400, 'Please accept to receive SMS about this appointment');
        }
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) ($in['date'] ?? '')) || !preg_match('/^\d{2}:\d{2}$/', (string) ($in['time'] ?? ''))) {
            throw new HttpError(400, 'Please choose a time slot');
        }
        $start = Clock::parse($in['date'] . ' ' . $in['time']);
        $end = $start->modify('+' . $type['minutes'] . ' minutes');

        $appointment = $this->db->transaction(function () use ($practitioner, $type, $patientIn, $start, $end, $source, $staff, $in) {
            if (!$this->availability->isFree($practitioner, (int) $type['minutes'], $start, $staff)) {
                throw new HttpError(409, 'This time slot is no longer available');
            }
            $patient = $this->db->one('SELECT * FROM patients WHERE phone = ?', [$patientIn['phone']]);
            if ($patient) {
                $upcoming = (int) $this->db->value("SELECT COUNT(*) FROM appointments WHERE patient_id = ? AND status = 'booked' AND starts_at > ?", [$patient['id'], Clock::sql(Clock::now())]);
                if (!$staff && $upcoming >= self::MAX_UPCOMING) {
                    throw new HttpError(409, 'You already have 2 upcoming appointments');
                }
                $this->db->run('UPDATE patients SET name = ?, email = CASE WHEN ? = \'\' THEN email ELSE ? END, birth_year = COALESCE(?, birth_year), lang = ? WHERE id = ?',
                    [$patientIn['name'], $patientIn['email'], $patientIn['email'], $patientIn['birth_year'], $patientIn['lang'], $patient['id']]);
                $patientId = (int) $patient['id'];
            } else {
                $patientId = $this->db->insert('patients', $patientIn + ['created_at' => Clock::sql(Clock::now())]);
            }
            $id = $this->db->insert('appointments', [
                'ref' => $this->newRef(), 'practitioner_id' => $practitioner['id'], 'type_id' => $type['id'], 'patient_id' => $patientId,
                'starts_at' => Clock::sql($start), 'ends_at' => Clock::sql($end), 'status' => $source === 'walk_in' ? 'arrived' : 'booked',
                'source' => $source, 'note' => trim((string) ($in['note'] ?? '')) ?: null, 'created_at' => Clock::sql(Clock::now()),
            ]);
            return $this->db->one('SELECT * FROM appointments WHERE id = ?', [$id]);
        }, 'SELECT id FROM practitioners WHERE id = ?', [$practitioner['id']]);

        $patient = $this->db->one('SELECT * FROM patients WHERE id = ?', [$appointment['patient_id']]);
        if ($source !== 'walk_in') {
            $this->sms->send('confirm', $appointment, $patient, $practitioner);
        }
        return $this->view($appointment['ref']);
    }

    /** What the patient sees; the phone number acts as the password for the reference */
    public function find(string $ref, string $phone): array
    {
        $a = $this->db->one('SELECT a.ref, p.phone FROM appointments a JOIN patients p ON p.id = a.patient_id WHERE a.ref = ?', [strtoupper(trim($ref))]);
        if (!$a || !hash_equals($a['phone'], self::safePhone($phone))) {
            throw new HttpError(404, 'No appointment matches this reference and phone number');
        }
        return $this->view($a['ref']);
    }

    public function cancel(string $ref, string $phone, bool $staff = false): array
    {
        $view = $staff ? $this->view(strtoupper($ref)) : $this->find($ref, $phone);
        $a = $this->db->one('SELECT * FROM appointments WHERE ref = ?', [$view['ref']]);
        if ($a['status'] !== 'booked') {
            throw new HttpError(409, 'This appointment can no longer be cancelled');
        }
        if (!$staff && Clock::parse($a['starts_at']) < Clock::now()->modify('+' . self::CANCEL_NOTICE_HOURS . ' hours')) {
            throw new HttpError(409, 'Less than 2 hours before the appointment: please call the clinic');
        }
        $this->db->run("UPDATE appointments SET status = 'cancelled', cancelled_at = ? WHERE id = ?", [Clock::sql(Clock::now()), $a['id']]);
        $this->sms->send('cancel', $a, $this->db->one('SELECT * FROM patients WHERE id = ?', [$a['patient_id']]), $this->db->one('SELECT * FROM practitioners WHERE id = ?', [$a['practitioner_id']]));
        return $this->view($a['ref']);
    }

    public function view(string $ref): array
    {
        $row = $this->db->one(
            'SELECT a.*, p.name AS patient_name, p.phone, pr.slug, pr.name AS practitioner_name, pr.title, pr.room, pr.color, t.code AS type_code, t.label AS type_label, t.price_da
             FROM appointments a JOIN patients p ON p.id = a.patient_id JOIN practitioners pr ON pr.id = a.practitioner_id JOIN appointment_types t ON t.id = a.type_id
             WHERE a.ref = ?', [$ref]);
        if (!$row) {
            throw new HttpError(404, 'Appointment not found');
        }
        $start = Clock::parse($row['starts_at']);
        return [
            'ref' => $row['ref'], 'status' => $row['status'], 'starts_at' => $start->format('Y-m-d\TH:i'), 'ends_at' => Clock::parse($row['ends_at'])->format('Y-m-d\TH:i'),
            'patient' => ['name' => $row['patient_name'], 'phone' => '•••• ' . substr($row['phone'], -4)],
            'practitioner' => ['slug' => $row['slug'], 'name' => $row['practitioner_name'], 'title' => Db::decode($row['title']), 'room' => $row['room'], 'color' => $row['color']],
            'type' => ['code' => $row['type_code'], 'label' => Db::decode($row['type_label']), 'price_da' => (int) $row['price_da']],
            'can_cancel' => $row['status'] === 'booked' && $start >= Clock::now()->modify('+' . self::CANCEL_NOTICE_HOURS . ' hours'),
        ];
    }

    private static function safePhone(string $raw): string
    {
        try {
            return self::phone($raw);
        } catch (HttpError) {
            return '';
        }
    }

    private function newRef(): string
    {
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        do {
            $ref = 'EA-';
            for ($i = 0; $i < 6; $i++) {
                $ref .= $alphabet[random_int(0, strlen($alphabet) - 1)];
            }
        } while ($this->db->value('SELECT 1 FROM appointments WHERE ref = ?', [$ref]));
        return $ref;
    }
}
