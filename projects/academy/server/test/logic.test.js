import { test } from "node:test";
import assert from "node:assert/strict";
import { canCertify, canOpen, certificateCode, courseStats, gradeQuiz, progress, publicCourse, studentCourse, studentStatus, validateCourse, weeklyEnrollments } from "../../shared/logic.js";
import { COURSES } from "../../shared/courses.js";
import { makeSeed } from "../../shared/seed.js";

const course = COURSES.find((c) => c.slug === "bases-couture");
const DAY = 86400000;

test("gradeQuiz counts correct answers and applies the pass mark", () => {
  const all = Object.fromEntries(course.quiz.questions.map((q) => [q.id, q.answer]));
  assert.deepEqual(pick(gradeQuiz(course.quiz, all)), { score: 5, total: 5, percent: 100, passed: true });
  assert.deepEqual(pick(gradeQuiz(course.quiz, { q1: 1, q2: 1, q3: 3 })), { score: 2, total: 5, percent: 40, passed: false });
  assert.equal(gradeQuiz(course.quiz, {}).score, 0);
});

test("progress ignores unknown lesson ids", () => {
  assert.deepEqual(progress(course, { completed: ["l1", "l2", "ghost"] }), { done: 2, total: 6, percent: 33 });
});

test("free lessons open before payment, the others after", () => {
  const [free, paidLesson] = course.lessons;
  assert.equal(canOpen(free, { paid: false }), true);
  assert.equal(canOpen(paidLesson, { paid: false }), false);
  assert.equal(canOpen(paidLesson, { paid: true }), true);
});

test("an attestation needs payment, every lesson and a passing score", () => {
  const all = course.lessons.map((l) => l.id);
  assert.equal(canCertify(course, { paid: true, completed: all, quizAttempts: [] }), false);
  assert.equal(canCertify(course, { paid: true, completed: all, quizAttempts: [{ percent: 40 }] }), false);
  assert.equal(canCertify(course, { paid: true, completed: all.slice(1), quizAttempts: [{ percent: 100 }] }), false);
  assert.equal(canCertify(course, { paid: false, completed: all, quizAttempts: [{ percent: 100 }] }), false);
  assert.equal(canCertify(course, { paid: true, completed: all, quizAttempts: [{ percent: 40 }, { percent: 80 }] }), true);
});

test("attestation codes are stable and distinct", () => {
  assert.equal(certificateCode("a@b.dz", "gandoura"), certificateCode("a@b.dz", "gandoura"));
  assert.notEqual(certificateCode("a@b.dz", "gandoura"), certificateCode("a@b.dz", "patronage"));
  assert.match(certificateCode("a@b.dz", "gandoura"), /^AY-[0-9A-Z]{7}$/);
});

test("student status: pending payment, at risk after 10 idle days, completed", () => {
  const now = Date.now();
  assert.equal(studentStatus(course, { paid: false, lastActivity: new Date(now) }, now), "pending");
  assert.equal(studentStatus(course, { paid: true, lastActivity: new Date(now - 11 * DAY) }, now), "at-risk");
  assert.equal(studentStatus(course, { paid: true, lastActivity: new Date(now - 2 * DAY) }, now), "on-track");
  assert.equal(studentStatus(course, { paid: true, lastActivity: new Date(now - 30 * DAY), certificate: { code: "x" } }, now), "completed");
});

test("views never leak notes, locked videos or quiz answers", () => {
  const pub = JSON.stringify(publicCourse(course));
  assert.equal(pub.includes("\"answer\""), false);
  assert.equal(pub.includes("content"), false);
  assert.equal(pub.split("media/").length - 1, 2, "only the free lesson's video and poster");

  const unpaid = studentCourse(course, { paid: false });
  assert.ok(unpaid.lessons[0].content && unpaid.lessons[0].video);
  assert.ok(unpaid.lessons.slice(1).every((l) => l.locked && !l.video && !l.content));
  assert.equal(unpaid.quiz.questions.length, 0);

  const paid = studentCourse(course, { paid: true }, (v) => ({ ...v, src: "signed:" + v.src }));
  assert.ok(paid.lessons.every((l) => !l.locked && l.video.src.startsWith("signed:")));
  assert.equal(JSON.stringify(paid.quiz).includes("\"answer\""), false);
});

test("validateCourse rejects incomplete courses", () => {
  assert.equal(validateCourse(course), null);
  assert.match(validateCourse({ ...course, title: { fr: "x", ar: "", en: "x" } }), /title/);
  assert.match(validateCourse({ ...course, lessons: [] }), /lesson/);
  const badQuiz = { ...course.quiz, questions: [{ id: "q", q: "?", options: ["a", "b"], answer: 5 }] };
  assert.match(validateCourse({ ...course, quiz: badQuiz }), /correct option/);
});

test("stats count revenue only for paid students", () => {
  const now = Date.now();
  const es = [
    { paid: true, enrolledAt: new Date(now - 1 * DAY), lastActivity: new Date(now), completed: ["l1", "l2", "l3"], quizAttempts: [{ percent: 80 }] },
    { paid: true, enrolledAt: new Date(now - 20 * DAY), lastActivity: new Date(now - 15 * DAY), completed: [], quizAttempts: [] },
    { paid: false, enrolledAt: new Date(now - 2 * DAY), lastActivity: new Date(now - 2 * DAY), completed: ["l1"], quizAttempts: [] },
  ];
  assert.deepEqual(courseStats(course, es, now), { students: 3, paid: 2, pending: 1, revenue: 14000, avgProgress: 25, avgScore: 80, completionRate: 0, atRisk: 1 });
  assert.deepEqual(weeklyEnrollments(es, 4, now), [0, 1, 0, 2]);
});

test("the seed is deterministic and consistent", () => {
  const now = Date.UTC(2026, 9, 24);
  const a = makeSeed(now), b = makeSeed(now);
  assert.deepEqual(a, b);
  const emails = new Set(a.users.map((u) => u.email));
  assert.equal(emails.size, a.users.length, "unique emails");
  for (const e of a.enrollments) {
    assert.ok(emails.has(e.email));
    const c = COURSES.find((x) => x.slug === e.course);
    assert.equal(Boolean(e.certificate), canCertify(c, e));
    if (!e.paid) assert.ok(e.completed.every((id) => c.lessons.find((l) => l.id === id).free), "unpaid students only finished free lessons");
  }
  assert.ok(a.enrollments.some((e) => !e.paid) && a.enrollments.some((e) => e.certificate));
});

function pick({ score, total, percent, passed }) { return { score, total, percent, passed }; }
