<?php

declare(strict_types=1);

namespace Clinic;

/**
 * The reception desk and the doctors' side: day agenda, arrivals and no-shows, absences,
 * patients and their history, reminders, statistics.
 */
final class Desk
{
    private const STATUSES = ['booked', 'arrived', 'done', 'no_show'];

    public function __construct(private readonly Db $db, private readonly Sms $sms)
    {
    }

    /** One day for all practitioners (reception) or one (a doctor) */
    public function agenda(string $date, ?int $onlyPractitioner): array
    {
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            throw new HttpError(400, 'Invalid date');
        }
        $from = $date . ' 00:00:00';
        $to = Clock::parse($date)->modify('+1 day')->format('Y-m-d') . ' 00:00:00';
        $practitioners = array_map([Catalog::class, 'practitioner'], $this->db->all('SELECT * FROM practitioners WHERE active = 1' . ($onlyPractitioner ? ' AND id = ' . (int) $onlyPractitioner : '') . ' ORDER BY id'));
        $rows = $this->db->all(
            "SELECT a.*, p.name AS patient_name, p.phone, p.birth_year, t.label AS type_label, t.minutes, t.code AS type_code
             FROM appointments a JOIN patients p ON p.id = a.patient_id JOIN appointment_types t ON t.id = a.type_id
             WHERE a.starts_at >= ? AND a.starts_at < ? AND a.status <> 'cancelled' ORDER BY a.starts_at", [$from, $to]);
        $closures = $this->db->all('SELECT * FROM closures WHERE starts_at < ? AND ends_at > ? ORDER BY starts_at', [$to, $from]);
        $weekday = (int) Clock::parse($date)->format('w');
        $hours = $this->db->all('SELECT * FROM schedules WHERE weekday = ? ORDER BY start_time', [$weekday]);

        foreach ($practitioners as &$p) {
            $p['hours'] = array_values(array_map(fn ($h) => ['start' => $h['start_time'], 'end' => $h['end_time']], array_filter($hours, fn ($h) => $h['practitioner_id'] == $p['id'])));
            $p['appointments'] = array_values(array_map([self::class, 'row'], array_filter($rows, fn ($r) => $r['practitioner_id'] == $p['id'])));
            $p['closures'] = array_values(array_map(fn ($c) => ['id' => (int) $c['id'], 'starts_at' => substr($c['starts_at'], 0, 16), 'ends_at' => substr($c['ends_at'], 0, 16), 'reason' => $c['reason'], 'clinic' => $c['practitioner_id'] === null],
                array_filter($closures, fn ($c) => $c['practitioner_id'] === null || $c['practitioner_id'] == $p['id'])));
        }
        $all = array_merge(...array_map(fn ($p) => $p['appointments'], $practitioners ?: [['appointments' => []]]));
        $count = fn (string $s) => count(array_filter($all, fn ($a) => $a['status'] === $s));
        return [
            'date' => $date,
            'practitioners' => $practitioners,
            'counts' => ['total' => count($all), 'booked' => $count('booked'), 'arrived' => $count('arrived'), 'done' => $count('done'), 'no_show' => $count('no_show')],
        ];
    }

    public static function row(array $r): array
    {
        return [
            'id' => (int) $r['id'], 'ref' => $r['ref'], 'starts_at' => substr($r['starts_at'], 0, 16), 'ends_at' => substr($r['ends_at'], 0, 16),
            'status' => $r['status'], 'source' => $r['source'], 'note' => $r['note'],
            'patient' => ['id' => (int) $r['patient_id'], 'name' => $r['patient_name'], 'phone' => $r['phone'], 'birth_year' => $r['birth_year'] === null ? null : (int) $r['birth_year']],
            'type' => ['code' => $r['type_code'], 'label' => Db::decode($r['type_label']), 'minutes' => (int) $r['minutes']],
        ];
    }

