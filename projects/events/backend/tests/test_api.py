from datetime import timedelta

from conftest import NOW, person

from twiza import clock
import hashlib

from twiza.security import _pbkdf2_fallback, check_password, hash_password, make_token, read_token


# ---------- Public pages ----------

def test_upcoming_events_include_the_one_in_progress_but_not_past_ones(client):
    events = client.get("/api/events").json()
    slugs = [e["slug"] for e in events]
    assert slugs[0] == "cafe-lecture-enfants" and events[0]["phase"] == "ongoing"
    assert "nettoyage-berges-rhumel" not in slugs
    assert [e["starts_at"] for e in events] == sorted(e["starts_at"] for e in events)
    past = client.get("/api/events?when=past").json()
    assert [e["slug"] for e in past] == ["nettoyage-berges-rhumel", "conference-entreprendre"]


def test_event_page_has_texts_in_three_languages_and_live_counts(client):
    e = client.get("/api/events/atelier-code-enfants").json()
    assert set(e["title"]) == {"fr", "ar", "en"} and e["description"]["ar"]
    assert (e["confirmed"], e["waitlist"], e["seats_left"]) == (20, 6, 0)
    assert client.get("/api/events/nope").status_code == 404


# ---------- Registration, waitlist, cancellation ----------

def test_registration_gives_a_ticket_with_a_qr_code(client):
    r = client.post("/api/events/balade-patrimoine-souika/register", json=person(1))
    assert r.status_code == 201
    t = r.json()
    assert t["status"] == "confirmed" and t["code"].startswith("TWZ-")
    assert t["qr_svg"].startswith("<svg")
    assert client.get(f"/api/tickets/{t['code'].lower()}").json()["name"] == "Test Person 1"


def test_registration_is_validated_with_readable_messages(client):
    url = "/api/events/balade-patrimoine-souika/register"
    assert client.post(url, json=person(phone="12345")).json()["detail"].startswith("Please enter a valid mobile number")
    assert client.post(url, json=person(email="nope")).json()["detail"] == "Please enter a valid email"
    assert client.post(url, json=person(name="A")).json()["detail"] == "Please enter your full name"
    assert client.post(url, json=person(consent=False)).json()["detail"].startswith("Please accept")
    assert client.post(url, json={}).json()["detail"] == "Please fill in all required fields"
    # +213 numbers are accepted and stored in the local format
    assert client.post(url, json=person(2, phone="+213 661 23 45 67")).status_code == 201


def test_one_ticket_per_email(client):
    url = "/api/events/balade-patrimoine-souika/register"
    assert client.post(url, json=person(3)).status_code == 201
    r = client.post(url, json=person(3, email="TEST3@mail.dz"))
    assert r.status_code == 409


def test_full_event_goes_to_waitlist_and_a_cancellation_promotes_the_first_in_line(client):
    url = "/api/events/atelier-code-enfants/register"
    t = client.post(url, json=person(4)).json()
    assert t["status"] == "waitlist" and t["position"] == 7

    # Cancel a confirmed seat: the first on the waitlist gets it
    first_waiting = client.get("/api/events/atelier-code-enfants").json()
    confirmed_ticket = _a_ticket(client, "atelier-code-enfants", "confirmed")
    waiting_ticket = _a_ticket(client, "atelier-code-enfants", "waitlist")
    r = client.post(f"/api/tickets/{confirmed_ticket}/cancel")
    assert r.json()["status"] == "cancelled" and r.json()["qr_svg"] is None
    assert client.get(f"/api/tickets/{waiting_ticket}").json()["status"] == "confirmed"
    assert client.get(f"/api/tickets/{t['code']}").json()["position"] == 6
    after = client.get("/api/events/atelier-code-enfants").json()
    assert (after["confirmed"], after["waitlist"]) == (20, first_waiting["waitlist"] - 1)

    assert client.post(f"/api/tickets/{confirmed_ticket}/cancel").status_code == 409


def test_registering_again_after_cancelling_reuses_the_ticket(client):
    url = "/api/events/balade-patrimoine-souika/register"
    code = client.post(url, json=person(5)).json()["code"]
    client.post(f"/api/tickets/{code}/cancel")
    again = client.post(url, json=person(5)).json()
    assert again["code"] == code and again["status"] == "confirmed"


def test_registrations_close_once_the_event_has_started(client):
    r = client.post("/api/events/cafe-lecture-enfants/register", json=person(6))
    assert r.status_code == 409 and "closed" in r.json()["detail"]


