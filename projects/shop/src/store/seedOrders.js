import { WILAYAS } from "../data/wilayas.js";
import { priceWithOptions } from "../data/products.js";
import { shippingCost } from "../format.js";

// Generates realistic demo orders over the last 60 days so the dashboard has data.
// A seeded random generator keeps the result the same on every reset.
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ["Amine", "Yacine", "Sofiane", "Karim", "Walid", "Mehdi", "Nassim", "Riad", "Samir", "Bilal",
  "Amel", "Sara", "Lina", "Nour", "Meriem", "Imane", "Yasmine", "Ines", "Rania", "Kenza"];
const LAST = ["Benali", "Bouzid", "Haddad", "Belkacem", "Mansouri", "Saidi", "Brahimi", "Khelifi", "Djebbar", "Amrani",
  "Boudiaf", "Cherif", "Meziane", "Ouali", "Rahmani", "Zerrouki", "Hamidi", "Lounis", "Taleb", "Ferhat"];
// Bigger cities order more often
const WEIGHTED_WILAYAS = [16, 16, 16, 16, 31, 31, 31, 25, 25, 9, 9, 19, 19, 6, 15, 35, 23, 13, 5, 42, 2, 26, 47, 30, 7, 21, 18, 34, 10, 39, 11, 1];

export function seedOrders(products, days = 60) {
  const r = rng(2024);
  const pick = (arr) => arr[Math.floor(r() * arr.length)];
  const now = Date.now();
  const orders = [];
  let n = 1000;

  for (let d = days; d >= 0; d--) {
    // More orders on recent days and weekends (Thu/Fri in Algeria)
    const day = new Date(now - d * 86400000);
    const weekend = [4, 5].includes(day.getDay());
    const count = Math.floor(r() * 3) + (weekend ? 2 : 1) + (d < 14 ? 1 : 0);

    for (let k = 0; k < count; k++) {
      const date = new Date(day);
      date.setHours(9 + Math.floor(r() * 12), Math.floor(r() * 60), 0, 0);
      if (date.getTime() > now) continue;

      const lineCount = r() < 0.7 ? 1 : 2;
      const items = [];
      for (let l = 0; l < lineCount; l++) {
        // Accessories sell more often than expensive items
        const p = r() < 0.55 ? pick(products.filter((x) => x.price < 20000)) : pick(products);
        const choice = Object.fromEntries((p.options || []).map((o) => [o.key, pick(o.values).id]));
        const key = `${p.id}|${Object.values(choice).join("-")}`;
        if (items.some((i) => i.key === key)) continue;
        items.push({
          key, id: p.id, title: p.title, image: p.image, qty: p.price < 10000 && r() < 0.3 ? 2 : 1,
          price: priceWithOptions(p, choice), options: optionLabels(p, choice),
        });
      }
      const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
      const code = pick(WEIGHTED_WILAYAS);
      const wilaya = WILAYAS.find((w) => w.code === code);
      const method = r() < 0.65 ? "home" : "desk";
      const shipping = shippingCost(wilaya, method, subtotal);

      // Older orders are mostly delivered; recent ones are still being processed
      const roll = r();
      const status = d > 6
        ? (roll < 0.86 ? "delivered" : roll < 0.95 ? "cancelled" : "returned")
        : d > 2
          ? (roll < 0.5 ? "shipped" : roll < 0.8 ? "delivered" : roll < 0.92 ? "confirmed" : "cancelled")
          : (roll < 0.45 ? "new" : roll < 0.8 ? "confirmed" : "shipped");

      const first = pick(FIRST);
      orders.push({
        id: `CMD-${++n}`,
        date: date.toISOString(),
        items, subtotal, shipping, total: subtotal + shipping, method, status,
        customer: {
          fullName: `${first} ${pick(LAST)}`,
          phone: `0${pick(["5", "6", "7"])}${String(Math.floor(r() * 1e8)).padStart(8, "0")}`,
          email: "",
          wilaya: wilaya.code,
          commune: wilaya.name.fr,
          address: method === "home" ? `Cité ${Math.floor(r() * 500) + 1} logements, bt ${Math.floor(r() * 30) + 1}` : "",
        },
      });
    }
  }
  return orders.reverse(); // newest first
}

// Readable option labels for an order line, e.g. [{ fr: "256 Go", ar: "256 غيغا" }, ...]
export function optionLabels(product, choice) {
  return (product.options || []).map((o) => o.values.find((v) => v.id === choice[o.key])?.label).filter(Boolean);
}
