import { useSyncExternalStore } from "react";
import { SEED_PRODUCTS } from "../data/products.js";
import { seedOrders } from "./seedOrders.js";

// A tiny client-side database shared by the shop and the admin dashboard.
// Data lives in localStorage, so admin changes show up in the shop immediately
// (even in another tab). Swap these functions for API calls to use a real backend.

const KEY = "dzt-db-v1";
const listeners = new Set();

function fresh() {
  return { products: SEED_PRODUCTS, orders: seedOrders(SEED_PRODUCTS) };
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(saved?.products) && Array.isArray(saved?.orders)) return saved;
  } catch { /* storage unavailable or corrupted */ }
  return fresh();
}

let state = load();

function commit(next) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota or private mode */ }
  listeners.forEach((l) => l());
}

// Keep tabs in sync (e.g. admin open in one tab, shop in another)
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) { state = load(); listeners.forEach((l) => l()); }
  });
}

export const db = {
  get: () => state,
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  saveProduct(product) {
    const exists = state.products.some((p) => p.id === product.id);
    commit({
      ...state,
      products: exists ? state.products.map((p) => (p.id === product.id ? product : p)) : [product, ...state.products],
    });
  },
  deleteProduct(id) {
    commit({ ...state, products: state.products.filter((p) => p.id !== id) });
  },

  // Saves a new order and takes the items out of stock
  addOrder(order) {
    const sold = {};
    order.items.forEach((i) => { sold[i.id] = (sold[i.id] || 0) + i.qty; });
    commit({
      products: state.products.map((p) => (sold[p.id] ? { ...p, stock: Math.max(0, p.stock - sold[p.id]) } : p)),
      orders: [order, ...state.orders],
    });
  },
  setOrderStatus(id, status) {
    commit({ ...state, orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)) });
  },

  reset() { commit(fresh()); },
};

// React hook: re-renders when the selected slice changes
export function useDb(selector) {
  return useSyncExternalStore(db.subscribe, () => selector(state));
}
export const useProducts = () => useDb((s) => s.products);
export const useOrders = () => useDb((s) => s.orders);
