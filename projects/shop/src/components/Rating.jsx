import { useI18n } from "../i18n.jsx";

// Five stars filled proportionally to the rating (0–5)
export default function Rating({ value = 0, count, size = 14 }) {
  const { t } = useI18n();
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const stars = "★★★★★";
  return (
    <span className="rating" aria-label={t("ratedOutOf", { r: value.toFixed(1) })}>
      <span className="stars" style={{ fontSize: size }} aria-hidden="true">
        <span className="stars-empty">{stars}</span>
        <span className="stars-full" style={{ width: `${pct}%` }}>{stars}</span>
      </span>
      <span className="rating-value">{value.toFixed(1)}</span>
      {count != null && <span className="rating-count">({t("reviewsCount", { n: count })})</span>}
    </span>
  );
}
