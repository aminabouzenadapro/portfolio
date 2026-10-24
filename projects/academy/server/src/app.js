import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { Course, Enrollment, User } from "./models.js";
import { HttpError, publicUser, requireUser, signMediaToken, signToken, verifyMediaToken } from "./auth.js";
import { MAX_VIDEO_MB, VIDEO_TYPES, canCertify, canOpen, certificateCode, gradeQuiz, slugify, validateCourse } from "../../shared/logic.js";
import { certificateView, courseCard, myCourse, myEnrollment, teacherCourse, teacherOverview } from "../../shared/views.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EDITABLE = ["title", "summary", "category", "level", "language", "priceDA", "hours", "format", "days", "time", "start", "seats", "color", "outcomes", "lessons", "quiz"];
const UPLOAD_NAME = /^[a-f0-9]{32}\.(mp4|webm|mov)$/;
const EXT = { "video/mp4": ".mp4", "video/webm": ".webm", "video/quicktime": ".mov" };

// Mongo documents -> the plain shapes used by shared/views.js
function toCourse(doc) {
  const { _id, __v, createdAt, updatedAt, teacher, ...rest } = doc;
  return { ...rest, teacher: { name: teacher.name, title: teacher.title } };
}
function toEnrollment(doc) {
  return {
    user: { name: doc.user.name, email: doc.user.email },
    enrolledAt: doc.enrolledAt,
    paid: doc.paid,
    paidAt: doc.paidAt,
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

export function createApp({ uploadDir = process.env.UPLOAD_DIR || path.resolve("uploads") } = {}) {
  fs.mkdirSync(uploadDir, { recursive: true });
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "500kb" }));

  // Uploaded videos become signed links; demo clips (relative paths) are served with the front end
  const resolver = (req, viewer = "public") => (video) => {
    if (!video?.upload) return video;
    const origin = `${req.protocol}://${req.get("host")}`;
    return { name: video.name, size: video.size, type: video.type, src: `${origin}/api/media/${video.upload}?token=${signMediaToken(video.upload, viewer)}` };
  };

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
    res.json(docs.map((d) => courseCard(toCourse(d), counts[String(d._id)] || 0, resolver(req))));
  });

  app.get("/api/courses/:slug", async (req, res) => {
    const doc = await findCourse(req.params.slug);
    const counts = await studentCounts([doc._id]);
    res.json(courseCard(toCourse(doc), counts[String(doc._id)] || 0, resolver(req)));
  });

  // Enrolling reserves a seat; lessons beyond the free preview open once the teacher marks it paid
  app.post("/api/courses/:slug/enroll", requireUser("student"), async (req, res) => {
    const doc = await findCourse(req.params.slug);
    if (await Enrollment.exists({ user: req.user._id, course: doc._id })) throw new HttpError(409, "You are already enrolled");
    if ((await Enrollment.countDocuments({ course: doc._id })) >= doc.seats) throw new HttpError(409, "This course is full");
    const e = await Enrollment.create({ user: req.user._id, course: doc._id });
    await e.populate("user", "name email");
    res.status(201).json(myCourse(toCourse(doc), toEnrollment(e.toObject()), resolver(req, String(req.user._id))));
  });

  app.get("/api/certificates/:code", async (req, res) => {
    const e = await Enrollment.findOne({ "certificate.code": String(req.params.code).toUpperCase() }).populate("user", "name email").lean();
    if (!e) throw new HttpError(404, "No certificate with this code");
    const doc = await Course.findById(e.course).populate("teacher", "name title").lean();
    res.json(certificateView(toCourse(doc), toEnrollment(e)));
  });

  // Streams an uploaded video (supports Range requests for seeking) to holders of a signed link
  app.get("/api/media/:file", (req, res) => {
    const { file } = req.params;
    if (!UPLOAD_NAME.test(file)) throw new HttpError(404, "Not found");
    if (!verifyMediaToken(req.query.token, file)) throw new HttpError(401, "This video link has expired, reload the page");
    res.sendFile(path.join(uploadDir, file), { maxAge: "6h" });
  });

  // ---- Student space ----
  app.get("/api/me/enrollments", requireUser("student"), async (req, res) => {
    const list = await Enrollment.find({ user: req.user._id }).populate("user", "name email").populate({ path: "course", populate: { path: "teacher", select: "name title" } }).sort({ lastActivity: -1 }).lean();
    res.json(list.map((e) => myEnrollment(toCourse(e.course), toEnrollment(e), resolver(req))));
  });

  app.get("/api/me/courses/:slug", requireUser("student"), async (req, res) => {
    const { course, enrollment } = await myEnrollmentDoc(req.user, req.params.slug);
    res.json(myCourse(toCourse(course), toEnrollment(enrollment.toObject()), resolver(req, String(req.user._id))));
  });

  app.post("/api/me/courses/:slug/lessons/:lessonId", requireUser("student"), async (req, res) => {
    const { course, enrollment } = await myEnrollmentDoc(req.user, req.params.slug);
    const lesson = course.lessons.find((l) => l.id === req.params.lessonId);
    if (!lesson) throw new HttpError(404, "Lesson not found");
    if (!canOpen(lesson, enrollment)) throw new HttpError(402, "This lesson opens once your payment is confirmed");
    const done = req.body?.done !== false;
    enrollment.completed = done ? [...new Set([...enrollment.completed, lesson.id])] : enrollment.completed.filter((id) => id !== lesson.id);
    enrollment.lastActivity = new Date();
    await enrollment.save();
    res.json(myCourse(toCourse(course), toEnrollment(enrollment.toObject()), resolver(req, String(req.user._id))));
  });

  app.post("/api/me/courses/:slug/quiz", requireUser("student"), async (req, res) => {
    const { course, enrollment } = await myEnrollmentDoc(req.user, req.params.slug);
    if (!enrollment.paid) throw new HttpError(402, "The quiz opens once your payment is confirmed");
    const result = gradeQuiz(course.quiz, req.body?.answers);
    enrollment.quizAttempts.push({ score: result.score, total: result.total, percent: result.percent, at: new Date() });
    enrollment.lastActivity = new Date();
    if (!enrollment.certificate && canCertify(course, enrollment.toObject())) {
      enrollment.certificate = { code: certificateCode(req.user.email, course.slug), issuedAt: new Date() };
    }
    await enrollment.save();
    res.json({ result, ...myCourse(toCourse(course), toEnrollment(enrollment.toObject()), resolver(req, String(req.user._id))) });
  });

  // ---- Teacher space ----
  const teacher = requireUser("teacher");

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
  async function sendTeacherCourse(req, res, slug, status = 200) {
    const doc = await findCourse(slug);
    const by = await enrollmentsOf([doc._id]);
    res.status(status).json(teacherCourse(toCourse(doc), by[String(doc._id)] || [], Date.now(), resolver(req, String(req.user._id))));
  }

  app.get("/api/teacher/overview", teacher, async (req, res) => {
    const docs = await Course.find({ teacher: req.user._id }).populate("teacher", "name title").sort({ start: 1 }).lean();
    const by = await enrollmentsOf(docs.map((d) => d._id));
    res.json(teacherOverview(docs.map(toCourse), Object.fromEntries(docs.map((d) => [d.slug, by[String(d._id)] || []]))));
  });

  app.get("/api/teacher/courses/:slug", teacher, async (req, res) => {
    await ownCourse(req.user, req.params.slug);
    await sendTeacherCourse(req, res, req.params.slug);
  });

  // Lesson videos only change through the upload routes, so the editor can't overwrite them
  const keepVideos = (lessons, existing = []) => lessons?.map((l) => ({ ...l, free: Boolean(l.free), video: existing.find((x) => x.id === l.id)?.video ?? null }));

  app.put("/api/teacher/courses/:slug", teacher, async (req, res) => {
    const doc = await ownCourse(req.user, req.params.slug);
    const changes = pick(req.body, EDITABLE);
    if (changes.lessons) changes.lessons = keepVideos(changes.lessons, doc.lessons);
    const next = { ...toCourse(doc), ...changes };
    const error = validateCourse(next);
    if (error) throw new HttpError(400, error);
    await Course.updateOne({ _id: doc._id }, pick(next, EDITABLE));
    await sendTeacherCourse(req, res, doc.slug);
  });

  app.post("/api/teacher/courses", teacher, async (req, res) => {
    const data = pick(req.body, EDITABLE);
    data.lessons = keepVideos(data.lessons);
    const error = validateCourse(data);
    if (error) throw new HttpError(400, error);
    const base = slugify(data.title.en || data.title.fr);
    let slug = base;
    for (let i = 2; await Course.exists({ slug }); i++) slug = `${base}-${i}`;
    await Course.create({ ...data, slug, teacher: req.user._id });
    await sendTeacherCourse(req, res, slug, 201);
  });

  // Marks a student's payment (at the atelier or by CCP transfer) as received, or undoes it
  app.patch("/api/teacher/courses/:slug/students/:email", teacher, async (req, res) => {
    const doc = await ownCourse(req.user, req.params.slug);
    const student = await User.findOne({ email: String(req.params.email).toLowerCase() });
    const e = student && await Enrollment.findOne({ user: student._id, course: doc._id });
    if (!e) throw new HttpError(404, "This student is not enrolled in this course");
    if (typeof req.body?.paid !== "boolean") throw new HttpError(400, "Say whether the student has paid");
    e.paid = req.body.paid;
    e.paidAt = e.paid ? new Date() : null;
    await e.save();
    await sendTeacherCourse(req, res, doc.slug);
  });

  // ---- Lesson videos ----
  const upload = multer({
    storage: multer.diskStorage({
      destination: uploadDir,
      filename: (_req, file, cb) => cb(null, crypto.randomBytes(16).toString("hex") + EXT[file.mimetype]),
    }),
    limits: { fileSize: MAX_VIDEO_MB * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) => (VIDEO_TYPES.includes(file.mimetype) ? cb(null, true) : cb(new HttpError(400, "Please choose an MP4, WebM or MOV video"))),
  });
  const removeUpload = (video) => { if (video?.upload && UPLOAD_NAME.test(video.upload)) fs.rm(path.join(uploadDir, video.upload), { force: true }, () => {}); };

  async function setLessonVideo(req, video) {
    const doc = await ownCourse(req.user, req.params.slug);
    const lesson = doc.lessons.find((l) => l.id === req.params.lessonId);
    if (!lesson) throw new HttpError(404, "Lesson not found");
    removeUpload(lesson.video);
    await Course.updateOne({ _id: doc._id, "lessons.id": lesson.id }, { $set: { "lessons.$.video": video } });
    return doc;
  }

  app.post("/api/teacher/courses/:slug/lessons/:lessonId/video", teacher, upload.single("video"), async (req, res) => {
    if (!req.file) throw new HttpError(400, "Please choose an MP4, WebM or MOV video");
    try {
      const doc = await setLessonVideo(req, { upload: req.file.filename, name: req.file.originalname, size: req.file.size, type: req.file.mimetype });
      await sendTeacherCourse(req, res, doc.slug);
    } catch (err) {
      removeUpload({ upload: req.file.filename });
      throw err;
    }
  });

  app.delete("/api/teacher/courses/:slug/lessons/:lessonId/video", teacher, async (req, res) => {
    const doc = await setLessonVideo(req, null);
    await sendTeacherCourse(req, res, doc.slug);
  });

  app.use("/api", (_req, _res, next) => next(new HttpError(404, "Not found")));

  app.use((err, _req, res, _next) => {
    if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON" });
    if (err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: `The video is too large (${MAX_VIDEO_MB} MB maximum)` });
    if (err.code === 11000) return res.status(409).json({ error: "Already exists" });
    if (err.code === "ENOENT") return res.status(404).json({ error: "Not found" });
    if (!err.status) console.error(err);
    res.status(err.status || 500).json({ error: err.status ? err.message : "Server error" });
  });

  return app;
}

function pick(obj = {}, keys) {
  return Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));
}
