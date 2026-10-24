"""The REST API. The same app runs under uvicorn on a server and, for the hosted demo,
inside the visitor's browser with Pyodide (see web/js/python-api.js).
(No `from __future__ import annotations` here: FastAPI needs the real annotations
of the dependencies defined inside create_app.)"""
from datetime import timedelta
from typing import Annotated, Iterator

import segno
from fastapi import Depends, FastAPI, Header, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from sqlalchemy import Engine, select
from sqlalchemy.orm import Session, sessionmaker

from . import services as sv
from .models import Base, Event, Registration, User
from .schemas import CheckInIn, EventIn, LoginIn, RegisterIn
from .security import check_password, make_token, read_token


# ---------- JSON shapes ----------

def iso(d):
    return d.isoformat(timespec="minutes") if d else None


def event_out(e: Event, *, full: bool = False) -> dict:
    out = {
        "id": e.id, "slug": e.slug, "title": e.title, "summary": e.summary, "category": e.category,
        "place": e.place, "address": e.address, "starts_at": iso(e.starts_at), "ends_at": iso(e.ends_at),
        "capacity": e.capacity, "color": e.color, "published": e.published, "phase": sv.phase(e), **sv.counts(e),
    }
    if full:
        out["description"] = e.description
    return out


def qr_svg(code: str) -> str:
    return segno.make(code, error="m").svg_inline(scale=8, border=2, dark="#16262b")


def ticket_out(r: Registration) -> dict:
    return {
        "code": r.code, "name": r.name, "status": r.status, "position": sv.waitlist_position(r),
        "created_at": iso(r.created_at), "checked_in_at": iso(r.checked_in_at),
        "event": event_out(r.event), "qr_svg": qr_svg(r.code) if r.status != "cancelled" else None,
    }


def registration_row(r: Registration) -> dict:
    return {
        "code": r.code, "name": r.name, "email": r.email, "phone": r.phone, "status": r.status,
        "position": sv.waitlist_position(r), "created_at": iso(r.created_at),
        "checked_in_at": iso(r.checked_in_at), "checked_in_by": r.checked_in_by,
    }


def user_out(u: User) -> dict:
    return {"id": u.id, "name": u.name, "email": u.email, "role": u.role}


def ics(e: Event, code: str) -> str:
    utc = lambda d: (d - timedelta(hours=1)).strftime("%Y%m%dT%H%M%SZ")  # Algeria is UTC+1
    esc = lambda s: s.replace("\\", "\\\\").replace(",", "\\,").replace(";", "\\;").replace("\n", "\\n")
    return "\r\n".join([
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Twiza//Events//FR", "BEGIN:VEVENT",
        f"UID:{code}@twiza-dz.org", f"DTSTAMP:{utc(e.created_at)}", f"DTSTART:{utc(e.starts_at)}", f"DTEND:{utc(e.ends_at)}",
        f"SUMMARY:{esc(e.title['fr'])}", f"LOCATION:{esc(', '.join(filter(None, [e.place, e.address])))}",
        f"DESCRIPTION:{esc('Ticket ' + code)}", "END:VEVENT", "END:VCALENDAR", "",
    ])


# ---------- App ----------

