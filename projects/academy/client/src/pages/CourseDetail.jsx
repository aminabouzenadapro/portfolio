import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import { Avatar, Bar, CourseCover, ErrorState, Loading, useSchedule } from "../components/ui.jsx";
import { api, useApi } from "../api/index.js";
import { useAuth } from "../auth.jsx";
import { useI18n } from "../i18n.jsx";

export default function CourseDetail() {
  const { slug } = useParams();
  const { t, tr, money, date, errMsg } = useI18n();
  const schedule = useSchedule();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: course, error, loading, reload } = useApi(`/courses/${slug}`);
  // A 403 here simply means "not enrolled yet"
  const mine = useApi(user?.role === "student" ? `/me/courses/${slug}` : null);
  const enrolled = Boolean(mine.data);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  if (error) return <div className="container page"><ErrorState error={error} onRetry={reload} /></div>;
  if (loading || !course) return <div className="container page"><Loading /></div>;

  const totalMinutes = course.lessons.reduce((s, l) => s + l.minutes, 0);
  const taken = course.seats - course.seatsLeft;

  async function enroll() {
    if (!user) return navigate(`/login?next=${encodeURIComponent(`/courses/${slug}`)}`);
    setBusy(true); setMsg(null);
    try {
      await api(`/courses/${slug}/enroll`, { method: "POST" });
      navigate(`/learn/${slug}`);
    } catch (e) {
      setMsg(errMsg(e));
      setBusy(false);
    }
  }

  return (
    <>
      <section className="course-hero" style={{ "--c": course.color }}>
        <div className="container course-hero-inner">
          <div>
            <Link to="/courses" className="back-link"><Icon name="back" size={16} className="flip" />{t("navCourses")}</Link>
            <div className="course-meta light">
              <span>{t(`cat_${course.category}`)}</span><span className="dot" /><span>{t(`level_${course.level}`)}</span>
            </div>
            <h1>{tr(course.title)}</h1>
            <p className="lead">{tr(course.summary)}</p>
            <div className="hero-teacher"><Avatar name={course.teacher.name} size={40} /><div><strong>{course.teacher.name}</strong><small>{tr(course.teacher.title)}</small></div></div>
          </div>
          <CourseCover course={course} />
        </div>
      </section>

      <div className="container course-layout">
        <div className="course-main">
          <section className="panel">
            <h2>{t("youWillLearn")}</h2>
            <ul className="outcomes" lang={course.language} dir={course.language === "ar" ? "rtl" : "ltr"}>
              {course.outcomes.map((o) => <li key={o}><Icon name="check" size={16} />{o}</li>)}
            </ul>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>{t("syllabus")}</h2>
              <span className="muted">{t("lessonsCount", { n: course.lessons.length })} · {t("minutesOnline", { n: totalMinutes })}</span>
            </div>
            <ol className="syllabus" lang={course.language} dir={course.language === "ar" ? "rtl" : "ltr"}>
              {course.lessons.map((l, i) => (
                <li key={l.id}>
                  <span className="syl-n">{i + 1}</span>
                  <span className="syl-title">{l.title}</span>
                  <span className="syl-min">{l.minutes} min</span>
                  <Icon name={enrolled ? "play" : "lock"} size={15} />
                </li>
              ))}
              <li className="syl-quiz">
                <span className="syl-n"><Icon name="quiz" size={15} /></span>
                <span className="syl-title">{t("finalQuiz", { n: course.quiz.count })}</span>
                <span className="syl-min">{t("passMark", { n: course.quiz.passMark })}</span>
                <Icon name="award" size={15} />
              </li>
            </ol>
            <p className="note"><Icon name="shield" size={15} />{t("certificateNote")}</p>
          </section>
        </div>

        <aside className="course-side">
          <div className="panel sticky">
            <strong className="price big">{money(course.priceDA)}</strong>
            <ul className="side-facts">
              <li><Icon name="calendar" />{t("startsOn", { date: date(course.start) })}</li>
              <li><Icon name="clock" />{schedule(course)}</li>
              <li><Icon name="book" />{t("hoursTotal", { n: course.hours })}</li>
              <li><Icon name="pin" />{t(`format_${course.format}`)}</li>
              <li><Icon name="globe" />{t("taughtInLang", { lang: t(`langName_${course.language}`) })}</li>
            </ul>
            <div className="seats">
              <div className="seats-row"><span>{t("seatsTaken", { n: taken, total: course.seats })}</span><strong>{course.seatsLeft ? t("seatsLeft", { n: course.seatsLeft }) : t("full")}</strong></div>
              <Bar value={(taken / course.seats) * 100} color={course.seatsLeft <= 5 ? "var(--warn)" : undefined} />
            </div>
            {enrolled ? (
              <Link to={`/learn/${slug}`} className="btn big block"><Icon name="play" />{t("continueCourse")}</Link>
            ) : user?.role === "teacher" ? (
              <p className="muted small">{t("teachersCannotEnroll")}</p>
            ) : (
              <button className="btn big block" onClick={enroll} disabled={busy || !course.seatsLeft}>
                {busy ? t("loading") : course.seatsLeft ? t("enrollNow") : t("full")}
              </button>
            )}
            {msg && <p className="form-error" role="alert">{msg}</p>}
            {!user && <p className="muted small center">{t("enrollHint")}</p>}
          </div>
        </aside>
      </div>
    </>
  );
}
