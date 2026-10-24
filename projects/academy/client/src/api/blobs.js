// Video files uploaded in demo mode, kept in this browser's IndexedDB
// (localStorage is far too small for video). Links look like "idb:<id>".

const DB = "atelier-videos", STORE = "videos";

function open() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => { resolve(req?.result); db.close(); };
    tx.onerror = () => { reject(tx.error); db.close(); };
  });
}

export const blobs = {
  put: (id, blob) => run("readwrite", (s) => s.put(blob, id)),
  get: (id) => run("readonly", (s) => s.get(id)),
  remove: (id) => run("readwrite", (s) => s.delete(id)),
  clear: () => run("readwrite", (s) => s.clear()),
};

// Object URLs for stored videos, created once per id
const urls = new Map();
export async function blobUrl(src) {
  const id = src.slice(4);
  if (!urls.has(id)) {
    const blob = await blobs.get(id);
    if (!blob) return null;
    urls.set(id, URL.createObjectURL(blob));
  }
  return urls.get(id);
}
