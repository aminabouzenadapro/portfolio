import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";
import { connect, disconnect } from "../src/db.js";
import { seedDatabase } from "../src/seed.js";
import { COURSES } from "../../shared/courses.js";
import { DEMO_PASSWORD, DEMO_STUDENT, DEMO_TEACHER } from "../../shared/seed.js";

// Runs against a real (in-memory) MongoDB
let app;
before(async () => {
  delete process.env.MONGODB_URI;
  await connect();
  await seedDatabase();
  app = createApp();
});
after(disconnect);

const login = async (email) => (await request(app).post("/api/auth/login").send({ email, password: DEMO_PASSWORD }).expect(200)).body.token;
const as = (token) => ({ Authorization: `Bearer ${token}` });

describe("catalog", () => {
  test("lists courses without lesson content or answers", async () => {
    const { body } = await request(app).get("/api/courses").expect(200);
    assert.equal(body.length, COURSES.length);
    const text = JSON.stringify(body);
    assert.equal(text.includes("\"content\""), false);
    assert.equal(text.includes("\"answer\""), false);
    assert.ok(body.every((c) => c.teacher.name && c.students >= 0));
  });

  test("filters by category and searches text", async () => {
    const dev = (await request(app).get("/api/courses?category=dev").expect(200)).body;
    assert.deepEqual(dev.map((c) => c.slug).sort(), ["python", "web-dev"]);
    const search = (await request(app).get("/api/courses?q=excel").expect(200)).body;
    assert.deepEqual(search.map((c) => c.slug), ["excel"]);
  });

  test("unknown course is a 404", async () => {
    await request(app).get("/api/courses/nope").expect(404);
  });
});

describe("auth", () => {
  test("rejects a wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: DEMO_STUDENT, password: "nope" }).expect(401);
    assert.equal(res.body.error, "Wrong email or password");
  });

  test("validates registration and refuses duplicates", async () => {
    await request(app).post("/api/auth/register").send({ name: "A", email: "x@y.dz", password: "12345678" }).expect(400);
    await request(app).post("/api/auth/register").send({ name: "Amel Test", email: "bad", password: "12345678" }).expect(400);
    await request(app).post("/api/auth/register").send({ name: "Amel Test", email: "amel@test.dz", password: "short" }).expect(400);
    await request(app).post("/api/auth/register").send({ name: "Sara", email: DEMO_STUDENT, password: "12345678" }).expect(409);
  });

  test("protected routes need a valid token", async () => {
    await request(app).get("/api/me/enrollments").expect(401);
    await request(app).get("/api/me/enrollments").set(as("forged.token.value")).expect(401);
  });
});

describe("student journey", () => {
  let token;
  before(async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "Lyna Test", email: "lyna@test.dz", password: "motdepasse" }).expect(201);
    token = res.body.token;
    assert.equal(res.body.user.role, "student");
    assert.equal(JSON.stringify(res.body).includes("passwordHash"), false);
  });

  test("cannot open a course before enrolling", async () => {
    await request(app).get("/api/me/courses/python").set(as(token)).expect(403);
  });

  test("enrolls, completes lessons, passes the quiz and gets a verifiable certificate", async () => {
    const course = COURSES.find((c) => c.slug === "python");
    const enrolled = await request(app).post("/api/courses/python/enroll").set(as(token)).expect(201);
    assert.equal(enrolled.body.enrollment.progress.percent, 0);
    assert.equal(JSON.stringify(enrolled.body.course.quiz).includes("\"answer\""), false);
    await request(app).post("/api/courses/python/enroll").set(as(token)).expect(409);

    // A failed attempt first
    const wrong = await request(app).post("/api/me/courses/python/quiz").set(as(token)).send({ answers: {} }).expect(200);
    assert.equal(wrong.body.result.passed, false);
    assert.equal(wrong.body.enrollment.certificate, null);

    let last;
    for (const l of course.lessons) last = await request(app).post(`/api/me/courses/python/lessons/${l.id}`).set(as(token)).send({ done: true }).expect(200);
    assert.equal(last.body.enrollment.progress.percent, 100);
    assert.equal(last.body.enrollment.certificate, null, "no certificate without passing the quiz");

    const answers = Object.fromEntries(course.quiz.questions.map((q) => [q.id, q.answer]));
    const pass = await request(app).post("/api/me/courses/python/quiz").set(as(token)).send({ answers }).expect(200);
    assert.equal(pass.body.result.percent, 100);
    const code = pass.body.enrollment.certificate.code;
    assert.match(code, /^CA-/);

    const cert = await request(app).get(`/api/certificates/${code.toLowerCase()}`).expect(200);
    assert.equal(cert.body.student, "Lyna Test");
    assert.equal(cert.body.course.slug, "python");
    assert.equal(cert.body.score, 100);

    const mine = await request(app).get("/api/me/enrollments").set(as(token)).expect(200);
    assert.equal(mine.body.length, 1);
    assert.equal(mine.body[0].bestScore, 100);
  });

  test("unknown lessons are refused", async () => {
    await request(app).post("/api/me/courses/python/lessons/l99").set(as(token)).send({}).expect(404);
  });

  test("students cannot use the teacher API", async () => {
    await request(app).get("/api/teacher/overview").set(as(token)).expect(403);
  });
});

describe("teacher space", () => {
  let token;
  before(async () => { token = await login(DEMO_TEACHER); });

  test("overview covers only the teacher's own courses", async () => {
    const { body } = await request(app).get("/api/teacher/overview").set(as(token)).expect(200);
    assert.deepEqual(body.courses.map((c) => c.slug).sort(), ["python", "web-dev"]);
    assert.equal(body.weekly.length, 8);
    assert.ok(body.totals.students > 0);
    assert.ok(body.atRisk.every((s) => s.status === "at-risk"));
  });

  test("sees students and full quiz answers of an own course", async () => {
    const { body } = await request(app).get("/api/teacher/courses/web-dev").set(as(token)).expect(200);
    assert.ok(body.students.some((s) => s.email === DEMO_STUDENT));
    assert.equal(typeof body.course.quiz.questions[0].answer, "number");
    assert.equal(body.lessonCompletion.length, body.course.lessons.length);
  });

  test("cannot open or edit another teacher's course", async () => {
    await request(app).get("/api/teacher/courses/excel").set(as(token)).expect(403);
    await request(app).put("/api/teacher/courses/excel").set(as(token)).send({ priceDA: 1 }).expect(403);
  });

  test("edits a course with validation", async () => {
    await request(app).put("/api/teacher/courses/web-dev").set(as(token)).send({ lessons: [] }).expect(400);
    const { body } = await request(app).put("/api/teacher/courses/web-dev").set(as(token)).send({ priceDA: 19500, seats: 20 }).expect(200);
    assert.equal(body.course.priceDA, 19500);
    const pub = await request(app).get("/api/courses/web-dev").expect(200);
    assert.equal(pub.body.priceDA, 19500);
  });

  test("creates a new course with a unique slug", async () => {
    const base = COURSES.find((c) => c.slug === "python");
    const { slug, teacher, ...data } = base;
    const a = await request(app).post("/api/teacher/courses").set(as(token)).send({ ...data, title: { fr: "React", ar: "رياكت", en: "React basics" } }).expect(201);
    const b = await request(app).post("/api/teacher/courses").set(as(token)).send({ ...data, title: { fr: "React", ar: "رياكت", en: "React basics" } }).expect(201);
    assert.equal(a.body.course.slug, "react-basics");
    assert.equal(b.body.course.slug, "react-basics-2");
    assert.equal(a.body.course.teacher.name, "Yacine Benali");
  });
});
