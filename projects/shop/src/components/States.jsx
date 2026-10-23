import { useI18n } from "../i18n.jsx";

// Shared error and empty states
export function ErrorState({ onRetry }) {
  const { t } = useI18n();
  return (
    <div className="state">
      <h2>{t("errorTitle")}</h2>
      <p className="muted">{t("errorText")}</p>
      {onRetry && <button className="btn btn-dark" onClick={onRetry}>{t("retry")}</button>}
    </div>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="state">
      <h2>{title}</h2>
      {text && <p className="muted">{text}</p>}
      {action}
    </div>
  );
}
