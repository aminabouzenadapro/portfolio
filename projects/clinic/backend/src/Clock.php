<?php

declare(strict_types=1);

namespace Clinic;

use DateTimeImmutable;
use DateTimeZone;

/** The clinic's local time (Africa/Algiers). Tests freeze it. */
final class Clock
{
    private static ?DateTimeImmutable $frozen = null;

    public static function zone(): DateTimeZone
    {
        return new DateTimeZone('Africa/Algiers');
    }

    public static function now(): DateTimeImmutable
    {
        return self::$frozen ?? new DateTimeImmutable('now', self::zone());
    }

    public static function freeze(?string $at): void
    {
        self::$frozen = $at === null ? null : new DateTimeImmutable($at, self::zone());
    }

    public static function parse(string $value): DateTimeImmutable
    {
        return new DateTimeImmutable($value, self::zone());
    }

    /** Format used in the database */
    public static function sql(DateTimeImmutable $d): string
    {
        return $d->format('Y-m-d H:i:s');
    }
}
