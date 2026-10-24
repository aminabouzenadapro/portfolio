"""Database tables: people who run the association, events, and registrations (tickets)."""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from .clock import now


class Base(DeclarativeBase):
    pass


class User(Base):
    """An organizer (manages events) or a volunteer (checks people in at the door)."""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(200))
    role: Mapped[str] = mapped_column(String(20), default="organizer")


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    # Texts are {"fr": ..., "ar": ..., "en": ...}
    title: Mapped[dict] = mapped_column(JSON)
    summary: Mapped[dict] = mapped_column(JSON)
    description: Mapped[dict] = mapped_column(JSON)
    category: Mapped[str] = mapped_column(String(30))
    place: Mapped[str] = mapped_column(String(200))
    address: Mapped[str] = mapped_column(String(200), default="")
    # Local time in Algeria (UTC+1, no daylight saving)
    starts_at: Mapped[datetime] = mapped_column(DateTime)
    ends_at: Mapped[datetime] = mapped_column(DateTime)
    capacity: Mapped[int] = mapped_column(Integer)
    color: Mapped[str] = mapped_column(String(9), default="#12715b")
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

    registrations: Mapped[list[Registration]] = relationship(back_populates="event", cascade="all, delete-orphan")


class Registration(Base):
    """A participant's ticket. Status: confirmed, waitlist or cancelled."""
    __tablename__ = "registrations"
    __table_args__ = (UniqueConstraint("event_id", "email", name="one_ticket_per_email"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), index=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(200))
    phone: Mapped[str] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(20), default="confirmed")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)
    checked_in_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    checked_in_by: Mapped[str | None] = mapped_column(String(120), nullable=True)
    note: Mapped[str] = mapped_column(Text, default="")

    event: Mapped[Event] = relationship(back_populates="registrations")
