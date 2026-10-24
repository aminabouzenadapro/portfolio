"""The association's rules: seats and waitlist, cancellations, check-in at the door, statistics.
Routes in app.py stay thin and call these functions."""
from __future__ import annotations

import re
import secrets
from collections import Counter
from datetime import timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from . import clock
from .models import Event, Registration


class Problem(Exception):
    """A rule was broken. `status` is the HTTP status to answer with."""

    def __init__(self, status: int, message: str):
        super().__init__(message)
        self.status = status
        self.message = message


CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no 0/O or 1/I to misread
CHECKIN_OPENS = timedelta(hours=2)  # doors open 2 hours before the start


def new_code(s: Session) -> str:
    while True:
        code = "TWZ-" + "".join(secrets.choice(CODE_ALPHABET) for _ in range(4)) + "-" + "".join(secrets.choice(CODE_ALPHABET) for _ in range(4))
        if not s.scalar(select(Registration.id).where(Registration.code == code)):
            return code


def normalize_code(raw: str) -> str:
    """Accepts a bare code, lowercase, without dashes, or a ticket link as read from the QR code."""
    m = re.search(r"TWZ-?([A-Z0-9]{4})-?([A-Z0-9]{4})", raw.upper())
    return f"TWZ-{m.group(1)}-{m.group(2)}" if m else raw.strip().upper()


def counts(event: Event) -> dict:
    c = Counter(r.status for r in event.registrations)
    checked = sum(1 for r in event.registrations if r.status == "confirmed" and r.checked_in_at)
    return {
        "confirmed": c["confirmed"],
        "waitlist": c["waitlist"],
        "cancelled": c["cancelled"],
        "checked_in": checked,
        "seats_left": max(0, event.capacity - c["confirmed"]),
    }


def phase(event: Event) -> str:
    """upcoming | ongoing | past"""
    n = clock.now()
    if n < event.starts_at:
        return "upcoming"
    return "ongoing" if n <= event.ends_at else "past"


def get_event(s: Session, slug: str, *, public: bool = True) -> Event:
    event = s.scalar(select(Event).where(Event.slug == slug).options(selectinload(Event.registrations)))
    if not event or (public and not event.published):
        raise Problem(404, "Event not found")
    return event


def get_event_by_id(s: Session, event_id: int) -> Event:
    event = s.get(Event, event_id, options=[selectinload(Event.registrations)])
    if not event:
        raise Problem(404, "Event not found")
    return event


def list_events(s: Session, *, when: str = "upcoming", include_unpublished: bool = False) -> list[Event]:
    q = select(Event).options(selectinload(Event.registrations))
    if not include_unpublished:
        q = q.where(Event.published.is_(True))
    n = clock.now()
    if when == "upcoming":
        q = q.where(Event.ends_at >= n).order_by(Event.starts_at)
    elif when == "past":
        q = q.where(Event.ends_at < n).order_by(Event.starts_at.desc())
    else:
        q = q.order_by(Event.starts_at.desc())
    return list(s.scalars(q))


def get_ticket(s: Session, code: str) -> Registration:
    reg = s.scalar(select(Registration).where(Registration.code == normalize_code(code)).options(selectinload(Registration.event).selectinload(Event.registrations)))
    if not reg:
        raise Problem(404, "Ticket not found")
    return reg


def waitlist_position(reg: Registration) -> int | None:
    if reg.status != "waitlist":
        return None
    queue = sorted((r for r in reg.event.registrations if r.status == "waitlist"), key=lambda r: (r.created_at, r.id))
    return queue.index(reg) + 1


def register(s: Session, slug: str, name: str, email: str, phone: str) -> Registration:
    event = get_event(s, slug)
    if phase(event) != "upcoming":
        raise Problem(409, "Registrations are closed for this event")
    existing = next((r for r in event.registrations if r.email == email), None)
    if existing and existing.status != "cancelled":
        raise Problem(409, "This email is already registered for this event")
    status = "confirmed" if counts(event)["confirmed"] < event.capacity else "waitlist"
    if existing:  # registering again after cancelling
        existing.status, existing.name, existing.phone, existing.created_at = status, name, phone, clock.now()
        reg = existing
    else:
        reg = Registration(event=event, code=new_code(s), name=name, email=email, phone=phone, status=status, created_at=clock.now())
        s.add(reg)
    s.flush()
    return reg


def promote_waitlist(event: Event) -> list[Registration]:
    """Gives free seats to the waitlist, first come first served."""
    promoted = []
    free = event.capacity - counts(event)["confirmed"]
    for reg in sorted((r for r in event.registrations if r.status == "waitlist"), key=lambda r: (r.created_at, r.id)):
        if free <= 0:
            break
        reg.status = "confirmed"
        promoted.append(reg)
        free -= 1
    return promoted


