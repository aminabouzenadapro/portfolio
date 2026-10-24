"""Server entry point: `uvicorn twiza.main:app --reload` (from the backend folder).
Uses SQLite by default; set DATABASE_URL for another database (e.g. PostgreSQL)."""
import os

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from .app import create_app
from .models import Base, Event
from .seed import seed

engine = create_engine(os.environ.get("DATABASE_URL", "sqlite:///twiza.db"))
Base.metadata.create_all(engine)
with Session(engine) as s:
    if not s.scalar(select(Event.id).limit(1)):
        print("Empty database, demo data added:", seed(s))

app = create_app(engine)
