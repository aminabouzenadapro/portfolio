import { bestScore, courseStats, progress, publicCourse, studentCourse, studentStatus, weeklyEnrollments } from "./logic.js";

// Response shapes of the API. The Node.js server and the in-browser demo both
// load their data, then build every response with these functions.
// `course.teacher` is { name, title }; `enrollment.user` is { name, email }.
// `resolve` turns a stored lesson video into a playable one (see logic.js).

export function courseCard(course, students, resolve) {
  return { ...publicCourse(course, resolve), students, seatsLeft: Math.max(0, course.seats - students) };
}

export function enrollmentState(course, e) {
  return {
    enrolledAt: e.enrolledAt,
    lastActivity: e.lastActivity,
    paid: Boolean(e.paid),
    paidAt: e.paidAt || null,
    completed: e.completed,
    quizAttempts: e.quizAttempts,
    certificate: e.certificate || null,
    progress: progress(course, e),
    bestScore: bestScore(e),
    nextLesson: course.lessons.find((l) => !e.completed.includes(l.id))?.id ?? null,
  };
}

export function myEnrollment(course, e, resolve) {
  return { course: publicCourse(course, resolve), ...enrollmentState(course, e) };
}

export function myCourse(course, e, resolve) {
  return { course: studentCourse(course, e, resolve), enrollment: enrollmentState(course, e) };
}

export function certificateView(course, e) {
  return {
    code: e.certificate.code,
    issuedAt: e.certificate.issuedAt,
    student: e.user.name,
    course: { slug: course.slug, title: course.title, hours: course.hours, color: course.color },
    teacher: course.teacher.name,
    score: bestScore(e),
  };
}

export function studentRow(course, e, now) {
  return {
    name: e.user.name,
    email: e.user.email,
    enrolledAt: e.enrolledAt,
    lastActivity: e.lastActivity,
    paid: Boolean(e.paid),
    paidAt: e.paidAt || null,
    progress: progress(course, e).percent,
    bestScore: bestScore(e),
    attempts: e.quizAttempts.length,
    status: studentStatus(course, e, now),
    certificate: e.certificate?.code ?? null,
  };
}

// Teacher dashboard: `enrollmentsBySlug` maps each of the teacher's courses to its enrollments
export function teacherOverview(courses, enrollmentsBySlug, now = Date.now()) {
  const pairs = courses.flatMap((c) => (enrollmentsBySlug[c.slug] || []).map((e) => ({ course: c, e })));
  const rows = courses.map((c) => ({ slug: c.slug, title: c.title, color: c.color, language: c.language, priceDA: c.priceDA, stats: courseStats(c, enrollmentsBySlug[c.slug] || [], now) }));
  const sum = (key) => rows.reduce((s, r) => s + r.stats[key], 0);
  const weighted = (key) => {
    const withData = rows.filter((r) => r.stats[key] !== null && r.stats.paid);
    const n = withData.reduce((s, r) => s + r.stats.paid, 0);
    return n ? Math.round(withData.reduce((s, r) => s + r.stats[key] * r.stats.paid, 0) / n) : null;
  };
  const row = ({ course, e }) => ({ ...studentRow(course, e, now), course: { slug: course.slug, title: course.title, priceDA: course.priceDA } });
  return {
    totals: {
      students: new Set(pairs.map(({ e }) => e.user.email)).size,
      enrollments: pairs.length,
      revenue: sum("revenue"),
      pending: sum("pending"),
      pendingAmount: pairs.filter(({ e }) => !e.paid).reduce((s, { course }) => s + course.priceDA, 0),
      avgProgress: weighted("avgProgress") ?? 0,
      avgScore: weighted("avgScore"),
      certificates: pairs.filter(({ e }) => e.certificate).length,
      atRisk: sum("atRisk"),
    },
    weekly: weeklyEnrollments(pairs.map(({ e }) => e), 8, now),
    courses: rows,
    pendingPayments: pairs.filter(({ e }) => !e.paid).sort((a, b) => new Date(b.e.enrolledAt) - new Date(a.e.enrolledAt)).map(row),
    atRisk: pairs.filter(({ course, e }) => studentStatus(course, e, now) === "at-risk").sort((a, b) => new Date(a.e.lastActivity) - new Date(b.e.lastActivity)).map(row),
    recentQuizzes: pairs
      .flatMap(({ course, e }) => e.quizAttempts.map((a) => ({ ...a, name: e.user.name, course: { slug: course.slug, title: course.title } })))
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 6),
  };
}

// The teacher sees her course in full (videos resolved for preview), its stats and students
export function teacherCourse(course, enrollments, now = Date.now(), resolve = (v) => v) {
  return {
    course: { ...course, lessons: course.lessons.map((l) => ({ ...l, free: Boolean(l.free), video: l.video ? resolve(l.video) : null })) },
    stats: courseStats(course, enrollments, now),
    students: enrollments.map((e) => studentRow(course, e, now)).sort((a, b) => Number(a.paid) - Number(b.paid) || b.progress - a.progress || a.name.localeCompare(b.name)),
    lessonCompletion: course.lessons.map((l) => ({ id: l.id, title: l.title, done: enrollments.filter((e) => e.completed.includes(l.id)).length })),
  };
}
