import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useI18n } from "../i18n.jsx";
import { useSectionNav } from "../useSectionNav.js";
import { BUSINESS } from "../config/business.js";
import { FREE_SHIPPING_FROM } from "../format.js";
import { BagIcon, CloseIcon, MenuIcon } from "./Icons.jsx";

export const SECTIONS = [
  ["produits", "navShop"],
  ["histoire", "navStory"],
  ["avis", "navReviews"],
  ["faq", "navFaq"],
  ["contact", "navContact"],
];

export default function Header() {
  const { count, setOpen } = useCart();
  const { t, tr, money, toggle, shopName } = useI18n();
  const goTo = useSectionNav();
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (id) => { setMenuOpen(false); goTo(id); };

  return (
    <header className="header">
      <div className="announce">{t("announce", { amount: money(FREE_SHIPPING_FROM) })}</div>
      <div className="container header-row">
        <Link to="/" className="logo" aria-label={shopName}>
          <span className="logo-mark">{tr(BUSINESS.initial)}</span>
          {shopName}
        </Link>

        <nav className={`main-nav${menuOpen ? " open" : ""}`} aria-label={t("menu")}>
          {SECTIONS.map(([id, key]) => (
            <button key={id} onClick={() => go(id)}>{t(key)}</button>
          ))}
        </nav>

        <div className="header-actions">
          <button className="lang-btn" onClick={toggle} aria-label={t("switchLangLabel")}>
            {t("switchLang")}
          </button>
          <button className="cart-btn" onClick={() => setOpen(true)} aria-label={t("openCart", { n: count })}>
            <BagIcon />
            <span className="cart-label">{t("cart")}</span>
            {count > 0 && <span className="cart-count">{count}</span>}
          </button>
          <button
            className="icon-btn menu-btn"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={t("menu")}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
