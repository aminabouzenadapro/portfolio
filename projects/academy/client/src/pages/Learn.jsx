import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import { Bar, ErrorState, Loading, Markdown, ProgressRing, VideoPlayer } from "../components/ui.jsx";
import { api, useApi } from "../api/index.js";
import { useI18n } from "../i18n.jsx";

// Lesson player and quiz for an enrolled student: /learn/:slug/:lessonId | /learn/:slug/quiz
export default function Learn() {
  const { slug, lessonId } = useParams();
  const { t, tr } = useI18n();
  const { data, error, loading, reload, setData } = useApi(`/me/courses/${slug}`);
  const [menu, setMenu] = useState(false);
  useEffect(() => { setMenu(false); }, [lessonId]);

  if (error?.status === 403) return <Navigate to={`/courses/${slug}`} replace />;
  if (error) return <div className="container page"><ErrorState error={error} onRetry={reload} /></div>;
  if (loading && !data) return <div className="container page"><Loading /></div>;

  const { course, enrollment } = data;
  if (!lessonId) return <Navigate to={`/learn/${slug}/${enrollment.nextLesson ?? course.lessons[0].id}`} replace />;
  const contentDir = course.language === "ar" ? "rtl" : "ltr";

  return (
    <div className="learn">
      <aside className={`learn-side ${menu ? "open" : ""}`}>
        <Link to="/learning" className="back-link"><Icon name="back" size={16} className="flip" />{t("navLearning")}</Link>
        <h2>{tr(course.title)}</h2>
        <div className="learn-progress">
          <Bar value={enrollment.progress.percent} />
          <span>{t("lessonsDone", { done: enrollment.progress.done, total: enrollment.progress.total })}</span>
        </div>
        <ol className="learn-list" lang={course.language} dir={contentDir}>
          {course.lessons.map((l, i) => {
            const done = enrollment.completed.includes(l.id);
            return (
              <li key={l.id}>
                <Link to={`/learn/${slug}/${l.id}`} className={`${l.id === lessonId ? "current" : ""} ${done ? "done" : ""}`} aria-current={l.id === lessonId ? "page" : undefined}>
                  <span className="ll-mark">{done ? <Icon name="check" size={14} stroke={3} /> : l.locked ? <Icon name="lock" size={12} /> : i + 1}</span>
                  <span className="ll-title">{l.title}</span>
                  <span className="ll-min">{l.minutes}′</span>
                </Link>
              </li>
            );
          })}
          <li>
            <Link to={`/learn/${slug}/quiz`} className={`quiz-link ${lessonId === "quiz" ? "current" : ""} ${enrollment.bestScore >= course.quiz.passMark ? "done" : ""}`}>
              <span className="ll-mark"><Icon name="quiz" size={14} /></span>
              <span className="ll-title">{t("quiz")}</span>
              {enrollment.bestScore !== null && <span className="ll-min">{enrollment.bestScore}%</span>}
            </Link>
          </li>
        </ol>
        {enrollment.certificate && (
          <Link to={`/certificate/${enrollment.certificate.code}`} className="cert-link"><Icon name="award" />{t("viewCertificate")}</Link>
        )}
      </aside>

      <section className="learn-main">
        <button className="btn ghost small learn-menu" onClick={() => setMenu((m) => !m)} aria-expanded={menu}><Icon name="menu" size={16} />{t("syllabus")}</button>
        {!enrollment.paid && <PaymentBanner course={course} />}
        {lessonId === "quiz"
          ? <Quiz key={slug} course={course} enrollment={enrollment} onResult={setData} contentDir={contentDir} />
          : <Lesson key={lessonId} course={course} enrollment={enrollment} lessonId={lessonId} onUpdate={setData} contentDir={contentDir} />}
      </section>
    </div>
  );
}

