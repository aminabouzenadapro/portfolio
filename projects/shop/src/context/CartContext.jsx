import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { defaultChoice, priceWithOptions } from "../data/products.js";
import { optionLabels } from "../store/seedOrders.js";

const CartContext = createContext(null);
const STORAGE_KEY = "dzt-cart";
const MAX_QTY = 10;

const limit = (item, qty) => Math.max(1, Math.min(qty, item.stock || MAX_QTY, MAX_QTY));

// Each line is one product + one combination of options (e.g. iPhone 15, 256 Go, Noir)
function reducer(items, action) {
  switch (action.type) {
    case "add": {
      const existing = items.find((i) => i.key === action.item.key);
      if (existing) {
        return items.map((i) => (i.key === existing.key ? { ...i, qty: limit(i, i.qty + action.qty) } : i));
      }
      return [...items, { ...action.item, qty: limit(action.item, action.qty) }];
    }
    case "set":
      return items.map((i) => (i.key === action.key ? { ...i, qty: limit(i, action.qty) } : i));
    case "remove":
      return items.filter((i) => i.key !== action.key);
    case "clear":
      return [];
    default:
      return items;
  }
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, load);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* storage unavailable */ }
  }, [items]);

  const value = useMemo(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    return {
      items,
      count,
      subtotal,
      open,
      setOpen,
      // `choice` holds the selected options, e.g. { storage: "256", color: "noir" }
      add(product, qty = 1, choice = defaultChoice(product), { openDrawer = true } = {}) {
        const item = {
          key: `${product.id}|${Object.values(choice).join("-")}`,
          id: product.id,
          title: product.title,
          image: product.image,
          stock: product.stock,
          price: priceWithOptions(product, choice),
          options: optionLabels(product, choice),
        };
        dispatch({ type: "add", item, qty });
        if (openDrawer) setOpen(true);
      },
      setQty: (key, qty) => dispatch({ type: "set", key, qty }),
      remove: (key) => dispatch({ type: "remove", key }),
      clear: () => dispatch({ type: "clear" }),
    };
  }, [items, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
