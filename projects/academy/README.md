# Cirta Academy: training center platform (Node.js + MongoDB + React)

A web platform for a training center in Constantine. Visitors browse courses and enroll; students follow lessons, take quizzes and earn a certificate with a verification code; teachers follow their students and edit their courses. French, Arabic (right-to-left) and English.

## What it does
**Students**
- Course catalog with search and filters (category, level), seats left, schedule and price in dinars
- Enrollment, then a lesson player with progress saved per lesson
- Final quiz graded on the server (answers never reach the browser before grading), with explanations and retries
- Certificate issued automatically when all lessons are done and the quiz is passed; printable, with a public verification page
- Dashboard with progress rings, "continue where you left off" and a reminder for courses left aside

**Teachers**
- Dashboard: students, average progress and score, certificates, weekly sign-ups chart, latest quiz results
- Students who haven't been active for 10 days, with a reminder email link
- Per course: student table (progress, best quiz, status), completion per lesson to see where students drop off
- Course editor: details in 3 languages, lessons (add, reorder, edit content), quiz questions and pass mark, with validation

## Architecture
```
shared/          rules and data used by both sides
  logic.js       grading, progress, certificates, "at risk" status, course validation
  views.js       the JSON shape of every API response
  courses.js     the 6 demo courses, lessons and quizzes
  seed.js        teachers, demo students and their progress (fixed random seed)
server/          REST API: Node.js, Express 5, MongoDB with Mongoose
  src/app.js     routes
  src/models.js  User, Course, Enrollment
  src/auth.js    JWT auth and roles
  test/          API tests (real in-memory MongoDB) and unit tests
client/          React 18 + Vite + React Router
  src/api/       API client, and mock.js: the same API running in the browser
app/             production build of the client (demo mode)
```

The server and the in-browser demo API both build their responses with `shared/views.js` and the same rules from `shared/logic.js`, so the hosted demo behaves exactly like the real backend.

### API
| Method | Route | Who |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | anyone (rate limited) |
| GET | `/api/auth/me` | signed in |
| GET | `/api/courses?q=&category=&level=`, `/api/courses/:slug` | anyone |
| POST | `/api/courses/:slug/enroll` | student |
| GET | `/api/me/enrollments`, `/api/me/courses/:slug` | student |
| POST | `/api/me/courses/:slug/lessons/:lessonId` `{ done }` | student |
| POST | `/api/me/courses/:slug/quiz` `{ answers }` | student |
| GET | `/api/certificates/:code` | anyone |
| GET | `/api/teacher/overview`, `/api/teacher/courses/:slug` | teacher |
| POST / PUT | `/api/teacher/courses`, `/api/teacher/courses/:slug` | teacher (own courses only) |

Passwords are hashed with bcrypt, sessions use JWT, quiz answers are stripped from every student response, and teachers can only see and edit their own courses.

## Run it
```
cd server
npm install
npm run dev          # API on http://localhost:4000/api
```
Without `MONGODB_URI`, the server starts an in-memory MongoDB and fills it with demo data. To use a real database, set `MONGODB_URI` (and `JWT_SECRET`) and run `npm run seed` once.

```
cd client
npm install
# PowerShell: $env:VITE_API_URL="http://localhost:4000/api"; npm run dev
VITE_API_URL=http://localhost:4000/api npm run dev
```
Without `VITE_API_URL`, the client runs in demo mode on its built-in API, with data saved in the browser. That is how the hosted version in `app/` works.

Demo accounts (password `demo1234`): student `sara@cirta-academy.dz`, teacher `yacine@cirta-academy.dz`.

## Tests
```
cd server
npm test
```
24 tests: grading, progress, certificate rules, validation and seed consistency, plus API tests against a real MongoDB covering auth, enrollment, the full student journey up to certificate verification, and teacher permissions.

## Build
```
cd client
npm run build        # writes ../app
```
