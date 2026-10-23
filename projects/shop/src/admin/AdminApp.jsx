import { useEffect, useState } from "react";
import { Link, NavLink, Route, Routes } from "react-router-dom";
import { useI18n } from "../i18n.jsx";
import { db, useOrders } from "../store/db.js";
import { BUSINESS } from "../config/business.js";
import Dashboard from "./Dashboard.jsx";
import Orders from "./Orders.jsx";
import Products from "./Products.jsx";
import { BoxIcon, ExternalIcon, GridIcon, LogoutIcon, ReceiptIcon, RefreshIcon } from "../components/Icons.jsx";
import "./admin.css";

// Demo access only: a real site must check credentials on a server.
export const DEMO_ADMIN = { email: "admin@dzairtech.demo", password: "demo2026" };
const SESSION_KEY = "dzt-admin";

export default function AdminApp() {
  const { lang } = useI18n();
  const [authed, setAuthed] = useState(() => {
    try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
  });
  const toProcess = useOrders().filter((o) => o.status === "new").length;

  // The admin is French and left-to-right; restore the shop's language when leaving
  useEffect(() => {
    const html = document.documentElement;
    html.lang = "fr"; html.dir = "ltr";
    document.title = `Administration — ${BUSINESS.name.fr}`;
    return () => { html.lang = lang; html.dir = lang === "ar" ? "rtl" : "ltr"; };
  }, [lang]);

  const login = () => { try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ } setAuthed(true); };
  const logout = () => { try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ } setAuthed(false); };
  const reset = () => {
    if (window.confirm("Réinitialiser la démo ? Les produits et commandes reviendront à leur état initial.")) db.reset();
  };

  if (!authed) return <Login onLogin={login} />;

  return (
    <div className="admin" dir="ltr" lang="fr">
      <aside className="adm-side">
        <Link to="/admin" className="adm-brand">
          <span className="adm-logo">{BUSINESS.initial.fr}</span>
          <span>{BUSINESS.name.fr}<small>Administration</small></span>
        </Link>
        <nav className="adm-nav">
          <NavLink to="/admin" end><GridIcon size={18} /> Tableau de bord</NavLink>
          <NavLink to="/admin/commandes">
            <ReceiptIcon size={18} /> Commandes
            {toProcess > 0 && <span className="adm-count" aria-label={`${toProcess} nouvelles`}>{toProcess}</span>}
          </NavLink>
          <NavLink to="/admin/produits"><BoxIcon size={18} /> Produits</NavLink>
        </nav>
        <div className="adm-side-foot">
          <Link to="/" target="_blank"><ExternalIcon size={16} /> Voir la boutique</Link>
          <button onClick={reset}><RefreshIcon size={16} /> Réinitialiser la démo</button>
          <button onClick={logout}><LogoutIcon size={16} /> Déconnexion</button>
        </div>
      </aside>

      <main className="adm-main">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="commandes" element={<Orders />} />
          <Route path="produits" element={<Products />} />
        </Routes>
      </main>
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password) onLogin();
    else setError("E-mail ou mot de passe incorrect.");
  }

  return (
    <div className="adm-login" dir="ltr" lang="fr">
      <form className="adm-card adm-login-card" onSubmit={submit} noValidate>
        <span className="adm-logo big">{BUSINESS.initial.fr}</span>
        <h1>Administration</h1>
        <p className="adm-muted">Connectez-vous pour gérer la boutique {BUSINESS.name.fr}.</p>

        <label className="adm-field">
          <span>E-mail</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        </label>
        <label className="adm-field">
          <span>Mot de passe</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        {error && <p className="adm-error" role="alert">{error}</p>}
        <button className="adm-btn primary block" type="submit">Se connecter</button>

        <div className="adm-demo-box">
          <strong>Accès de démonstration</strong>
          <span>{DEMO_ADMIN.email} · {DEMO_ADMIN.password}</span>
          <button type="button" className="adm-link" onClick={() => { setEmail(DEMO_ADMIN.email); setPassword(DEMO_ADMIN.password); }}>
            Remplir automatiquement
          </button>
          <small>Démo : l'accès est vérifié dans le navigateur. Un vrai site doit le vérifier sur un serveur.</small>
        </div>
        <Link to="/" className="adm-link">← Retour à la boutique</Link>
      </form>
    </div>
  );
}
