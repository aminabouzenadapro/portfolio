import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import { Avatar, Bar, ErrorState, Loading, StatusPill } from "../components/ui.jsx";
import { api, useApi } from "../api/index.js";
import { useI18n } from "../i18n.jsx";
import { CATEGORIES, LEVELS } from "../../../shared/courses.js";

const DAYS = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"];
const COLORS = ["#3b5bdb", "#2b8a3e", "#c2255c", "#e8590c", "#087f5b", "#5f3dc4", "#1971c2", "#9c36b5"];
const EDITABLE = ["title", "summary", "category", "level", "language", "priceDA", "hours", "format", "days", "time", "start", "seats", "color", "outcomes", "lessons", "quiz"];

const BLANK = {
  title: { fr: "", ar: "", en: "" }, summary: { fr: "", ar: "", en: "" },
  category: "dev", level: "beginner", language: "fr", format: "onsite",
  priceDA: 10000, hours: 20, seats: 20, days: ["sat"], time: "10:00–12:00",
  start: new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10), color: COLORS[6], outcomes: [],
  lessons: [{ id: "l1", title: "", minutes: 30, content: "" }],
  quiz: { passMark: 60, questions: [{ id: "q1", q: "", options: ["", ""], answer: 0, explain: "" }] },
};

const nextId = (prefix, list) => prefix + (Math.max(0, ...list.map((x) => Number(x.id.slice(1)) || 0)) + 1);
const pickEditable = (c) => Object.fromEntries(EDITABLE.map((k) => [k, c[k]]));

export default function TeacherCourse() {
  const { slug } = useParams();
  const isNew = !slug;
  const { t, tr } = useI18n();
  const { data, error, loading, reload, setData } = useApi(isNew ? null : `/teacher/courses/${slug}`);
  const [tab, setTab] = useState(isNew ? "content" : "students");

  if (error) return <div className="container page"><ErrorState error={error} onRetry={reload} /></div>;
  if (!isNew && (loading || !data)) return <div className="container page"><Loading /></div>;

  return (
    <div className="container page">
      <Link to="/teacher" className="back-link"><Icon name="back" size={16} className="flip" />{t("teacherTitle")}</Link>
      <div className="page-head row">
        <div>
          <h1>{isNew ? t("newCourse") : tr(data.course.title)}</h1>
          {!isNew && <p>{t("courseManageLead", { n: data.stats.students })}</p>}
        </div>
        {!isNew && <Link to={`/courses/${slug}`} className="btn ghost"><Icon name="globe" />{t("publicPage")}</Link>}
      </div>

      {!isNew && (
        <div className="tabs wide" role="tablist">
          {["students", "content", "settings"].map((k) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{t(`tab_${k}`)}</button>
          ))}
        </div>
      )}

      {tab === "students" && !isNew
        ? <Students data={data} />
        : <Editor key={slug || "new"} course={isNew ? BLANK : data.course} isNew={isNew} section={isNew ? "all" : tab} onSaved={setData} />}
    </div>
  );
}

