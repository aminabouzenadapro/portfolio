-- Centre médical El Amel: MySQL / MariaDB schema (utf8mb4, InnoDB)

CREATE TABLE IF NOT EXISTS practitioners (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  specialty VARCHAR(30) NOT NULL,
  title JSON NOT NULL,          -- {"fr": ..., "ar": ..., "en": ...}
  bio JSON NOT NULL,
  room VARCHAR(30) NOT NULL DEFAULT '',
  color CHAR(7) NOT NULL DEFAULT '#2563eb',
  slot_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 15,
  active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS appointment_types (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  practitioner_id INT UNSIGNED NOT NULL,
  code VARCHAR(40) NOT NULL,
  label JSON NOT NULL,
  minutes SMALLINT UNSIGNED NOT NULL,
  price_da INT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY practitioner_code (practitioner_id, code),
  CONSTRAINT fk_type_practitioner FOREIGN KEY (practitioner_id) REFERENCES practitioners (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Opening hours: one row per time range (e.g. morning and afternoon). weekday: 0 = Sunday … 6 = Saturday
CREATE TABLE IF NOT EXISTS schedules (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  practitioner_id INT UNSIGNED NOT NULL,
  weekday TINYINT UNSIGNED NOT NULL,
  start_time CHAR(5) NOT NULL,
  end_time CHAR(5) NOT NULL,
  KEY practitioner_day (practitioner_id, weekday),
  CONSTRAINT fk_schedule_practitioner FOREIGN KEY (practitioner_id) REFERENCES practitioners (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Absences, holidays and blocked time. practitioner_id NULL = the whole clinic
CREATE TABLE IF NOT EXISTS closures (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  practitioner_id INT UNSIGNED NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  reason VARCHAR(200) NOT NULL DEFAULT '',
  KEY period (starts_at, ends_at),
  CONSTRAINT fk_closure_practitioner FOREIGN KEY (practitioner_id) REFERENCES practitioners (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patients (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(10) NOT NULL UNIQUE,
  email VARCHAR(200) NOT NULL DEFAULT '',
  birth_year SMALLINT UNSIGNED NULL,
  lang CHAR(2) NOT NULL DEFAULT 'fr',
  created_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS appointments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ref VARCHAR(12) NOT NULL UNIQUE,
  practitioner_id INT UNSIGNED NOT NULL,
  type_id INT UNSIGNED NOT NULL,
  patient_id INT UNSIGNED NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  status VARCHAR(12) NOT NULL DEFAULT 'booked',   -- booked, arrived, done, no_show, cancelled
  source VARCHAR(10) NOT NULL DEFAULT 'online',   -- online, phone, walk_in
  note TEXT NULL,
  created_at DATETIME NOT NULL,
  cancelled_at DATETIME NULL,
  reminder_sent_at DATETIME NULL,
  KEY practitioner_time (practitioner_id, starts_at),
  KEY patient (patient_id),
  CONSTRAINT fk_appt_practitioner FOREIGN KEY (practitioner_id) REFERENCES practitioners (id),
  CONSTRAINT fk_appt_type FOREIGN KEY (type_id) REFERENCES appointment_types (id),
  CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patients (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(12) NOT NULL,                      -- reception, doctor
  practitioner_id INT UNSIGNED NULL,
  CONSTRAINT fk_user_practitioner FOREIGN KEY (practitioner_id) REFERENCES practitioners (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SMS the clinic would send (confirmations, reminders, cancellations)
CREATE TABLE IF NOT EXISTS sms_outbox (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT UNSIGNED NULL,
  phone VARCHAR(10) NOT NULL,
  kind VARCHAR(12) NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  KEY created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