def create_app(engine: Engine) -> FastAPI:
    Base.metadata.create_all(engine)
    make_session = sessionmaker(engine, expire_on_commit=False)
    app = FastAPI(title="Twiza events API", version="1.0.0")
    app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

    @app.exception_handler(sv.Problem)
    async def _problem(_req: Request, exc: sv.Problem):
        return JSONResponse({"detail": exc.message}, status_code=exc.status)

    @app.exception_handler(RequestValidationError)
    async def _invalid(_req: Request, exc: RequestValidationError):
        first = exc.errors()[0]
        message = first.get("msg", "").removeprefix("Value error, ")
        if first.get("type") in ("missing", "json_invalid") or not message:
            message = "Please fill in all required fields"
        return JSONResponse({"detail": message}, status_code=400)

    # One database session per request, committed if the request succeeds
    def db() -> Iterator[Session]:
        with make_session() as s:
            try:
                yield s
                s.commit()
            except Exception:
                s.rollback()
                raise

    DB = Annotated[Session, Depends(db)]

    def signed_in(*roles: str):
        def dependency(s: DB, authorization: Annotated[str | None, Header()] = None) -> User:
            payload = read_token((authorization or "").removeprefix("Bearer "))
            user = payload and s.get(User, payload["sub"])
            if not user:
                raise sv.Problem(401, "Please sign in")
            if roles and user.role not in roles:
                raise sv.Problem(403, "Your account can't do this")
            return user
        return dependency

    Staff = Annotated[User, Depends(signed_in("organizer", "volunteer"))]
    Organizer = Annotated[User, Depends(signed_in("organizer"))]

    @app.get("/api/health")
    def health():
        return {"ok": True}

    # ---- Accounts ----
    @app.post("/api/auth/login")
    def login(body: LoginIn, s: DB):
        user = s.scalar(select(User).where(User.email == body.email.strip().lower()))
        if not user or not check_password(body.password, user.password_hash):
            raise sv.Problem(401, "Wrong email or password")
        return {"token": make_token(user.id, user.role), "user": user_out(user)}

    @app.get("/api/auth/me")
    def me(user: Staff):
        return {"user": user_out(user)}

    # ---- Public ----
    @app.get("/api/events")
    def events(s: DB, when: str = "upcoming"):
        return [event_out(e) for e in sv.list_events(s, when=when)]

    @app.get("/api/events/{slug}")
    def event(slug: str, s: DB):
        return event_out(sv.get_event(s, slug), full=True)

    @app.post("/api/events/{slug}/register", status_code=201)
    def register(slug: str, body: RegisterIn, s: DB):
        return ticket_out(sv.register(s, slug, body.name, body.email, body.phone))

    @app.get("/api/tickets/{code}")
    def ticket(code: str, s: DB):
        return ticket_out(sv.get_ticket(s, code))

    @app.get("/api/tickets/{code}/calendar.ics")
    def ticket_calendar(code: str, s: DB):
        reg = sv.get_ticket(s, code)
        return Response(ics(reg.event, reg.code), media_type="text/calendar", headers={"Content-Disposition": f'attachment; filename="{reg.event.slug}.ics"'})

    @app.post("/api/tickets/{code}/cancel")
    def cancel(code: str, s: DB):
        reg, _promoted = sv.cancel(s, code)
        return ticket_out(reg)

    # ---- Door: organizers and volunteers ----
    @app.get("/api/staff/events")
    def staff_events(s: DB, _user: Staff):
        return [event_out(e) for e in sv.list_events(s, when="upcoming", include_unpublished=True)]

    @app.post("/api/staff/checkin")
    def checkin(body: CheckInIn, s: DB, user: Staff):
        r = sv.check_in(s, body.code, body.event_id, user.name)
        event = sv.get_event_by_id(s, body.event_id)
        return {**r, "registration": registration_row(r["registration"]) if r["registration"] else None, "counts": sv.counts(event)}

    @app.post("/api/staff/checkin/undo")
    def checkin_undo(body: CheckInIn, s: DB, _user: Staff):
        sv.undo_check_in(s, body.code, body.event_id)
        return {"counts": sv.counts(sv.get_event_by_id(s, body.event_id))}

    @app.get("/api/staff/events/{event_id}/checkins")
    def checkins(event_id: int, s: DB, _user: Staff):
        e = sv.get_event_by_id(s, event_id)
        done = sorted((r for r in e.registrations if r.checked_in_at), key=lambda r: r.checked_in_at, reverse=True)
        return {"event": event_out(e), "recent": [registration_row(r) for r in done[:8]]}

    # ---- Organizers ----
    @app.get("/api/admin/overview")
    def overview(s: DB, _user: Organizer):
        return {**sv.overview(s), "events": [event_out(e) for e in sv.list_events(s, when="all", include_unpublished=True)]}

    @app.post("/api/admin/events", status_code=201)
    def create_event(body: EventIn, s: DB, _user: Organizer):
        return event_out(sv.apply_event(s, None, body), full=True)

    @app.get("/api/admin/events/{event_id}")
    def admin_event(event_id: int, s: DB, _user: Organizer):
        return event_out(sv.get_event_by_id(s, event_id), full=True)

    @app.put("/api/admin/events/{event_id}")
    def update_event(event_id: int, body: EventIn, s: DB, _user: Organizer):
        return event_out(sv.apply_event(s, sv.get_event_by_id(s, event_id), body), full=True)

    @app.get("/api/admin/events/{event_id}/registrations")
    def registrations(event_id: int, s: DB, _user: Organizer, q: str = "", status: str = ""):
        e = sv.get_event_by_id(s, event_id)
        rows = sorted(e.registrations, key=lambda r: (r.created_at, r.id))
        if status:
            rows = [r for r in rows if (r.status == status) or (status == "checked_in" and r.checked_in_at)]
        if q:
            needle = q.lower()
            rows = [r for r in rows if needle in f"{r.name} {r.email} {r.phone} {r.code}".lower()]
        return [registration_row(r) for r in rows]

    @app.get("/api/admin/events/{event_id}/registrations.csv")
    def registrations_csv(event_id: int, s: DB, _user: Organizer):
        e = sv.get_event_by_id(s, event_id)
        return Response("\ufeff" + sv.registrations_csv(e), media_type="text/csv; charset=utf-8", headers={"Content-Disposition": f'attachment; filename="{e.slug}-inscriptions.csv"'})

    return app