function Students({ data }) {
  const { t, ago } = useI18n();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const rows = data.students.filter((s) => (!status || s.status === status) && (!q || s.name.toLowerCase().includes(q.toLowerCase())));
  const n = data.students.length || 1;
  const { stats, lessonCompletion, course } = data;

  return (
    <>
      <div className="kpis">
        <div className="kpi"><Icon name="users" /><strong>{stats.students}</strong><span>{t("kpiStudents")}</span></div>
        <div className="kpi"><Icon name="book" /><strong>{stats.avgProgress}%</strong><span>{t("kpiAvgProgress")}</span></div>
        <div className="kpi"><Icon name="quiz" /><strong>{stats.avgScore === null ? "–" : `${stats.avgScore}%`}</strong><span>{t("kpiAvgScore")}</span></div>
        <div className={`kpi ${stats.atRisk ? "warn" : ""}`}><Icon name="alert" /><strong>{stats.atRisk}</strong><span>{t("kpiAtRisk")}</span></div>
      </div>

      <section className="panel">
          <div className="panel-head">
            <h2>{t("tab_students")}</h2>
            <div className="table-tools">
              <label className="search small"><Icon name="search" size={16} /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchStudent")} aria-label={t("searchStudent")} /></label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label={t("status")}>
                <option value="">{t("allStatuses")}</option>
                {["on-track", "at-risk", "completed"].map((s) => <option key={s} value={s}>{t(`status_${s}`)}</option>)}
              </select>
            </div>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>{t("student")}</th><th>{t("progress")}</th><th>{t("bestQuiz")}</th><th>{t("lastActivityCol")}</th><th>{t("status")}</th></tr></thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.email}>
                    <td><div className="who"><Avatar name={s.name} size={30} /><div><strong>{s.name}</strong><small dir="ltr">{s.email}</small></div></div></td>
                    <td><div className="bar-cell"><Bar value={s.progress} color={s.progress === 100 ? "var(--success)" : undefined} /><span>{s.progress}%</span></div></td>
                    <td>{s.bestScore === null ? "–" : <>{s.bestScore}% <small className="muted">({t("attempts", { n: s.attempts })})</small></>}</td>
                    <td>{ago(s.lastActivity)}</td>
                    <td>{s.certificate ? <Link to={`/certificate/${s.certificate}`}><StatusPill status="completed" /></Link> : <StatusPill status={s.status} />}</td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan="5" className="muted center">{t("noResults")}</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><h2>{t("lessonFunnel")}</h2></div>
          <ol className="funnel cols" lang={course.language} dir={course.language === "ar" ? "rtl" : "ltr"}>
            {lessonCompletion.map((l, i) => (
              <li key={l.id}>
                <span className="funnel-label"><b>{i + 1}.</b> {l.title}</span>
                <span className="bar-cell"><Bar value={(l.done / n) * 100} /><span>{l.done}/{data.students.length}</span></span>
              </li>
            ))}
          </ol>
          <p className="muted small">{t("funnelHint")}</p>
        </section>
    </>
  );
}

