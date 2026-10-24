import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { STRINGS } from "./strings.js";

export const LANGS = [
  { code: "fr", label: "FR", name: "Français" },
  { code: "ar", label: "ع", name: "العربية" },
  { code: "en", label: "EN", name: "English" },
];
const STORAGE_KEY = "cirta-lang";
const LOCALES = { fr: "fr-FR", ar: "ar-DZ", en: "en-GB" };
const I18nContext = createContext(null);

function initialLang() {
  const fromUrl = new URLSearchParams(window.location.search).get("lang");
  if (LANGS.some((l) => l.code === fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (LANGS.some((l) => l.code === saved)) return saved;
  } catch { /* storage unavailable */ }
  return "fr";
}

// Latin digits in every language, as used in Algeria
const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* storage unavailable */ }
  }, [lang]);

  const t = useCallback(
    (key, vars = {}) => (STRINGS[lang][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? ""),
    [lang]
  );

  const value = useMemo(() => ({
    lang,
    setLang,
    dir: lang === "ar" ? "rtl" : "ltr",
    t,
    // Pick the right language from a { fr, ar, en } object
    tr: (obj) => (obj ? obj[lang] || obj.fr || obj.en || "" : ""),
    // API errors arrive in English; show them in the current language when we know them
    errMsg: (e) => STRINGS[lang]["err:" + e?.message] ?? e?.message ?? STRINGS[lang].errorGeneric,
    money: (n) => `${number.format(Math.round(n))} ${lang === "ar" ? "د.ج" : "DA"}`,
    num: (n) => number.format(n),
    date: (d, opts = { day: "numeric", month: "long", year: "numeric" }) => new Date(d).toLocaleDateString(LOCALES[lang], { numberingSystem: "latn", ...opts }),
    ago: (d) => {
      const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
      return days <= 0 ? t("today") : days === 1 ? t("yesterday") : t("daysAgo", { n: days });
    },
  }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
