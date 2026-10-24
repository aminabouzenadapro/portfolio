import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import { ErrorState, Loading, Logo } from "../components/ui.jsx";
import { useApi } from "../api/index.js";
import { useI18n } from "../i18n.jsx";

export function Certificate() {
  const { code } = useParams();
  const { t, tr, date } = useI18n();
  const { data: c, error, loading } = useApi(`/certificates/${encodeURIComponent(code)}`);

  if (error?.status === 404) {
    return (
      <div className="container page narrow">
        <div className="verify-banner bad"><Icon name="alert" size={22} /><div><strong>{t("certNotFound")}</strong><p>{t("certNotFoundText", { code })}</p></div></div>
        <VerifyForm />
      </div>
    );
  }
  if (error) return <div className="container page"><ErrorState error={error} /></div>;
  if (loading || !c) return <div className="container page"><Loading /></div>;

  return (
    <div className="container page">
      <div className="verify-banner good no-print">
        <Icon name="shield" size={22} />
        <div><strong>{t("certValid")}</strong><p>{t("certValidText", { name: c.student, date: date(c.issuedAt) })}</p></div>
        <button className="btn ghost small" onClick={() => window.print()}><Icon name="print" />{t("print")}</button>
      </div>

      <article className="certificate" style={{ "--c": c.course.color }}>
        <div className="cert-border">
          <Logo />
          <p className="cert-kicker">{t("certTitle")}</p>
          <p className="cert-small">{t("certAwardedTo")}</p>
          <h1 className="cert-name">{c.student}</h1>
          <p className="cert-small">{t("certForCompleting")}</p>
          <h2 className="cert-course">{tr(c.course.title)}</h2>
          <p className="cert-detail">{t("certDetail", { hours: c.course.hours, score: c.score })}</p>
          <div className="cert-foot">
            <div><span className="cert-sign">{c.teacher}</span><small>{t("trainer")}</small></div>
            <div className="seal" aria-hidden="true"><Icon name="award" size={34} /></div>
            <div><span className="cert-sign">{date(c.issuedAt)}</span><small>{t("issuedOn")}</small></div>
          </div>
          <p className="cert-code">{t("verifyAt")} · <b dir="ltr">{c.code}</b></p>
        </div>
      </article>
      <p className="center no-print"><Link to="/learning" className="link-arrow">{t("navLearning")}<Icon name="arrow" size={16} className="flip" /></Link></p>
    </div>
  );
}

function VerifyForm() {
  const { t } = useI18n();
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  return (
    <form className="verify-form" onSubmit={(e) => { e.preventDefault(); if (code.trim()) navigate(`/certificate/${code.trim().toUpperCase()}`); }}>
      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="AY-XXXXXXX" dir="ltr" aria-label={t("certCode")} />
      <button className="btn">{t("verify")}</button>
    </form>
  );
}

export function Verify() {
  const { t } = useI18n();
  return (
    <div className="container page narrow">
      <div className="verify-hero">
        <span className="cat-icon big"><Icon name="shield" size={30} /></span>
        <h1>{t("verifyTitle")}</h1>
        <p>{t("verifyLead")}</p>
      </div>
      <VerifyForm />
    </div>
  );
}
