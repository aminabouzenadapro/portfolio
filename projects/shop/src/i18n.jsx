import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { STRINGS } from "./strings.js";
import { BUSINESS } from "./config/business.js";

const STORAGE_KEY = "shop-lang";
const I18nContext = createContext(null);

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "fr" || saved === "ar") return saved;
  } catch { /* storage unavailable */ }
  return "fr";
}

// Algerian dinar: "1 200 DA" in French, "1 200 د.ج" in Arabic (Latin digits, as used in Algeria)
const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    // The admin dashboard is always French / left-to-right and manages this itself
    if (!window.location.hash.startsWith("#/admin")) {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* storage unavailable */ }
  }, [lang]);

  const t = useCallback(
    (key, vars = {}) => (STRINGS[lang][key] ?? key).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? ""),
    [lang]
  );

  const value = useMemo(() => ({
    lang,
    dir: lang === "ar" ? "rtl" : "ltr",
    t,
    // Pick the right language from a { fr, ar } object
    tr: (obj) => (obj ? obj[lang] ?? obj.fr : ""),
    shopName: BUSINESS.name[lang],
    money: (n) => `${number.format(Math.round(n))} ${lang === "ar" ? "د.ج" : "DA"}`,
    date: (d, opts) => new Date(d).toLocaleDateString(lang === "ar" ? "ar-DZ" : "fr-FR", opts),
    toggle: () => setLang((l) => (l === "fr" ? "ar" : "fr")),
  }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
