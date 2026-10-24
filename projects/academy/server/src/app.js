import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { Course, Enrollment, User } from "./models.js";
import { HttpError, publicUser, requireUser, signToken } from "./auth.js";
import { canCertify, certificateCode, gradeQuiz, slugify, validateCourse } from "../../shared/logic.js";
import { certificateView, courseCard, myCourse, myEnrollment, teacherCourse, teacherOverview } from "../../shared/views.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EDITABLE = ["title", "summary", "category", "level", "language", "priceDA", "hours", "format", "days", "time", "start", "seats", "color", "outcomes", "lessons", "quiz"];

// Mongo documents -> the plain shapes used by shared/views.js
function toCourse(doc) {
  const { _id, __v, createdAt, updatedAt, teacher, ...rest } = doc;
  return { ...rest, teacher: { name: teacher.name, title: teacher.title } };
}
function toEnrollment(doc) {
  return {
    user: { name: doc.user.name, email: doc.user.email },
    enrolledAt: doc.enrolledAt,
    completed: doc.completed,
    quizAttempts: doc.quizAttempts,
    lastActivity: doc.lastActivity,
    certificate: doc.certificate,
  };
}

async function findCourse(slug) {
  const doc = await Course.findOne({ slug }).populate("teacher", "name title").lean();
  if (!doc) throw new HttpError(404, "Course not found");
  return doc;
}

async function studentCounts(courseIds) {
  const rows = await Enrollment.aggregate([{ $match: { course: { $in: courseIds } } }, { $group: { _id: "$course", n: { $sum: 1 } } }]);
  return Object.fromEntries(rows.map((r) => [String(r._id), r.n]));
}

