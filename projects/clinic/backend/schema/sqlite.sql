-- Same schema for SQLite (tests and the in-browser demo). JSON columns are TEXT.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS practitioners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT NOT NULL,
  room TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#2563eb',
  slot_minutes INTEGER NOT NULL DEFAULT 15,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS appointment_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  practitioner_id INTEGER NOT NULL REFERENCES practitioners (id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  minutes INTEGER NOT NULL,
  price_da INTEGER NOT NULL DEFAULT 0,
  UNIQUE (practitioner_id, code)
);

CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  practitioner_id INTEGER NOT NULL REFERENCES practitioners (id) ON DELETE CASCADE,
  weekday INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS schedules_day ON schedules (practitioner_id, weekday);

CREATE TABLE IF NOT EXISTS closures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  practitioner_id INTEGER NULL REFERENCES practitioners (id) ON DELETE CASCADE,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS closures_period ON closures (starts_at, ends_at);

CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL DEFAULT '',
  birth_year INTEGER NULL,
  lang TEXT NOT NULL DEFAULT 'fr',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ref TEXT NOT NULL UNIQUE,
  practitioner_id INTEGER NOT NULL REFERENCES practitioners (id),
  type_id INTEGER NOT NULL REFERENCES appointment_types (id),
  patient_id INTEGER NOT NULL REFERENCES patients (id),
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked',
  source TEXT NOT NULL DEFAULT 'online',
  note TEXT NULL,
  created_at TEXT NOT NULL,
  cancelled_at TEXT NULL,
  reminder_sent_at TEXT NULL
);
CREATE INDEX IF NOT EXISTS appointments_time ON appointments (practitioner_id, starts_at);
CREATE INDEX IF NOT EXISTS appointments_patient ON appointments (patient_id);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  practitioner_id INTEGER NULL REFERENCES practitioners (id)
);

CREATE TABLE IF NOT EXISTS sms_outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  appointment_id INTEGER NULL,
  phone TEXT NOT NULL,
  kind TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sms_created ON sms_outbox (created_at);
