import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import { CourseCover, useSchedule } from "./ui.jsx";
import { useI18n } from "../i18n.jsx";

export default function CourseCard({ course }) {
  const { t, tr, money, date } = useI18n();
  const schedule = useSchedule();
  const few = course.seatsLeft > 0 && course.seatsLeft <= 5;
  const videos = course.lessons.filter((l) => l.hasVideo).length;
  const hasFree = course.lessons.some((l) => l.free);
  return (
    <Link to={`/courses/${course.slug}`} className="course-card">
      <CourseCover course={course} />
      <div className="course-card-body">
        <div className="course-meta">
          <span>{t(`cat_${course.category}`)}</span>
          <span className="dot" />
          <span>{t(`level_${course.level}`)}</span>
          <span className="lang-chip" title={t("taughtIn")}>{t(`langName_${course.language}`)}</span>
        </div>
        <h3>{tr(course.title)}</h3>
        <ul className="facts">
          <li><Icon name="play" size={15} />{t("videoLessons", { n: videos })}{hasFree && <span className="free-chip">{t("firstFree")}</span>}</li>
          <li><Icon name="clock" size={15} />{schedule(course)}</li>
          <li><Icon name="calendar" size={15} />{t("startsOn", { date: date(course.start, { day: "numeric", month: "short" }) })}</li>
        </ul>
        <div className="course-card-foot">
          <strong className="price">{money(course.priceDA)}</strong>
          {course.seatsLeft === 0
            ? <span className="pill status-at-risk">{t("full")}</span>
            : <span className={`pill ${few ? "status-at-risk" : "soft"}`}>{t("seatsLeft", { n: course.seatsLeft })}</span>}
        </div>
      </div>
    </Link>
  );
}
