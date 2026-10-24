// Small view helpers: an html`` tag that escapes every value unless wrapped in raw(),
// icons, and date formatting for Algerian local times.
import { lang, t } from "./i18n.js";

class Raw { constructor(h) { this.h = h; } toString() { return this.h; } }
export const raw = (h) => new Raw(h);

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ESC[c]);

function render(v) {
  if (v instanceof Raw) return v.h;
  if (Array.isArray(v)) return v.map(render).join("");
  if (v === null || v === undefined || v === false) return "";
  return esc(v);
}
export function html(strings, ...values) {
  return new Raw(strings.reduce((out, s, i) => out + s + (i < values.length ? render(values[i]) : ""), ""));
}

const PATHS = {
  calendar: "M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 2v4M8 2v4M3 10h18",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  pin: "M12 22s-8-7.6-8-13a8 8 0 1 1 16 0c0 5.4-8 13-8 13zM12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  check: "M20 6 9 17l-5-5",
  x: "M18 6 6 18M6 6l12 12",
  alert: "M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
  ticket: "M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4zM13 5v2M13 17v2M13 11v2",
  scan: "M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10",
  arrow: "M5 12h14M13 5l7 7-7 7",
  back: "M19 12H5M11 19l-7-7 7-7",
  plus: "M12 5v14M5 12h14",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35",
  chart: "M3 3v18h18M7 15l4-4 3 3 6-6",
  undo: "M3 7v6h6M21 17a9 9 0 0 0-15-6.7L3 13",
  camera: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z",
  leaf: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10zM2 21c0-3 1.9-5.4 5.1-6",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5",
  landmark: "M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l9 5H3z",
  hands: "M7 11V5.5a1.5 1.5 0 0 1 3 0V10M10 9.5v-6a1.5 1.5 0 0 1 3 0V10M13 7.5a1.5 1.5 0 0 1 3 0V12M16 9.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-2a6 6 0 0 1-5-2.7l-3-4.6a1.5 1.5 0 0 1 2.5-1.7L7 13",
  refresh: "M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15",
  print: "M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  menu: "M3 6h18M3 12h18M3 18h18",
};
export const icon = (name, size = 18, cls = "") =>
  raw(`<svg class="icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${PATHS[name]}"/></svg>`);

export const CATEGORY_ICON = { environment: "leaf", health: "heart", education: "book", culture: "landmark", solidarity: "hands" };

// Event times are Algerian local times without a zone: shown as-is wherever the visitor is
const LOCALE = { fr: "fr-FR", ar: "ar-DZ", en: "en-GB" };
const opts = (o) => ({ numberingSystem: "latn", ...o });
export const fmt = {
  day: (iso) => new Date(iso).toLocaleDateString(LOCALE[lang()], opts({ weekday: "long", day: "numeric", month: "long" })),
  short: (iso) => new Date(iso).toLocaleDateString(LOCALE[lang()], opts({ day: "numeric", month: "short" })),
  dayNum: (iso) => new Date(iso).getDate(),
  month: (iso) => new Date(iso).toLocaleDateString(LOCALE[lang()], opts({ month: "short" })).replace(".", ""),
  time: (iso) => new Date(iso).toLocaleTimeString(LOCALE[lang()], opts({ hour: "2-digit", minute: "2-digit", hour12: false })),
  dateTime: (iso) => new Date(iso).toLocaleString(LOCALE[lang()], opts({ day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false })),
  ago(iso) {
    const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (min < 1) return t("justNow");
    if (min < 60) return t("minutesAgo", { n: min });
    return fmt.time(iso);
  },
};

export function bar(value, max, color) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return raw(`<span class="bar"${color ? ` style="--bar:${esc(color)}"` : ""}><i style="width:${pct}%"></i></span>`);
}

// Saves text as a file (CSV export, calendar)
export function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function toast(message, kind = "ok") {
  const el = Object.assign(document.createElement("div"), { className: `toast ${kind}`, role: "status" });
  el.textContent = message;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 300); }, 2600);
}
