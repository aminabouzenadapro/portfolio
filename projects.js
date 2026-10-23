/* =====================================================================
   YOUR CONTENT — edit this file to update the portfolio.
   No build step needed: save the file and refresh the page.

   Any text can be a plain string (same in every language) or a
   translated object: { en: "...", fr: "...", ar: "..." }.
   Missing languages fall back to English.
   ===================================================================== */

const PROFILE = {
  name: "Amina Bouzenada",
  role: "Full-Stack Developer",
  // Hero headline. Wrap words in *stars* to give them the gradient highlight.
  headline: {
    en: "Full-stack developer building *web and mobile* products.",
    fr: "Je conçois et développe des produits *web et mobiles*.",
    ar: "أصمم وأطور منتجات *ويب وتطبيقات جوال*.",
  },
  tagline: {
    en: "I design and build web and mobile applications end to end with React, Node.js and Flutter, for clients and for a product I co-own with a local company.",
    fr: "Je crée des applications web et mobiles de bout en bout avec React, Node.js et Flutter, pour des clients et pour un produit que je codétiens avec une entreprise locale.",
    ar: "أبني تطبيقات ويب وجوال متكاملة باستخدام React وNode.js وFlutter، لصالح العملاء ولمنتج أشارك في ملكيته مع شركة محلية.",
  },
  // "" hides the green badge
  status: {
    en: "Open to new opportunities",
    fr: "Disponible pour de nouvelles opportunités",
    ar: "أرحب بفرص جديدة",
  },
  avatar: "",                            // e.g. "images/me.jpg" ("" shows your initials)
  email: "amina.bouzenada.pro@gmail.com",
  resume: "",                            // e.g. "resume.pdf" ("" hides the Download CV button)
  // One string per paragraph
  about: {
    en: [
      "I'm a full-stack developer based in Constantine, Algeria. I build complete products: responsive web apps with React, mobile apps with Flutter, and the APIs and databases behind them with Node.js, PHP and Python.",
      "For the past year I've worked as a freelancer, taking client projects from the first idea to deployment. I'm also the co-owner of a product developed with a local company, where I'm involved in both the technical side and the product decisions.",
      "I care about clean, maintainable code and interfaces that feel simple to use. I work comfortably in Arabic, French, English and Turkish.",
    ],
    fr: [
      "Je travaille en full-stack depuis Constantine, en Algérie. Je construis des produits complets : des applications web responsives avec React, des applications mobiles avec Flutter, ainsi que les API et les bases de données qui les font tourner, avec Node.js, PHP et Python.",
      "Depuis un an, je travaille en freelance et je mène des projets clients de la première idée jusqu'à la mise en ligne. Je codétiens aussi un produit développé avec une entreprise locale, où j'interviens à la fois sur la technique et sur les décisions produit.",
      "J'accorde beaucoup d'importance à un code propre et maintenable, et à des interfaces simples à utiliser. Je travaille aisément en arabe, en français, en anglais et en turc.",
    ],
    ar: [
      "أعمل في تطوير الويب والتطبيقات (Full-Stack) من قسنطينة، الجزائر. أبني منتجات متكاملة: تطبيقات ويب متجاوبة بـ React، وتطبيقات جوال بـ Flutter، إضافة إلى واجهات البرمجة وقواعد البيانات التي تشغلها بـ Node.js وPHP وPython.",
      "منذ عام، أعمل بشكل حر وأرافق مشاريع العملاء من الفكرة الأولى حتى الإطلاق. كما أشارك في ملكية منتج يُطوَّر مع شركة محلية، حيث أساهم في الجانب التقني وفي قرارات المنتج.",
      "أهتم بكتابة شيفرة نظيفة وسهلة الصيانة، وبواجهات بسيطة الاستعمال. أعمل بسهولة بالعربية والفرنسية والإنجليزية والتركية.",
    ],
  },
  facts: [
    { label: { en: "Based in", fr: "Ville", ar: "المدينة" }, value: { en: "Constantine, Algeria", fr: "Constantine, Algérie", ar: "قسنطينة، الجزائر" } },
    { label: { en: "Currently", fr: "Actuellement", ar: "حاليا" }, value: { en: "Freelancer & product co-owner", fr: "Freelance & copropriétaire d'un produit", ar: "عمل حر وشراكة في منتج" } },
    { label: { en: "Focus", fr: "Spécialité", ar: "التخصص" }, value: { en: "Full-stack web & mobile", fr: "Web & mobile full-stack", ar: "ويب وجوال (Full-Stack)" } },
    { label: { en: "Languages", fr: "Langues", ar: "اللغات" }, value: { en: "Arabic, French, English, Turkish", fr: "Arabe, français, anglais, turc", ar: "العربية، الفرنسية، الإنجليزية، التركية" } },
  ],
  socials: [
    { label: "GitHub", url: "https://github.com/aminabouzenadapro" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/amina-bouzenada-24b555446" },
    { label: { en: "Email", fr: "E-mail", ar: "البريد الإلكتروني" }, url: "mailto:amina.bouzenada.pro@gmail.com" },
  ],
};

/* ---------------------------------------------------------------------
   PROJECTS — to add one, copy a block { ... }, paste it, and edit it.
   Fields (text fields can be translated objects, see the top of the file):
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
     video        demo video (MP4) shown instead of the screenshot,
                  playing on a loop, e.g. "videos/my-project.mp4"
     poster       image shown while the video loads
     links        extra links: [{ label: "...", url: "..." }]
     featured     true = large card at the top of the Work section
   --------------------------------------------------------------------- */
const PROJECTS = [
  {
    title: "Dzair Tech",
    category: { en: "E-commerce", fr: "E-commerce", ar: "تجارة إلكترونية" },
    summary: {
      en: "A bilingual tech store for an Algerian small business, with product variants, cash-on-delivery checkout and a full admin dashboard.",
      fr: "Une boutique tech bilingue pour une petite entreprise algérienne, avec variantes de produits, paiement à la livraison et un tableau de bord d'administration complet.",
      ar: "متجر تقني ثنائي اللغة لمؤسسة جزائرية صغيرة، مع خيارات متعددة للمنتجات، والدفع عند الاستلام، ولوحة إدارة متكاملة.",
    },
    description: {
      en: [
        "Dzair Tech is an e-commerce site built with React and Vite for a small Algerian electronics shop: smartphones, laptops, audio, smartwatches, gaming and accessories, priced in dinars. Products have variants (storage, color, configuration) that change the price, plus a full specs table.",
        "Checkout follows how Algerians shop online: delivery to all 58 wilayas (home or stop desk) with prices by zone, Algerian phone number validation and cash on delivery. The whole storefront switches between French and Arabic with a right-to-left layout.",
        "The admin dashboard shows revenue, sales, average basket and trends compared with the previous period, a daily revenue chart, best sellers, top wilayas and stock alerts. Store owners can manage orders (search, filter, change status, export to CSV) and products (add, edit, hide, delete, upload photos), and changes appear in the shop instantly. It's a demo: data is stored in the browser and no real order is placed.",
      ],
      fr: [
        "Dzair Tech est un site e-commerce réalisé avec React et Vite pour une petite boutique d'électronique algérienne : smartphones, ordinateurs, audio, montres connectées, gaming et accessoires, avec des prix en dinars. Les produits ont des variantes (stockage, couleur, configuration) qui modifient le prix, et une fiche technique complète.",
        "La commande suit les habitudes d'achat en Algérie : livraison dans les 58 wilayas (à domicile ou en stop desk) avec des tarifs par zone, vérification des numéros de téléphone algériens et paiement à la livraison. Toute la boutique passe du français à l'arabe, avec une mise en page de droite à gauche.",
        "Le tableau de bord affiche le chiffre d'affaires, les ventes, le panier moyen et leur évolution par rapport à la période précédente, un graphique des ventes par jour, les meilleures ventes, les wilayas les plus actives et les alertes de stock. On peut gérer les commandes (recherche, filtres, changement de statut, export CSV) et les produits (ajout, modification, masquage, suppression, import de photos), et les changements apparaissent aussitôt dans la boutique. C'est une démo : les données sont stockées dans le navigateur et aucune vraie commande n'est passée.",
      ],
      ar: [
        "دزاير تك موقع تجارة إلكترونية مبني بـ React وVite لمتجر إلكترونيات جزائري صغير: هواتف ذكية، حواسيب، صوتيات، ساعات ذكية، ألعاب وإكسسوارات، بأسعار بالدينار. للمنتجات خيارات (السعة، اللون، المواصفات) تغيّر السعر، مع جدول مواصفات كامل.",
        "تتبع عملية الطلب طريقة الشراء عبر الإنترنت في الجزائر: التوصيل إلى 58 ولاية (إلى المنزل أو إلى مكتب التوصيل) بأسعار حسب المنطقة، والتحقق من أرقام الهاتف الجزائرية، والدفع عند الاستلام. ويتحول المتجر بالكامل بين الفرنسية والعربية مع تخطيط من اليمين إلى اليسار.",
        "تعرض لوحة الإدارة رقم الأعمال والمبيعات ومتوسط السلة وتطورها مقارنة بالفترة السابقة، ورسما بيانيا للمبيعات اليومية، والمنتجات الأكثر مبيعا، والولايات الأكثر نشاطا، وتنبيهات المخزون. ويمكن إدارة الطلبات (البحث، التصفية، تغيير الحالة، التصدير إلى CSV) والمنتجات (الإضافة، التعديل، الإخفاء، الحذف، رفع الصور)، وتظهر التغييرات فورا في المتجر. هذه نسخة تجريبية: تُحفظ البيانات في المتصفح ولا يتم تسجيل أي طلب حقيقي.",
      ],
    },
    role: { en: "Front-end developer", fr: "Développement front-end", ar: "تطوير الواجهة الأمامية" },
    year: "2026",
    tags: [
      "React", "Vite", "React Router",
      { en: "Admin dashboard", fr: "Tableau de bord admin", ar: "لوحة إدارة" },
      { en: "Data visualization", fr: "Visualisation de données", ar: "عرض البيانات" },
      "i18n (FR/AR)",
      { en: "RTL layout", fr: "Mise en page RTL", ar: "تخطيط من اليمين لليسار" },
    ],
    image: "images/dzair-tech.jpg",
    url: "dzair-tech.dz",
    color: "#1d4ed8",
    github: "",
    demo: "projects/shop/dist/",
    video: "videos/dzair-tech-demo.mp4",      // demo video shown instead of the screenshot
    poster: "videos/dzair-tech-poster.jpg",   // first frame, shown while the video loads
    links: [
      { label: { en: "Admin dashboard", fr: "Tableau de bord", ar: "لوحة الإدارة" }, url: "projects/shop/dist/#/admin" },
    ],
    featured: true,
  },
];

/* ---------------------------------------------------------------------
   SKILLS — grouped lists (the first items of each group also appear
   in the "Tech I work with" row at the top)
   --------------------------------------------------------------------- */
const SKILLS = [
  { group: { en: "Front end & mobile", fr: "Front-end & mobile", ar: "الواجهة الأمامية والجوال" }, items: ["React", "Flutter", "JavaScript", "HTML & CSS"] },
  { group: { en: "Back end", fr: "Back-end", ar: "الواجهة الخلفية" }, items: ["Node.js", "PHP", "Python", "REST APIs"] },
  { group: { en: "Databases & tools", fr: "Bases de données & outils", ar: "قواعد البيانات والأدوات" }, items: ["MySQL", "MongoDB", "Git"] },
];

/* ---------------------------------------------------------------------
   EXPERIENCE & EDUCATION — newest first
   --------------------------------------------------------------------- */
const TIMELINE = [
  {
    when: { en: "2025 — Present", fr: "2025 — Aujourd'hui", ar: "2025 — اليوم" },
    title: { en: "Freelance Full-Stack Developer", fr: "Développement full-stack en freelance", ar: "تطوير Full-Stack بشكل حر" },
    where: { en: "Self-employed", fr: "Freelance", ar: "عمل حر" },
    text: {
      en: "Designing and building web and mobile applications for clients, from gathering requirements to deployment and maintenance, with React, Flutter, Node.js, PHP and MySQL/MongoDB.",
      fr: "Conception et développement d'applications web et mobiles pour des clients, de l'analyse des besoins à la mise en ligne et la maintenance, avec React, Flutter, Node.js, PHP et MySQL/MongoDB.",
      ar: "تصميم وتطوير تطبيقات ويب وجوال لصالح العملاء، من تحليل الاحتياجات إلى الإطلاق والصيانة، باستخدام React وFlutter وNode.js وPHP وMySQL/MongoDB.",
    },
  },
  {
    when: { en: "Present", fr: "Aujourd'hui", ar: "حاليا" },
    title: { en: "Co-owner & Developer", fr: "Copropriété & développement d'un produit", ar: "شراكة في الملكية وتطوير منتج" },
    where: { en: "Product built with a local company", fr: "Produit développé avec une entreprise locale", ar: "منتج يُطوَّر مع شركة محلية" },
    text: {
      en: "Co-owning and developing a product in partnership with a local company: building features, shaping the product and working directly with the business side.",
      fr: "Copropriété et développement d'un produit en partenariat avec une entreprise locale : création des fonctionnalités, orientation du produit et travail direct avec l'équipe métier.",
      ar: "المشاركة في ملكية منتج وتطويره بالشراكة مع شركة محلية: بناء الميزات، وتوجيه المنتج، والعمل مباشرة مع الجانب التجاري.",
    },
  },
];