function Lesson({ course, enrollment, lessonId, onUpdate, contentDir }) {
  const { t, errMsg } = useI18n();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const index = course.lessons.findIndex((l) => l.id === lessonId);
  if (index === -1) return <Navigate to={`/learn/${course.slug}`} replace />;
  const lesson = course.lessons[index];
  const prev = course.lessons[index - 1];
  const next = course.lessons[index + 1];
  const done = enrollment.completed.includes(lesson.id);
  if (lesson.locked) return <Locked course={course} title={lesson.title} eyebrow={t("lessonN", { n: index + 1, total: course.lessons.length })} contentDir={contentDir} />;

  async function toggle(markDone, goNext) {
    setBusy(true); setErr(null);
    try {
      const updated = await api(`/me/courses/${course.slug}/lessons/${lesson.id}`, { method: "POST", body: { done: markDone } });
      onUpdate(updated);
      if (goNext) navigate(next ? `/learn/${course.slug}/${next.id}` : `/learn/${course.slug}/quiz`);
    } catch (e) { setErr(errMsg(e)); }
    setBusy(false);
  }

  return (
    <article className="lesson">
      <div className="lesson-head">
        <span className="eyebrow">{t("lessonN", { n: index + 1, total: course.lessons.length })} · {lesson.minutes} min</span>
        <h1 lang={course.language} dir={contentDir}>{lesson.title}</h1>
      </div>
      <VideoPlayer video={lesson.video} />
      <h2 className="notes-title">{t("lessonNotes")}</h2>
      <div lang={course.language} dir={contentDir}><Markdown text={lesson.content} /></div>

      <div className="lesson-actions">
        {done ? (
          <>
            <span className="done-badge"><Icon name="check" size={16} stroke={3} />{t("completed")}</span>
            <button className="btn ghost small" onClick={() => toggle(false)} disabled={busy}>{t("markUndone")}</button>
          </>
        ) : (
          <button className="btn big" onClick={() => toggle(true, true)} disabled={busy}><Icon name="check" />{next ? t("completeAndNext") : t("completeAndQuiz")}</button>
        )}
        {err && <p className="form-error" role="alert">{err}</p>}
      </div>

      <nav className="lesson-nav">
        {prev ? <Link to={`/learn/${course.slug}/${prev.id}`}><Icon name="back" size={16} className="flip" /><span><small>{t("previous")}</small><b lang={course.language}>{prev.title}</b></span></Link> : <span />}
        <Link to={next ? `/learn/${course.slug}/${next.id}` : `/learn/${course.slug}/quiz`} className="next">
          <span><small>{t("next")}</small><b lang={course.language}>{next ? next.title : t("quiz")}</b></span><Icon name="arrow" size={16} className="flip" />
        </Link>
      </nav>
    </article>
  );
}

function PaymentBanner({ course }) {
  const { t, money } = useI18n();
  return (
    <div className="notice pay">
      <Icon name="lock" />
      <span><strong>{t("pendingTitle")}</strong> {t("pendingText", { price: money(course.priceDA) })}</span>
    </div>
  );
}

// A lesson or quiz that opens after payment
function Locked({ course, title, eyebrow, contentDir }) {
  const { t, money } = useI18n();
  return (
    <article className="lesson">
      <div className="lesson-head">
        <span className="eyebrow">{eyebrow}</span>
        <h1 lang={course.language} dir={contentDir}>{title}</h1>
      </div>
      <div className="locked-panel">
        <span className="cat-icon big"><Icon name="lock" size={28} /></span>
        <h2>{t("lockedTitle")}</h2>
        <p>{t("lockedText", { price: money(course.priceDA) })}</p>
        <ul className="pay-ways">
          <li><Icon name="pin" size={18} /><div><strong>{t("payAtelier")}</strong><small>{t("payAtelierText")}</small></div></li>
          <li><Icon name="mail" size={18} /><div><strong>{t("payCcp")}</strong><small>{t("payCcpText")}</small></div></li>
        </ul>
        <Link to={`/learn/${course.slug}/${course.lessons.find((l) => !l.locked)?.id}`} className="btn ghost"><Icon name="play" />{t("watchFree")}</Link>
      </div>
    </article>
  );
}

