import { test } from "node:test";
import assert from "node:assert/strict";
import { canCertify, certificateCode, courseStats, gradeQuiz, progress, publicCourse, studentCourse, studentStatus, validateCourse, weeklyEnrollments } from "../../shared/logic.js";
import { COURSES } from "../../shared/courses.js";
import { makeSeed } from "../../shared/seed.js";

const course = COURSES.find((c) => c.slug === "web-dev");
const DAY = 86400000;

test("gradeQuiz counts correct answers and applies the pass mark", () => {
  const all = Object.fromEntries(course.quiz.questions.map((q) => [q.id, q.answer]));
  assert.deepEqual(pick(gradeQuiz(course.quiz, all)), { score: 5, total: 5, percent: 100, passed: true });
  const two = { q1: 1, q2: 1, q3: 3 };
  assert.deepEqual(pick(gradeQuiz(course.quiz, two)), { score: 2, total: 5, percent: 40, passed: false });
  assert.equal(gradeQuiz(course.quiz, {}).score, 0);
});

test("progress ignores unknown lesson ids", () => {
  assert.deepEqual(progress(course, { completed: ["l1", "l2", "ghost"] }), { done: 2, total: 6, percent: 33 });
});

test("a certificate needs every lesson and a passing score", () => {
  const all = course.lessons.map((l) => l.id);
  assert.equal(canCertify(course, { completed: all, quizAttempts: [] }), false);
  assert.equal(canCertify(course, { completed: all, quizAttempts: [{ percent: 40 }] }), false);
  assert.equal(canCertify(course, { completed: all.slice(1), quizAttempts: [{ percent: 100 }] }), false);
  assert.equal(canCertify(course, { completed: all, quizAttempts: [{ percent: 40 }, { percent: 80 }] }), true);
});

test("certificate codes are stable and distinct", () => {
  assert.equal(certificateCode("a@b.dz", "web-dev"), certificateCode("a@b.dz", "web-dev"));
  assert.notEqual(certificateCode("a@b.dz", "web-dev"), certificateCode("a@b.dz", "python"));
  assert.match(certificateCode("a@b.dz", "web-dev"), /^CA-[0-9A-Z]{7}$/);
});

test("students idle for 10 days are at risk", () => {
  const now = Date.now();
  assert.equal(studentStatus(course, { lastActivity: new Date(now - 11 * DAY) }, now), "at-risk");
  assert.equal(studentStatus(course, { lastActivity: new Date(now - 2 * DAY) }, now), "on-track");
  assert.equal(studentStatus(course, { lastActivity: new Date(now - 30 * DAY), certificate: { code: "x" } }, now), "completed");
});

test("public and student views never leak quiz answers", () => {
  assert.equal(JSON.stringify(publicCourse(course)).includes("\"answer\""), false);
  assert.equal(JSON.stringify(publicCourse(course)).includes("content"), false);
  const s = studentCourse(course);
  assert.ok(s.lessons[0].content);
  assert.equal(JSON.stringify(s.quiz).includes("\"answer\""), false);
});

test("validateCourse rejects incomplete courses", () => {
  assert.equal(validateCourse(course), null);
  assert.match(validateCourse({ ...course, title: { fr: "x", ar: "", en: "x" } }), /title/);
  assert.match(validateCourse({ ...course, lessons: [] }), /lesson/);
  const badQuiz = { ...course.quiz, questions: [{ id: "q", q: "?", options: ["a", "b"], answer: 5 }] };
  assert.match(validateCourse({ ...course, quiz: badQuiz }), /correct option/);
});

test("stats and weekly sign-ups", () => {
  const now = Date.now();
  const es = [
    { enrolledAt: new Date(now - 1 * DAY), lastActivity: new Date(now), completed: ["l1", "l2", "l3"], quizAttempts: [{ percent: 80 }] },
    { enrolledAt: new Date(now - 20 * DAY), lastActivity: new Date(now - 15 * DAY), completed: [], quizAttempts: [] },
  ];
  assert.deepEqual(courseStats(course, es, now), { students: 2, avgProgress: 25, avgScore: 80, completionRate: 0, atRisk: 1 });
  assert.deepEqual(weeklyEnrollments(es, 4, now), [0, 1, 0, 1]);
});

test("the seed is deterministic and consistent", () => {
  const now = Date.UTC(2026, 9, 23);
  const a = makeSeed(now), b = makeSeed(now);
  assert.deepEqual(a, b);
  const emails = new Set(a.users.map((u) => u.email));
  assert.equal(emails.size, a.users.length, "unique emails");
  for (const e of a.enrollments) {
    assert.ok(emails.has(e.email));
    const c = COURSES.find((x) => x.slug === e.course);
    assert.equal(Boolean(e.certificate), canCertify(c, e));
  }
});

function pick({ score, total, percent, passed }) { return { score, total, percent, passed }; }
