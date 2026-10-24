<?php

declare(strict_types=1);

namespace Clinic;

use PDO;

/**
 * Thin PDO wrapper. The app runs on MySQL/MariaDB; tests and the in-browser demo use SQLite.
 * Queries stick to SQL both understand; the few differences live here.
 */
final class Db
{
    public readonly string $driver;

    public function __construct(public readonly PDO $pdo)
    {
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        $this->driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
        if ($this->driver === 'sqlite') {
            $pdo->exec('PRAGMA foreign_keys = ON');
        }
    }

    /** Builds a connection from DATABASE_URL-style settings: mysql://user:pass@host:port/db or sqlite:/path/file.db */
    public static function connect(string $url): self
    {
        if (str_starts_with($url, 'sqlite:')) {
            return new self(new PDO($url));
        }
        $p = parse_url($url);
        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $p['host'] ?? '127.0.0.1', $p['port'] ?? 3306, ltrim($p['path'] ?? '', '/'));
        $pdo = new PDO($dsn, urldecode($p['user'] ?? 'root'), urldecode($p['pass'] ?? ''));
        $pdo->exec("SET time_zone = '+01:00'");
        return new self($pdo);
    }

    public function migrate(): void
    {
        $sql = file_get_contents(__DIR__ . '/../schema/' . ($this->driver === 'sqlite' ? 'sqlite' : 'mysql') . '.sql');
        // Statements are separated by ";" at the end of a line
        foreach (preg_split('/;\s*$/m', $sql) as $statement) {
            $statement = trim(preg_replace('/^\s*--.*$/m', '', $statement));
            if ($statement !== '') {
                $this->pdo->exec($statement);
            }
        }
    }

    /** @return list<array<string, mixed>> */
    public function all(string $sql, array $params = []): array
    {
        $st = $this->pdo->prepare($sql);
        $st->execute($params);
        return $st->fetchAll();
    }

    public function one(string $sql, array $params = []): ?array
    {
        $st = $this->pdo->prepare($sql);
        $st->execute($params);
        $row = $st->fetch();
        return $row === false ? null : $row;
    }

    public function value(string $sql, array $params = []): mixed
    {
        $st = $this->pdo->prepare($sql);
        $st->execute($params);
        return $st->fetchColumn();
    }

    public function run(string $sql, array $params = []): int
    {
        $st = $this->pdo->prepare($sql);
        $st->execute($params);
        return $st->rowCount();
    }

    public function insert(string $table, array $row): int
    {
        $cols = array_keys($row);
        $sql = sprintf('INSERT INTO %s (%s) VALUES (%s)', $table, implode(', ', $cols), implode(', ', array_map(fn ($c) => ':' . $c, $cols)));
        $this->run($sql, $row);
        return (int) $this->pdo->lastInsertId();
    }

    /**
     * Runs $fn in a transaction. On MySQL, $lockSql (a SELECT … FOR UPDATE) serializes concurrent
     * bookings for the same practitioner; SQLite locks the whole database on write anyway.
     */
    public function transaction(callable $fn, ?string $lockSql = null, array $lockParams = []): mixed
    {
        $this->pdo->beginTransaction();
        try {
            if ($lockSql !== null && $this->driver === 'mysql') {
                $this->run($lockSql . ' FOR UPDATE', $lockParams);
            }
            $result = $fn();
            $this->pdo->commit();
            return $result;
        } catch (\Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    public static function json(mixed $value): string
    {
        return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    }

    public static function decode(?string $json): mixed
    {
        return $json === null ? null : json_decode($json, true, 512, JSON_THROW_ON_ERROR);
    }
}
