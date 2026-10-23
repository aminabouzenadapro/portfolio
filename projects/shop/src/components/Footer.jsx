import { Link } from "react-router-dom";
import { useI18n } from "../i18n.jsx";
import { useSectionNav } from "../useSectionNav.js";
import { BUSINESS } from "../config/business.js";
import { SECTIONS } from "./Header.jsx";
import { FacebookIcon, InstagramIcon, PhoneIcon } from "./Icons.jsx";

export default function Footer() {
  const { t, tr, shopName } = useI18n();
  const goTo = useSectionNav();
  const b = BUSINESS;

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <span className="logo"><span className="logo-mark">{tr(b.initial)}</span>{shopName}</span>
          <p className="muted footer-tagline">{tr(b.tagline)}</p>
          <div className="socials">
            <a href={b.instagram.url} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /></a>
            <a href={b.facebook.url} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FacebookIcon /></a>
          </div>
        </div>

        <div>
          <h3>{shopName}</h3>
          <ul className="footer-links">
            {SECTIONS.map(([id, key]) => <li key={id}><button onClick={() => goTo(id)}>{t(key)}</button></li>)}
          </ul>
        </div>

        <div>
          <h3>{t("navContact")}</h3>
          <ul className="footer-links">
            <li><a href={`tel:${b.phone.replace(/\s/g, "")}`} dir="ltr"><PhoneIcon size={16} /> {b.phone}</a></li>
            <li>{tr(b.address)}</li>
            <li><a href={`mailto:${b.email}`}>{b.email}</a></li>
          </ul>
        </div>

        <div>
          <h3>{t("hours")}</h3>
          <ul className="footer-links">
            {b.hours.map((h, i) => <li key={i}>{tr(h.days)} : {tr(h.time)}</li>)}
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>{t("rights", { year: new Date().getFullYear(), shop: shopName })}</span>
        <Link to="/admin" className="admin-link">{t("adminLink")}</Link>
        <span>{t("demoFooter")}</span>
      </div>
    </footer>
  );
}
