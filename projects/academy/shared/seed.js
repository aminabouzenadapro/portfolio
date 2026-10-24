import { COURSES } from "./courses.js";
import { canCertify, certificateCode } from "./logic.js";

// Demo data used by both the API seed script and the in-browser demo.
// Everything is generated from a fixed random seed, so it is the same every time.

export const DEMO_PASSWORD = "demo1234";
export const DEMO_STUDENT = "sara@cirta-academy.dz";
export const DEMO_TEACHER = "yacine@cirta-academy.dz";

export const TEACHERS = [
  { name: "Yacine Benali", email: "yacine@cirta-academy.dz", title: { fr: "Développeur full-stack", ar: "مطور ويب متكامل", en: "Full-stack developer" } },
  { name: "Nadia Khelifi", email: "nadia@cirta-academy.dz", title: { fr: "Formatrice en anglais et marketing", ar: "مكوّنة في الإنجليزية والتسويق", en: "English & marketing trainer" } },
  { name: "Karim Boudiaf", email: "karim@cirta-academy.dz", title: { fr: "Professeur de mathématiques", ar: "أستاذ رياضيات", en: "Mathematics teacher" } },
];

const FIRST = ["Amine", "Lina", "Walid", "Meriem", "Sofiane", "Imene", "Rayan", "Yasmine", "Bilal", "Asma", "Hichem", "Nour", "Islam", "Feriel", "Anis", "Rania", "Mehdi", "Khadidja", "Oussama", "Selma", "Riad", "Chaima", "Fares", "Manel", "Adel", "Ines", "Zakaria", "Hadjer", "Nassim", "Douaa", "Ayoub", "Sabrina", "Younes", "Amel", "Haithem", "Wissal", "Samir", "Maroua", "Akram", "Djihane"];
const LAST = ["Bouzid", "Hamdi", "Saidi", "Mebarki", "Rahmani", "Benkhaled", "Ziani", "Chabane", "Belkacem", "Aouadi", "Gherbi", "Lounis", "Merabet", "Brahimi", "Djebbar", "Kaci", "Hadj", "Boukhalfa", "Ferhat", "Slimani"];

const DAY = 24 * 60 * 60 * 1000;

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function enrollment(course, email, { enrolledAt, done, lastActivity, score }) {
  const e = {
    email, course: course.slug,
    enrolledAt: new Date(enrolledAt).toISOString(),
    completed: course.lessons.slice(0, done).map((l) => l.id),
    quizAttempts: [],
    lastActivity: new Date(lastActivity).toISOString(),
    certificate: null,
  };
  if (score !== undefined) {
    const total = course.quiz.questions.length;
    e.quizAttempts.push({ score, total, percent: Math.round((score / total) * 100), at: e.lastActivity });
  }
  if (canCertify(course, e)) e.certificate = { code: certificateCode(email, course.slug), issuedAt: e.lastActivity };
  return e;
}

export function makeSeed(now = Date.now()) {
  const random = rng(20261023);
  const pick = (xs) => xs[Math.floor(random() * xs.length)];
  const bySlug = Object.fromEntries(COURSES.map((c) => [c.slug, c]));

  const users = [
    ...TEACHERS.map((t) => ({ ...t, role: "teacher" })),
    { name: "Sara Mansouri", email: DEMO_STUDENT, role: "student" },
  ];

  // The demo student: one course in progress, one finished, one left aside
  const enrollments = [
    enrollment(bySlug["web-dev"], DEMO_STUDENT, { enrolledAt: now - 24 * DAY, done: 4, lastActivity: now - 1 * DAY }),
    enrollment(bySlug["business-english"], DEMO_STUDENT, { enrolledAt: now - 52 * DAY, done: 4, lastActivity: now - 9 * DAY, score: 4 }),
    enrollment(bySlug["python"], DEMO_STUDENT, { enrolledAt: now - 30 * DAY, done: 1, lastActivity: now - 13 * DAY }),
  ];

  // Other students. Sign-ups grow over the last 8 weeks.
  const used = new Set();
  for (let i = 0; i < 40; i++) {
    let name;
    do { name = `${FIRST[i % FIRST.length]} ${pick(LAST)}`; } while (used.has(name));
    used.add(name);
    const email = name.toLowerCase().replace(" ", ".") + "@mail.dz";
    users.push({ name, email, role: "student" });

    const courses = random() < 0.35 ? 2 : 1;
    const taken = new Set();
    for (let k = 0; k < courses; k++) {
      let course;
      do { course = pick(COURSES); } while (taken.has(course.slug));
      taken.add(course.slug);
      const daysAgo = Math.floor(Math.pow(random(), 0.8) * 55) + 1;
      const enrolledAt = now - daysAgo * DAY - Math.floor(random() * 10) * 3600_000;
      const total = course.lessons.length;
      const done = Math.min(total, Math.floor(random() * (total + 2)));
      const idle = random() < 0.22 ? 10 + Math.floor(random() * 20) : Math.floor(random() * 6);
      const lastActivity = Math.max(enrolledAt, now - Math.min(idle, daysAgo) * DAY);
      const questions = course.quiz.questions.length;
      const score = done === total && random() < 0.85 ? Math.max(1, Math.round(questions * (0.4 + random() * 0.6))) : undefined;
      enrollments.push(enrollment(course, email, { enrolledAt, done, lastActivity, score }));
    }
  }

  return { users, enrollments };
}