def test_calendar_file(client):
    code = client.post("/api/events/collecte-de-sang/register", json=person(7)).json()["code"]
    r = client.get(f"/api/tickets/{code}/calendar.ics")
    assert r.headers["content-type"].startswith("text/calendar")
    body = r.text
    start = (NOW + timedelta(days=10)).replace(hour=8, minute=0)  # 09:00 in Algeria is 08:00 UTC
    assert f"DTSTART:{start:%Y%m%dT%H%M%S}Z" in body and f"UID:{code}@twiza-dz.org" in body


# ---------- Accounts and roles ----------

def test_sign_in_and_roles(client, organizer, volunteer):
    assert client.post("/api/auth/login", json={"email": "organisatrice@twiza-dz.org", "password": "wrong"}).status_code == 401
    assert client.get("/api/admin/overview").status_code == 401
    assert client.get("/api/admin/overview", headers={"Authorization": "Bearer forged.token"}).status_code == 401
    assert client.get("/api/admin/overview", headers=volunteer).status_code == 403
    assert client.get("/api/staff/events", headers=volunteer).status_code == 200
    assert client.get("/api/auth/me", headers=organizer).json()["user"]["role"] == "organizer"


def test_passwords_and_tokens():
    stored = hash_password("s3cret-pass")
    assert check_password("s3cret-pass", stored) and not check_password("other", stored)
    token = make_token(4, "volunteer")
    assert read_token(token)["sub"] == 4
    payload, sig = token.split(".")
    assert read_token(payload + "." + sig[:-2] + "AA") is None
    assert read_token("garbage") is None


def test_pure_python_pbkdf2_matches_the_standard_library():
    # Used by the browser build, which has no hashlib.pbkdf2_hmac
    for password, salt, n in [(b"demo1234", b"abc", 1), (b"demo1234", b"salt" * 8, 50), (b"x" * 100, b"s", 3)]:
        assert _pbkdf2_fallback(password, salt, n) == hashlib.pbkdf2_hmac("sha256", password, salt, n)


# ---------- Check-in at the door ----------

def _a_ticket(client, slug, status, organizer=None):
    from twiza.seed import ORGANIZER
    from conftest import login
    headers = organizer or login(client, ORGANIZER)
    event_id = client.get(f"/api/events/{slug}").json()["id"]
    rows = client.get(f"/api/admin/events/{event_id}/registrations?status={status}", headers=headers).json()
    unchecked = [r for r in rows if not r["checked_in_at"]]
    return (unchecked or rows)[0]["code"]


def test_check_in_flow(client, organizer, volunteer):
    event = client.get("/api/events/cafe-lecture-enfants").json()
    code = _a_ticket(client, "cafe-lecture-enfants", "confirmed", organizer)
    url = "/api/staff/checkin"

    r = client.post(url, json={"code": code.lower().replace("-", ""), "event_id": event["id"]}, headers=volunteer).json()
    assert r["result"] == "ok" and r["registration"]["checked_in_by"] == "Walid Haddad"
    assert r["counts"]["checked_in"] == event["checked_in"] + 1

    again = client.post(url, json={"code": f"https://twiza-dz.org/#/ticket/{code}", "event_id": event["id"]}, headers=volunteer).json()
    assert again["result"] == "already"

    assert client.post(url, json={"code": "TWZ-AAAA-AAAA", "event_id": event["id"]}, headers=volunteer).json()["result"] == "unknown"
    other = _a_ticket(client, "collecte-de-sang", "confirmed", organizer)
    wrong = client.post(url, json={"code": other, "event_id": event["id"]}, headers=volunteer).json()
    assert wrong["result"] == "wrong_event" and wrong["registration"] is None

    undo = client.post(url + "/undo", json={"code": code, "event_id": event["id"]}, headers=volunteer)
    assert undo.json()["counts"]["checked_in"] == event["checked_in"]
    assert client.post(url + "/undo", json={"code": code, "event_id": event["id"]}, headers=volunteer).status_code == 409

    recent = client.get(f"/api/staff/events/{event['id']}/checkins", headers=volunteer).json()["recent"]
    assert len(recent) == 8 and recent == sorted(recent, key=lambda r: r["checked_in_at"], reverse=True)