async function myEnrollmentDoc(user, slug) {
  const course = await findCourse(slug);
  const enrollment = await Enrollment.findOne({ user: user._id, course: course._id }).populate("user", "name email");
  if (!enrollment) throw new HttpError(403, "Enroll in this course first");
  return { course, enrollment };
}

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "200kb" }));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // ---- Auth ----
  const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { error: "Too many attempts, try again in a few minutes" } });

  app.post("/api/auth/register", authLimit, async (req, res) => {
    const { name = "", email = "", password = "" } = req.body || {};
    if (name.trim().length < 2) throw new HttpError(400, "Please enter your full name");
    if (!EMAIL.test(email)) throw new HttpError(400, "Please enter a valid email");
    if (password.length < 8) throw new HttpError(400, "Password must be at least 8 characters");
    if (await User.exists({ email: email.toLowerCase() })) throw new HttpError(409, "An account already uses this email");
    const user = await User.create({ name: name.trim(), email, passwordHash: await bcrypt.hash(password, 10), role: "student" });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  });

  app.post("/api/auth/login", authLimit, async (req, res) => {
    const { email = "", password = "" } = req.body || {};
    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) throw new HttpError(401, "Wrong email or password");
    res.json({ token: signToken(user), user: publicUser(user) });
  });

  app.get("/api/auth/me", requireUser(), (req, res) => res.json({ user: publicUser(req.user) }));

  // ---- Public catalog ----
  app.get("/api/courses", async (req, res) => {
    const { q, category, level } = req.query;
    const filter = {};
    if (category) filter.category = String(category);
    if (level) filter.level = String(level);
    let docs = await Course.find(filter).populate("teacher", "name title").sort({ start: 1 }).lean();
    if (q) {
      const needle = String(q).toLowerCase();
      docs = docs.filter((c) => [...Object.values(c.title), ...Object.values(c.summary), c.teacher.name].some((s) => s?.toLowerCase().includes(needle)));
    }
    const counts = await studentCounts(docs.map((d) => d._id));
    res.json(docs.map((d) => courseCard(toCourse(d), counts[String(d._id)] || 0)));
  });

  app.get("/api/courses/:slug", async (req, res) => {
    const doc = await findCourse(req.params.slug);
    const counts = await studentCounts([doc._id]);
    res.json(courseCard(toCourse(doc), counts[String(doc._id)] || 0));
  });

  app.post("/api/courses/:slug/enroll", requireUser("student"), async (req, res) => {
    const doc = await findCourse(req.params.slug);
    if (await Enrollment.exists({ user: req.user._id, course: doc._id })) throw new HttpError(409, "You are already enrolled");
    if ((await Enrollment.countDocuments({ course: doc._id })) >= doc.seats) throw new HttpError(409, "This course is full");
    const e = await Enrollment.create({ user: req.user._id, course: doc._id });
    await e.populate("user", "name email");
    res.status(201).json(myCourse(toCourse(doc), toEnrollment(e.toObject())));
  });

  app.get("/api/certificates/:code", async (req, res) => {
    const e = await Enrollment.findOne({ "certificate.code": String(req.params.code).toUpperCase() }).populate("user", "name email").lean();
    if (!e) throw new HttpError(404, "No certificate with this code");
    const doc = await Course.findById(e.course).populate("teacher", "name title").lean();
    res.json(certificateView(toCourse(doc), toEnrollment(e)));
  });

  // ---- Student space ----
  app.get("/api/me/enrollments", requireUser("student"), async (req, res) => {
    const list = await Enrollment.find({ user: req.user._id }).populate("user", "name email").populate({ path: "course", populate: { path: "teacher", select: "name title" } }).sort({ lastActivity: -1 }).lean();
    res.json(list.map((e) => myEnrollment(toCourse(e.course), toEnrollment(e))));
  });

  app.get("/api/me/courses/:slug", requireUser("student"), async (req, res) => {
    const { course, enrollment } = await myEnrollmentDoc(req.user, req.params.slug);
    res.json(myCourse(toCourse(course), toEnrollment(enrollment.toObject())));
  });

  app.post("/api/me/courses/:slug/lessons/:lessonId", requireUser("student"), async (req, res) => {
    const { course, enrollment } = await myEnrollmentDoc(req.user, req.params.slug);
    const { lessonId } = req.params;
    if (!course.lessons.some((l) => l.id === lessonId)) throw new HttpError(404, "Lesson not found");
    const done = req.body?.done !== false;
    enrollment.completed = done ? [...new Set([...enrollment.completed, lessonId])] : enrollment.completed.filter((id) => id !== lessonId);
    enrollment.lastActivity = new Date();
    await enrollment.save();
    res.json(myCourse(toCourse(course), toEnrollment(enrollment.toObject())));
  });

  app.post("/api/me/courses/:slug/quiz", requireUser("student"), async (req, res) => {
    const { course, enrollment } = await myEnrollmentDoc(req.user, req.params.slug);
    const result = gradeQuiz(course.quiz, req.body?.answers);
    enrollment.quizAttempts.push({ score: result.score, total: result.total, percent: result.percent, at: new Date() });
    enrollment.lastActivity = new Date();
    if (!enrollment.certificate && canCertify(course, enrollment.toObject())) {
      enrollment.certificate = { code: certificateCode(req.user.email, course.slug), issuedAt: new Date() };
    }
    await enrollment.save();
    res.json({ result, ...myCourse(toCourse(course), toEnrollment(enrollment.toObject())) });
  });

  // ---- Teacher space ----
  const teacher = requireUser("teacher");

  async function teacherCourses(user) {
    return Course.find({ teacher: user._id }).populate("teacher", "name title").sort({ start: 1 }).lean();
  }
  async function enrollmentsOf(courseIds) {
    const list = await Enrollment.find({ course: { $in: courseIds } }).populate("user", "name email").lean();
    const by = {};
    for (const e of list) (by[String(e.course)] ||= []).push(toEnrollment(e));
    return by;
  }
  async function ownCourse(user, slug) {
    const doc = await findCourse(slug);
    if (String(doc.teacher._id) !== String(user._id)) throw new HttpError(403, "This is not one of your courses");
    return doc;
  }

  app.get("/api/teacher/overview", teacher, async (req, res) => {
    const docs = await teacherCourses(req.user);
    const by = await enrollmentsOf(docs.map((d) => d._id));
    res.json(teacherOverview(docs.map(toCourse), Object.fromEntries(docs.map((d) => [d.slug, by[String(d._id)] || []]))));
  });

  app.get("/api/teacher/courses/:slug", teacher, async (req, res) => {
    const doc = await ownCourse(req.user, req.params.slug);
    const by = await enrollmentsOf([doc._id]);
    res.json(teacherCourse(toCourse(doc), by[String(doc._id)] || []));
  });

  app.put("/api/teacher/courses/:slug", teacher, async (req, res) => {
    const doc = await ownCourse(req.user, req.params.slug);
    const next = { ...toCourse(doc), ...pick(req.body, EDITABLE) };
    const error = validateCourse(next);
    if (error) throw new HttpError(400, error);
    await Course.updateOne({ _id: doc._id }, pick(next, EDITABLE));
    const saved = await findCourse(doc.slug);
    const by = await enrollmentsOf([doc._id]);
    res.json(teacherCourse(toCourse(saved), by[String(doc._id)] || []));
  });

  app.post("/api/teacher/courses", teacher, async (req, res) => {
    const data = pick(req.body, EDITABLE);
    const error = validateCourse(data);
    if (error) throw new HttpError(400, error);
    let slug = slugify(data.title.en || data.title.fr);
    for (let i = 2; await Course.exists({ slug }); i++) slug = `${slugify(data.title.en || data.title.fr)}-${i}`;
    await Course.create({ ...data, slug, teacher: req.user._id });
    res.status(201).json(teacherCourse(toCourse(await findCourse(slug)), []));
  });

  app.use("/api", (_req, _res, next) => next(new HttpError(404, "Not found")));

  app.use((err, _req, res, _next) => {
    if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON" });
    if (err.code === 11000) return res.status(409).json({ error: "Already exists" });
    if (!err.status) console.error(err);
    res.status(err.status || 500).json({ error: err.status ? err.message : "Server error" });
  });

  return app;
}

function pick(obj = {}, keys) {
  return Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));
}
