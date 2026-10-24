from datetime import datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from twiza import clock
from twiza.app import create_app
from twiza.models import Base
from twiza.seed import DEMO_PASSWORD, ORGANIZER, VOLUNTEER, seed

NOW = datetime(2026, 10, 24, 15, 20)


@pytest.fixture()
def client():
    clock.freeze(NOW)
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    with Session(engine) as s:
        seed(s, NOW)
    with TestClient(create_app(engine)) as c:
        yield c
    clock.freeze(None)


def login(client, email):
    r = client.post("/api/auth/login", json={"email": email, "password": DEMO_PASSWORD})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


@pytest.fixture()
def organizer(client):
    return login(client, ORGANIZER)


@pytest.fixture()
def volunteer(client):
    return login(client, VOLUNTEER)


def person(i=1, **extra):
    return {"name": f"Test Person {i}", "email": f"test{i}@mail.dz", "phone": "0555 12 34 5" + str(i % 10), "consent": True, **extra}
