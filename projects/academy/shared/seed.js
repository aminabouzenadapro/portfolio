import { COURSES } from "./courses.js";
import { canCertify, certificateCode } from "./logic.js";

// Demo data used by both the API seed script and the in-browser demo.
// Everything is generated from a fixed random seed, so it is the same every time.

export const DEMO_PASSWORD = "demo1234";
export const DEMO_STUDENT = "sara@atelier-yasmina.dz";
export const DEMO_TEACHER = "yasmina@atelier-yasmina.dz";

export const TEACHERS = [
  {
    name: "Yasmina Hamidi", email: DEMO_TEACHER,
    title: { fr: "Couturière et formatrice", ar: "خياطة ومكوّنة", en: "Dressmaker and teacher" },
  },
];

const FIRST = ["Lina", "Meriem", "Imene", "Yasmine", "Asma", "Nour", "Feriel", "Rania", "Khadidja", "Selma", "Chaima", "Manel", "Ines", "Hadjer", "Douaa", "Sabrina", "Amel", "Wissal", "Maroua", "Djihane", "Amina", "Soumia", "Nesrine", "Kenza", "Lamia", "Hiba", "Sarah", "Ikram", "Rym", "Bouchra", "Zineb", "Souad", "Nadia", "Fatima", "Houda", "Malak", "Aya", "Chahra", "Widad", "Kahina"];
const LAST = ["Bouzid", "Hamdi", "Saidi", "Mebarki", "Rahmani", "Benkhaled", "Ziani", "Chabane", "Belkacem", "Aouadi", "Gherbi", "Lounis", "Merabet", "Brahimi", "Djebbar", "Kaci", "Boukhalfa", "Ferhat", "Slimani", "Bensalem"];

const DAY = 24 * 60 * 60 * 1000;

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function enrollment(course, email, { enrolledAt, paid, done, lastActivity, score }) {
  const e = {
    email, course: course.slug,
    enrolledAt: new Date(enrolledAt).toISOString(),
    paid,
    paidAt: paid ? new Date(enrolledAt + DAY).toISOString() : null,
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
  const random = rng(20261024);
  const pick = (xs) => xs[Math.floor(random() * xs.length)];
  const bySlug = Object.fromEntries(COURSES.map((c) => [c.slug, c]));

  const users = [
    ...TEACHERS.map((t) => ({ ...t, role: "teacher" })),
    { name: "Sara Mansouri", email: DEMO_STUDENT, role: "student" },
  ];

  // The demo student: one course in progress, one finished, one waiting for payment
  const enrollments = [
    enrollment(bySlug["bases-couture"], DEMO_STUDENT, { enrolledAt: now - 24 * DAY, paid: true, done: 4, lastActivity: now - 1 * DAY }),
    enrollment(bySlug["gandoura"], DEMO_STUDENT, { enrolledAt: now - 50 * DAY, paid: true, done: 5, lastActivity: now - 9 * DAY, score: 4 }),
    enrollment(bySlug["patronage"], DEMO_STUDENT, { enrolledAt: now - 2 * DAY, paid: false, done: 1, lastActivity: now - 2 * DAY }),
  ];

  // Other students. Sign-ups grow over the last 8 weeks; recent ones may not have paid yet.
  const used = new Set();
  for (let i = 0; i < 40; i++) {
    let name;
    do { name = `${FIRST[i % FIRST.length]} ${pick(LAST)}`; } while (used.has(name));
    used.add(name);
    const email = name.toLowerCase().replace(" ", ".") + "@mail.dz";
    users.push({ name, email, role: "student" });

    const count = random() < 0.3 ? 2 : 1;
    const taken = new Set();
    for (let k = 0; k < count; k++) {
      let course;
      do { course = pick(COURSES); } while (taken.has(course.slug));
      taken.add(course.slug);
      const daysAgo = Math.floor(Math.pow(random(), 0.8) * 55) + 1;
      const enrolledAt = now - daysAgo * DAY - Math.floor(random() * 10) * 3600_000;
      const paid = daysAgo > 12 || random() < 0.55;
      const total = course.lessons.length;
      const done = paid ? Math.min(total, Math.floor(random() * (total + 2))) : random() < 0.6 ? 1 : 0;
      const idle = random() < 0.22 ? 10 + Math.floor(random() * 20) : Math.floor(random() * 6);
      const lastActivity = Math.max(enrolledAt, now - Math.min(idle, daysAgo) * DAY);
      const questions = course.quiz.questions.length;
      const score = paid && done === total && random() < 0.85 ? Math.max(1, Math.round(questions * (0.4 + random() * 0.6))) : undefined;
      enrollments.push(enrollment(course, email, { enrolledAt, paid, done, lastActivity, score }));
    }
  }

  return { users, enrollments };
}