def cancel(s: Session, code: str) -> tuple[Registration, list[Registration]]:
    reg = get_ticket(s, code)
    if reg.status == "cancelled":
        raise Problem(409, "This ticket is already cancelled")
    if reg.checked_in_at:
        raise Problem(409, "This ticket has already been used")
    if phase(reg.event) == "past":
        raise Problem(409, "This event is over")
    was_confirmed = reg.status == "confirmed"
    reg.status = "cancelled"
    promoted = promote_waitlist(reg.event) if was_confirmed else []
    s.flush()
    return reg, promoted


def check_in(s: Session, raw_code: str, event_id: int, staff_name: str) -> dict:
    """Checks a ticket at the door. Never raises for a bad ticket: the volunteer
    needs a clear answer on screen, so the result says what went wrong."""
    event = get_event_by_id(s, event_id)
    code = normalize_code(raw_code)
    reg = s.scalar(select(Registration).where(Registration.code == code))
    result = {"code": code, "result": "ok", "registration": None}
    if not reg:
        result["result"] = "unknown"
    elif reg.event_id != event.id:
        result["result"] = "wrong_event"
        result["other_event"] = reg.event.title
    elif reg.status == "cancelled":
        result["result"] = "cancelled"
    elif reg.status == "waitlist":
        result["result"] = "waitlist"
    elif reg.checked_in_at:
        result["result"] = "already"
    elif clock.now() < event.starts_at - CHECKIN_OPENS:
        result["result"] = "too_early"
    elif phase(event) == "past":
        result["result"] = "event_over"
    else:
        reg.checked_in_at = clock.now()
        reg.checked_in_by = staff_name
        s.flush()
    if reg and reg.event_id == event.id:
        result["registration"] = reg
    return result


def undo_check_in(s: Session, code: str, event_id: int) -> Registration:
    reg = get_ticket(s, code)
    if reg.event_id != event_id or not reg.checked_in_at:
        raise Problem(409, "This ticket is not checked in")
    reg.checked_in_at = None
    reg.checked_in_by = None
    s.flush()
    return reg


def apply_event(s: Session, event: Event | None, data) -> Event:
    """Creates or updates an event from a validated EventIn."""
    values = data.model_dump()
    for key in ("title", "summary", "description"):
        values[key] = {k: v.strip() for k, v in values[key].items()}
    if event is None:
        event = Event(slug=unique_slug(s, values["title"]["en"] or values["title"]["fr"]), created_at=clock.now(), registrations=[])
        s.add(event)
    else:
        confirmed = counts(event)["confirmed"]
        if values["capacity"] < confirmed:
            raise Problem(400, f"Capacity can't be lower than the {confirmed} confirmed registrations")
    for key, value in values.items():
        setattr(event, key, value)
    promote_waitlist(event)
    s.flush()
    return event


def unique_slug(s: Session, text: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:60] or "event"
    slug, i = base, 2
    while s.scalar(select(Event.id).where(Event.slug == slug)):
        slug, i = f"{base}-{i}", i + 1
    return slug


def overview(s: Session) -> dict:
    events = list_events(s, when="all", include_unpublished=True)
    past = [e for e in events if phase(e) == "past"]
    upcoming = [e for e in events if phase(e) != "past"]
    attended = sum(counts(e)["checked_in"] for e in past)
    expected = sum(counts(e)["confirmed"] for e in past)
    regs = [r for e in events for r in e.registrations]
    n = clock.now()
    weeks = [0] * 8
    for r in regs:
        ago = (n - r.created_at).days // 7
        if 0 <= ago < 8:
            weeks[7 - ago] += 1
    return {
        "upcoming_events": len(upcoming),
        "registrations": sum(1 for r in regs if r.status != "cancelled"),
        "upcoming_registrations": sum(counts(e)["confirmed"] for e in upcoming),
        "waitlist": sum(counts(e)["waitlist"] for e in upcoming),
        "attendance_rate": round(attended / expected * 100) if expected else None,
        "people": len({r.email for r in regs}),
        "weekly": weeks,
    }


def registrations_csv(event: Event) -> str:
    import csv
    import io

    out = io.StringIO()
    w = csv.writer(out)
    w.writerow(["code", "name", "email", "phone", "status", "registered_at", "checked_in_at"])
    for r in sorted(event.registrations, key=lambda r: (r.created_at, r.id)):
        w.writerow([r.code, r.name, r.email, r.phone, r.status, r.created_at.isoformat(sep=" "), r.checked_in_at.isoformat(sep=" ") if r.checked_in_at else ""])
    return out.getvalue()


def registrations_count(s: Session) -> int:
    return s.scalar(select(func.count(Registration.id))) or 0
