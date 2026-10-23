// Formatting and helpers for the admin dashboard (French only)
import { wilayaByCode } from "../data/wilayas.js";

const num = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
export const dzd = (n) => `${num.format(Math.round(n))} DA`;
export const compactDzd = (n) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1).replace(".", ",")} M DA` : n >= 1e3 ? `${Math.round(n / 1e3)} k DA` : dzd(n);
export const fmtDate = (d, opts = { day: "2-digit", month: "short", year: "numeric" }) => new Date(d).toLocaleDateString("fr-FR", opts);
export const fmtDateTime = (d) =>
  new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
export const wilayaName = (code) => {
  const w = wilayaByCode(code);
  return w ? `${String(w.code).padStart(2, "0")} - ${w.name.fr}` : "—";
};

// Each status has a label and a color class; badges always show the label (never color alone)
export const STATUS = {
  new: { label: "Nouvelle", cls: "s-new" },
  confirmed: { label: "Confirmée", cls: "s-confirmed" },
  shipped: { label: "Expédiée", cls: "s-shipped" },
  delivered: { label: "Livrée", cls: "s-delivered" },
  cancelled: { label: "Annulée", cls: "s-cancelled" },
  returned: { label: "Retournée", cls: "s-returned" },
};

// Orders that count as sales (cancelled and returned orders bring no revenue)
export const isSale = (o) => o.status !== "cancelled" && o.status !== "returned";

export const DAY = 86400000;
export const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

// Downloads rows as a CSV file that opens correctly in Excel (UTF-8 BOM, ";" separator)
export function downloadCsv(filename, rows) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = "﻿" + rows.map((r) => r.map(esc).join(";")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}
