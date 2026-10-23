/* =====================================================================
   YOUR CONTENT — edit this file to update the portfolio.
   No build step needed: save the file and refresh the page.
   ===================================================================== */

const PROFILE = {
  name: "Amina Bouzenada",
  role: "Full-Stack Developer",
  // Hero headline. Wrap words in *stars* to give them the gradient highlight.
  headline: "Full-stack developer building *web and mobile* products.",
  tagline: "I design and build web and mobile applications end to end with React, Node.js and Flutter, for clients and for a product I co-own with a local company.",
  status: "Open to new opportunities",   // "" hides the green badge
  avatar: "",                            // e.g. "images/me.jpg" ("" shows your initials)
  email: "amina.bouzenada.pro@gmail.com",
  resume: "",                            // e.g. "resume.pdf" ("" hides the Download CV button)
  // One string per paragraph
  about: [
    "I'm a full-stack developer based in Constantine, Algeria. I build complete products: responsive web apps with React, mobile apps with Flutter, and the APIs and databases behind them with Node.js, PHP and Python.",
    "For the past year I've worked as a freelancer, taking client projects from the first idea to deployment. I'm also the co-owner of a product developed with a local company, where I'm involved in both the technical side and the product decisions.",
    "I care about clean, maintainable code and interfaces that feel simple to use. I work comfortably in Arabic, French, English and Turkish.",
  ],
  facts: [
    { label: "Based in", value: "Constantine, Algeria" },
    { label: "Currently", value: "Freelancer & product co-owner" },
    { label: "Focus", value: "Full-stack web & mobile" },
    { label: "Languages", value: "Arabic, French, English, Turkish" },
  ],
  socials: [
    { label: "GitHub", url: "https://github.com/AminaBouzenada" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/amina-bouzenada-24b555446" },
    { label: "Email", url: "mailto:amina.bouzenada.pro@gmail.com" },
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
    github: "https://github.com/AminaBouzenada/portfolio/tree/main/projects/shop",
    demo: "projects/shop/dist/",
    featured: true,
  },
];

/* ---------------------------------------------------------------------
   SKILLS — grouped lists (the first items of each group also appear
   in the "Tech I work with" row at the top)
   --------------------------------------------------------------------- */
const SKILLS = [
  { group: "Front end & mobile", items: ["React", "Flutter", "JavaScript", "HTML & CSS"] },
  { group: "Back end", items: ["Node.js", "PHP", "Python", "REST APIs"] },
  { group: "Databases & tools", items: ["MySQL", "MongoDB", "Git"] },
];

/* ---------------------------------------------------------------------
   EXPERIENCE & EDUCATION — newest first
   --------------------------------------------------------------------- */
const TIMELINE = [
  {
    when: "2025 — Present",
    title: "Freelance Full-Stack Developer",
    where: "Self-employed",
    text: "Designing and building web and mobile applications for clients, from gathering requirements to deployment and maintenance, with React, Flutter, Node.js, PHP and MySQL/MongoDB.",
  },
  {
    when: "Present",
    title: "Co-owner & Developer",
    where: "Product built with a local company",
    text: "Co-owning and developing a product in partnership with a local company: building features, shaping the product and working directly with the business side.",
  },
];
