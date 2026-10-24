import { bestScore, courseStats, progress, publicCourse, studentCourse, studentStatus, weeklyEnrollments } from "./logic.js";

// Response shapes of the API. The Node.js server and the in-browser demo both
// load their data, then build every response with these functions.
// `course.teacher` is { name, title }; `enrollment.user` is { name, email }.

export function courseCard(course, students) {
  return { ...publicCourse(course), students, seatsLeft: Math.max(0, course.seats - students) };
}

export function enrollmentState(course, e) {
  return {
    enrolledAt: e.enrolledAt,
    lastActivity: e.lastActivity,
    completed: e.completed,
    quizAttempts: e.quizAttempts,
    certificate: e.certificate || null,
    progress: progress(course, e),
    bestScore: bestScore(e),
    nextLesson: course.lessons.find((l) => !e.completed.includes(l.id))?.id ?? null,
  };
}

export function myEnrollment(course, e) {
  return { course: publicCourse(course), ...enrollmentState(course, e) };
}

export function myCourse(course, e) {
  return { course: studentCourse(course), enrollment: enrollmentState(course, e) };
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
    progress: progress(course, e).percent,
    bestScore: bestScore(e),
    attempts: e.quizAttempts.length,
    status: studentStatus(course, e, now),
    certificate: e.certificate?.code ?? null,
  };
}

// Teacher dashboard: `enrollmentsBySlug` maps each of the teacher's courses to its enrollments
export function teacherOverview(courses, enrollmentsBySlug, now = Date.now()) {
  const all = courses.flatMap((c) => enrollmentsBySlug[c.slug] || []);
  const rows = courses.map((c) => ({ slug: c.slug, title: c.title, color: c.color, language: c.language, stats: courseStats(c, enrollmentsBySlug[c.slug] || [], now) }));
  const weighted = (key) => {
    const withData = rows.filter((r) => r.stats[key] !== null && r.stats.students);
    const n = withData.reduce((s, r) => s + r.stats.students, 0);
    return n ? Math.round(withData.reduce((s, r) => s + r.stats[key] * r.stats.students, 0) / n) : null;
  };
  const atRisk = courses
    .flatMap((c) => (enrollmentsBySlug[c.slug] || []).map((e) => ({ course: c, e })))
    .filter(({ course, e }) => studentStatus(course, e, now) === "at-risk")
    .sort((a, b) => new Date(a.e.lastActivity) - new Date(b.e.lastActivity))
    .map(({ course, e }) => ({ ...studentRow(course, e, now), course: { slug: course.slug, title: course.title } }));
  const attempts = courses
    .flatMap((c) => (enrollmentsBySlug[c.slug] || []).flatMap((e) => e.quizAttempts.map((a) => ({ ...a, name: e.user.name, course: { slug: c.slug, title: c.title } }))))
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 6);
  return {
    totals: {
      students: new Set(all.map((e) => e.user.email)).size,
      enrollments: all.length,
      avgProgress: weighted("avgProgress") ?? 0,
      avgScore: weighted("avgScore"),
      certificates: all.filter((e) => e.certificate).length,
      atRisk: atRisk.length,
    },
    weekly: weeklyEnrollments(all, 8, now),
    courses: rows,
    atRisk,
    recentQuizzes: attempts,
  };
}

export function teacherCourse(course, enrollments, now = Date.now()) {
  return {
    course,
    stats: courseStats(course, enrollments, now),
    students: enrollments.map((e) => studentRow(course, e, now)).sort((a, b) => b.progress - a.progress || a.name.localeCompare(b.name)),
    lessonCompletion: course.lessons.map((l) => ({ id: l.id, title: l.title, done: enrollments.filter((e) => e.completed.includes(l.id)).length })),
  };
}
