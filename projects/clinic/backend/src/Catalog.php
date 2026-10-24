<?php

declare(strict_types=1);

namespace Clinic;

/** Practitioners, their appointment types and opening hours. */
final class Catalog
{
    public function __construct(private readonly Db $db)
    {
    }

    public function practitioners(): array
    {
        $rows = $this->db->all('SELECT * FROM practitioners WHERE active = 1 ORDER BY id');
        $types = $this->db->all('SELECT * FROM appointment_types ORDER BY practitioner_id, id');
        $hours = $this->db->all('SELECT * FROM schedules ORDER BY practitioner_id, weekday, start_time');
        return array_map(fn (array $p) => self::practitioner($p)
            + ['types' => array_values(array_map([self::class, 'typeOut'], array_filter($types, fn ($t) => $t['practitioner_id'] == $p['id'])))]
            + ['hours' => array_values(array_map(fn ($h) => ['weekday' => (int) $h['weekday'], 'start' => $h['start_time'], 'end' => $h['end_time']], array_filter($hours, fn ($h) => $h['practitioner_id'] == $p['id'])))],
            $rows);
    }

    public function practitionerBySlug(string $slug): array
    {
        $p = $this->db->one('SELECT * FROM practitioners WHERE slug = ? AND active = 1', [$slug]);
        if (!$p) {
            throw new HttpError(404, 'Practitioner not found');
        }
        return $p;
    }

    public function type(int $practitionerId, string $code): array
    {
        $t = $this->db->one('SELECT * FROM appointment_types WHERE practitioner_id = ? AND code = ?', [$practitionerId, $code]);
        if (!$t) {
            throw new HttpError(404, 'Appointment type not found');
        }
        return $t;
    }

    public static function practitioner(array $p): array
    {
        return [
            'id' => (int) $p['id'], 'slug' => $p['slug'], 'name' => $p['name'], 'specialty' => $p['specialty'],
            'title' => Db::decode($p['title']), 'bio' => Db::decode($p['bio']), 'room' => $p['room'],
            'color' => $p['color'], 'slot_minutes' => (int) $p['slot_minutes'],
        ];
    }

    public static function typeOut(array $t): array
    {
        return ['id' => (int) $t['id'], 'code' => $t['code'], 'label' => Db::decode($t['label']), 'minutes' => (int) $t['minutes'], 'price_da' => (int) $t['price_da']];
    }
}
