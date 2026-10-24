<?php

declare(strict_types=1);

namespace Clinic;

/** Wires the services to the API routes. The same App serves PHP-FPM/Apache, tests and the in-browser demo. */
final class App
{
    private Router $router;

    public function __construct(private readonly Db $db, string $secret)
    {
        $catalog = new Catalog($db);
        $availability = new Availability($db);
        $sms = new Sms($db);
        $bookings = new Bookings($db, $catalog, $availability, $sms);
        $desk = new Desk($db, $sms);
        $auth = new Auth($db, $secret);
        $r = $this->router = new Router();

        // ---- Public ----
        $r->add('GET', '/api/health', fn () => ['ok' => true, 'driver' => $db->driver]);
        $r->add('GET', '/api/practitioners', fn () => $catalog->practitioners());

        $r->add('GET', '/api/availability', function (Request $q) use ($catalog, $availability) {
            $p = $catalog->practitionerBySlug((string) ($q->query['practitioner'] ?? ''));
            $type = $catalog->type((int) $p['id'], (string) ($q->query['type'] ?? ''));
            $from = (string) ($q->query['from'] ?? Clock::now()->format('Y-m-d'));
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $from) || $from < Clock::now()->format('Y-m-d')) {
                $from = Clock::now()->format('Y-m-d');
            }
            return ['practitioner' => $p['slug'], 'type' => $type['code'], 'minutes' => (int) $type['minutes'],
                'days' => $availability->slots($p, (int) $type['minutes'], $from, (int) ($q->query['days'] ?? 14))];
        });

        $r->add('POST', '/api/appointments', fn (Request $q) => Response::json($bookings->book($q->body), 201));
        // POST so the phone number stays out of URLs and server logs
        $r->add('POST', '/api/appointments/{ref}/lookup', fn (Request $q) => $bookings->find($q->params['ref'], (string) $q->input('phone', '')));
        $r->add('POST', '/api/appointments/{ref}/cancel', fn (Request $q) => $bookings->cancel($q->params['ref'], (string) $q->input('phone', '')));

        // ---- Staff ----
        $r->add('POST', '/api/auth/login', fn (Request $q) => $auth->login((string) $q->input('email', ''), (string) $q->input('password', '')));
        $r->add('GET', '/api/auth/me', fn (Request $q) => ['user' => Auth::publicUser($auth->user($q))]);

        $r->add('GET', '/api/staff/agenda', function (Request $q) use ($auth, $desk) {
            $user = $auth->user($q);
            return $desk->agenda((string) ($q->query['date'] ?? Clock::now()->format('Y-m-d')), $user['role'] === 'doctor' ? (int) $user['practitioner_id'] : null);
        });
        $r->add('PATCH', '/api/staff/appointments/{id}', fn (Request $q) => $desk->update((int) $q->params['id'], $q->body, $auth->user($q)));
        // Bookings taken by phone or walk-ins at the desk
        $r->add('POST', '/api/staff/appointments', function (Request $q) use ($auth, $bookings) {
            $auth->user($q, 'reception');
            $source = in_array($q->input('source'), ['phone', 'walk_in'], true) ? $q->input('source') : 'phone';
            return Response::json($bookings->book($q->body, $source, staff: true), 201);
        });
        $r->add('POST', '/api/staff/appointments/{ref}/cancel', function (Request $q) use ($auth, $bookings) {
            $auth->user($q, 'reception');
            return $bookings->cancel($q->params['ref'], '', staff: true);
        });
        $r->add('GET', '/api/staff/availability', function (Request $q) use ($auth, $catalog, $availability) {
            $auth->user($q, 'reception');
            $p = $catalog->practitionerBySlug((string) ($q->query['practitioner'] ?? ''));
            $type = $catalog->type((int) $p['id'], (string) ($q->query['type'] ?? ''));
            return $availability->slots($p, (int) $type['minutes'], (string) ($q->query['date'] ?? Clock::now()->format('Y-m-d')), 1, staff: true)[0];
        });
        $r->add('POST', '/api/staff/closures', function (Request $q) use ($auth, $desk) {
            $auth->user($q, 'reception');
            return Response::json($desk->addClosure($q->body), 201);
        });
        $r->add('DELETE', '/api/staff/closures/{id}', function (Request $q) use ($auth, $desk) {
            $auth->user($q, 'reception');
            $desk->removeClosure((int) $q->params['id']);
            return ['ok' => true];
        });
        $r->add('GET', '/api/staff/patients', function (Request $q) use ($auth, $desk) {
            $auth->user($q, 'reception', 'doctor');
            return $desk->patients((string) ($q->query['q'] ?? ''));
        });
        $r->add('GET', '/api/staff/patients/{id}', function (Request $q) use ($auth, $desk) {
            $auth->user($q, 'reception', 'doctor');
            return $desk->patient((int) $q->params['id']);
        });
        $r->add('GET', '/api/staff/stats', function (Request $q) use ($auth, $desk) {
            $auth->user($q, 'reception');
            return $desk->stats((int) ($q->query['days'] ?? 30));
        });
        $r->add('GET', '/api/staff/sms', function (Request $q) use ($auth, $desk) {
            $auth->user($q, 'reception');
            return $desk->outbox();
        });
        $r->add('POST', '/api/staff/reminders', function (Request $q) use ($auth, $desk) {
            $auth->user($q, 'reception');
            return ['sent' => $desk->sendReminders()];
        });
    }

    public function handle(Request $req): Response
    {
        try {
            return $this->router->dispatch($req);
        } catch (HttpError $e) {
            return Response::json(['error' => $e->getMessage()], $e->status);
        } catch (\Throwable $e) {
            error_log((string) $e);
            return Response::json(['error' => 'Server error'], 500);
        }
    }
}
