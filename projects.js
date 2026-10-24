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
    title: "Atelier Yasmina",
    category: { en: "Full-stack web app", fr: "Application web full-stack", ar: "تطبيق ويب متكامل" },
    summary: {
      en: "An online sewing school for a dressmaker in Constantine: she uploads her video lessons, students pay at the atelier or by CCP, and their lessons unlock.",
      fr: "Une école de couture en ligne pour une couturière de Constantine : elle met en ligne ses leçons en vidéo, les élèves paient à l'atelier ou par CCP, et leurs leçons se débloquent.",
      ar: "مدرسة خياطة عبر الإنترنت لخياطة في قسنطينة: ترفع دروسها بالفيديو، وتدفع التلميذات في الورشة أو عبر CCP، فتُفتح دروسهن.",
    },
    description: {
      en: [
        "Atelier Yasmina is a full-stack platform for a dressmaker who teaches through her own videos: machine basics, pattern making, the house gandoura, Constantine's medjboud gold embroidery and alterations. The first lesson of every course is a free preview, playable right on the course page.",
        "Payment fits how things work in Algeria: students enroll online, then pay at the atelier or by CCP transfer. The teacher marks them as paid from her dashboard and every video opens. Until then, locked lessons explain how to pay. Students follow each video with written notes, take a server-graded quiz and receive an attestation that anyone can verify with its code.",
        "The teacher uploads a video for each lesson (multer, with an upload progress bar, preview, replace and delete). Videos are streamed with HTTP range requests through signed links that expire, so only paying students can watch them. The back end is Node.js, Express and MongoDB with JWT auth and 31 tests against a real database; the React front end works in French, Arabic and English. The hosted demo runs the same API rules in the browser and keeps uploaded videos in IndexedDB.",
      ],
      fr: [
        "Atelier Yasmina est une plateforme full-stack pour une couturière qui enseigne avec ses propres vidéos : bases de la machine, patronage, gandoura d'intérieur, broderie medjboud au fil d'or de Constantine et retouches. La première leçon de chaque cours est offerte et se regarde directement sur la page du cours.",
        "Le paiement suit les habitudes algériennes : l'élève s'inscrit en ligne puis paie à l'atelier ou par virement CCP. La formatrice la marque comme payée depuis son tableau de bord et toutes les vidéos s'ouvrent. En attendant, les leçons verrouillées expliquent comment payer. Les élèves suivent chaque vidéo avec sa fiche, passent un quiz corrigé par le serveur et reçoivent une attestation vérifiable par son code.",
        "La formatrice met en ligne une vidéo par leçon (multer, barre de progression, aperçu, remplacement et suppression). Les vidéos sont diffusées par requêtes HTTP Range via des liens signés qui expirent : seules les élèves qui ont payé peuvent les regarder. Le back-end est en Node.js, Express et MongoDB avec authentification JWT et 31 tests sur une vraie base ; le front-end React fonctionne en français, en arabe et en anglais. La démo en ligne exécute les mêmes règles d'API dans le navigateur et garde les vidéos envoyées dans IndexedDB.",
      ],
      ar: [
        "ورشة ياسمينة منصة متكاملة لخياطة تدرّس بفيديوهاتها الخاصة: أساسيات الآلة، والباترون، وقندورة الدار، وطرز المجبود القسنطيني بالخيط الذهبي، والتعديلات. الدرس الأول من كل دورة مجاني ويُشاهد مباشرة في صفحة الدورة.",
        "يتماشى الدفع مع العادات في الجزائر: تسجل التلميذة عبر الإنترنت ثم تدفع في الورشة أو بتحويل CCP. تسجل المكوّنة الدفع من لوحتها فتُفتح كل الفيديوهات، وقبل ذلك تشرح الدروس المغلقة طريقة الدفع. تتابع التلميذات كل فيديو مع بطاقته، ويجتزن اختبارا يصححه الخادم، ويحصلن على شهادة يمكن التحقق منها برمزها.",
        "ترفع المكوّنة فيديو لكل درس (multer مع شريط تقدم ومعاينة واستبدال وحذف). تُبث الفيديوهات بطلبات HTTP Range عبر روابط موقّعة تنتهي صلاحيتها، فلا تشاهدها إلا من دفعت. الواجهة الخلفية مبنية بـ Node.js وExpress وMongoDB مع مصادقة JWT و31 اختبارا على قاعدة بيانات حقيقية، وواجهة React تعمل بالفرنسية والعربية والإنجليزية. وتشغّل النسخة المنشورة قواعد الواجهة نفسها داخل المتصفح وتحفظ الفيديوهات المرفوعة في IndexedDB.",
      ],
    },
    role: { en: "Full-stack developer", fr: "Développement full-stack", ar: "تطوير متكامل" },
    year: "2026",
    tags: [
      "Node.js", "Express", "MongoDB", "React",
      { en: "Video upload & streaming", fr: "Upload et streaming vidéo", ar: "رفع وبث الفيديو" },
      { en: "JWT auth", fr: "Auth JWT", ar: "مصادقة JWT" },
      "i18n (FR/AR/EN)",
      { en: "API tests", fr: "Tests d'API", ar: "اختبارات الواجهة" },
    ],
    image: "",
    video: "videos/atelier-yasmina-demo.mp4",
    poster: "videos/atelier-yasmina-poster.jpg",
    url: "atelier-yasmina.dz",
    color: "#b8475f",
    github: "",
    demo: "projects/academy/app/",
    links: [
      { label: { en: "Teacher space", fr: "Espace formatrice", ar: "فضاء المكوّنة" }, url: "projects/academy/app/#/teacher" },
    ],
    featured: true,
  },
  {
    title: "Twiza",
    category: { en: "Python web app", fr: "Application web Python", ar: "تطبيق ويب بايثون" },
    summary: {
      en: "Events for a volunteer association in Constantine: free registration with QR tickets and a waitlist, check-in at the door by camera, and a dashboard for the team.",
      fr: "Les événements d'une association de bénévoles à Constantine : inscription gratuite avec billet QR et liste d'attente, accueil par caméra à l'entrée et tableau de bord pour l'équipe.",
      ar: "فعاليات جمعية متطوعين في قسنطينة: تسجيل مجاني بتذكرة QR وقائمة انتظار، واستقبال بالكاميرا عند المدخل، ولوحة متابعة للفريق.",
    },
    description: {
      en: [
        "Twiza helps a volunteer association run its events: tree planting, blood drives, kids' coding workshops and heritage walks. Anyone can register in a minute without an account and receive a ticket with a QR code, an add-to-calendar file and a cancel button. When an event is full, people join a waitlist, and a cancellation or a bigger room confirms the first in line automatically.",
        "On the day, volunteers open the check-in screen on their phone and scan tickets with the camera or type the code. Each scan gives a clear answer: welcome, already in (with the time and who checked them in), wrong event, on the waitlist, cancelled or too early. Organizers follow registrations and attendance on a dashboard, search and export the lists as CSV, and create events in French, Arabic and English.",
        "The back end is Python: FastAPI, SQLAlchemy 2.0 and Pydantic, with roles for organizers and volunteers and 17 pytest tests. The front end is plain JavaScript with no framework or build step. The live demo runs the actual FastAPI app inside the visitor's browser with Pyodide (Python on WebAssembly) and keeps its SQLite database in IndexedDB, so there's no JavaScript copy of the back end.",
      ],
      fr: [
        "Twiza aide une association de bénévoles à organiser ses événements : plantations d'arbres, collectes de sang, ateliers de code pour enfants, balades patrimoine. Chacun s'inscrit en une minute, sans compte, et reçoit un billet avec QR code, un fichier pour son agenda et un bouton d'annulation. Quand c'est complet, on rejoint une liste d'attente : une annulation ou une salle plus grande confirme automatiquement la première personne.",
        "Le jour J, les bénévoles ouvrent l'écran d'accueil sur leur téléphone et scannent les billets avec la caméra ou tapent le code. Chaque passage donne une réponse claire : bienvenue, déjà entré (avec l'heure et le bénévole), mauvais événement, liste d'attente, annulé ou trop tôt. Les organisatrices suivent inscriptions et présences sur un tableau de bord, recherchent et exportent les listes en CSV, et créent les événements en français, arabe et anglais.",
        "Le back-end est en Python : FastAPI, SQLAlchemy 2.0 et Pydantic, avec des rôles organisatrice et bénévole et 17 tests pytest. Le front-end est en JavaScript natif, sans framework ni étape de build. La démo en ligne exécute la vraie application FastAPI dans le navigateur du visiteur grâce à Pyodide (Python en WebAssembly) et garde sa base SQLite dans IndexedDB : il n'y a pas de copie du back-end en JavaScript.",
      ],
      ar: [
        "تساعد تويزة جمعية متطوعين على تنظيم فعالياتها: غرس الأشجار والتبرع بالدم وورشات البرمجة للأطفال والجولات التراثية. يسجل أي شخص في دقيقة دون حساب ويحصل على تذكرة برمز QR وملف للرزنامة وزر للإلغاء. وعند اكتمال الأماكن ينضم إلى قائمة انتظار، فيؤكد الإلغاء أو توسيع القاعة أول شخص فيها تلقائيا.",
        "يوم الفعالية يفتح المتطوعون شاشة الاستقبال في هواتفهم ويمسحون التذاكر بالكاميرا أو يكتبون الرمز. ويعطي كل مسح جوابا واضحا: أهلا وسهلا، سبق دخوله (مع الوقت واسم المتطوع)، فعالية أخرى، قائمة الانتظار، ملغاة أو مبكر جدا. وتتابع المنظمات التسجيلات والحضور في لوحة متابعة، ويبحثن في القوائم ويصدرنها بصيغة CSV، وينشئن الفعاليات بالفرنسية والعربية والإنجليزية.",
        "الواجهة الخلفية مكتوبة ببايثون: FastAPI وSQLAlchemy 2.0 وPydantic، مع دوري المنظمة والمتطوع و17 اختبار pytest. والواجهة الأمامية بجافاسكريبت أصلية دون إطار عمل ولا مرحلة بناء. وتشغّل النسخة المنشورة تطبيق FastAPI الحقيقي داخل متصفح الزائر بفضل Pyodide (بايثون على WebAssembly) وتحفظ قاعدة SQLite في IndexedDB، دون أي نسخة من الواجهة الخلفية بجافاسكريبت.",
      ],
    },
    role: { en: "Full-stack developer", fr: "Développement full-stack", ar: "تطوير متكامل" },
    year: "2026",
    tags: [
      "Python", "FastAPI", "SQLAlchemy", "Pydantic",
      { en: "QR tickets & scanner", fr: "Billets et scan QR", ar: "تذاكر ومسح QR" },
      "Pyodide / WebAssembly", "Vanilla JS", "pytest", "i18n (FR/AR/EN)",
    ],
    image: "",
    video: "videos/twiza-demo.mp4",
    poster: "videos/twiza-poster.jpg",
    url: "twiza-dz.org",
    color: "#12715b",
    github: "",
    demo: "projects/events/web/",
    links: [
      { label: { en: "Check-in screen", fr: "Écran d'accueil", ar: "شاشة الاستقبال" }, url: "projects/events/web/#/staff/checkin" },
    ],
    featured: true,
  },
  {
    title: "El Amel",
    category: { en: "PHP & MySQL web app", fr: "Application web PHP & MySQL", ar: "تطبيق ويب PHP وMySQL" },
    summary: {
      en: "Online appointments for a medical center in Constantine: patients book a real free slot and get an SMS, the reception runs the day from an agenda.",
      fr: "Les rendez-vous en ligne d'un centre médical à Constantine : les patients réservent un vrai créneau libre et reçoivent un SMS, l'accueil gère la journée depuis un agenda.",
      ar: "مواعيد عبر الإنترنت لمركز طبي في قسنطينة: يحجز المرضى موعدا متاحا فعلا ويتلقون رسالة قصيرة، ويدير الاستقبال اليوم من أجندة.",
    },
    description: {
      en: [
        "El Amel is the booking system of a medical center with a general practitioner, a dentist and a pediatrician. Patients pick a reason for the visit, see the free slots of the next two weeks and book in two minutes. Slots are computed from each practitioner's hours and grid, the length of the visit, existing appointments, absences and national holidays. Patients get an SMS in their language and can cancel online up to two hours before.",
        "The reception sees the day as a timeline with one column per practitioner. They mark patients as arrived, seen or absent, take bookings by phone and walk-ins, and block time or whole days, with the list of patients to call. They also get patient histories, 30-day statistics (no-show rate, online share, occupancy) and the SMS outbox with tomorrow's reminders. Doctors only see their own agenda.",
        "The back end is PHP 8 without a framework: a small router, PDO, and services for availability, bookings and the desk. It runs on MySQL in production, where a booking locks the practitioner's row (SELECT … FOR UPDATE) so two patients can't take the same slot. The 21 PHPUnit tests pass on both MariaDB and SQLite. The front end is Vue 3 from a CDN with no build step. The live demo runs the actual PHP code in the visitor's browser with php-wasm (PHP compiled to WebAssembly) on SQLite.",
      ],
      fr: [
        "El Amel est le système de rendez-vous d'un centre médical avec une généraliste, un dentiste et une pédiatre. Le patient choisit le motif, voit les créneaux libres des deux semaines à venir et réserve en deux minutes. Les créneaux sont calculés à partir des horaires et de la grille de chaque praticien, de la durée de la visite, des rendez-vous existants, des absences et des jours fériés. Le patient reçoit un SMS dans sa langue et peut annuler en ligne jusqu'à deux heures avant.",
        "L'accueil voit la journée sous forme de planning, une colonne par praticien. Il marque les patients arrivés, vus ou absents, prend les rendez-vous par téléphone et sans rendez-vous, et bloque des créneaux ou des journées, avec la liste des patients à prévenir. Il dispose aussi de l'historique des patients, des statistiques sur 30 jours (taux d'absence, part en ligne, occupation) et de la boîte d'envoi des SMS avec les rappels de la veille. Les médecins ne voient que leur propre agenda.",
        "Le back-end est en PHP 8 sans framework : un petit routeur, PDO, et des services pour les disponibilités, les réservations et l'accueil. Il tourne sur MySQL en production, où une réservation verrouille la ligne du praticien (SELECT … FOR UPDATE) pour que deux patients ne prennent pas le même créneau. Les 21 tests PHPUnit passent sur MariaDB et sur SQLite. Le front-end est en Vue 3 chargé depuis un CDN, sans étape de build. La démo en ligne exécute le vrai code PHP dans le navigateur du visiteur grâce à php-wasm (PHP compilé en WebAssembly) avec SQLite.",
      ],
      ar: [
        "الأمل هو نظام المواعيد لمركز طبي يضم طبيبة عامة وطبيب أسنان وطبيبة أطفال. يختار المريض سبب الزيارة ويرى المواعيد المتاحة خلال الأسبوعين القادمين ويحجز في دقيقتين. تُحسب المواعيد من أوقات عمل كل طبيب وتقسيمه الزمني ومدة الزيارة والمواعيد الموجودة والغيابات والأعياد الوطنية. ويتلقى المريض رسالة بلغته ويمكنه الإلغاء عبر الإنترنت حتى ساعتين قبل الموعد.",
        "يرى الاستقبال اليوم في شكل جدول زمني بعمود لكل طبيب. يسجل حضور المرضى أو فحصهم أو غيابهم، ويأخذ المواعيد بالهاتف والزيارات دون موعد، ويحجب أوقاتا أو أياما كاملة مع قائمة المرضى الواجب الاتصال بهم. ويطلع أيضا على سجل المرضى وإحصائيات 30 يوما (نسبة الغياب والحجز عبر الإنترنت والامتلاء) وصندوق الرسائل مع تذكيرات الغد. ولا يرى الأطباء إلا أجندتهم.",
        "الواجهة الخلفية مكتوبة بـ PHP 8 دون إطار عمل: موجه صغير وPDO وخدمات للمواعيد المتاحة والحجز والاستقبال. وتعمل على MySQL في الإنتاج، حيث يقفل الحجز سطر الطبيب (SELECT … FOR UPDATE) حتى لا يأخذ مريضان الموعد نفسه. وتنجح اختبارات PHPUnit الـ21 على MariaDB وعلى SQLite. والواجهة الأمامية مبنية بـ Vue 3 من شبكة CDN دون مرحلة بناء. وتشغّل النسخة المنشورة شيفرة PHP الحقيقية داخل متصفح الزائر بفضل php-wasm (PHP مترجمة إلى WebAssembly) مع SQLite.",
      ],
    },
    role: { en: "Full-stack developer", fr: "Développement full-stack", ar: "تطوير متكامل" },
    year: "2026",
    tags: [
      "PHP 8", "MySQL", "PDO", "Vue 3", "PHPUnit",
      { en: "Slot scheduling", fr: "Calcul des créneaux", ar: "حساب المواعيد" },
      { en: "SMS reminders", fr: "Rappels SMS", ar: "تذكيرات SMS" },
      "php-wasm / WebAssembly", "i18n (FR/AR/EN)",
    ],
    image: "",
    video: "videos/el-amel-demo.mp4",
    poster: "videos/el-amel-poster.jpg",
    url: "centre-elamel.dz",
    color: "#0f9d8f",
    github: "",
    demo: "projects/clinic/web/",
    links: [
      { label: { en: "Reception agenda", fr: "Agenda de l'accueil", ar: "أجندة الاستقبال" }, url: "projects/clinic/web/#/staff" },
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
