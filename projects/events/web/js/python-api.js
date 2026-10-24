// Runs the real FastAPI app (../backend/twiza) inside the browser with Pyodide (Python on WebAssembly).
// Requests are passed straight to the ASGI app; the SQLite database file is saved in IndexedDB
// after every change, so registrations survive a page reload.

const PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";
const PACKAGES = ["micropip", "sqlalchemy", "pydantic", "sqlite3"];
// Same pins as backend/requirements.txt
const PURE_PYTHON = ["fastapi==0.115.12", "starlette==0.46.2", "segno==1.6.6"];
const MODULES = ["__init__", "clock", "models", "security", "schemas", "services", "seed", "app"];
const DB_PATH = "/home/pyodide/twiza.db";
const STORE = { db: "twiza-demo", store: "files", key: "twiza.db" };
const MAX_AGE_HOURS = 12; // older demo data is replaced, so dates stay realistic

let py = null;
let handle = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error("Could not load " + src));
    document.head.appendChild(s);
  });
}

// ---- IndexedDB copy of the SQLite file ----
function idb(mode, fn) {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(STORE.db, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(STORE.store);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const tx = open.result.transaction(STORE.store, mode);
      const req = fn(tx.objectStore(STORE.store));
      tx.oncomplete = () => { resolve(req?.result); open.result.close(); };
      tx.onerror = () => { reject(tx.error); open.result.close(); };
    };
  });
}
const loadSaved = () => idb("readonly", (s) => s.get(STORE.key)).catch(() => null);
const save = () => idb("readwrite", (s) => s.put({ bytes: py.FS.readFile(DB_PATH), savedAt: Date.now() }, STORE.key)).catch(() => {});
export const resetDemoData = () => idb("readwrite", (s) => s.delete(STORE.key)).catch(() => {});

export async function startPython(onStep = () => {}) {
  onStep("runtime");
  await loadScript(PYODIDE + "pyodide.js");
  py = await window.loadPyodide({ indexURL: PYODIDE });

  onStep("packages");
  await py.loadPackage(PACKAGES);
  await py.pyimport("micropip").install(PURE_PYTHON);

  onStep("app");
  py.FS.mkdirTree("/home/pyodide/twiza");
  const base = new URL("../backend/twiza/", new URL("..", import.meta.url));
  await Promise.all(MODULES.map(async (m) => {
    // "no-cache" revalidates, so a new deploy of the Python code is picked up right away
    const res = await fetch(new URL(m + ".py", base), { cache: "no-cache" });
    if (!res.ok) throw new Error(`Could not load ${m}.py`);
    py.FS.writeFile(`/home/pyodide/twiza/${m}.py`, await res.text());
  }));
  const saved = await loadSaved();
  if (saved && Date.now() - saved.savedAt < MAX_AGE_HOURS * 3600_000) py.FS.writeFile(DB_PATH, saved.bytes);

  handle = await py.runPythonAsync(`
import json, sys
sys.path.insert(0, "/home/pyodide")

# WebAssembly has no threads: run FastAPI's thread-pool work directly
import anyio.to_thread
async def _run_sync(func, *args, **kwargs):
    return func(*args)
anyio.to_thread.run_sync = _run_sync

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from twiza.app import create_app
from twiza.models import Base, Event
from twiza.seed import seed

engine = create_engine("sqlite:///${DB_PATH}")
Base.metadata.create_all(engine)
with Session(engine) as s:
    if not s.scalar(select(Event.id).limit(1)):
        seed(s)
app = create_app(engine)

async def handle(method, path, query, headers_json, body):
    headers = [(k.lower().encode("latin-1"), v.encode("latin-1")) for k, v in json.loads(headers_json).items()]
    data = (body or "").encode()
    if data:
        headers.append((b"content-length", str(len(data)).encode()))
    sent = False
    async def receive():
        nonlocal sent
        if sent:
            return {"type": "http.disconnect"}
        sent = True
        return {"type": "http.request", "body": data, "more_body": False}
    out = {"status": 500, "headers": {}, "body": []}
    async def send(message):
        if message["type"] == "http.response.start":
            out["status"] = message["status"]
            out["headers"] = {k.decode(): v.decode() for k, v in message.get("headers", [])}
        elif message["type"] == "http.response.body":
            out["body"].append(message.get("body", b""))
    scope = {"type": "http", "asgi": {"version": "3.0"}, "http_version": "1.1", "method": method, "scheme": "http",
             "path": path, "raw_path": path.encode(), "query_string": query.encode(), "headers": headers,
             "server": ("demo", 80), "client": ("browser", 0), "root_path": ""}
    await app(scope, receive, send)
    return json.dumps({"status": out["status"], "headers": out["headers"], "body": b"".join(out["body"]).decode("utf-8")})

def demo_tickets(event_id):
    """For the demo check-in screen: a few real codes to try without a camera."""
    from twiza.models import Registration
    with Session(engine) as s:
        regs = list(s.scalars(select(Registration).where(Registration.event_id == event_id)))
        other = s.scalar(select(Registration).where(Registration.event_id != event_id, Registration.status == "confirmed"))
    pick = lambda f: next((r for r in regs if f(r)), None)
    rows = [("valid", pick(lambda r: r.status == "confirmed" and not r.checked_in_at)),
            ("already", pick(lambda r: r.checked_in_at)),
            ("waitlist", pick(lambda r: r.status == "waitlist")),
            ("other", other)]
    return json.dumps([{"kind": k, "code": r.code, "name": r.name} for k, r in rows if r])

handle
`);
  return py.version;
}

export async function pythonFetch(method, path, body, headers) {
  const url = new URL(path, "http://demo");
  const out = JSON.parse(await handle(method, url.pathname, url.search.slice(1), JSON.stringify(headers), body ?? ""));
  if (method !== "GET" && out.status < 400) await save();
  return out;
}

export async function demoTickets(eventId) {
  return JSON.parse(py.globals.get("demo_tickets")(eventId));
}
