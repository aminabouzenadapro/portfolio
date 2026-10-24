"""Passwords and sign-in tokens, with the standard library only
(so the same code runs on the server and in the browser build)."""
import base64
import hashlib
import hmac
import json
import os
import secrets
import time

TOKEN_HOURS = 12


def _pbkdf2_fallback(password: bytes, salt: bytes, iterations: int) -> bytes:
    """PBKDF2-HMAC-SHA256 (RFC 8018), for Python builds without OpenSSL's pbkdf2_hmac (Pyodide)."""
    inner, outer = hashlib.sha256(), hashlib.sha256()
    key = password if len(password) <= 64 else hashlib.sha256(password).digest()
    key = key.ljust(64, b"\0")
    inner.update(bytes(b ^ 0x36 for b in key))
    outer.update(bytes(b ^ 0x5C for b in key))

    def prf(data: bytes) -> bytes:
        i, o = inner.copy(), outer.copy()
        i.update(data)
        o.update(i.digest())
        return o.digest()

    u = prf(salt + b"\x00\x00\x00\x01")
    result = int.from_bytes(u, "big")
    for _ in range(iterations - 1):
        u = prf(u)
        result ^= int.from_bytes(u, "big")
    return result.to_bytes(32, "big")


NATIVE_PBKDF2 = hasattr(hashlib, "pbkdf2_hmac")
# The pure-Python fallback only runs in the browser demo, where fewer iterations keep sign-in fast.
# Each hash stores its own count, so checking works whatever created it.
ITERATIONS = 120_000 if NATIVE_PBKDF2 else 3_000


def _pbkdf2(password: str, salt: str, iterations: int) -> str:
    if NATIVE_PBKDF2:
        return hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), iterations).hex()
    return _pbkdf2_fallback(password.encode(), salt.encode(), iterations).hex()


def _secret() -> bytes:
    return os.environ.get("TWIZA_SECRET", "dev-only-secret-change-me").encode()


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    return f"pbkdf2${ITERATIONS}${salt}${_pbkdf2(password, salt, ITERATIONS)}"


def check_password(password: str, stored: str) -> bool:
    try:
        _, iterations, salt, digest = stored.split("$")
    except ValueError:
        return False
    return hmac.compare_digest(_pbkdf2(password, salt, int(iterations)), digest)


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def make_token(user_id: int, role: str) -> str:
    payload = _b64(json.dumps({"sub": user_id, "role": role, "exp": int(time.time()) + TOKEN_HOURS * 3600}).encode())
    signature = _b64(hmac.new(_secret(), payload.encode(), hashlib.sha256).digest())
    return f"{payload}.{signature}"


def read_token(token: str) -> dict | None:
    """Returns the payload of a valid, unexpired token, or None."""
    try:
        payload, signature = token.split(".")
    except ValueError:
        return None
    expected = _b64(hmac.new(_secret(), payload.encode(), hashlib.sha256).digest())
    if not hmac.compare_digest(signature, expected):
        return None
    data = json.loads(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)))
    return data if data.get("exp", 0) > time.time() else None
