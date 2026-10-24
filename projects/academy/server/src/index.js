import { createApp } from "./app.js";
import { connect } from "./db.js";
import { Course } from "./models.js";
import { seedDatabase } from "./seed.js";

const port = Number(process.env.PORT) || 4000;

await connect();
// A new or in-memory database starts with the demo data
if (!(await Course.exists({}))) console.log("Database empty, seeded:", await seedDatabase());

createApp().listen(port, () => console.log(`Cirta Academy API on http://localhost:${port}/api`));
