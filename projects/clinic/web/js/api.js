// API client: a real PHP server when window.CLINIC_API is set, otherwise the PHP app running in this browser.
import { reactive } from "vue";
import { phpFetch } from "./php-api.js";

const BASE = (window.CLINIC_API || "").replace(/\/$/, "");
export const DEMO = !BASE;
const TOKEN = "elamel-token";

export const session = reactive({ user: null });
const token = {
  get: () => { try { return localStorage.getItem(TOKEN); } catch { return null; } },
  set: (v) => { try { v ? localStorage.setItem(TOKEN, v) : localStorage.removeItem(TOKEN); } catch { /* storage unavailable */ } },
};

export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export async function api(path, { method = "GET", body } = {}) {
  const headers = { "content-type": "application/json" };
  if (token.get()) headers.authorization = `Bearer ${token.get()}`;
  const payload = body === undefined ? undefined : JSON.stringify(body);
  let status, text;
  if (DEMO) {
    ({ status, text } = await phpFetch(method, path, payload, headers));
  } else {
    const res = await fetch(BASE + path, { method, headers, body: payload });
    status = res.status;
    text = await res.text();
  }
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* not JSON */ }
  if (status >= 400) throw new ApiError(status, data?.error || "Server error");
  return data;
}

export async function signIn(email, password) {
  const res = await api("/api/auth/login", { method: "POST", body: { email, password } });
  token.set(res.token);
  session.user = res.user;
  return res.user;
}
export function signOut() { token.set(null); session.user = null; }
export async function restoreSession() {
  if (!token.get()) return;
  try { session.user = (await api("/api/auth/me")).user; } catch { signOut(); }
}
