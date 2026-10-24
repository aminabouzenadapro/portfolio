import { COURSES } from "../../../shared/courses.js";
import { DEMO_PASSWORD, makeSeed } from "../../../shared/seed.js";
import { MAX_VIDEO_MB, VIDEO_TYPES, canCertify, canOpen, certificateCode, gradeQuiz, slugify, validateCourse } from "../../../shared/logic.js";
import { certificateView, courseCard, myCourse, myEnrollment, teacherCourse, teacherOverview } from "../../../shared/views.js";
import { blobs } from "./blobs.js";

// The demo API: the same routes and JSON as server/src/app.js, with the data kept in
// this browser (localStorage, and IndexedDB for uploaded videos). Used when the site
// is hosted without a backend.

const KEY = "atelier-demo-v1";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EDITABLE = ["title", "summary", "category", "level", "language", "priceDA", "hours", "format", "days", "time", "start", "seats", "color", "outcomes", "lessons", "quiz"];

class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }

// Not a real password hash: the demo data never leaves the visitor's browser
const scramble = (s) => btoa(unescape(encodeURIComponent("atelier:" + s)));

function fresh() {
  const { users, enrollments } = makeSeed(Date.now());
  return {
    users: users.map((u) => ({ ...u, password: scramble(DEMO_PASSWORD) })),
    courses: structuredClone(COURSES),
    enrollments,
  };
}

let db = load();
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved?.users && saved?.courses && saved?.enrollments) return saved;
  } catch { /* storage unavailable or corrupted */ }
  return fresh();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* quota or private mode */ }
}

export async function resetDemo() {
  db = fresh(); save();
  try { await blobs.clear(); } catch { /* IndexedDB unavailable */ }
}

// Uploaded videos live in IndexedDB; the player turns "idb:<id>" into a local link
const resolve = (video) => (video?.upload ? { name: video.name, size: video.size, type: video.type, src: "idb:" + video.upload } : video);

const userBy = (email) => db.users.find((u) => u.email === email);
const publicUser = (u) => ({ id: u.email, name: u.name, email: u.email, role: u.role, title: u.title });
const withTeacher = (c) => { const t = userBy(c.teacher); return { ...c, teacher: { name: t.name, title: t.title } }; };
const withUser = (e) => { const u = userBy(e.email); return { ...e, user: { name: u.name, email: u.email } }; };
const studentsOf = (slug) => db.enrollments.filter((e) => e.course === slug);
const token = (u) => "demo." + btoa(u.email);

function findCourse(slug) {
  const c = db.courses.find((x) => x.slug === slug);
  if (!c) throw new HttpError(404, "Course not found");
  return c;
}
function currentUser(headers, role) {
  const raw = (headers.Authorization || "").replace(/^Bearer demo\./, "");
  let u;
  try { u = userBy(atob(raw)); } catch { /* bad token */ }
  if (!u) throw new HttpError(401, "Please sign in");
  if (role && u.role !== role) throw new HttpError(403, "Not allowed for your account");
  return u;
}
function myEnrollmentOf(user, slug) {
  const course = findCourse(slug);
  const e = db.enrollments.find((x) => x.email === user.email && x.course === slug);
  if (!e) throw new HttpError(403, "Enroll in this course first");
  return { course, e };
}
function ownCourse(user, slug) {
  const c = findCourse(slug);
  if (c.teacher !== user.email) throw new HttpError(403, "This is not one of your courses");
  return c;
}
const teacherView = (c) => teacherCourse(withTeacher(c), studentsOf(c.slug).map(withUser), Date.now(), resolve);
const pick = (obj = {}, keys) => Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));
// Lesson videos only change through the upload routes, so the editor can't overwrite them
const keepVideos = (lessons, existing = []) => lessons?.map((l) => ({ ...l, free: Boolean(l.free), video: existing.find((x) => x.id === l.id)?.video ?? null }));

