/* =====================================================================
   YOUR CONTENT — edit this file to update the portfolio.
   No build step needed: save the file and refresh the page.
   ===================================================================== */

const PROFILE = {
  name: "Your Name",
  role: "Software Developer",
  // Hero headline. Wrap words in *stars* to give them the gradient highlight.
  headline: "Software developer building *fast, reliable* products.",
  tagline: "I design and build web applications end to end, from clean interfaces to solid APIs, with a focus on quality and performance.",
  status: "Open to new opportunities",   // "" hides the green badge
  avatar: "",                            // e.g. "images/me.jpg" ("" shows your initials)
  email: "you@example.com",
  // One string per paragraph
  about: [
    "I'm a software developer who enjoys turning ideas into products people actually use. I care about clean code, thoughtful UX and shipping things that work reliably.",
    "Right now I work as a developer, building and maintaining features for real customers. In my free time I build side projects to explore new tools and ideas.",
    "Replace these paragraphs with your own short professional summary: what you do, what you're good at and what you're looking for next.",
  ],
  facts: [
    { label: "Based in", value: "Your City, Country" },
    { label: "Currently", value: "Developer at Company" },
    { label: "Focus", value: "Full-stack web" },
    { label: "Languages", value: "English, French" },
  ],
  socials: [
    { label: "GitHub", url: "https://github.com/yourname" },
    { label: "LinkedIn", url: "https://linkedin.com/in/yourname" },
  ],
};

/* ---------------------------------------------------------------------
   PROJECTS — to add one, copy a block { ... }, paste it, and edit it.
   Fields:
     title        (required) project name
     category     (required) any name — filter tabs are created automatically
     summary      (required) one or two lines shown on the card
     description  longer text shown when the project is clicked
                  (use an array of strings for several paragraphs)
     role         your role, e.g. "Full-stack developer"
     year         e.g. "2025"
     tags         list of technologies
     image        screenshot, e.g. "images/my-project.png" — shown inside a
                  browser frame ("" = an auto-generated app mockup)
     url          address shown in the browser frame, e.g. "myapp.com"
     color        accent color for the card, e.g. "#6366f1"
     github       link to the code ("" to hide)
     demo         link to the live site ("" to hide)
     featured     true = large card at the top of the Work section
   --------------------------------------------------------------------- */
const PROJECTS = [
  {
    title: "Dzair Tech",
    category: "E-commerce",
    summary: "A bilingual tech store for an Algerian small business, with product variants, cash-on-delivery checkout and a full admin dashboard.",
    description: [
      "Dzair Tech is an e-commerce site built with React and Vite for a small Algerian electronics shop: smartphones, laptops, audio, smartwatches, gaming and accessories, priced in dinars. Products have variants (storage, color, configuration) that change the price, plus a full specs table.",
      "Checkout follows how Algerians shop online: delivery to all 58 wilayas (home or stop desk) with prices by zone, Algerian phone number validation and cash on delivery. The whole storefront switches between French and Arabic with a right-to-left layout.",
      "The admin dashboard shows revenue, sales, average basket and trends compared with the previous period, a daily revenue chart, best sellers, top wilayas and stock alerts. Store owners can manage orders (search, filter, change status, export to CSV) and products (add, edit, hide, delete, upload photos). Changes appear in the shop instantly. It's a demo, so data is stored in the browser and no real order is placed.",
    ],
    role: "Front-end developer",
    year: "2026",
    tags: ["React", "Vite", "React Router", "Admin dashboard", "Data visualization", "i18n (FR/AR)", "RTL layout"],
    image: "images/dzair-tech.jpg",
    url: "dzair-tech.dz",
    color: "#1d4ed8",
    github: "",
    demo: "projects/shop/dist/",
    featured: true,
  },
];

/* ---------------------------------------------------------------------
   SKILLS — grouped lists (the first items of each group also appear
   in the "Tech I work with" row at the top)
   --------------------------------------------------------------------- */
const SKILLS = [
  { group: "Front end", items: ["TypeScript", "React", "Next.js", "Vue", "Tailwind CSS"] },
  { group: "Back end", items: ["Node.js", "Python", "PostgreSQL", "REST & GraphQL"] },
  { group: "Tools", items: ["Git", "Docker", "Figma", "CI/CD", "Linux"] },
];

/* ---------------------------------------------------------------------
   EXPERIENCE & EDUCATION — newest first
   --------------------------------------------------------------------- */
const TIMELINE = [
  {
    when: "2024 — Present",
    title: "Software Developer",
    where: "Company Name",
    text: "Building and maintaining web applications used every day by customers. Describe your impact and the technologies you use.",
  },
  {
    when: "2023",
    title: "Freelance Developer",
    where: "Self-employed",
    text: "Designed and built websites and small web apps for local businesses.",
  },
  {
    when: "2021 — 2026",
    title: "Your Degree",
    where: "University Name",
    text: "Final year. Mention your thesis, favorite courses or achievements.",
  },
];
