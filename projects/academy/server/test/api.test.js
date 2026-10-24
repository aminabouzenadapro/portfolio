import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { createApp } from "../src/app.js";
import { connect, disconnect } from "../src/db.js";
import { seedDatabase } from "../src/seed.js";
import { COURSES } from "../../shared/courses.js";
import { DEMO_PASSWORD, DEMO_STUDENT, DEMO_TEACHER } from "../../shared/seed.js";

// Runs against a real (in-memory) MongoDB, with uploads in a temporary folder
let app, uploadDir;
before(async () => {
  delete process.env.MONGODB_URI;
  await connect();
  await seedDatabase();
  uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), "atelier-uploads-"));
  app = createApp({ uploadDir });
});
after(async () => {
  await disconnect();
  fs.rmSync(uploadDir, { recursive: true, force: true });
});

const login = async (email) => (await request(app).post("/api/auth/login").send({ email, password: DEMO_PASSWORD }).expect(200)).body.token;
const as = (token) => ({ Authorization: `Bearer ${token}` });
const course = (slug) => COURSES.find((c) => c.slug === slug);
// A tiny "video": the bytes don't matter to the API, only the type and size
const fakeVideo = Buffer.alloc(64 * 1024, 7);

describe("catalog", () => {
  test("lists courses without lesson notes or quiz answers, with the free preview video", async () => {
    const { body } = await request(app).get("/api/courses").expect(200);
    assert.equal(body.length, COURSES.length);
    const text = JSON.stringify(body);
    assert.equal(text.includes("\"content\""), false);
    assert.equal(text.includes("\"answer\""), false);
    const first = body[0].lessons;
    assert.ok(first.find((l) => l.free).video.src, "free lesson has its video");
    assert.ok(first.filter((l) => !l.free).every((l) => !l.video && l.hasVideo), "paid lessons only say they have a video");
  });

  test("filters by category and searches text", async () => {
    const trad = (await request(app).get("/api/courses?category=traditional").expect(200)).body;
    assert.deepEqual(trad.map((c) => c.slug).sort(), ["gandoura", "medjboud"]);
    const search = (await request(app).get("/api/courses?q=fermeture").expect(200)).body;
    assert.deepEqual(search.map((c) => c.slug), ["retouches"]);
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

describe("student journey with payment", () => {
  let token, teacherToken;
  const slug = "retouches";
  before(async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "Lyna Test", email: "lyna@test.dz", password: "motdepasse" }).expect(201);
    token = res.body.token;
    teacherToken = await login(DEMO_TEACHER);
    assert.equal(JSON.stringify(res.body).includes("passwordHash"), false);
  });

  test("cannot open a course before enrolling", async () => {
    await request(app).get(`/api/me/courses/${slug}`).set(as(token)).expect(403);
  });

  test("before payment only the free lesson is open", async () => {
    const { body } = await request(app).post(`/api/courses/${slug}/enroll`).set(as(token)).expect(201);
    assert.equal(body.enrollment.paid, false);
    const [free, locked] = body.course.lessons;
    assert.ok(free.video.src && free.content && !free.locked);
    assert.ok(locked.locked && !locked.video && !locked.content, "paid lesson is locked");
    assert.equal(body.course.quiz.questions.length, 0, "quiz is hidden");
    await request(app).post(`/api/courses/${slug}/enroll`).set(as(token)).expect(409);

    await request(app).post(`/api/me/courses/${slug}/lessons/l1`).set(as(token)).send({ done: true }).expect(200);
    const blocked = await request(app).post(`/api/me/courses/${slug}/lessons/l2`).set(as(token)).send({ done: true }).expect(402);
    assert.match(blocked.body.error, /payment/);
    await request(app).post(`/api/me/courses/${slug}/quiz`).set(as(token)).send({ answers: {} }).expect(402);
  });

  test("the teacher marks the payment, lessons open, and the attestation can be verified", async () => {
    const paid = await request(app).patch(`/api/teacher/courses/${slug}/students/lyna@test.dz`).set(as(teacherToken)).send({ paid: true }).expect(200);
    assert.equal(paid.body.students.find((s) => s.email === "lyna@test.dz").paid, true);

    const opened = await request(app).get(`/api/me/courses/${slug}`).set(as(token)).expect(200);
    assert.ok(opened.body.course.lessons.every((l) => !l.locked));
    assert.equal(JSON.stringify(opened.body.course.quiz).includes("\"answer\""), false);

    const c = course(slug);
    let last;
    for (const l of c.lessons) last = await request(app).post(`/api/me/courses/${slug}/lessons/${l.id}`).set(as(token)).send({ done: true }).expect(200);
    assert.equal(last.body.enrollment.progress.percent, 100);
    assert.equal(last.body.enrollment.certificate, null, "no attestation without the quiz");

    const fail = await request(app).post(`/api/me/courses/${slug}/quiz`).set(as(token)).send({ answers: {} }).expect(200);
    assert.equal(fail.body.result.passed, false);
    const answers = Object.fromEntries(c.quiz.questions.map((q) => [q.id, q.answer]));
    const pass = await request(app).post(`/api/me/courses/${slug}/quiz`).set(as(token)).send({ answers }).expect(200);
    const code = pass.body.enrollment.certificate.code;
    assert.match(code, /^AY-/);

    const cert = await request(app).get(`/api/certificates/${code.toLowerCase()}`).expect(200);
    assert.equal(cert.body.student, "Lyna Test");
    assert.equal(cert.body.teacher, "Yasmina Hamidi");
  });

  test("payment can be undone, which locks the lessons again", async () => {
    await request(app).patch(`/api/teacher/courses/${slug}/students/lyna@test.dz`).set(as(teacherToken)).send({ paid: false }).expect(200);
    const { body } = await request(app).get(`/api/me/courses/${slug}`).set(as(token)).expect(200);
    assert.ok(body.course.lessons.slice(1).every((l) => l.locked));
    await request(app).patch(`/api/teacher/courses/${slug}/students/lyna@test.dz`).set(as(teacherToken)).send({}).expect(400);
    await request(app).patch(`/api/teacher/courses/${slug}/students/nobody@test.dz`).set(as(teacherToken)).send({ paid: true }).expect(404);
  });

  test("students cannot use the teacher API", async () => {
    await request(app).get("/api/teacher/overview").set(as(token)).expect(403);
    await request(app).patch(`/api/teacher/courses/${slug}/students/lyna@test.dz`).set(as(token)).send({ paid: true }).expect(403);
    await request(app).post(`/api/teacher/courses/${slug}/lessons/l1/video`).set(as(token)).attach("video", fakeVideo, { filename: "x.mp4", contentType: "video/mp4" }).expect(403);
  });
});

describe("lesson videos", () => {
  let teacherToken, studentToken, src;
  before(async () => {
    teacherToken = await login(DEMO_TEACHER);
    studentToken = await login(DEMO_STUDENT);
  });

  test("the teacher uploads her video for a lesson", async () => {
    const { body } = await request(app).post("/api/teacher/courses/bases-couture/lessons/l2/video").set(as(teacherToken))
      .attach("video", fakeVideo, { filename: "enfiler la machine.mp4", contentType: "video/mp4" }).expect(200);
    const lesson = body.course.lessons.find((l) => l.id === "l2");
    assert.equal(lesson.video.name, "enfiler la machine.mp4");
    assert.match(lesson.video.src, /\/api\/media\/[a-f0-9]{32}\.mp4\?token=/);
    assert.equal(fs.readdirSync(uploadDir).length, 1);
  });

  test("a paid student gets a signed link that streams, with seeking", async () => {
    const { body } = await request(app).get("/api/me/courses/bases-couture").set(as(studentToken)).expect(200);
    src = body.course.lessons.find((l) => l.id === "l2").video.src;
    const url = new URL(src);
    const full = await request(app).get(url.pathname + url.search).expect(200);
    assert.equal(full.body.length, fakeVideo.length);
    await request(app).get(url.pathname + url.search).set("Range", "bytes=0-99").expect(206);
  });

  test("video links need a valid token for that file", async () => {
    const url = new URL(src);
    await request(app).get(url.pathname).expect(401);
    await request(app).get(url.pathname + "?token=forged").expect(401);
    await request(app).get("/api/media/..%2F..%2Fsecret.mp4?token=x").expect(404);
  });

  test("the editor can't overwrite an uploaded video", async () => {
    const teacherView = (await request(app).get("/api/teacher/courses/bases-couture").set(as(teacherToken)).expect(200)).body.course;
    const lessons = teacherView.lessons.map((l) => ({ ...l, video: { src: "https://evil.example/x.mp4" } }));
    const { body } = await request(app).put("/api/teacher/courses/bases-couture").set(as(teacherToken)).send({ lessons }).expect(200);
    assert.match(body.course.lessons.find((l) => l.id === "l2").video.src, /\/api\/media\//);
    assert.match(body.course.lessons.find((l) => l.id === "l1").video.src, /^media\//);
  });

  test("rejects files that aren't videos, and replacing or removing deletes the old file", async () => {
    await request(app).post("/api/teacher/courses/bases-couture/lessons/l2/video").set(as(teacherToken))
      .attach("video", Buffer.from("hello"), { filename: "notes.txt", contentType: "text/plain" }).expect(400);
    await request(app).post("/api/teacher/courses/bases-couture/lessons/l2/video").set(as(teacherToken))
      .attach("video", fakeVideo, { filename: "v2.webm", contentType: "video/webm" }).expect(200);
    await new Promise((r) => setTimeout(r, 100));
    assert.deepEqual(fs.readdirSync(uploadDir).map((f) => path.extname(f)), [".webm"], "old upload removed");
    const { body } = await request(app).delete("/api/teacher/courses/bases-couture/lessons/l2/video").set(as(teacherToken)).expect(200);
    assert.equal(body.course.lessons.find((l) => l.id === "l2").video, null);
    await new Promise((r) => setTimeout(r, 100));
    assert.equal(fs.readdirSync(uploadDir).length, 0);
  });
});

describe("teacher space", () => {
  let token;
  before(async () => { token = await login(DEMO_TEACHER); });

  test("overview: revenue, pending payments and students at risk", async () => {
    const { body } = await request(app).get("/api/teacher/overview").set(as(token)).expect(200);
    assert.equal(body.courses.length, COURSES.length);
    assert.equal(body.weekly.length, 8);
    assert.ok(body.totals.revenue > 0);
    assert.ok(body.pendingPayments.length > 0 && body.pendingPayments.every((s) => !s.paid));
    assert.ok(body.pendingPayments.some((s) => s.email === DEMO_STUDENT && s.course.slug === "patronage"));
    assert.ok(body.atRisk.every((s) => s.status === "at-risk"));
  });

  test("sees students and full quiz answers of a course", async () => {
    const { body } = await request(app).get("/api/teacher/courses/gandoura").set(as(token)).expect(200);
    assert.ok(body.students.some((s) => s.email === DEMO_STUDENT && s.certificate));
    assert.equal(typeof body.course.quiz.questions[0].answer, "number");
  });

  test("edits a course with validation", async () => {
    await request(app).put("/api/teacher/courses/patronage").set(as(token)).send({ lessons: [] }).expect(400);
    const { body } = await request(app).put("/api/teacher/courses/patronage").set(as(token)).send({ priceDA: 9500 }).expect(200);
    assert.equal(body.course.priceDA, 9500);
    assert.equal((await request(app).get("/api/courses/patronage").expect(200)).body.priceDA, 9500);
  });

  test("creates a new course with a unique slug", async () => {
    const { slug, teacher, ...data } = course("retouches");
    const title = { fr: "Karakou", ar: "كاراكو", en: "Karakou jacket" };
    const a = await request(app).post("/api/teacher/courses").set(as(token)).send({ ...data, title }).expect(201);
    const b = await request(app).post("/api/teacher/courses").set(as(token)).send({ ...data, title }).expect(201);
    assert.equal(a.body.course.slug, "karakou-jacket");
    assert.equal(b.body.course.slug, "karakou-jacket-2");
    assert.equal(a.body.course.teacher.name, "Yasmina Hamidi");
  });

  test("another teacher can't touch her courses", async () => {
    const other = await request(app).post("/api/auth/register").send({ name: "Other Person", email: "other@test.dz", password: "12345678" }).expect(201);
    // Promote directly in the database: there is no public way to become a teacher
    const { User } = await import("../src/models.js");
    await User.updateOne({ email: "other@test.dz" }, { role: "teacher" });
    await request(app).get("/api/teacher/courses/gandoura").set(as(other.body.token)).expect(403);
    await request(app).delete("/api/teacher/courses/gandoura/lessons/l1/video").set(as(other.body.token)).expect(403);
  });
});
