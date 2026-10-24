import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Icon from "./Icon.jsx";
import { Avatar, Logo } from "./ui.jsx";
import { LANGS, useI18n } from "../i18n.jsx";
import { homeFor, useAuth } from "../auth.jsx";
import { DEMO } from "../api/index.js";
import { resetDemo } from "../api/mock.js";
import { DEMO_PASSWORD, DEMO_STUDENT, DEMO_TEACHER } from "../../../shared/seed.js";

export function LangSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="lang-switch" role="group" aria-label={t("language")}>
      {LANGS.map((l) => (
        <button key={l.code} className={l.code === lang ? "on" : ""} aria-pressed={l.code === lang} title={l.name} lang={l.code} onClick={() => setLang(l.code)}>{l.label}</button>
      ))}
    </div>
  );
}

// One-click demo accounts, used by the demo bar and the sign-in page
export function useDemoLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  return async (role) => {
    const user = await login(role === "teacher" ? DEMO_TEACHER : DEMO_STUDENT, DEMO_PASSWORD);
    navigate(homeFor(user));
  };
}

function DemoBar() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const demoLogin = useDemoLogin();
  const navigate = useNavigate();
  return (
    <div className="demo-bar">
      <div className="container demo-inner">
        <span className="demo-tag">{t("demoTag")}</span>
        <span className="demo-text">{t("demoText")}</span>
        <span className="demo-actions">
          <button className={user?.role === "student" ? "on" : ""} onClick={() => demoLogin("student")}><Icon name="user" size={14} />{t("tryStudent")}</button>
          <button className={user?.role === "teacher" ? "on" : ""} onClick={() => demoLogin("teacher")}><Icon name="chart" size={14} />{t("tryTeacher")}</button>
          <button onClick={async () => { if (confirm(t("resetConfirm"))) { await resetDemo(); logout(); navigate("/"); window.location.reload(); } }}><Icon name="refresh" size={14} />{t("resetDemo")}</button>
        </span>
      </div>
    </div>
  );
}

function Header() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="Atelier Yasmina"><Logo /></Link>
        <nav className={`nav ${open ? "open" : ""}`} aria-label={t("mainNav")}>
          <NavLink to="/courses">{t("navCourses")}</NavLink>
          <NavLink to="/verify">{t("navVerify")}</NavLink>
          {user?.role === "student" && <NavLink to="/learning">{t("navLearning")}</NavLink>}
          {user?.role === "teacher" && <NavLink to="/teacher">{t("navTeacher")}</NavLink>}
        </nav>
        <div className="header-end">
          <LangSwitch />
          {user ? (
            <div className="me">
              <Link to={homeFor(user)} className="me-link" title={user.name}><Avatar name={user.name} size={34} /><span className="me-name">{user.name.split(" ")[0]}</span></Link>
              <button className="icon-btn" onClick={() => { logout(); navigate("/"); }} title={t("signOut")} aria-label={t("signOut")}><Icon name="logout" /></button>
            </div>
          ) : (
            <Link to="/login" className="btn small">{t("signIn")}</Link>
          )}
          <button className="icon-btn menu-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={t("menu")}><Icon name={open ? "x" : "menu"} /></button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <Logo light />
          <p>{t("footerAbout")}</p>
        </div>
        <div>
          <h4>{t("footerLinks")}</h4>
          <Link to="/courses">{t("navCourses")}</Link>
          <Link to="/verify">{t("navVerify")}</Link>
          <Link to="/login">{t("signIn")}</Link>
        </div>
        <div>
          <h4>{t("footerVisit")}</h4>
          <p><Icon name="pin" size={15} /> {t("footerAddress")}</p>
          <p><Icon name="clock" size={15} /> {t("footerHours")}</p>
        </div>
      </div>
      <div className="container footer-bottom">© 2026 Atelier Yasmina ·{t("footerNote")}</div>
    </footer>
  );
}

export default function Layout({ children }) {
  const { pathname } = useLocation();
  // Block body on purpose: newer browsers return a Promise from scrollTo, which React would treat as a cleanup
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      {DEMO && <DemoBar />}
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
