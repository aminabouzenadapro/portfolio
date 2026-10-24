import bcrypt from "bcryptjs";
import { pathToFileURL } from "node:url";
import { Course, Enrollment, User } from "./models.js";
import { COURSES } from "../../shared/courses.js";
import { DEMO_PASSWORD, makeSeed } from "../../shared/seed.js";

// Replaces all data with the demo courses, teachers and students
export async function seedDatabase(now = Date.now()) {
  await Promise.all([User.deleteMany({}), Course.deleteMany({}), Enrollment.deleteMany({})]);
  const { users, enrollments } = makeSeed(now);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const savedUsers = await User.insertMany(users.map((u) => ({ ...u, passwordHash })));
  const userId = Object.fromEntries(savedUsers.map((u) => [u.email, u._id]));

  const savedCourses = await Course.insertMany(COURSES.map((c) => ({ ...c, teacher: userId[c.teacher] })));
  const courseId = Object.fromEntries(savedCourses.map((c) => [c.slug, c._id]));

  await Enrollment.insertMany(enrollments.map(({ email, course, ...e }) => ({ ...e, user: userId[email], course: courseId[course] })));
  return { users: savedUsers.length, courses: savedCourses.length, enrollments: enrollments.length };
}

// `npm run seed`
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { connect, disconnect } = await import("./db.js");
  await connect();
  console.log("Seeded", await seedDatabase());
  await disconnect();
}