function Quiz({ course, enrollment, onResult, contentDir }) {
  const { t, errMsg } = useI18n();
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [newCert, setNewCert] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const { questions, passMark } = course.quiz;
  if (course.quiz.locked) return <Locked course={course} title={t("quizTitle")} eyebrow={t("quiz")} contentDir={contentDir} />;
  const missing = questions.length - Object.keys(answers).length;

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const res = await api(`/me/courses/${course.slug}/quiz`, { method: "POST", body: { answers } });
      if (res.enrollment.certificate && !enrollment.certificate) setNewCert(res.enrollment.certificate);
      setResult(res.result);
      onResult({ course: res.course, enrollment: res.enrollment });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e2) { setErr(errMsg(e2)); }
    setBusy(false);
  }

  const lessonsLeft = enrollment.progress.total - enrollment.progress.done;

  return (
    <div className="quiz">
      <div className="lesson-head">
        <span className="eyebrow">{t("quiz")} · {t("passMark", { n: passMark })}</span>
        <h1>{t("quizTitle")}</h1>
        {enrollment.quizAttempts.length > 0 && !result && <p className="muted">{t("attemptsSoFar", { n: enrollment.quizAttempts.length, best: enrollment.bestScore })}</p>}
      </div>

      {result && (
        <div className={`quiz-result ${result.passed ? "pass" : "fail"}`} role="status">
          <ProgressRing value={result.percent} size={84} stroke={8} color={result.passed ? "var(--success)" : "var(--warn)"} />
          <div>
            <h2>{result.passed ? t("quizPassed") : t("quizFailed")}</h2>
            <p>{t("quizScore", { score: result.score, total: result.total })}</p>
            {result.passed && !enrollment.certificate && lessonsLeft > 0 && <p>{t("finishLessonsForCert", { n: lessonsLeft })}</p>}
          </div>
          <div className="quiz-result-actions">
            {newCert && <Link to={`/certificate/${newCert.code}`} className="btn big"><Icon name="award" />{t("getCertificate")}</Link>}
            <button className="btn ghost" onClick={() => { setResult(null); setAnswers({}); }}><Icon name="refresh" />{t("retry")}</button>
          </div>
        </div>
      )}

      <form onSubmit={submit} lang={course.language} dir={contentDir}>
        {questions.map((q, i) => {
          const r = result?.results.find((x) => x.id === q.id);
          return (
            <fieldset key={q.id} className={`question ${r ? (r.correct ? "right" : "wrong") : ""}`} disabled={Boolean(result)}>
              <legend><span className="q-n">{i + 1}</span>{q.q}</legend>
              <div className="options">
                {q.options.map((o, k) => (
                  <label key={k} className={`option ${answers[q.id] === k ? "chosen" : ""} ${r && r.answer === k ? "is-answer" : ""}`}>
                    <input type="radio" name={q.id} checked={answers[q.id] === k} onChange={() => setAnswers((a) => ({ ...a, [q.id]: k }))} />
                    <span>{o}</span>
                    {r && r.answer === k && <Icon name="check" size={16} stroke={3} />}
                  </label>
                ))}
              </div>
              {r && <p className="explain">{r.correct ? "✓ " : "✗ "}{r.explain}</p>}
            </fieldset>
          );
        })}
        {!result && (
          <div className="quiz-submit" dir="auto">
            {err && <p className="form-error" role="alert">{err}</p>}
            <button className="btn big" disabled={busy || missing > 0}>{busy ? t("loading") : t("submitQuiz")}</button>
            {missing > 0 && <span className="muted small">{t("questionsLeft", { n: missing })}</span>}
          </div>
        )}
      </form>
    </div>
  );
}
