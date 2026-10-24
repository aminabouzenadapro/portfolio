<?php

declare(strict_types=1);

namespace Clinic;

use DateTimeImmutable;

/**
 * Free slots: opening hours, minus appointments, absences and holidays, minus the past.
 * Slots start on the practitioner's grid (e.g. every 15 minutes) and need the whole
 * duration of the appointment type to be free.
 */
final class Availability
{
    public const LEAD_MINUTES = 60;   // online bookings at least one hour ahead
    public const MAX_DAYS = 30;

    public function __construct(private readonly Db $db)
    {
    }

    /** @return list<array{date: string, slots: list<string>}> */
    public function slots(array $practitioner, int $minutes, string $fromDate, int $days, bool $staff = false): array
    {
        $days = max(1, min(self::MAX_DAYS, $days));
        $from = Clock::parse($fromDate . ' 00:00');
        $to = $from->modify("+$days days");
        $busy = $this->busy((int) $practitioner['id'], $from, $to);
        $hours = [];
        foreach ($this->db->all('SELECT weekday, start_time, end_time FROM schedules WHERE practitioner_id = ? ORDER BY start_time', [$practitioner['id']]) as $h) {
            $hours[(int) $h['weekday']][] = [$h['start_time'], $h['end_time']];
        }
        // Reception can book walk-ins right now; patients online need some notice
        $earliest = Clock::now()->modify($staff ? '-10 minutes' : '+' . self::LEAD_MINUTES . ' minutes');
        $step = (int) $practitioner['slot_minutes'];

        $out = [];
        for ($day = $from; $day < $to; $day = $day->modify('+1 day')) {
            $slots = [];
            foreach ($hours[(int) $day->format('w')] ?? [] as [$start, $end]) {
                $t = Clock::parse($day->format('Y-m-d') . ' ' . $start);
                $close = Clock::parse($day->format('Y-m-d') . ' ' . $end);
                for (; $t->modify("+$minutes minutes") <= $close; $t = $t->modify("+$step minutes")) {
                    $slotEnd = $t->modify("+$minutes minutes");
                    if ($t >= $earliest && !self::overlaps($busy, $t, $slotEnd)) {
                        $slots[] = $t->format('H:i');
                    }
                }
            }
            $out[] = ['date' => $day->format('Y-m-d'), 'weekday' => (int) $day->format('w'), 'slots' => $slots];
        }
        return $out;
    }

    public function isFree(array $practitioner, int $minutes, DateTimeImmutable $start, bool $staff = false): bool
    {
        foreach ($this->slots($practitioner, $minutes, $start->format('Y-m-d'), 1, $staff)[0]['slots'] as $slot) {
            if ($slot === $start->format('H:i')) {
                return true;
            }
        }
        return false;
    }

    /** Busy periods: active appointments and closures (the practitioner's and the clinic's) */
    private function busy(int $practitionerId, DateTimeImmutable $from, DateTimeImmutable $to): array
    {
        $params = [$practitionerId, Clock::sql($to), Clock::sql($from)];
        $rows = array_merge(
            $this->db->all("SELECT starts_at, ends_at FROM appointments WHERE practitioner_id = ? AND status <> 'cancelled' AND starts_at < ? AND ends_at > ?", $params),
            $this->db->all('SELECT starts_at, ends_at FROM closures WHERE (practitioner_id = ? OR practitioner_id IS NULL) AND starts_at < ? AND ends_at > ?', $params),
        );
        return array_map(fn ($r) => [Clock::parse($r['starts_at']), Clock::parse($r['ends_at'])], $rows);
    }

    private static function overlaps(array $busy, DateTimeImmutable $start, DateTimeImmutable $end): bool
    {
        foreach ($busy as [$s, $e]) {
            if ($start < $e && $end > $s) {
                return true;
            }
        }
        return false;
    }
}