    /** Reception moves an appointment along; a doctor can only touch their own */
    public function update(int $id, array $in, array $user): array
    {
        $a = $this->db->one('SELECT * FROM appointments WHERE id = ?', [$id]);
        if (!$a) {
            throw new HttpError(404, 'Appointment not found');
        }
        if ($user['role'] === 'doctor' && (int) $a['practitioner_id'] !== (int) $user['practitioner_id']) {
            throw new HttpError(403, "Your account can't do this");
        }
        if ($a['status'] === 'cancelled') {
            throw new HttpError(409, 'This appointment is cancelled');
        }
        if (array_key_exists('status', $in)) {
            if (!in_array($in['status'], self::STATUSES, true)) {
                throw new HttpError(400, 'Invalid status');
            }
            if ($in['status'] !== 'booked' && Clock::parse($a['starts_at'])->format('Y-m-d') > Clock::now()->format('Y-m-d')) {
                throw new HttpError(409, 'This appointment is not today yet');
            }
            $this->db->run('UPDATE appointments SET status = ? WHERE id = ?', [$in['status'], $id]);
        }
        if (array_key_exists('note', $in)) {
            $this->db->run('UPDATE appointments SET note = ? WHERE id = ?', [mb_substr(trim((string) $in['note']), 0, 2000) ?: null, $id]);
        }
        return self::row($this->db->one(
            'SELECT a.*, p.name AS patient_name, p.phone, p.birth_year, t.label AS type_label, t.minutes, t.code AS type_code
             FROM appointments a JOIN patients p ON p.id = a.patient_id JOIN appointment_types t ON t.id = a.type_id WHERE a.id = ?', [$id]));
    }

    public function addClosure(array $in): array
    {
        try {
            $start = Clock::parse((string) ($in['starts_at'] ?? ''));
            $end = Clock::parse((string) ($in['ends_at'] ?? ''));
        } catch (\Exception) {
            throw new HttpError(400, 'Invalid date');
        }
        if ($end <= $start) {
            throw new HttpError(400, 'The end must be after the start');
        }
        $practitioner = $in['practitioner_id'] ?? null;
        if ($practitioner !== null && !$this->db->value('SELECT 1 FROM practitioners WHERE id = ?', [$practitioner])) {
            throw new HttpError(404, 'Practitioner not found');
        }
        $id = $this->db->insert('closures', ['practitioner_id' => $practitioner, 'starts_at' => Clock::sql($start), 'ends_at' => Clock::sql($end), 'reason' => mb_substr(trim((string) ($in['reason'] ?? '')), 0, 200)]);
        // Appointments already booked in that period are listed so the reception can call the patients
        $clash = $this->db->all(
            "SELECT a.ref, a.starts_at, p.name, p.phone FROM appointments a JOIN patients p ON p.id = a.patient_id
             WHERE a.status = 'booked' AND a.starts_at < ? AND a.ends_at > ?" . ($practitioner !== null ? ' AND a.practitioner_id = ' . (int) $practitioner : '') . ' ORDER BY a.starts_at',
            [Clock::sql($end), Clock::sql($start)]);
        return ['id' => $id, 'to_call' => array_map(fn ($c) => ['ref' => $c['ref'], 'starts_at' => substr($c['starts_at'], 0, 16), 'name' => $c['name'], 'phone' => $c['phone']], $clash)];
    }

    public function removeClosure(int $id): void
    {
        if ($this->db->run('DELETE FROM closures WHERE id = ?', [$id]) === 0) {
            throw new HttpError(404, 'Not found');
        }
    }

    public function patients(string $q): array
    {
        $like = '%' . trim($q) . '%';
        $rows = $this->db->all(
            "SELECT p.*, COUNT(a.id) AS visits, MAX(a.starts_at) AS last_visit,
                    SUM(CASE WHEN a.status = 'no_show' THEN 1 ELSE 0 END) AS no_shows
             FROM patients p LEFT JOIN appointments a ON a.patient_id = p.id AND a.status <> 'cancelled'
             WHERE p.name LIKE ? OR p.phone LIKE ?
             GROUP BY p.id, p.name, p.phone, p.email, p.birth_year, p.lang, p.created_at
             ORDER BY last_visit DESC LIMIT 50", [$like, $like]);
        return array_map(fn ($p) => ['id' => (int) $p['id'], 'name' => $p['name'], 'phone' => $p['phone'], 'birth_year' => $p['birth_year'] === null ? null : (int) $p['birth_year'], 'visits' => (int) $p['visits'], 'no_shows' => (int) $p['no_shows'], 'last_visit' => $p['last_visit'] ? substr($p['last_visit'], 0, 16) : null], $rows);
    }

    public function patient(int $id): array
    {
        $p = $this->db->one('SELECT * FROM patients WHERE id = ?', [$id]);
        if (!$p) {
            throw new HttpError(404, 'Patient not found');
        }
        $history = $this->db->all(
            'SELECT a.ref, a.starts_at, a.status, a.source, a.note, pr.name AS practitioner, pr.color, t.label AS type_label
             FROM appointments a JOIN practitioners pr ON pr.id = a.practitioner_id JOIN appointment_types t ON t.id = a.type_id
             WHERE a.patient_id = ? ORDER BY a.starts_at DESC', [$id]);
        return [
            'id' => (int) $p['id'], 'name' => $p['name'], 'phone' => $p['phone'], 'email' => $p['email'], 'birth_year' => $p['birth_year'] === null ? null : (int) $p['birth_year'], 'since' => substr($p['created_at'], 0, 10),
            'history' => array_map(fn ($h) => ['ref' => $h['ref'], 'starts_at' => substr($h['starts_at'], 0, 16), 'status' => $h['status'], 'source' => $h['source'], 'note' => $h['note'], 'practitioner' => $h['practitioner'], 'color' => $h['color'], 'type' => Db::decode($h['type_label'])], $history),
        ];
    }

    /** Sends tomorrow's reminders once (run every evening by cron: bin/send-reminders.php) */
    public function sendReminders(): int
    {
        $tomorrow = Clock::now()->modify('+1 day')->format('Y-m-d');
        $rows = $this->db->all("SELECT * FROM appointments WHERE status = 'booked' AND reminder_sent_at IS NULL AND starts_at >= ? AND starts_at < ?",
            [$tomorrow . ' 00:00:00', Clock::parse($tomorrow)->modify('+1 day')->format('Y-m-d') . ' 00:00:00']);
        foreach ($rows as $a) {
            $this->sms->send('reminder', $a, $this->db->one('SELECT * FROM patients WHERE id = ?', [$a['patient_id']]), $this->db->one('SELECT * FROM practitioners WHERE id = ?', [$a['practitioner_id']]));
            $this->db->run('UPDATE appointments SET reminder_sent_at = ? WHERE id = ?', [Clock::sql(Clock::now()), $a['id']]);
        }
        return count($rows);
    }

    public function outbox(): array
    {
        return array_map(fn ($s) => ['id' => (int) $s['id'], 'phone' => $s['phone'], 'kind' => $s['kind'], 'body' => $s['body'], 'created_at' => substr($s['created_at'], 0, 16)],
            $this->db->all('SELECT * FROM sms_outbox ORDER BY id DESC LIMIT 40'));
    }

    /** Last N days: bookings per day, no-show rate, online share, occupancy per practitioner */
    public function stats(int $days): array
    {
        $days = max(7, min(90, $days));
        $today = Clock::parse(Clock::now()->format('Y-m-d'));
        $from = $today->modify("-$days days");
        $rows = $this->db->all("SELECT a.practitioner_id, a.starts_at, a.ends_at, a.status, a.source, a.created_at FROM appointments a WHERE a.starts_at >= ? AND a.starts_at < ? AND a.status <> 'cancelled'",
            [Clock::sql($from), Clock::sql($today)]);
        $perDay = [];
        for ($d = $from; $d < $today; $d = $d->modify('+1 day')) {
            $perDay[$d->format('Y-m-d')] = 0;
        }
        foreach ($rows as $r) {
            $perDay[substr($r['starts_at'], 0, 10)]++;
        }
        $past = array_filter($rows, fn ($r) => in_array($r['status'], ['done', 'no_show'], true));
        $noShows = count(array_filter($past, fn ($r) => $r['status'] === 'no_show'));
        $practitioners = [];
        foreach ($this->db->all('SELECT * FROM practitioners WHERE active = 1 ORDER BY id') as $p) {
            $open = 0;
            foreach ($this->db->all('SELECT weekday, start_time, end_time FROM schedules WHERE practitioner_id = ?', [$p['id']]) as $h) {
                $count = 0;
                for ($d = $from; $d < $today; $d = $d->modify('+1 day')) {
                    $count += (int) $d->format('w') === (int) $h['weekday'] ? 1 : 0;
                }
                $open += $count * (strtotime('1970-01-01 ' . $h['end_time'] . ':00 UTC') - strtotime('1970-01-01 ' . $h['start_time'] . ':00 UTC')) / 60;
            }
            $mine = array_filter($rows, fn ($r) => $r['practitioner_id'] == $p['id']);
            $booked = array_sum(array_map(fn ($r) => (strtotime($r['ends_at']) - strtotime($r['starts_at'])) / 60, $mine));
            $practitioners[] = ['id' => (int) $p['id'], 'name' => $p['name'], 'color' => $p['color'], 'appointments' => count($mine), 'occupancy' => $open ? (int) round($booked / $open * 100) : 0];
        }
        return [
            'days' => $days,
            'appointments' => count($rows),
            'no_show_rate' => $past ? (int) round($noShows / count($past) * 100) : null,
            'online_share' => $rows ? (int) round(count(array_filter($rows, fn ($r) => $r['source'] === 'online')) / count($rows) * 100) : null,
            'per_day' => array_map(fn ($d, $n) => ['date' => $d, 'count' => $n], array_keys($perDay), $perDay),
            'practitioners' => $practitioners,
        ];
    }
}
