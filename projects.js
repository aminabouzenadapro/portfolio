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
  {
    title: "Dar El Bahdja",
    category: { en: "Mobile & web app", fr: "Application mobile & web", ar: "تطبيق جوال وويب" },
    summary: {
      en: "A Flutter app for an Algerian restaurant: guests order from their table by scanning a QR code, and the kitchen follows every order live.",
      fr: "Une application Flutter pour un restaurant algérien : les clients commandent depuis leur table en scannant un QR code, et la cuisine suit chaque commande en direct.",
      ar: "تطبيق Flutter لمطعم جزائري: يطلب الزبائن من طاولتهم بمسح رمز QR، ويتابع المطبخ كل طلب مباشرة.",
    },
    description: {
      en: [
        "Dar El Bahdja is a QR-code table ordering app built with Flutter, from one codebase for the web and Android. Each table has its own QR code; guests browse a menu of Algerian dishes (chorba, couscous, rechta, mhadjeb, makrout…) with photos and prices in dinars, add notes like \"no onions\", and send their order straight to the kitchen.",
        "The kitchen screen shows tickets in three columns (new, preparing, ready to serve) with timers that turn red when an order is late. Each step the kitchen takes updates the guest's phone live, and guests can call a waiter or ask for the bill, which appears instantly in the kitchen.",
        "The app works in French, Arabic and English with a full right-to-left layout. State is managed with ChangeNotifier and saved on the device, with tabs kept in sync; the order logic is covered by unit tests. A demo mode shows the guest's phone and the kitchen side by side. It's a demo: data stays in the browser.",
      ],
      fr: [
        "Dar El Bahdja est une application de commande à table par QR code, développée avec Flutter à partir d'un seul code pour le web et Android. Chaque table a son QR code ; les clients parcourent un menu de plats algériens (chorba, couscous, rechta, mhadjeb, makrout…) avec photos et prix en dinars, ajoutent une remarque comme « sans oignons » et envoient leur commande directement en cuisine.",
        "L'écran de la cuisine affiche les tickets en trois colonnes (nouvelles, en préparation, prêtes à servir) avec des minuteurs qui passent au rouge en cas de retard. Chaque étape validée en cuisine met à jour le téléphone du client en direct, et le client peut appeler un serveur ou demander l'addition, ce qui apparaît aussitôt en cuisine.",
        "L'application fonctionne en français, en arabe et en anglais, avec une mise en page de droite à gauche. L'état est géré avec ChangeNotifier et sauvegardé sur l'appareil, avec synchronisation entre onglets ; la logique des commandes est couverte par des tests unitaires. Un mode démo montre le téléphone du client et la cuisine côte à côte. C'est une démo : les données restent dans le navigateur.",
      ],
      ar: [
        "دار البهجة تطبيق للطلب من الطاولة عبر رمز QR، مطوَّر بـ Flutter بشيفرة واحدة للويب وأندرويد. لكل طاولة رمز QR خاص بها؛ يتصفح الزبائن قائمة أطباق جزائرية (شوربة، كسكس، رشتة، محاجب، مقروط…) مع الصور والأسعار بالدينار، ويضيفون ملاحظات مثل «بدون بصل»، ثم يرسلون الطلب مباشرة إلى المطبخ.",
        "تعرض شاشة المطبخ التذاكر في ثلاثة أعمدة (جديدة، قيد التحضير، جاهزة للتقديم) مع مؤقتات تتحول إلى الأحمر عند التأخر. كل خطوة في المطبخ تُحدّث هاتف الزبون مباشرة، ويمكن للزبون نداء النادل أو طلب الفاتورة فيظهر ذلك فورا في المطبخ.",
        "يعمل التطبيق بالفرنسية والعربية والإنجليزية مع تخطيط كامل من اليمين إلى اليسار. تُدار الحالة بـ ChangeNotifier وتُحفظ على الجهاز مع مزامنة بين النوافذ، ومنطق الطلبات مغطى باختبارات وحدات. ويعرض وضع العرض هاتف الزبون والمطبخ جنبا إلى جنب. هذه نسخة تجريبية: تبقى البيانات في المتصفح.",
      ],
    },
    role: { en: "Flutter developer", fr: "Développement Flutter", ar: "تطوير Flutter" },
    year: "2026",
    tags: [
      "Flutter", "Dart", "Material 3",
      { en: "QR codes", fr: "QR codes", ar: "رموز QR" },
      { en: "Live order tracking", fr: "Suivi en direct", ar: "تتبع مباشر" },
      "i18n (FR/AR/EN)",
      { en: "Unit tests", fr: "Tests unitaires", ar: "اختبارات الوحدات" },
    ],
    image: "",
    video: "videos/dar-el-bahdja-demo.mp4",
    poster: "videos/dar-el-bahdja-poster.jpg",
    url: "dar-el-bahdja.dz",
    color: "#0e5e6f",
    github: "",
    demo: "projects/restaurant/app/#/demo",
    links: [
      { label: { en: "Kitchen screen", fr: "Écran cuisine", ar: "شاشة المطبخ" }, url: "projects/restaurant/app/#/kitchen" },
    ],
    featured: true,
  },
  {
    title: "Cirta Academy",
    category: { en: "Full-stack web app", fr: "Application web full-stack", ar: "تطبيق ويب متكامل" },
    summary: {
      en: "A training center platform for Constantine: students follow lessons, pass quizzes and earn verifiable certificates, while teachers track progress and edit their courses.",
      fr: "Une plateforme pour un centre de formation à Constantine : les étudiants suivent leurs leçons, passent des quiz et obtiennent des certificats vérifiables, et les formateurs suivent leur progression et modifient leurs cours.",
      ar: "منصة لمركز تكوين في قسنطينة: يتابع الطلبة دروسهم ويجتازون الاختبارات ويحصلون على شهادات قابلة للتحقق، ويتابع المكوّنون تقدمهم ويعدّلون دوراتهم.",
    },
    description: {
      en: [
        "Cirta Academy is a full-stack platform for a training center in Constantine, with courses in web development, Python, business English, Excel, digital marketing and Baccalaureate maths. Visitors browse the catalog by category and level, see the schedule, price in dinars and seats left, and enroll online.",
        "Students follow each lesson with their progress saved, then take a final quiz graded on the server. Once every lesson is done and the quiz is passed, a certificate is issued with a code that anyone (an employer, for example) can check on a public page. Teachers get a dashboard with weekly sign-ups, average progress and scores, the students who have stopped coming, completion per lesson, and an editor for lessons and quizzes.",
        "The back end is a REST API in Node.js and Express with MongoDB (Mongoose), JWT authentication, bcrypt, role checks and rate limiting, covered by 24 tests that run against a real MongoDB. The React front end works in French, Arabic and English with a right-to-left layout. The hosted demo runs the same API rules inside the browser, so it works without a server: data stays in the browser.",
      ],
      fr: [
        "Cirta Academy est une plateforme full-stack pour un centre de formation à Constantine, avec des cours de développement web, Python, anglais professionnel, Excel, marketing digital et mathématiques du Bac. Les visiteurs parcourent le catalogue par catégorie et niveau, voient l'horaire, le prix en dinars et les places restantes, et s'inscrivent en ligne.",
        "Les étudiants suivent chaque leçon avec leur progression enregistrée, puis passent un quiz final corrigé par le serveur. Quand toutes les leçons sont terminées et le quiz réussi, un certificat est délivré avec un code que n'importe qui (un employeur, par exemple) peut vérifier sur une page publique. Les formateurs ont un tableau de bord avec les inscriptions par semaine, la progression et les scores moyens, les étudiants qui décrochent, l'avancement par leçon et un éditeur de leçons et de quiz.",
        "Le back-end est une API REST en Node.js et Express avec MongoDB (Mongoose), authentification JWT, bcrypt, contrôle des rôles et limitation des tentatives, couverte par 24 tests qui tournent sur une vraie base MongoDB. Le front-end React fonctionne en français, en arabe et en anglais, avec une mise en page de droite à gauche. La démo en ligne exécute les mêmes règles d'API dans le navigateur, elle fonctionne donc sans serveur : les données restent dans le navigateur.",
      ],
      ar: [
        "Cirta Academy منصة متكاملة لمركز تكوين في قسنطينة، تضم دورات في تطوير الويب وبايثون والإنجليزية المهنية وإكسل والتسويق الرقمي ورياضيات البكالوريا. يتصفح الزوار الدورات حسب الفئة والمستوى، ويطّلعون على التوقيت والسعر بالدينار والأماكن المتبقية، ثم يسجلون عبر الإنترنت.",
        "يتابع الطلبة كل درس مع حفظ تقدمهم، ثم يجتازون اختبارا نهائيا يصححه الخادم. وعند إنهاء كل الدروس والنجاح في الاختبار تُسلَّم شهادة برمز يمكن لأي شخص (صاحب عمل مثلا) التحقق منه في صفحة عامة. ويحصل المكوّنون على لوحة متابعة تعرض التسجيلات الأسبوعية ومتوسط التقدم والنتائج والطلبة المنقطعين والتقدم حسب الدرس، مع محرر للدروس والاختبارات.",
        "الواجهة الخلفية واجهة REST مبنية بـ Node.js وExpress مع MongoDB (Mongoose)، ومصادقة JWT وbcrypt والتحقق من الأدوار وتحديد عدد المحاولات، وتغطيها 24 اختبارا تعمل على قاعدة MongoDB حقيقية. وتعمل واجهة React بالفرنسية والعربية والإنجليزية مع تخطيط من اليمين إلى اليسار. وتشغّل النسخة المنشورة قواعد الواجهة نفسها داخل المتصفح، فتعمل دون خادم: تبقى البيانات في المتصفح.",
      ],
    },
    role: { en: "Full-stack developer", fr: "Développement full-stack", ar: "تطوير متكامل" },
    year: "2026",
    tags: [
      "Node.js", "Express", "MongoDB", "React",
      { en: "JWT auth", fr: "Auth JWT", ar: "مصادقة JWT" },
      { en: "REST API", fr: "API REST", ar: "واجهة REST" },
      "i18n (FR/AR/EN)",
      { en: "API tests", fr: "Tests d'API", ar: "اختبارات الواجهة" },
    ],
    image: "",
    video: "videos/cirta-academy-demo.mp4",
    poster: "videos/cirta-academy-poster.jpg",
    url: "cirta-academy.dz",
    color: "#e2583e",
    github: "",
    demo: "projects/academy/app/",
    links: [
      { label: { en: "Teacher space", fr: "Espace formateur", ar: "فضاء المكوّن" }, url: "projects/academy/app/#/teacher" },
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
