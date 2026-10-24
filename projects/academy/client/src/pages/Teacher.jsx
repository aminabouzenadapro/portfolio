import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import { Avatar, Bar, ErrorState, Loading } from "../components/ui.jsx";
import { useApi } from "../api/index.js";
import { useAuth } from "../auth.jsx";
import { useI18n } from "../i18n.jsx";

// Sign-ups per week, as an SVG bar chart
function WeeklyChart({ weeks }) {
  const { t } = useI18n();
  const max = Math.max(4, ...weeks);
  const W = 560, H = 190, pad = 26, bw = (W - pad) / weeks.length;
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H + 24}`} role="img" aria-label={t("weeklySignups") + ": " + weeks.join(", ")}>
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line x1={pad} x2={W} y1={H - f * (H - 20)} y2={H - f * (H - 20)} className="grid" />
          <text x={pad - 6} y={H - f * (H - 20) + 4} textAnchor="end" className="axis">{Math.round(f * max)}</text>
        </g>
      ))}
      {weeks.map((n, i) => {
        const h = (n / max) * (H - 20);
        const x = pad + i * bw + bw * 0.18;
        return (
          <g key={i}>
            <rect x={x} y={H - h} width={bw * 0.64} height={Math.max(h, 1)} rx="5" className={i === weeks.length - 1 ? "bar-now" : "bar-col"} />
            {n > 0 && <text x={x + bw * 0.32} y={H - h - 6} textAnchor="middle" className="val">{n}</text>}
            <text x={x + bw * 0.32} y={H + 18} textAnchor="middle" className="axis">{i === weeks.length - 1 ? t("thisWeek") : `-${weeks.length - 1 - i}`}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Teacher() {
  const { t, tr, ago } = useI18n();
  const { user } = useAuth();
  const { data, error, loading, reload } = useApi("/teacher/overview");

  if (error) return <div className="container page"><ErrorState error={error} onRetry={reload} /></div>;
  if (loading && !data) return <div className="container page"><Loading /></div>;
  const { totals, weekly, courses, atRisk, recentQuizzes } = data;

  return (
    <div className="container page">
      <div className="page-head row">
        <div>
          <h1>{t("teacherTitle")}</h1>
          <p>{t("teacherLead", { name: user.name })}</p>
        </div>
        <Link to="/teacher/new" className="btn"><Icon name="plus" />{t("newCourse")}</Link>
      </div>

      <div className="kpis five">
        <div className="kpi"><Icon name="users" /><strong>{totals.students}</strong><span>{t("kpiStudents")}</span></div>
        <div className="kpi"><Icon name="book" /><strong>{totals.avgProgress}%</strong><span>{t("kpiAvgProgress")}</span></div>
        <div className="kpi"><Icon name="quiz" /><strong>{totals.avgScore === null ? "–" : `${totals.avgScore}%`}</strong><span>{t("kpiAvgScore")}</span></div>
        <div className="kpi"><Icon name="award" /><strong>{totals.certificates}</strong><span>{t("kpiCertificates")}</span></div>
        <div className={`kpi ${totals.atRisk ? "warn" : ""}`}><Icon name="alert" /><strong>{totals.atRisk}</strong><span>{t("kpiAtRisk")}</span></div>
      </div>

      <div className="dash-grid">
        <section className="panel">
          <div className="panel-head"><h2>{t("weeklySignups")}</h2><span className="muted small">{t("last8Weeks")}</span></div>
          <WeeklyChart weeks={weekly} />
        </section>

        <section className="panel">
          <div className="panel-head"><h2>{t("recentQuizzes")}</h2></div>
          {recentQuizzes.length ? (
            <ul className="feed">
              {recentQuizzes.map((a, i) => (
                <li key={i}>
                  <Avatar name={a.name} size={32} />
                  <div><strong>{a.name}</strong><small>{tr(a.course.title)} · {ago(a.at)}</small></div>
                  <span className={`score ${a.percent >= 60 ? "good" : "bad"}`}>{a.percent}%</span>
                </li>
              ))}
            </ul>
          ) : <p className="muted">{t("nothingYet")}</p>}
        </section>
      </div>

      <section className="panel">
        <div className="panel-head"><h2>{t("myCoursesTeacher")}</h2></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>{t("course")}</th><th>{t("kpiStudents")}</th><th>{t("kpiAvgProgress")}</th><th>{t("kpiAvgScore")}</th><th>{t("completion")}</th><th>{t("kpiAtRisk")}</th><th /></tr></thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.slug}>
                  <td><span className="swatch" style={{ background: c.color }} /><Link to={`/teacher/course/${c.slug}`}>{tr(c.title)}</Link></td>
                  <td>{c.stats.students}</td>
                  <td><div className="bar-cell"><Bar value={c.stats.avgProgress} /><span>{c.stats.avgProgress}%</span></div></td>
                  <td>{c.stats.avgScore === null ? "–" : `${c.stats.avgScore}%`}</td>
                  <td>{c.stats.completionRate}%</td>
                  <td>{c.stats.atRisk ? <span className="pill status-at-risk">{c.stats.atRisk}</span> : "0"}</td>
                  <td><Link to={`/teacher/course/${c.slug}`} className="btn ghost small">{t("manage")}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><h2>{t("atRiskTitle")}</h2><span className="muted small">{t("atRiskHint")}</span></div>
        {atRisk.length ? (
          <ul className="risk-list">
            {atRisk.map((s) => (
              <li key={s.email + s.course.slug}>
                <Avatar name={s.name} size={36} />
                <div><strong>{s.name}</strong><small>{tr(s.course.title)}</small></div>
                <span className="muted small">{t("lastSeen", { when: ago(s.lastActivity) })}</span>
                <span className="bar-cell"><Bar value={s.progress} color="var(--warn)" /><span>{s.progress}%</span></span>
                <a className="btn ghost small" href={`mailto:${s.email}?subject=${encodeURIComponent(tr(s.course.title))}`}><Icon name="mail" size={15} />{t("remind")}</a>
              </li>
            ))}
          </ul>
        ) : <p className="muted">{t("noAtRisk")}</p>}
      </section>
    </div>
  );
}
