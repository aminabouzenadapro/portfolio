import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import CourseCard from "../components/CourseCard.jsx";
import { CourseCover, ErrorState, Loading, ProgressRing } from "../components/ui.jsx";
import { useApi } from "../api/index.js";
import { useI18n } from "../i18n.jsx";
import { CATEGORIES } from "../../../shared/courses.js";

const CAT_ICON = { dev: "monitor", lang: "globe", office: "layers", business: "chart", school: "book" };

export default function Home() {
  const { t, tr, num } = useI18n();
  const { data: courses, error, loading, reload } = useApi("/courses");
  const students = courses?.reduce((s, c) => s + c.students, 0) ?? 0;
  const teachers = new Set(courses?.map((c) => c.teacher.name)).size;
  const sample = courses?.find((c) => c.slug === "web-dev") ?? courses?.[0];

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">{t("heroEyebrow")}</span>
            <h1>{t("heroTitle")}</h1>
            <p className="lead">{t("heroLead")}</p>
            <div className="hero-cta">
              <Link to="/courses" className="btn big">{t("heroBrowse")}<Icon name="arrow" className="flip" /></Link>
              <Link to="/verify" className="btn big ghost"><Icon name="shield" />{t("navVerify")}</Link>
            </div>
            <ul className="hero-points">
              <li><Icon name="check" size={16} />{t("heroPoint1")}</li>
              <li><Icon name="check" size={16} />{t("heroPoint2")}</li>
              <li><Icon name="check" size={16} />{t("heroPoint3")}</li>
            </ul>
          </div>

          {/* A preview of the student space, built from real course data */}
          {sample && (
            <div className="hero-visual" aria-hidden="true">
              <div className="hv-card hv-course">
                <CourseCover course={sample} />
                <div>
                  <small>{t(`cat_${sample.category}`)}</small>
                  <strong>{tr(sample.title)}</strong>
                  <span className="hv-lessons"><Icon name="book" size={14} />{t("lessonsCount", { n: sample.lessons.length })}</span>
                </div>
              </div>
              <div className="hv-card hv-progress">
                <ProgressRing value={67} size={64} />
                <div><small>{t("yourProgress")}</small><strong>{t("lessonsDone", { done: 4, total: 6 })}</strong></div>
              </div>
              <div className="hv-card hv-cert">
                <Icon name="award" size={26} />
                <div><small>{t("certificate")}</small><strong>CA-1X7Q2KD</strong></div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="stats-strip">
        <div className="container stats-inner">
          <div><strong>{courses ? num(courses.length) : "–"}</strong><span>{t("statCourses")}</span></div>
          <div><strong>{courses ? num(teachers) : "–"}</strong><span>{t("statTeachers")}</span></div>
          <div><strong>{courses ? num(students) : "–"}</strong><span>{t("statStudents")}</span></div>
          <div><strong>3</strong><span>{t("statLanguages")}</span></div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>{t("categoriesTitle")}</h2>
          </div>
          <div className="cat-grid">
            {CATEGORIES.map((c) => (
              <Link key={c} to={`/courses?category=${c}`} className="cat-tile">
                <span className="cat-icon"><Icon name={CAT_ICON[c]} size={22} /></span>
                <strong>{t(`cat_${c}`)}</strong>
                <small>{t("coursesCount", { n: courses?.filter((x) => x.category === c).length ?? 0 })}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="section-head">
            <h2>{t("upcomingTitle")}</h2>
            <Link to="/courses" className="link-arrow">{t("seeAll")}<Icon name="arrow" size={16} className="flip" /></Link>
          </div>
          {loading && !courses && <Loading />}
          {error && <ErrorState error={error} onRetry={reload} />}
          {courses && <div className="course-grid">{courses.slice(0, 3).map((c) => <CourseCard key={c.slug} course={c} />)}</div>}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head"><h2>{t("howTitle")}</h2></div>
          <ol className="steps">
            {[1, 2, 3].map((n) => (
              <li key={n}>
                <span className="step-n">{n}</span>
                <h3>{t(`how${n}Title`)}</h3>
                <p>{t(`how${n}Text`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