function Editor({ course, isNew, section, onSaved }) {
  const { t, errMsg } = useI18n();
  const navigate = useNavigate();
  const initial = useMemo(() => structuredClone(pickEditable(course)), [course]);
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [open, setOpen] = useState(isNew ? "l1" : null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = (patch) => { setMsg(null); setDraft((d) => ({ ...d, ...patch })); };
  const setLesson = (i, patch) => set({ lessons: draft.lessons.map((l, k) => (k === i ? { ...l, ...patch } : l)) });
  const setQuestion = (i, patch) => set({ quiz: { ...draft.quiz, questions: draft.quiz.questions.map((q, k) => (k === i ? { ...q, ...patch } : q)) } });
  const move = (list, i, d) => { const next = [...list]; [next[i], next[i + d]] = [next[i + d], next[i]]; return next; };

  async function save() {
    setSaving(true); setMsg(null);
    try {
      const body = { ...draft, outcomes: draft.outcomes.map((o) => o.trim()).filter(Boolean), priceDA: Number(draft.priceDA), hours: Number(draft.hours), seats: Number(draft.seats), lessons: draft.lessons.map((l) => ({ ...l, minutes: Number(l.minutes) })), quiz: { ...draft.quiz, passMark: Number(draft.quiz.passMark) } };
      const res = await api(isNew ? "/teacher/courses" : `/teacher/courses/${course.slug}`, { method: isNew ? "POST" : "PUT", body });
      if (isNew) return navigate(`/teacher/course/${res.course.slug}`, { replace: true });
      onSaved(res);
      setMsg({ ok: true, text: t("saved") });
    } catch (e) {
      setMsg({ ok: false, text: errMsg(e) });
    }
    setSaving(false);
  }

  const showContent = section === "all" || section === "content";
  const showSettings = section === "all" || section === "settings";
  const dir = draft.language === "ar" ? "rtl" : "ltr";

  return (
    <div className="editor">
      {showSettings && (
        <section className="panel">
          <h2>{t("courseInfo")}</h2>
          <div className="form grid3">
            {["fr", "ar", "en"].map((l) => (
              <label key={l}>{t("titleIn", { lang: t(`langName_${l}`) })}
                <input value={draft.title[l]} dir={l === "ar" ? "rtl" : "ltr"} lang={l} onChange={(e) => set({ title: { ...draft.title, [l]: e.target.value } })} />
              </label>
            ))}
            {["fr", "ar", "en"].map((l) => (
              <label key={l}>{t("summaryIn", { lang: t(`langName_${l}`) })}
                <textarea rows="3" value={draft.summary[l]} dir={l === "ar" ? "rtl" : "ltr"} lang={l} onChange={(e) => set({ summary: { ...draft.summary, [l]: e.target.value } })} />
              </label>
            ))}
          </div>
          <div className="form grid4">
            <label>{t("category")}<select value={draft.category} onChange={(e) => set({ category: e.target.value })}>{CATEGORIES.map((c) => <option key={c} value={c}>{t(`cat_${c}`)}</option>)}</select></label>
            <label>{t("level")}<select value={draft.level} onChange={(e) => set({ level: e.target.value })}>{LEVELS.map((c) => <option key={c} value={c}>{t(`level_${c}`)}</option>)}</select></label>
            <label>{t("taughtIn")}<select value={draft.language} onChange={(e) => set({ language: e.target.value })}>{["fr", "ar", "en"].map((c) => <option key={c} value={c}>{t(`langName_${c}`)}</option>)}</select></label>
            <label>{t("format")}<select value={draft.format} onChange={(e) => set({ format: e.target.value })}>{["onsite", "online", "hybrid"].map((c) => <option key={c} value={c}>{t(`format_${c}`)}</option>)}</select></label>
            <label>{t("priceDA")}<input type="number" min="0" step="500" value={draft.priceDA} onChange={(e) => set({ priceDA: e.target.value })} /></label>
            <label>{t("hours")}<input type="number" min="1" value={draft.hours} onChange={(e) => set({ hours: e.target.value })} /></label>
            <label>{t("seats")}<input type="number" min="1" value={draft.seats} onChange={(e) => set({ seats: e.target.value })} /></label>
            <label>{t("startDate")}<input type="date" value={draft.start} onChange={(e) => set({ start: e.target.value })} /></label>
          </div>
          <div className="form grid2">
            <fieldset className="days">
              <legend>{t("days")}</legend>
              {DAYS.map((d) => (
                <label key={d} className={`chip ${draft.days.includes(d) ? "on" : ""}`}>
                  <input type="checkbox" checked={draft.days.includes(d)} onChange={() => set({ days: draft.days.includes(d) ? draft.days.filter((x) => x !== d) : DAYS.filter((x) => x === d || draft.days.includes(x)) })} />
                  {t(`day_${d}`)}
                </label>
              ))}
            </fieldset>
            <label>{t("time")}<input value={draft.time} onChange={(e) => set({ time: e.target.value })} dir="ltr" /></label>
          </div>
          <fieldset className="colors">
            <legend>{t("color")}</legend>
            {COLORS.map((c) => <button key={c} type="button" className={draft.color === c ? "on" : ""} style={{ background: c }} aria-label={c} aria-pressed={draft.color === c} onClick={() => set({ color: c })} />)}
          </fieldset>
          <label className="form">{t("outcomes")}
            <textarea rows="4" dir={dir} value={draft.outcomes.join("\n")} onChange={(e) => set({ outcomes: e.target.value.split("\n") })} placeholder={t("outcomesHint")} />
          </label>
        </section>
      )}

      {showContent && (
        <>
          <section className="panel">
            <div className="panel-head">
              <h2>{t("lessons")}</h2>
              <button className="btn ghost small" onClick={() => { const id = nextId("l", draft.lessons); set({ lessons: [...draft.lessons, { id, title: "", minutes: 30, content: "" }] }); setOpen(id); }}><Icon name="plus" size={15} />{t("addLesson")}</button>
            </div>
            <ol className="edit-list">
              {draft.lessons.map((l, i) => (
                <li key={l.id} className={open === l.id ? "open" : ""}>
                  <div className="edit-row">
                    <span className="syl-n">{i + 1}</span>
                    <input className="grow" value={l.title} dir={dir} placeholder={t("lessonTitle")} aria-label={t("lessonTitle")} onChange={(e) => setLesson(i, { title: e.target.value })} />
                    <label className="mins"><input type="number" min="1" value={l.minutes} onChange={(e) => setLesson(i, { minutes: e.target.value })} aria-label={t("minutes")} />min</label>
                    <button className="icon-btn" onClick={() => setOpen(open === l.id ? null : l.id)} aria-label={t("editContent")} title={t("editContent")}><Icon name="edit" size={16} /></button>
                    <button className="icon-btn" disabled={i === 0} onClick={() => set({ lessons: move(draft.lessons, i, -1) })} aria-label={t("moveUp")}><Icon name="up" size={16} /></button>
                    <button className="icon-btn" disabled={i === draft.lessons.length - 1} onClick={() => set({ lessons: move(draft.lessons, i, 1) })} aria-label={t("moveDown")}><Icon name="down" size={16} /></button>
                    <button className="icon-btn danger" disabled={draft.lessons.length === 1} onClick={() => set({ lessons: draft.lessons.filter((_, k) => k !== i) })} aria-label={t("remove")}><Icon name="trash" size={16} /></button>
                  </div>
                  {open === l.id && (
                    <label className="content-edit">{t("lessonContent")}
                      <textarea rows="9" dir={dir} value={l.content} onChange={(e) => setLesson(i, { content: e.target.value })} />
                      <small className="muted">{t("markdownHint")}</small>
                    </label>
                  )}
                </li>
              ))}
            </ol>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>{t("quiz")}</h2>
              <label className="inline">{t("passMarkLabel")}<input type="number" min="1" max="100" value={draft.quiz.passMark} onChange={(e) => set({ quiz: { ...draft.quiz, passMark: e.target.value } })} />%</label>
            </div>
            {draft.quiz.questions.map((q, i) => (
              <fieldset key={q.id} className="q-edit">
                <legend>{t("questionN", { n: i + 1 })}</legend>
                <input value={q.q} dir={dir} placeholder={t("questionText")} aria-label={t("questionText")} onChange={(e) => setQuestion(i, { q: e.target.value })} />
                {q.options.map((o, k) => (
                  <div key={k} className="opt-edit">
                    <input type="radio" name={`ans-${q.id}`} checked={q.answer === k} onChange={() => setQuestion(i, { answer: k })} aria-label={t("correctAnswer")} title={t("correctAnswer")} />
                    <input className="grow" value={o} dir={dir} placeholder={t("optionN", { n: k + 1 })} onChange={(e) => setQuestion(i, { options: q.options.map((x, j) => (j === k ? e.target.value : x)) })} />
                    <button className="icon-btn danger" disabled={q.options.length <= 2} aria-label={t("remove")}
                      onClick={() => setQuestion(i, { options: q.options.filter((_, j) => j !== k), answer: q.answer === k ? 0 : q.answer > k ? q.answer - 1 : q.answer })}><Icon name="x" size={15} /></button>
                  </div>
                ))}
                <div className="q-tools">
                  {q.options.length < 6 && <button className="btn ghost small" onClick={() => setQuestion(i, { options: [...q.options, ""] })}><Icon name="plus" size={14} />{t("addOption")}</button>}
                  <input className="grow" value={q.explain || ""} dir={dir} placeholder={t("explanation")} aria-label={t("explanation")} onChange={(e) => setQuestion(i, { explain: e.target.value })} />
                  <button className="icon-btn danger" disabled={draft.quiz.questions.length === 1} onClick={() => set({ quiz: { ...draft.quiz, questions: draft.quiz.questions.filter((_, k) => k !== i) } })} aria-label={t("remove")}><Icon name="trash" size={16} /></button>
                </div>
              </fieldset>
            ))}
            <button className="btn ghost small" onClick={() => set({ quiz: { ...draft.quiz, questions: [...draft.quiz.questions, { id: nextId("q", draft.quiz.questions), q: "", options: ["", ""], answer: 0, explain: "" }] } })}><Icon name="plus" size={15} />{t("addQuestion")}</button>
          </section>
        </>
      )}

      <div className={`save-bar ${dirty || isNew || msg ? "show" : ""}`}>
        {msg && <span className={msg.ok ? "ok" : "form-error"} role="status">{msg.ok && <Icon name="check" size={16} stroke={3} />}{msg.text}</span>}
        {dirty && !msg && <span className="muted">{t("unsaved")}</span>}
        {dirty && !isNew && <button className="btn ghost" onClick={() => { setDraft(initial); setMsg(null); }}>{t("discard")}</button>}
        <button className="btn" onClick={save} disabled={saving || (!dirty && !isNew)}><Icon name="save" />{saving ? t("loading") : isNew ? t("createCourse") : t("save")}</button>
      </div>
    </div>
  );
}
