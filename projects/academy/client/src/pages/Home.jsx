import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import CourseCard from "../components/CourseCard.jsx";
import { Avatar, ErrorState, Loading, ProgressRing } from "../components/ui.jsx";
import { useApi } from "../api/index.js";
import { useI18n } from "../i18n.jsx";
import { CATEGORIES } from "../../../shared/courses.js";

const CAT_ICON = { basics: "play", patterns: "edit", traditional: "award", alterations: "refresh" };

export default function Home() {
  const { t, num } = useI18n();
  const { data: courses, error, loading, reload } = useApi("/courses");
  const students = courses?.reduce((s, c) => s + c.students, 0) ?? 0;
  const videos = courses?.reduce((s, c) => s + c.lessons.filter((l) => l.hasVideo).length, 0) ?? 0;

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
              <Link to="/courses/bases-couture" className="btn big ghost"><Icon name="play" />{t("heroFree")}</Link>
            </div>
            <ul className="hero-points">
              <li><Icon name="check" size={16} />{t("heroPoint1")}</li>
              <li><Icon name="check" size={16} />{t("heroPoint2")}</li>
              <li><Icon name="check" size={16} />{t("heroPoint3")}</li>
            </ul>
          </div>

          {/* A lesson playing, as students see it */}
          <div className="hero-visual" aria-hidden="true">
            <div className="hv-video">
              <video src="media/sew-seam.mp4" poster="media/sew-seam.jpg" autoPlay muted loop playsInline />
              <div className="hv-video-bar"><span className="hv-dot" />{t("heroVideoCaption")}</div>
            </div>
            <div className="hv-card hv-progress">
              <ProgressRing value={67} size={60} />
              <div><small>{t("yourProgress")}</small><strong>{t("lessonsDone", { done: 4, total: 6 })}</strong></div>
            </div>
            <div className="hv-card hv-cert">
              <Icon name="award" size={26} />
              <div><small>{t("certificate")}</small><strong>AY-0K7Q2PD</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div className="container stats-inner">
          <div><strong>{courses ? num(courses.length) : "–"}</strong><span>{t("statCourses")}</span></div>
          <div><strong>{courses ? num(videos) : "–"}</strong><span>{t("statVideos")}</span></div>
          <div><strong>{courses ? num(students) : "–"}</strong><span>{t("statStudents")}</span></div>
          <div><strong>15</strong><span>{t("statYears")}</span></div>
        </div>
      </section>

      <section className="section">
        <div className="container teacher-intro">
          <div className="teacher-portrait">
            <Avatar name="Yasmina Hamidi" size={120} />
            <span className="teacher-badge"><Icon name="award" size={16} />{t("teacherBadge")}</span>
          </div>
          <div>
            <span className="eyebrow">{t("meetEyebrow")}</span>
            <h2>{t("meetTitle")}</h2>
            <p className="lead">{t("meetText")}</p>
            <ul className="hero-points">
              <li><Icon name="play" size={16} />{t("meetPoint1")}</li>
              <li><Icon name="users" size={16} />{t("meetPoint2")}</li>
              <li><Icon name="pin" size={16} />{t("meetPoint3")}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="section-head"><h2>{t("categoriesTitle")}</h2></div>
          <div className="cat-grid four">
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

      <section className="section">
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

      <section className="section alt">
        <div className="container">
          <div className="section-head"><h2>{t("howTitle")}</h2></div>
          <ol className="steps four">
            {[1, 2, 3, 4].map((n) => (
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
