"""Algeria's local time. Algeria stays on UTC+1 all year, so a fixed offset is exact
(and avoids needing tz data, which isn't available everywhere, e.g. in the browser build)."""
from datetime import datetime, timedelta, timezone

ALGIERS = timezone(timedelta(hours=1), "CET")

# Tests freeze time by setting this
_frozen: datetime | None = None


def now() -> datetime:
    """Current local time in Algeria, without tzinfo (that's how it is stored)."""
    return _frozen or datetime.now(ALGIERS).replace(tzinfo=None, microsecond=0)


def freeze(at: datetime | None) -> None:
    global _frozen
    _frozen = at