const routes = [
  ["GET", /^\/health$/, () => ({ ok: true })],

  ["POST", /^\/auth\/register$/, ({ body }) => {
    const { name = "", email = "", password = "" } = body || {};
    if (name.trim().length < 2) throw new HttpError(400, "Please enter your full name");
    if (!EMAIL.test(email)) throw new HttpError(400, "Please enter a valid email");
    if (password.length < 8) throw new HttpError(400, "Password must be at least 8 characters");
    if (userBy(email.toLowerCase())) throw new HttpError(409, "An account already uses this email");
    const u = { name: name.trim(), email: email.toLowerCase(), role: "student", password: scramble(password) };
    db.users.push(u); save();
    return [201, { token: token(u), user: publicUser(u) }];
  }],

  ["POST", /^\/auth\/login$/, ({ body }) => {
    const u = userBy(String(body?.email || "").toLowerCase());
    if (!u || u.password !== scramble(String(body?.password || ""))) throw new HttpError(401, "Wrong email or password");
    return { token: token(u), user: publicUser(u) };
  }],

  ["GET", /^\/auth\/me$/, ({ headers }) => ({ user: publicUser(currentUser(headers)) })],

  ["GET", /^\/courses$/, ({ query }) => {
    let list = db.courses.map(withTeacher);
    if (query.get("category")) list = list.filter((c) => c.category === query.get("category"));
    if (query.get("level")) list = list.filter((c) => c.level === query.get("level"));
    const q = query.get("q")?.toLowerCase();
    if (q) list = list.filter((c) => [...Object.values(c.title), ...Object.values(c.summary), c.teacher.name].some((s) => s?.toLowerCase().includes(q)));
    return list.sort((a, b) => a.start.localeCompare(b.start)).map((c) => courseCard(c, studentsOf(c.slug).length, resolve));
  }],

  ["GET", /^\/courses\/([^/]+)$/, ({ params: [slug] }) => courseCard(withTeacher(findCourse(slug)), studentsOf(slug).length, resolve)],

  ["POST", /^\/courses\/([^/]+)\/enroll$/, ({ headers, params: [slug] }) => {
    const u = currentUser(headers, "student");
    const c = findCourse(slug);
    if (db.enrollments.some((e) => e.email === u.email && e.course === slug)) throw new HttpError(409, "You are already enrolled");
    if (studentsOf(slug).length >= c.seats) throw new HttpError(409, "This course is full");
    const now = new Date().toISOString();
    const e = { email: u.email, course: slug, enrolledAt: now, paid: false, paidAt: null, completed: [], quizAttempts: [], lastActivity: now, certificate: null };
    db.enrollments.push(e); save();
    return [201, myCourse(withTeacher(c), withUser(e), resolve)];
  }],

  ["GET", /^\/certificates\/([^/]+)$/, ({ params: [code] }) => {
    const e = db.enrollments.find((x) => x.certificate?.code === code.toUpperCase());
    if (!e) throw new HttpError(404, "No certificate with this code");
    return certificateView(withTeacher(findCourse(e.course)), withUser(e));
  }],

  ["GET", /^\/me\/enrollments$/, ({ headers }) => {
    const u = currentUser(headers, "student");
    return db.enrollments.filter((e) => e.email === u.email)
      .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
      .map((e) => myEnrollment(withTeacher(findCourse(e.course)), withUser(e), resolve));
  }],

  ["GET", /^\/me\/courses\/([^/]+)$/, ({ headers, params: [slug] }) => {
    const { course, e } = myEnrollmentOf(currentUser(headers, "student"), slug);
    return myCourse(withTeacher(course), withUser(e), resolve);
  }],

  ["POST", /^\/me\/courses\/([^/]+)\/lessons\/([^/]+)$/, ({ headers, body, params: [slug, lessonId] }) => {
    const { course, e } = myEnrollmentOf(currentUser(headers, "student"), slug);
    const lesson = course.lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new HttpError(404, "Lesson not found");
    if (!canOpen(lesson, e)) throw new HttpError(402, "This lesson opens once your payment is confirmed");
    e.completed = body?.done !== false ? [...new Set([...e.completed, lessonId])] : e.completed.filter((id) => id !== lessonId);
    e.lastActivity = new Date().toISOString();
    save();
    return myCourse(withTeacher(course), withUser(e), resolve);
  }],

  ["POST", /^\/me\/courses\/([^/]+)\/quiz$/, ({ headers, body, params: [slug] }) => {
    const u = currentUser(headers, "student");
    const { course, e } = myEnrollmentOf(u, slug);
    if (!e.paid) throw new HttpError(402, "The quiz opens once your payment is confirmed");
    const result = gradeQuiz(course.quiz, body?.answers);
    const now = new Date().toISOString();
    e.quizAttempts.push({ score: result.score, total: result.total, percent: result.percent, at: now });
    e.lastActivity = now;
    if (!e.certificate && canCertify(course, e)) e.certificate = { code: certificateCode(u.email, slug), issuedAt: now };
    save();
    return { result, ...myCourse(withTeacher(course), withUser(e), resolve) };
  }],

  ["GET", /^\/teacher\/overview$/, ({ headers }) => {
    const u = currentUser(headers, "teacher");
    const courses = db.courses.filter((c) => c.teacher === u.email).sort((a, b) => a.start.localeCompare(b.start));
    return teacherOverview(courses.map(withTeacher), Object.fromEntries(courses.map((c) => [c.slug, studentsOf(c.slug).map(withUser)])));
  }],

  ["GET", /^\/teacher\/courses\/([^/]+)$/, ({ headers, params: [slug] }) => teacherView(ownCourse(currentUser(headers, "teacher"), slug))],

  ["PUT", /^\/teacher\/courses\/([^/]+)$/, ({ headers, body, params: [slug] }) => {
    const c = ownCourse(currentUser(headers, "teacher"), slug);
    const changes = pick(body, EDITABLE);
    if (changes.lessons) changes.lessons = keepVideos(changes.lessons, c.lessons);
    const next = { ...c, ...changes };
    const error = validateCourse(next);
    if (error) throw new HttpError(400, error);
    Object.assign(c, pick(structuredClone(next), EDITABLE)); save();
    return teacherView(c);
  }],

  ["POST", /^\/teacher\/courses$/, ({ headers, body }) => {
    const u = currentUser(headers, "teacher");
    const data = pick(structuredClone(body), EDITABLE);
    data.lessons = keepVideos(data.lessons);
    const error = validateCourse(data);
    if (error) throw new HttpError(400, error);
    const base = slugify(data.title.en || data.title.fr);
    let slug = base;
    for (let i = 2; db.courses.some((c) => c.slug === slug); i++) slug = `${base}-${i}`;
    const c = { ...data, slug, teacher: u.email };
    db.courses.push(c); save();
    return [201, teacherView(c)];
  }],

  ["PATCH", /^\/teacher\/courses\/([^/]+)\/students\/([^/]+)$/, ({ headers, body, params: [slug, email] }) => {
    const c = ownCourse(currentUser(headers, "teacher"), slug);
    const e = db.enrollments.find((x) => x.course === slug && x.email === email.toLowerCase());
    if (!e) throw new HttpError(404, "This student is not enrolled in this course");
    if (typeof body?.paid !== "boolean") throw new HttpError(400, "Say whether the student has paid");
    e.paid = body.paid;
    e.paidAt = e.paid ? new Date().toISOString() : null;
    save();
    return teacherView(c);
  }],

  ["DELETE", /^\/teacher\/courses\/([^/]+)\/lessons\/([^/]+)\/video$/, async ({ headers, params: [slug, lessonId] }) => {
    const c = ownCourse(currentUser(headers, "teacher"), slug);
    const lesson = c.lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new HttpError(404, "Lesson not found");
    if (lesson.video?.upload) await blobs.remove(lesson.video.upload).catch(() => {});
    lesson.video = null; save();
    return teacherView(c);
  }],
];

