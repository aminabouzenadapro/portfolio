<?php

declare(strict_types=1);

namespace Clinic;

/** Staff sign-in: bcrypt passwords and HMAC-signed tokens (no session storage needed). */
final class Auth
{
    private const HOURS = 12;

    public function __construct(private readonly Db $db, private readonly string $secret)
    {
    }

    public function login(string $email, string $password): array
    {
        $user = $this->db->one('SELECT * FROM users WHERE email = ?', [strtolower(trim($email))]);
        if (!$user || !password_verify($password, $user['password_hash'])) {
            throw new HttpError(401, 'Wrong email or password');
        }
        return ['token' => $this->token((int) $user['id']), 'user' => self::publicUser($user)];
    }

    public function token(int $userId): string
    {
        $payload = self::b64(json_encode(['sub' => $userId, 'exp' => Clock::now()->getTimestamp() + self::HOURS * 3600]));
        return $payload . '.' . self::b64(hash_hmac('sha256', $payload, $this->secret, true));
    }

    /** The signed-in user, optionally restricted to some roles */
    public function user(Request $req, string ...$roles): array
    {
        $parts = explode('.', $req->bearer());
        $user = null;
        if (count($parts) === 2 && hash_equals(self::b64(hash_hmac('sha256', $parts[0], $this->secret, true)), $parts[1])) {
            $data = json_decode(base64_decode(strtr($parts[0], '-_', '+/')), true);
            if (is_array($data) && ($data['exp'] ?? 0) > Clock::now()->getTimestamp()) {
                $user = $this->db->one('SELECT * FROM users WHERE id = ?', [$data['sub']]);
            }
        }
        if (!$user) {
            throw new HttpError(401, 'Please sign in');
        }
        if ($roles && !in_array($user['role'], $roles, true)) {
            throw new HttpError(403, "Your account can't do this");
        }
        return $user;
    }

    public static function publicUser(array $u): array
    {
        return ['id' => (int) $u['id'], 'name' => $u['name'], 'email' => $u['email'], 'role' => $u['role'], 'practitioner_id' => $u['practitioner_id'] === null ? null : (int) $u['practitioner_id']];
    }

    private static function b64(string $raw): string
    {
        return rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');
    }
}
