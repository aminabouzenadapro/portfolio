import mongoose from "mongoose";

const { Schema, model } = mongoose;
const i18n = { fr: String, ar: String, en: String };

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["student", "teacher"], default: "student" },
  title: i18n,
}, { timestamps: true });

// `video` is a demo clip { src, poster, credit } or an upload { upload, name, size, type }
const LessonSchema = new Schema({ id: String, title: String, minutes: Number, free: Boolean, video: Schema.Types.Mixed, content: String }, { _id: false });
const QuestionSchema = new Schema({ id: String, q: String, options: [String], answer: Number, explain: String }, { _id: false });

const CourseSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  title: i18n,
  summary: i18n,
  category: { type: String, index: true },
  level: String,
  language: { type: String, enum: ["fr", "ar", "en"] },
  teacher: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  priceDA: Number,
  hours: Number,
  format: { type: String, enum: ["onsite", "online", "hybrid"] },
  days: [String],
  time: String,
  start: String,
  seats: Number,
  color: String,
  outcomes: [String],
  lessons: [LessonSchema],
  quiz: { passMark: Number, questions: [QuestionSchema] },
}, { timestamps: true });

const AttemptSchema = new Schema({ score: Number, total: Number, percent: Number, at: Date }, { _id: false });

const EnrollmentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
  enrolledAt: { type: Date, default: Date.now },
  paid: { type: Boolean, default: false },
  paidAt: { type: Date, default: null },
  completed: [String],
  quizAttempts: [AttemptSchema],
  lastActivity: { type: Date, default: Date.now },
  certificate: { type: new Schema({ code: { type: String, index: true }, issuedAt: Date }, { _id: false }), default: null },
});
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export const User = model("User", UserSchema);
export const Course = model("Course", CourseSchema);
export const Enrollment = model("Enrollment", EnrollmentSchema);
