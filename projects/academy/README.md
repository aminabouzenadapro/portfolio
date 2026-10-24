# Atelier Yasmina: online sewing school (Node.js + MongoDB + React)

A platform for a dressmaker in Constantine who teaches sewing through her own videos. Students watch the first lesson of each course for free, pay at the atelier or by CCP transfer, and the teacher unlocks the rest of the course with one click. French, Arabic (right-to-left) and English.

## What it does
**Students**
- 5 courses (machine basics, pattern making, house gandoura, medjboud gold embroidery, alterations), taught in French or Arabic
- A free first lesson in every course, watchable on the course page before signing up
- Lesson player: the teacher's video, then written notes; progress saved per lesson
- Locked lessons explain how to pay (at the atelier or by CCP transfer); they open as soon as the teacher confirms the payment
- Final quiz graded on the server, then an attestation with a code anyone can verify on a public page

**Teacher**
- Dashboard: money received and still to collect, pending payments with a "mark as paid" button, weekly sign-ups, latest quiz results, students who stopped coming
- Per course: students with their payment status, progress and quiz results; completion per lesson
- Course editor: details in 3 languages, lessons (free preview or not, notes, order), quiz questions, and **video upload per lesson** with progress, preview, replace and delete

## Architecture
```
shared/          rules and data used by both sides
  logic.js       payment gating, grading, progress, attestations, validation, upload limits
  views.js       the JSON shape of every API response
  courses.js     the courses, lessons, notes and quizzes
  media.js       credits of the demo video clips
  seed.js        the teacher, demo students, payments and progress (fixed random seed)
server/          REST API: Node.js, Express 5, MongoDB with Mongoose, multer
  src/app.js     routes, uploads and video streaming
  src/models.js  User, Course, Enrollment
  src/auth.js    JWT auth, roles and signed video links
  test/          API tests (real in-memory MongoDB) and unit tests
client/          React 18 + Vite + React Router
  src/api/       API client; mock.js runs the same API in the browser, blobs.js stores demo uploads in IndexedDB
  public/media/  demo clips (replaced by the teacher's uploads)
app/             production build of the client (demo mode)
```

The server and the in-browser demo API build their responses with `shared/views.js` and the same rules from `shared/logic.js`, so the hosted demo behaves like the real backend.

### How videos are protected
Uploaded videos are stored outside the web root with random names. A `<video>` tag can't send an `Authorization` header, so the API gives each student a **signed link** valid for 6 hours and for one file only (`/api/media/:file?token=…`). Students who haven't paid never receive a link for paid lessons, and the server streams with HTTP range requests so the player can seek.

### API
| Method | Route | Who |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | anyone (rate limited) |
| GET | `/api/courses?q=&category=&level=`, `/api/courses/:slug` | anyone (free lessons include their video) |
| POST | `/api/courses/:slug/enroll` | student (enrollment starts unpaid) |
| GET | `/api/me/enrollments`, `/api/me/courses/:slug` | student (paid lessons locked until payment) |
| POST | `/api/me/courses/:slug/lessons/:lessonId`, `/api/me/courses/:slug/quiz` | student (`402` before payment) |
| GET | `/api/certificates/:code` | anyone |
| GET | `/api/media/:file?token=` | holder of a signed link |
| GET | `/api/teacher/overview`, `/api/teacher/courses/:slug` | teacher |
| POST / PUT | `/api/teacher/courses`, `/api/teacher/courses/:slug` | teacher (own courses only) |
| PATCH | `/api/teacher/courses/:slug/students/:email` `{ paid }` | teacher |
| POST / DELETE | `/api/teacher/courses/:slug/lessons/:lessonId/video` (multipart `video`) | teacher; MP4, WebM or MOV up to 500 MB |

## Run it
```
cd server
npm install
npm run dev          # API on http://localhost:4000/api
```
Without `MONGODB_URI`, the server starts an in-memory MongoDB and fills it with demo data. For a real database, set `MONGODB_URI`, `JWT_SECRET` and optionally `UPLOAD_DIR`, then run `npm run seed` once.

```
cd client
npm install
# PowerShell: $env:VITE_API_URL="http://localhost:4000/api"; npm run dev
VITE_API_URL=http://localhost:4000/api npm run dev
```
Without `VITE_API_URL`, the client runs in demo mode: data stays in the browser and uploaded videos are kept in IndexedDB. That is how the hosted version in `app/` works.

Demo accounts (password `demo1234`): teacher `yasmina@atelier-yasmina.dz`, student `sara@atelier-yasmina.dz`.

## Tests
```
cd server
npm test
```
31 tests: payment gating, grading, attestation rules, validation and seed consistency, plus API tests against a real MongoDB covering auth, the full student journey from free preview to payment to verified attestation, video upload, signed streaming with range requests, rejected file types, and teacher permissions.

## Demo videos
The demo clips come from [Wikimedia Commons](https://commons.wikimedia.org) under CC BY and CC BY-SA licenses, trimmed and compressed. Authors and sources are in `shared/media.js` and shown under each video.
