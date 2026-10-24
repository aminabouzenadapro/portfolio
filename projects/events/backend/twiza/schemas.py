"""Request bodies, validated by pydantic. Error messages are short English sentences
that the front end translates."""
import re
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, field_validator, model_validator

CATEGORIES = ("environment", "health", "education", "culture", "solidarity")
EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
# Algerian mobile numbers: 05, 06 or 07 followed by 8 digits
PHONE = re.compile(r"^0[5-7]\d{8}$")


class LoginIn(BaseModel):
    email: str
    password: str


class RegisterIn(BaseModel):
    name: str
    email: str
    phone: str
    consent: bool = False

    @field_validator("name")
    @classmethod
    def _name(cls, v: str) -> str:
        v = " ".join(v.split())
        if len(v) < 3 or len(v) > 120:
            raise ValueError("Please enter your full name")
        return v

    @field_validator("email")
    @classmethod
    def _email(cls, v: str) -> str:
        v = v.strip().lower()
        if not EMAIL.match(v):
            raise ValueError("Please enter a valid email")
        return v

    @field_validator("phone")
    @classmethod
    def _phone(cls, v: str) -> str:
        v = re.sub(r"[\s.-]", "", v).replace("+213", "0", 1)
        if not PHONE.match(v):
            raise ValueError("Please enter a valid mobile number (05, 06 or 07 + 8 digits)")
        return v

    @field_validator("consent")
    @classmethod
    def _consent(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Please accept to be contacted about this event")
        return v


class I18n(BaseModel):
    fr: str
    ar: str
    en: str

    @model_validator(mode="after")
    def _filled(self):
        if not all(s.strip() for s in (self.fr, self.ar, self.en)):
            raise ValueError("Fill in the French, Arabic and English versions")
        return self


class EventIn(BaseModel):
    title: I18n
    summary: I18n
    description: I18n
    category: Literal[CATEGORIES]
    place: str
    address: str = ""
    starts_at: datetime
    ends_at: datetime
    capacity: int
    color: str = "#12715b"
    published: bool = True

    @field_validator("place")
    @classmethod
    def _place(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Please enter the place")
        return v.strip()

    @field_validator("capacity")
    @classmethod
    def _capacity(cls, v: int) -> int:
        if not 1 <= v <= 5000:
            raise ValueError("Capacity must be between 1 and 5000")
        return v

    @field_validator("color")
    @classmethod
    def _color(cls, v: str) -> str:
        if not re.fullmatch(r"#[0-9a-fA-F]{6}", v):
            raise ValueError("Invalid color")
        return v

    @model_validator(mode="after")
    def _dates(self):
        if self.ends_at <= self.starts_at:
            raise ValueError("The event must end after it starts")
        return self


class CheckInIn(BaseModel):
    code: str
    event_id: int
