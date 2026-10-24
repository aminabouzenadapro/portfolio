// Domain rules shared by the Node.js API and the in-browser demo API,
// so grading, progress and certificates behave the same in both.

export const AT_RISK_DAYS = 10;
const DAY = 24 * 60 * 60 * 1000;

// Grades a quiz. `answers` maps question id -> chosen option index.
export function gradeQuiz(quiz, answers = {}) {
  const results = quiz.questions.map((q) => {
    const given = Number.isInteger(answers[q.id]) ? answers[q.id] : null;
    return { id: q.id, given, answer: q.answer, correct: given === q.answer, explain: q.explain };
  });
  const score = results.filter((r) => r.correct).length;
  const total = results.length;
  const percent = total ? Math.round((score / total) * 100) : 0;
  return { score, total, percent, passed: percent >= quiz.passMark, results };
}

export function progress(course, enrollment) {
  const ids = new Set(course.lessons.map((l) => l.id));
  const done = (enrollment?.completed || []).filter((id) => ids.has(id)).length;
  const total = course.lessons.length;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

export function bestScore(enrollment) {
  const attempts = enrollment?.quizAttempts || [];
  return attempts.length ? Math.max(...attempts.map((a) => a.percent)) : null;
}

// A certificate needs every lesson done and a passing quiz score
export function canCertify(course, enrollment) {
  const best = bestScore(enrollment);
  return progress(course, enrollment).percent === 100 && best !== null && best >= course.quiz.passMark;
}

// Short, stable code printed on the certificate and checked on the public verify page
export function certificateCode(email, courseSlug) {
  let h = 2166136261;
  for (const ch of `${email}:${courseSlug}`) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return "CA-" + (h >>> 0).toString(36).toUpperCase().padStart(7, "0");
}

// completed | on-track | at-risk (no activity for AT_RISK_DAYS days and not finished)
export function studentStatus(course, enrollment, now = Date.now()) {
  if (enrollment.certificate) return "completed";
  const idle = (now - new Date(enrollment.lastActivity || enrollment.enrolledAt).getTime()) / DAY;
  return idle >= AT_RISK_DAYS ? "at-risk" : "on-track";
}

export function courseStats(course, enrollments, now = Date.now()) {
  const n = enrollments.length;
  const scores = enrollments.map(bestScore).filter((s) => s !== null);
  const avg = (xs) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);
  return {
    students: n,
    avgProgress: avg(enrollments.map((e) => progress(course, e).percent)) ?? 0,
    avgScore: avg(scores),
    completionRate: n ? Math.round((enrollments.filter((e) => e.certificate).length / n) * 100) : 0,
    atRisk: enrollments.filter((e) => studentStatus(course, e, now) === "at-risk").length,
  };
}

// New enrollments per week, oldest first, ending with the current week
export function weeklyEnrollments(enrollments, weeks = 8, now = Date.now()) {
  const counts = Array(weeks).fill(0);
  for (const e of enrollments) {
    const ago = Math.floor((now - new Date(e.enrolledAt).getTime()) / (7 * DAY));
    if (ago >= 0 && ago < weeks) counts[weeks - 1 - ago]++;
  }
  return counts;
}

// What anyone can see: no lesson content, no quiz answers
export function publicCourse(course) {
  const { lessons, quiz, ...rest } = course;
  return {
    ...rest,
    lessons: lessons.map(({ id, title, minutes }) => ({ id, title, minutes })),
    quiz: { passMark: quiz.passMark, count: quiz.questions.length },
  };
}

// What an enrolled student sees: full lessons, quiz without the answers
export function studentCourse(course) {
  return {
    ...course,
    quiz: { passMark: course.quiz.passMark, questions: course.quiz.questions.map(({ id, q, options }) => ({ id, q, options })) },
  };
}

// Checks a course sent by the teacher editor. Returns an error message or null.
export function validateCourse(c) {
  if (!c || typeof c !== "object") return "Invalid course";
  if (!["fr", "ar", "en"].every((l) => typeof c.title?.[l] === "string" && c.title[l].trim())) return "A title is required in French, Arabic and English";
  if (!Array.isArray(c.lessons) || !c.lessons.length) return "Add at least one lesson";
  for (const l of c.lessons) {
    if (!l.id || !String(l.title || "").trim()) return "Every lesson needs a title";
    if (!(l.minutes > 0 && l.minutes <= 600)) return "Lesson length must be between 1 and 600 minutes";
  }
  if (!Array.isArray(c.quiz?.questions) || !c.quiz.questions.length) return "Add at least one quiz question";
  for (const q of c.quiz.questions) {
    if (!String(q.q || "").trim()) return "Every question needs a text";
    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.some((o) => !String(o).trim())) return "Every question needs at least two filled options";
    if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length)) return "Pick the correct option for every question";
  }
  if (!(c.quiz.passMark >= 1 && c.quiz.passMark <= 100)) return "Pass mark must be between 1 and 100";
  if (!(c.priceDA >= 0)) return "Price must be zero or more";
  return null;
}

export function slugify(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "course";
}
