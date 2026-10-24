# Twiza: events, QR tickets and check-in for a volunteer association (Python, FastAPI)

Twiza is a volunteer association in Constantine (tree planting, blood drives, kids' workshops, heritage walks). This app lets anyone register for its events in a minute and get a ticket with a QR code, and gives the team what it needs on the day: a check-in screen that scans tickets at the door, live attendance, and a dashboard. French, Arabic (right-to-left) and English.

**The hosted demo runs the real FastAPI server inside your browser**: the same Python code as `backend/`, on WebAssembly with [Pyodide](https://pyodide.org). There is no JavaScript copy of the back end.

## What it does
**Participants** (no account needed)
- Upcoming and past events, with live seats, attendance and an "in progress" badge
- Registration form validated on the server (Algerian mobile numbers, one ticket per email)
- Ticket with a QR code, add-to-calendar file (.ics), print, and cancellation
- **Waitlist**: when an event is full, people join a queue; a cancellation or a bigger capacity confirms the first in line automatically
- "My tickets" lists the tickets booked from this browser

**Volunteers** (role `volunteer`)
- Check-in screen: scan the QR code with the phone camera (jsQR) or type the code
- A clear answer for every case: welcome, already in (when and by whom), unknown, other event, cancelled, on the waitlist, too early (doors open 2 hours before), event over
- Undo a check-in, live counter, latest arrivals; sound and vibration feedback

**Organizers** (role `organizer`)
- Dashboard: upcoming registrations, waitlists, attendance rate of past events, different participants, weekly sign-ups
- Per event: registrations with search and status filter, CSV export (opens in Excel with accents)
- Create and edit events in three languages, with validation (dates, capacity not below confirmed seats, all languages filled), draft or published

## Architecture
```
backend/                 Python 3.12+
  twiza/app.py           FastAPI routes, JSON shapes, error handling, QR codes (segno), .ics files
  twiza/services.py      the rules: seats and waitlist, cancellation, check-in, statistics, CSV
  twiza/models.py        SQLAlchemy 2.0 models: User, Event, Registration
  twiza/schemas.py       Pydantic v2 request validation with readable messages
  twiza/security.py      PBKDF2 passwords and signed tokens with the standard library only
  twiza/clock.py         Algeria's local time (UTC+1 all year)
  twiza/seed.py          demo team, events and participants (dates relative to now)
  tests/                 pytest + FastAPI TestClient
web/                     plain HTML, CSS and JavaScript modules, no build step
  js/python-api.js       starts Pyodide, installs the pinned packages, loads backend/twiza/*.py,
                         and passes requests straight to the ASGI app; the SQLite file is saved
                         to IndexedDB after each change
  js/api.js              API client: in-browser Python, or a real server (config.js)
  js/views/              public pages and team pages
  js/scanner.js          camera QR scanner
```

Two details make the same code run in both places:
- WebAssembly has no threads, so in the browser FastAPI's thread-pool calls run directly (a three-line patch in `python-api.js`); the server keeps standard `def` endpoints.
- Pyodide's `hashlib` has no `pbkdf2_hmac`, so `security.py` includes a pure-Python PBKDF2 (tested against the standard library). Every hash stores its iteration count.

### API
| Method | Route | Who |
|---|---|---|
| GET | `/api/events?when=upcoming\|past`, `/api/events/{slug}` | anyone |
| POST | `/api/events/{slug}/register` | anyone |
| GET | `/api/tickets/{code}`, `/api/tickets/{code}/calendar.ics` | ticket holder |
| POST | `/api/tickets/{code}/cancel` | ticket holder |
| POST | `/api/auth/login` · GET `/api/auth/me` | team |
| GET | `/api/staff/events`, `/api/staff/events/{id}/checkins` | organizer, volunteer |
| POST | `/api/staff/checkin`, `/api/staff/checkin/undo` | organizer, volunteer |
| GET | `/api/admin/overview`, `/api/admin/events/{id}`, `/api/admin/events/{id}/registrations[.csv]` | organizer |
| POST / PUT | `/api/admin/events`, `/api/admin/events/{id}` | organizer |

Interactive docs at `/docs` when the server runs.

## Run the server
```
cd backend
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn twiza.main:app --reload --port 8100
```
It uses SQLite (`twiza.db`) and adds demo data on first start. Set `DATABASE_URL` for another database and `TWIZA_SECRET` for token signing.

To use the web front end with this server, set `window.TWIZA_API = "http://localhost:8100"` in `web/config.js` and serve the `web/` folder (e.g. `python -m http.server`). With an empty value, the front end runs the back end in the browser.

Demo accounts (password `demo1234`): organizer `organisatrice@twiza-dz.org`, volunteer `benevole@twiza-dz.org`.

## Tests
```
cd backend
pytest
```
17 tests: listing and phases, validation messages, one ticket per email, waitlist positions and promotion on cancellation or capacity change, closed registrations, calendar times in UTC, roles, tokens, PBKDF2, every check-in outcome including door opening time and undo, statistics, event creation and editing, search, filters and CSV.
