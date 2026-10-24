import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import { CourseCover, ErrorState, Loading, ProgressRing } from "../components/ui.jsx";
import { useApi } from "../api/index.js";
import { useAuth } from "../auth.jsx";
import { useI18n } from "../i18n.jsx";
import { AT_RISK_DAYS } from "../../../shared/logic.js";

export default function MyLearning() {
  const { t, tr, ago, money } = useI18n();
  const { user } = useAuth();
  const { data: list, error, loading, reload } = useApi("/me/enrollments");

  if (error) return <div className="container page"><ErrorState error={error} onRetry={reload} /></div>;
  if (loading && !list) return <div className="container page"><Loading /></div>;

  const lessonsDone = list.reduce((s, e) => s + e.progress.done, 0);
  const certificates = list.filter((e) => e.certificate);
  const scores = list.map((e) => e.bestScore).filter((s) => s !== null);
  const current = list.find((e) => !e.certificate && e.paid);
  const pending = list.filter((e) => !e.paid);
  const idle = list.filter((e) => !e.certificate && e.paid && (Date.now() - new Date(e.lastActivity)) / 86400000 >= AT_RISK_DAYS);

  return (
    <div className="container page">
      <div className="page-head">
        <h1>{t("helloName", { name: user.name.split(" ")[0] })}</h1>
        <p>{t("learningLead")}</p>
      </div>

      <div className="kpis">
        <div className="kpi"><Icon name="book" /><strong>{list.length}</strong><span>{t("kpiCourses")}</span></div>
        <div className="kpi"><Icon name="check" /><strong>{lessonsDone}</strong><span>{t("kpiLessons")}</span></div>
        <div className="kpi"><Icon name="quiz" /><strong>{scores.length ? `${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}%` : "–"}</strong><span>{t("kpiAvgScore")}</span></div>
        <div className="kpi"><Icon name="award" /><strong>{certificates.length}</strong><span>{t("kpiCertificates")}</span></div>
      </div>

      {idle.map((e) => (
        <div key={e.course.slug} className="notice warn">
          <Icon name="alert" />
          <span>{t("idleNotice", { course: tr(e.course.title), when: ago(e.lastActivity) })}</span>
          <Link to={`/learn/${e.course.slug}`} className="btn small">{t("resume")}</Link>
        </div>
      ))}

      {pending.map((e) => (
        <div key={e.course.slug} className="notice pay">
          <Icon name="lock" />
          <span><strong>{tr(e.course.title)}</strong> · {t("pendingText", { price: money(e.course.priceDA) })}</span>
          <Link to={`/learn/${e.course.slug}`} className="btn small ghost">{t("watchFree")}</Link>
        </div>
      ))}

      {current && (
        <section className="continue-card" style={{ "--c": current.course.color }}>
          <CourseCover course={current.course} compact />
          <div className="continue-body">
            <small>{t("continueWhere")}</small>
            <h2>{tr(current.course.title)}</h2>
            <p lang={current.course.language}>
              {current.nextLesson
                ? <>{t("nextLesson")}: <strong>{current.course.lessons.find((l) => l.id === current.nextLesson).title}</strong></>
                : t("readyForQuiz")}
            </p>
          </div>
          <ProgressRing value={current.progress.percent} size={72} stroke={7} />
          <Link to={current.nextLesson ? `/learn/${current.course.slug}/${current.nextLesson}` : `/learn/${current.course.slug}/quiz`} className="btn big">
            <Icon name="play" />{current.nextLesson ? t("resume") : t("takeQuiz")}
          </Link>
        </section>
      )}

      <section>
        <div className="section-head"><h2>{t("myCourses")}</h2><Link to="/courses" className="link-arrow">{t("findCourse")}<Icon name="arrow" size={16} className="flip" /></Link></div>
        {list.length === 0 ? (
          <div className="state"><Icon name="book" size={26} /><p>{t("noCoursesYet")}</p><Link to="/courses" className="btn">{t("heroBrowse")}</Link></div>
        ) : (
          <div className="my-courses">
            {list.map((e) => (
              <article key={e.course.slug} className="my-course">
                <CourseCover course={e.course} compact />
                <div className="my-course-body">
                  <h3><Link to={`/learn/${e.course.slug}`}>{tr(e.course.title)}</Link>{!e.paid && <span className="pill status-pending">{t("status_pending")}</span>}</h3>
                  <p className="muted small">{e.course.teacher.name} · {t("lastActivity", { when: ago(e.lastActivity) })}</p>
                  <div className="my-course-stats">
                    <span><Icon name="book" size={15} />{t("lessonsDone", { done: e.progress.done, total: e.progress.total })}</span>
                    <span><Icon name="quiz" size={15} />{e.bestScore === null ? t("quizNotTaken") : t("bestScore", { n: e.bestScore })}</span>
                  </div>
                </div>
                <ProgressRing value={e.progress.percent} color={e.certificate ? "var(--success)" : undefined} />
                {e.certificate
                  ? <Link to={`/certificate/${e.certificate.code}`} className="btn ghost"><Icon name="award" />{t("viewCertificate")}</Link>
                  : <Link to={`/learn/${e.course.slug}`} className="btn ghost">{t("open")}</Link>}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
