# Centre médical El Amel: online appointments (PHP 8 + MySQL, Vue 3)

Appointment booking for a medical center in Constantine with a general practitioner, a dentist and a pediatrician. Patients book a real free slot in two minutes and get an SMS; the reception runs the day from an agenda; doctors see their own patients. French, Arabic (right-to-left) and English.

**The hosted demo runs the real PHP back end inside your browser** with [php-wasm](https://github.com/WordPress/wordpress-playground) (PHP 8.3 compiled to WebAssembly, from WordPress Playground) on SQLite. On a server, the same code runs on MySQL/MariaDB.

## What it does
**Patients** (no account)
- Each practitioner's next free slot on the home page
- Booking in three steps: reason (with duration and fee), a free slot from the next 14 days, contact details
- Slots come from opening hours (closed on Friday), the practitioner's grid (every 15 or 20 minutes) and the length of the visit, minus booked appointments, absences and national holidays; online bookings need one hour's notice
- Confirmation page with reference, calendar file and print; SMS in the patient's language
- Find an appointment with its reference and phone number; cancel online up to 2 hours before
- At most 2 upcoming appointments per phone number, so slots stay available for everyone

**Reception**
- Day agenda as a timeline, one column per practitioner, with opening hours, blocked time and a "now" line
- Mark patients arrived, seen or absent; private notes; cancel
- Phone bookings and walk-ins (the desk can book a slot right now)
- Block time or whole days (one practitioner or the whole center); the patients already booked in that period are listed so they can be called
- Patient search with visit history and no-shows
- Statistics for the last 30 days: appointments per day, no-show rate, share booked online, agenda occupancy
- SMS outbox and "send tomorrow's reminders" (or `bin/send-reminders.php` from cron)

**Doctors** see only their own agenda and patients, and can update statuses and notes.

## Architecture
```
backend/                    PHP 8.2+, no framework
  public/index.php          front controller (Apache/nginx point here)
  src/App.php               routes
  src/Router.php, Request.php, Response.php, HttpError.php
  src/Db.php                PDO wrapper: MySQL in production, SQLite for tests and the demo
  src/Availability.php      free-slot calculation
  src/Bookings.php          booking (in a transaction, practitioner row locked with SELECT … FOR UPDATE
                            on MySQL so two patients can't take the same slot), lookup, cancellation
  src/Desk.php              agenda, statuses, absences, patients, reminders, statistics
  src/Auth.php              bcrypt passwords, HMAC-signed tokens, roles (reception, doctor)
  src/Sms.php               SMS texts in French, Arabic, English, written to an outbox table
  src/Seed.php              demo practitioners, hours, staff accounts and three weeks of appointments
  schema/mysql.sql          InnoDB, utf8mb4, foreign keys and indexes
  schema/sqlite.sql         the same schema for SQLite
  tests/                    PHPUnit 11 (21 tests, 110 assertions)
  bin/send-reminders.php    cron job
web/                        Vue 3 and Vue Router from a CDN, no build step
  js/php-api.js             loads php-wasm, copies backend/ into its virtual file system and runs
                            public/index.php for each request; the SQLite file is kept in IndexedDB
  js/pages/                 patient pages and staff pages
```

### API
| Method | Route | Who |
|---|---|---|
| GET | `/api/practitioners`, `/api/availability?practitioner=&type=&from=&days=` | anyone |
| POST | `/api/appointments` | anyone |
| POST | `/api/appointments/{ref}/lookup`, `/api/appointments/{ref}/cancel` `{ phone }` | the patient (POST keeps the phone number out of URLs and logs) |
| POST | `/api/auth/login` · GET `/api/auth/me` | staff |
| GET | `/api/staff/agenda?date=` · PATCH `/api/staff/appointments/{id}` | reception, doctor (own patients) |
| GET | `/api/staff/patients?q=`, `/api/staff/patients/{id}` | reception, doctor |
| POST | `/api/staff/appointments`, `/api/staff/appointments/{ref}/cancel` · GET `/api/staff/availability` | reception |
| POST / DELETE | `/api/staff/closures`, `/api/staff/closures/{id}` | reception |
| GET | `/api/staff/stats`, `/api/staff/sms` · POST `/api/staff/reminders` | reception |

## Run it
```
cd backend
composer install
# create an empty MySQL database "clinic", then:
DATABASE_URL="mysql://user:pass@127.0.0.1:3306/clinic" APP_SECRET="change-me" composer serve
```
The tables and demo data are created on the first request. Then serve `web/` (e.g. `python -m http.server`) with `window.CLINIC_API = "http://localhost:8200"` in `web/config.js`. With an empty value, the front end runs the PHP back end in the browser.

With Apache, point the document root at `backend/public` and send every request to `index.php`; with nginx: `try_files $uri /index.php?$query_string;`.

Demo accounts (password `demo1234`): reception `accueil@centre-elamel.dz`, doctor `dr.mansouri@centre-elamel.dz`.

## Tests
```
cd backend
vendor/bin/phpunit                                                   # SQLite in memory
TEST_DATABASE_URL="mysql://user:pass@127.0.0.1:3306/clinic_test" vendor/bin/phpunit   # MySQL/MariaDB
```
The same 21 tests pass on SQLite and on MariaDB 10.4: slot calculation (hours, grid, notice, lunch break, Friday, holidays, long visits that must end before closing, overlaps), validation messages, double booking, patient recognition by phone and the 2-appointment limit, lookup and cancellation rules, roles and token expiry, the doctor's restricted agenda, statuses, walk-ins without SMS, absences with patients to call, reminders sent once, patient history, statistics, and the demo data having no double bookings.
