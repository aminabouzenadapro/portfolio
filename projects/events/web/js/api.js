// API client. With window.TWIZA_API set (see config.js) it calls a FastAPI server;
// otherwise it calls the same FastAPI app running in this browser (python-api.js).
import { pythonFetch } from "./python-api.js";

const BASE = (window.TWIZA_API || "").replace(/\/$/, "");
export const DEMO = !BASE;

const TOKEN = "twiza-token";
export const session = {
  get token() { try { return localStorage.getItem(TOKEN); } catch { return null; } },
  set token(v) { try { v ? localStorage.setItem(TOKEN, v) : localStorage.removeItem(TOKEN); } catch { /* storage unavailable */ } },
  user: null,
};

export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// Returns parsed JSON, or text for CSV / calendar files
export async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  if (session.token) headers.Authorization = `Bearer ${session.token}`;
  const payload = body === undefined ? undefined : JSON.stringify(body);
  let status, type, text;
  if (DEMO) {
    const res = await pythonFetch(method, path, payload, headers);
    ({ status, body: text } = res);
    type = res.headers["content-type"] || "";
  } else {
    const res = await fetch(BASE + path, { method, headers, body: payload });
    status = res.status;
    type = res.headers.get("content-type") || "";
    text = await res.text();
  }
  const data = type.includes("json") ? JSON.parse(text || "null") : text;
  if (status >= 400) throw new ApiError(status, data?.detail || "Error");
  return data;
}

export async function signIn(email, password) {
  const { token, user } = await api("/api/auth/login", { method: "POST", body: { email, password } });
  session.token = token;
  session.user = user;
  return user;
}

export function signOut() {
  session.token = null;
  session.user = null;
}

export async function restoreSession() {
  if (!session.token) return null;
  try { session.user = (await api("/api/auth/me")).user; } catch { signOut(); }
  return session.user;
}

// Tickets this browser has booked, so participants find them again without an account
const MINE = "twiza-my-tickets";
export const myTickets = {
  list() { try { return JSON.parse(localStorage.getItem(MINE)) || []; } catch { return []; } },
  add(code) { const l = myTickets.list().filter((c) => c !== code); l.unshift(code); try { localStorage.setItem(MINE, JSON.stringify(l.slice(0, 20))); } catch { /* storage unavailable */ } },
};
