import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import { Logo } from "../components/ui.jsx";
import { useDemoLogin } from "../components/Layout.jsx";
import { DEMO } from "../api/index.js";
import { homeFor, useAuth } from "../auth.jsx";
import { useI18n } from "../i18n.jsx";

export default function Login() {
  const { t, errMsg } = useI18n();
  const { user, login, register } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const demoLogin = useDemoLogin();
  const [mode, setMode] = useState(params.get("mode") === "register" ? "register" : "login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const next = params.get("next");
  if (user && !busy) return <Navigate to={next || homeFor(user)} replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const u = mode === "login" ? await login(form.email, form.password) : await register(form.name, form.email, form.password);
      navigate(next || homeFor(u), { replace: true });
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Logo />
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={mode === "login"} className={mode === "login" ? "on" : ""} onClick={() => { setMode("login"); setError(null); }}>{t("signIn")}</button>
          <button role="tab" aria-selected={mode === "register"} className={mode === "register" ? "on" : ""} onClick={() => { setMode("register"); setError(null); }}>{t("createAccount")}</button>
        </div>

        <form onSubmit={submit} className="form" noValidate>
          {mode === "register" && (
            <label>{t("fullName")}<input value={form.name} onChange={set("name")} autoComplete="name" required /></label>
          )}
          <label>{t("email")}<input type="email" value={form.email} onChange={set("email")} autoComplete="email" dir="ltr" required /></label>
          <label>{t("password")}<input type="password" value={form.password} onChange={set("password")} autoComplete={mode === "login" ? "current-password" : "new-password"} dir="ltr" required minLength={8} />
            {mode === "register" && <small className="muted">{t("passwordHint")}</small>}
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn big block" disabled={busy}>{busy ? t("loading") : mode === "login" ? t("signIn") : t("createAccount")}</button>
        </form>

        {DEMO && (
          <div className="demo-accounts">
            <p>{t("demoAccounts")}</p>
            <div>
              <button className="btn ghost" onClick={() => demoLogin("student").catch((e) => setError(errMsg(e)))}><Icon name="user" />{t("tryStudent")}</button>
              <button className="btn ghost" onClick={() => demoLogin("teacher").catch((e) => setError(errMsg(e)))}><Icon name="chart" />{t("tryTeacher")}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