def test_check_in_refuses_waitlist_cancelled_and_too_early(client, organizer, volunteer):
    workshop = client.get("/api/events/atelier-code-enfants").json()
    waiting = _a_ticket(client, "atelier-code-enfants", "waitlist", organizer)
    assert client.post("/api/staff/checkin", json={"code": waiting, "event_id": workshop["id"]}, headers=volunteer).json()["result"] == "waitlist"
    confirmed = _a_ticket(client, "atelier-code-enfants", "confirmed", organizer)
    assert client.post("/api/staff/checkin", json={"code": confirmed, "event_id": workshop["id"]}, headers=volunteer).json()["result"] == "too_early"
    cancelled = client.post("/api/events/balade-patrimoine-souika/register", json=person(8)).json()["code"]
    client.post(f"/api/tickets/{cancelled}/cancel")
    walk = client.get("/api/events/balade-patrimoine-souika").json()
    assert client.post("/api/staff/checkin", json={"code": cancelled, "event_id": walk["id"]}, headers=volunteer).json()["result"] == "cancelled"

    # Doors open two hours before the start (14:00): at 12:30 the same ticket is accepted
    clock.freeze(NOW.replace(hour=12, minute=30) + timedelta(days=13))
    assert client.post("/api/staff/checkin", json={"code": confirmed, "event_id": workshop["id"]}, headers=volunteer).json()["result"] == "ok"


# ---------- Organizer tools ----------

def test_overview(client, organizer):
    o = client.get("/api/admin/overview", headers=organizer).json()
    assert o["upcoming_events"] == 5 and o["waitlist"] == 6
    assert o["attendance_rate"] == round((56 + 33) / (71 + 46) * 100)
    assert len(o["weekly"]) == 8 and sum(o["weekly"]) > 0
    assert len(o["events"]) == 7


def _event_body(**extra):
    start = NOW + timedelta(days=30)
    body = {
        "title": {"fr": "Iftar solidaire", "ar": "إفطار تضامني", "en": "Community iftar"},
        "summary": {"fr": "Repas partagé", "ar": "وجبة مشتركة", "en": "Shared meal"},
        "description": {"fr": "Texte", "ar": "نص", "en": "Text"},
        "category": "solidarity", "place": "Mosquée Émir-Abdelkader", "address": "",
        "starts_at": start.isoformat(), "ends_at": (start + timedelta(hours=3)).isoformat(),
        "capacity": 2, "color": "#e8590c", "published": True,
    }
    body.update(extra)
    return body


def test_create_and_edit_events(client, organizer):
    bad = client.post("/api/admin/events", json=_event_body(ends_at=(NOW + timedelta(days=29)).isoformat()), headers=organizer)
    assert bad.status_code == 400 and bad.json()["detail"] == "The event must end after it starts"
    missing_ar = _event_body(title={"fr": "x", "ar": " ", "en": "x"})
    assert client.post("/api/admin/events", json=missing_ar, headers=organizer).json()["detail"] == "Fill in the French, Arabic and English versions"

    e = client.post("/api/admin/events", json=_event_body(), headers=organizer).json()
    assert e["slug"] == "community-iftar"
    assert client.post("/api/admin/events", json=_event_body(), headers=organizer).json()["slug"] == "community-iftar-2"

    for i in range(3):
        client.post("/api/events/community-iftar/register", json=person(20 + i))
    assert client.get("/api/events/community-iftar").json()["waitlist"] == 1

    too_small = client.put(f"/api/admin/events/{e['id']}", json=_event_body(capacity=1), headers=organizer)
    assert too_small.status_code == 400 and "2 confirmed" in too_small.json()["detail"]
    bigger = client.put(f"/api/admin/events/{e['id']}", json=_event_body(capacity=5), headers=organizer).json()
    assert (bigger["confirmed"], bigger["waitlist"]) == (3, 0), "raising capacity promotes the waitlist"

    hidden = client.put(f"/api/admin/events/{e['id']}", json=_event_body(capacity=5, published=False), headers=organizer)
    assert hidden.status_code == 200
    assert client.get("/api/events/community-iftar").status_code == 404


def test_registrations_list_search_and_csv(client, organizer):
    event_id = client.get("/api/events/conference-entreprendre").json()["id"]
    url = f"/api/admin/events/{event_id}/registrations"
    everyone = client.get(url, headers=organizer).json()
    assert len(everyone) == 47
    assert len(client.get(url + "?status=checked_in", headers=organizer).json()) == 33
    one = everyone[3]
    assert [r["code"] for r in client.get(url + f"?q={one['email'][:12]}", headers=organizer).json()] == [one["code"]]
    csv = client.get(url + ".csv", headers=organizer)
    assert csv.headers["content-type"].startswith("text/csv")
    lines = csv.text.lstrip("﻿").strip().splitlines()
    assert lines[0] == "code,name,email,phone,status,registered_at,checked_in_at" and len(lines) == 48
