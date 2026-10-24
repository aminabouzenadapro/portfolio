// Formatting helpers. Times from the API are Algerian local times ("2026-10-27T09:10") and are shown as-is.
import { i18n } from "./i18n.js";

const LOCALE = { fr: "fr-FR", ar: "ar-DZ", en: "en-GB" };
const loc = () => LOCALE[i18n.lang];
const asDate = (s) => new Date(s.length === 10 ? s + "T12:00" : s);
const o = (x) => ({ numberingSystem: "latn", ...x });

export const fmt = {
  day: (s) => asDate(s).toLocaleDateString(loc(), o({ weekday: "long", day: "numeric", month: "long" })),
  dayShort: (s) => asDate(s).toLocaleDateString(loc(), o({ weekday: "short", day: "numeric", month: "short" })),
  weekday: (s) => asDate(s).toLocaleDateString(loc(), o({ weekday: "short" })).replace(".", ""),
  dayNum: (s) => asDate(s).getDate(),
  month: (s) => asDate(s).toLocaleDateString(loc(), o({ month: "short" })).replace(".", ""),
  time: (s) => s.slice(11, 16),
  money: (n) => `${new Intl.NumberFormat("fr-FR").format(n)} ${i18n.lang === "ar" ? "د.ج" : "DA"}`,
  phone: (p) => (p || "").replace(/^(\d{4})(\d{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4"),
};

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export function addDays(date, n) {
  const d = asDate(date);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export const minutes = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

// Calendar file for the patient's phone (Algeria is UTC+1 all year)
export function ics(a, title) {
  const utc = (s) => { const d = new Date(s + ":00Z"); d.setUTCHours(d.getUTCHours() - 1); return d.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z"; };
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//El Amel//RDV//FR", "BEGIN:VEVENT", `UID:${a.ref}@centre-elamel.dz`,
    `DTSTAMP:${utc(new Date().toISOString().slice(0, 16))}`, `DTSTART:${utc(a.starts_at)}`, `DTEND:${utc(a.ends_at)}`,
    `SUMMARY:${title}`, "LOCATION:Centre médical El Amel\\, Constantine", `DESCRIPTION:Réf. ${a.ref}`, "END:VEVENT", "END:VCALENDAR", ""].join("\r\n");
}

export function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Simple line icons
const P = {
  calendar: "M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 2v4M8 2v4M3 10h18",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  pin: "M12 22s-8-7.6-8-13a8 8 0 1 1 16 0c0 5.4-8 13-8 13zM12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z",
  check: "M20 6 9 17l-5-5", x: "M18 6 6 18M6 6l12 12", arrow: "M5 12h14M13 5l7 7-7 7", back: "M19 12H5M11 19l-7-7 7-7",
  left: "M15 18l-6-6 6-6", right: "M9 18l6-6-6-6", user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  chart: "M3 3v18h18M7 15l4-4 3 3 6-6", sms: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", plus: "M12 5v14M5 12h14",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9", search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35",
  ban: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM4.9 4.9l14.2 14.2", print: "M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4", refresh: "M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15",
  stethoscope: "M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4M20 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  tooth: "M12 5.5C10.5 4 9 3.5 7.5 3.5 5 3.5 3.5 5.5 3.5 8c0 3 1 4.5 1.5 7.5.4 2.5 1 5 2.5 5s1.8-2.5 2.2-4.5c.3-1.3.9-2 2.3-2s2 .7 2.3 2c.4 2 .7 4.5 2.2 4.5s2.1-2.5 2.5-5c.5-3 1.5-4.5 1.5-7.5 0-2.5-1.5-4.5-4-4.5-1.5 0-3 .5-4.5 2z",
  baby: "M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1",
};
export const SPECIALTY_ICON = { general: "stethoscope", dentist: "tooth", pediatrics: "baby" };

export const Icon = {
  props: { name: String, size: { type: Number, default: 18 } },
  template: `<svg class="icon" :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="paths[name]"/></svg>`,
  setup: () => ({ paths: P }),
};
