import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import CourseCard from "../components/CourseCard.jsx";
import { ErrorState, Loading } from "../components/ui.jsx";
import { useApi } from "../api/index.js";
import { useI18n } from "../i18n.jsx";
import { CATEGORIES, LEVELS } from "../../../shared/courses.js";

export default function Catalog() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "";
  const level = params.get("level") || "";
  const [q, setQ] = useState(params.get("q") || "");

  // Debounce typing before it reaches the URL (and the API)
  useEffect(() => {
    const id = setTimeout(() => update({ q: q.trim() }), 250);
    return () => clearTimeout(id);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  // The debounced search fires later, so read the filters as they are then, not as they were when typing
  const latest = useRef(params);
  latest.current = params;
  function update(changes) {
    const next = new URLSearchParams(latest.current);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (next.toString() !== latest.current.toString()) setParams(next, { replace: true });
  }

  const query = new URLSearchParams({ ...(category && { category }), ...(level && { level }), ...(params.get("q") && { q: params.get("q") }) }).toString();
  const { data: courses, error, loading, reload } = useApi(`/courses${query ? "?" + query : ""}`);

  return (
    <div className="container page">
      <div className="page-head">
        <h1>{t("catalogTitle")}</h1>
        <p>{t("catalogLead")}</p>
      </div>

      <div className="filters">
        <label className="search">
          <Icon name="search" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchPlaceholder")} aria-label={t("searchPlaceholder")} />
        </label>
        <div className="chips" role="group" aria-label={t("category")}>
          <button className={!category ? "chip on" : "chip"} onClick={() => update({ category: "" })}>{t("all")}</button>
          {CATEGORIES.map((c) => (
            <button key={c} className={category === c ? "chip on" : "chip"} aria-pressed={category === c} onClick={() => update({ category: category === c ? "" : c })}>{t(`cat_${c}`)}</button>
          ))}
        </div>
        <select value={level} onChange={(e) => update({ level: e.target.value })} aria-label={t("level")}>
          <option value="">{t("allLevels")}</option>
          {LEVELS.map((l) => <option key={l} value={l}>{t(`level_${l}`)}</option>)}
        </select>
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && !courses && <Loading />}
      {courses && (
        <>
          <p className="result-count" aria-live="polite">{t("resultsCount", { n: courses.length })}</p>
          {courses.length ? (
            <div className={`course-grid ${loading ? "dim" : ""}`}>{courses.map((c) => <CourseCard key={c.slug} course={c} />)}</div>
          ) : (
            <div className="state">
              <Icon name="search" size={26} />
              <p>{t("noResults")}</p>
              <button className="btn ghost" onClick={() => { setQ(""); setParams({}, { replace: true }); }}>{t("clearFilters")}</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