async function respond(fn) {
  try {
    const out = await fn();
    const [status, data] = Array.isArray(out) && typeof out[0] === "number" ? out : [200, out];
    return { status, data: structuredClone(data) };
  } catch (err) {
    if (err instanceof HttpError) return { status: err.status, data: { error: err.message } };
    console.error(err);
    return { status: 500, data: { error: "Server error" } };
  }
}

// Same contract as fetch on the real API: resolves with { status, data }
export async function mockFetch(method, path, body, headers) {
  await new Promise((r) => setTimeout(r, 120 + Math.random() * 120));
  const url = new URL(path, "http://demo");
  for (const [m, re, handler] of routes) {
    const match = m === method && url.pathname.match(re);
    if (match) return respond(() => handler({ headers, body: body && structuredClone(body), query: url.searchParams, params: match.slice(1).map(decodeURIComponent) }));
  }
  return { status: 404, data: { error: "Not found" } };
}

// POST /teacher/courses/:slug/lessons/:lessonId/video, with a simulated upload progress
export async function mockUpload(path, file, onProgress, authToken) {
  const match = path.match(/^\/teacher\/courses\/([^/]+)\/lessons\/([^/]+)\/video$/);
  if (!match) return { status: 404, data: { error: "Not found" } };
  const [slug, lessonId] = match.slice(1).map(decodeURIComponent);
  return respond(async () => {
    const c = ownCourse(currentUser({ Authorization: `Bearer ${authToken}` }, "teacher"), slug);
    const lesson = c.lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new HttpError(404, "Lesson not found");
    if (!VIDEO_TYPES.includes(file.type)) throw new HttpError(400, "Please choose an MP4, WebM or MOV video");
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) throw new HttpError(413, `The video is too large (${MAX_VIDEO_MB} MB maximum)`);
    for (let p = 0.1; p < 1; p += 0.15) { onProgress(p); await new Promise((r) => setTimeout(r, 90)); }
    const id = crypto.randomUUID();
    await blobs.put(id, file);
    if (lesson.video?.upload) await blobs.remove(lesson.video.upload).catch(() => {});
    lesson.video = { upload: id, name: file.name, size: file.size, type: file.type };
    save();
    onProgress(1);
    return teacherView(c);
  });
}
