<?php

declare(strict_types=1);

namespace Clinic\Tests;

use Clinic\App;
use Clinic\Clock;
use Clinic\Db;
use Clinic\Request;
use Clinic\Seed;
use PHPUnit\Framework\TestCase;

/**
 * Calls the real App with fake requests, on a fresh database for every test.
 * Time is frozen on Monday 26 October 2026, 10:05 in Constantine.
 */
abstract class ApiTestCase extends TestCase
{
    protected const NOW = '2026-10-26 10:05';
    protected Db $db;
    protected App $app;

    protected function setUp(): void
    {
        Clock::freeze(self::NOW);
        $url = getenv('TEST_DATABASE_URL') ?: 'sqlite::memory:';
        $this->db = Db::connect($url);
        if ($this->db->driver === 'mysql') {
            $this->db->pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
            foreach ($this->db->all('SHOW TABLES') as $row) {
                $this->db->pdo->exec('DROP TABLE `' . array_values($row)[0] . '`');
            }
            $this->db->pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
        }
        $this->db->migrate();
        Seed::run($this->db, withHistory: false);
        $this->app = new App($this->db, 'test-secret');
    }

    protected function tearDown(): void
    {
        Clock::freeze(null);
    }

    /** @return array{0: int, 1: mixed} status and decoded JSON */
    protected function call(string $method, string $uri, array $body = [], ?string $token = null): array
    {
        $parts = parse_url($uri);
        parse_str($parts['query'] ?? '', $query);
        $headers = $token ? ['authorization' => "Bearer $token"] : [];
        $res = $this->app->handle(new Request($method, $parts['path'], $query, $body, $headers));
        return [$res->status, json_decode($res->body, true)];
    }

    protected function login(string $email): string
    {
        [$status, $data] = $this->call('POST', '/api/auth/login', ['email' => $email, 'password' => Seed::PASSWORD]);
        $this->assertSame(200, $status);
        return $data['token'];
    }

    protected function book(array $over = []): array
    {
        $body = array_replace_recursive([
            'practitioner' => 'dr-belaid', 'type' => 'consultation', 'date' => '2026-10-27', 'time' => '09:10',
            'patient' => ['name' => 'Sara Mansouri', 'phone' => '0661 23 45 67', 'email' => '', 'birth_year' => 1994, 'lang' => 'fr'],
            'consent' => true,
        ], $over);
        return $this->call('POST', '/api/appointments', $body);
    }
}
