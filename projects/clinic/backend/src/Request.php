<?php

declare(strict_types=1);

namespace Clinic;

final class Request
{
    public function __construct(
        public readonly string $method,
        public readonly string $path,
        public readonly array $query = [],
        public readonly array $body = [],
        public readonly array $headers = [],
        public array $params = [],
    ) {
    }

    public static function fromGlobals(): self
    {
        $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $raw = file_get_contents('php://input') ?: '';
        $body = $raw === '' ? [] : json_decode($raw, true);
        if (!is_array($body)) {
            throw new HttpError(400, 'Invalid JSON');
        }
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $headers[strtolower(str_replace('_', '-', substr($key, 5)))] = $value;
            }
        }
        return new self(strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET'), $path, $_GET, $body, $headers);
    }

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->body[$key] ?? $default;
    }

    public function bearer(): string
    {
        return preg_replace('/^Bearer\s+/i', '', $this->headers['authorization'] ?? '');
    }
}
