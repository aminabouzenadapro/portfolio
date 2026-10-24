// Runs the real PHP back end (../backend) inside the browser with php-wasm (PHP compiled to
// WebAssembly, from WordPress Playground). Each API request runs public/index.php, as Apache would.
// The SQLite database file is copied to IndexedDB after every change.

const PHP_WASM = "3.1.60";
const PHP_VERSION = "8.3";
const FILES = [
  "public/index.php", "src/bootstrap.php", "src/App.php", "src/Auth.php", "src/Availability.php", "src/Bookings.php",
  "src/Catalog.php", "src/Clock.php", "src/Db.php", "src/Desk.php", "src/HttpError.php", "src/Request.php",
  "src/Response.php", "src/Router.php", "src/Seed.php", "src/Sms.php", "schema/sqlite.sql", "schema/mysql.sql",
];
const DB_FILE = "/data/clinic.db";
const IDB = { name: "elamel-demo", store: "files", key: "clinic.db" };
const MAX_AGE_HOURS = 12; // older demo data is reset so the agenda stays around today

let php = null;
let queue = Promise.resolve(); // one PHP request at a time

function idb(mode, fn) {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(IDB.name, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(IDB.store);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const tx = open.result.transaction(IDB.store, mode);
      const req = fn(tx.objectStore(IDB.store));
      tx.oncomplete = () => { resolve(req?.result); open.result.close(); };
      tx.onerror = () => { reject(tx.error); open.result.close(); };
    };
  });
}
export const resetDemoData = () => idb("readwrite", (s) => s.delete(IDB.key)).catch(() => {});

export async function startPhp(onStep = () => {}) {
  onStep("runtime");
  const [{ loadWebRuntime }, { PHP }] = await Promise.all([
    import(`https://esm.sh/@php-wasm/web@${PHP_WASM}`),
    import(`https://esm.sh/@php-wasm/universal@${PHP_WASM}`),
  ]);
  php = new PHP(await loadWebRuntime(PHP_VERSION));

  onStep("app");
  const base = new URL("../../backend/", import.meta.url);
  await Promise.all(FILES.map(async (f) => {
    const res = await fetch(new URL(f, base), { cache: "no-cache" });
    if (!res.ok) throw new Error(`Could not load ${f}`);
    const path = `/app/${f}`;
    php.mkdir(path.slice(0, path.lastIndexOf("/")));
    php.writeFile(path, await res.text());
  }));
  php.mkdir("/data");

  onStep("data");
  const saved = await idb("readonly", (s) => s.get(IDB.key)).catch(() => null);
  if (saved && Date.now() - saved.savedAt < MAX_AGE_HOURS * 3600_000) php.writeFile(DB_FILE, saved.bytes);
  // The first request creates the tables and the demo data if needed
  const health = await phpFetch("GET", "/api/health");
  if (health.status !== 200) throw new Error("PHP: " + health.text.slice(0, 300));
  await save();
}

async function save() {
  await idb("readwrite", (s) => s.put({ bytes: php.readFileAsBuffer(DB_FILE), savedAt: Date.now() }, IDB.key)).catch(() => {});
}

export function phpFetch(method, path, body, headers = {}) {
  const run = async () => {
    const res = await php.run({
      scriptPath: "/app/public/index.php",
      relativeUri: path,
      method,
      headers,
      body: body ?? "",
      env: { DATABASE_URL: `sqlite:${DB_FILE}`, APP_SECRET: "in-browser-demo" },
      $_SERVER: { REQUEST_URI: path, REQUEST_METHOD: method, ...Object.fromEntries(Object.entries(headers).map(([k, v]) => ["HTTP_" + k.toUpperCase().replace(/-/g, "_"), v])) },
    });
    const out = { status: res.httpStatusCode, text: res.text };
    if (method !== "GET" && out.status < 400) await save();
    return out;
  };
  queue = queue.then(run, run);
  return queue;
}
