/* =====================================================================
   INTERFACE TEXTS — English, French and Arabic.
   Your own content (profile, projects, experience) is in projects.js,
   where any text can be a plain string or { en: "...", fr: "...", ar: "..." }.
   ===================================================================== */

const LANGUAGES = [
  { code: "en", label: "EN", name: "English" },
  { code: "fr", label: "FR", name: "Français" },
  { code: "ar", label: "ع", name: "العربية" },
];

const UI = {
  en: {
    skip: "Skip to content",
    nav_work: "Work", nav_about: "About", nav_experience: "Experience", nav_contact: "Contact",
    cta_touch: "Get in touch",
    theme: "Toggle dark mode", menu: "Open menu", language: "Language",
    view_projects: "View projects", download_cv: "Download CV",
    stack_label: "Tech I work with",
    work_eyebrow: "Selected work", work_title: "Featured projects",
    work_sub: "A few things I've designed and built recently.",
    more_projects: "More projects", filter_all: "All", empty: "No projects in this category yet.",
    about_eyebrow: "About", about_title: "A bit about me", skills_title: "Skills & tools",
    exp_eyebrow: "Experience", exp_title: "Where I've worked",
    contact_eyebrow: "Contact", contact_title: "Let's build something together.",
    contact_text: "I'm open to new roles, freelance work and interesting collaborations. I usually reply within a day or two.",
    send_email: "Send an email", copied: "Email address copied",
    back_top: "Back to top ↑",
    live_site: "Live site", source: "Source", details: "Details →",
    visit_live: "Visit live site", view_source: "View source",
    role: "Role", year: "Year", type: "Type", close: "Close",
    view_details: "View details for {name}", screenshot: "{name} screenshot",
    live_demo: "Live demo", demo_title: "{name}, live demo",
  },
  fr: {
    skip: "Aller au contenu",
    nav_work: "Projets", nav_about: "À propos", nav_experience: "Parcours", nav_contact: "Contact",
    cta_touch: "Me contacter",
    theme: "Activer ou désactiver le mode sombre", menu: "Ouvrir le menu", language: "Langue",
    view_projects: "Voir mes projets", download_cv: "Télécharger mon CV",
    stack_label: "Technologies que j'utilise",
    work_eyebrow: "Réalisations", work_title: "Projets phares",
    work_sub: "Quelques projets que j'ai conçus et développés récemment.",
    more_projects: "Autres projets", filter_all: "Tous", empty: "Aucun projet dans cette catégorie pour l'instant.",
    about_eyebrow: "À propos", about_title: "Quelques mots sur moi", skills_title: "Compétences & outils",
    exp_eyebrow: "Parcours", exp_title: "Mon expérience",
    contact_eyebrow: "Contact", contact_title: "Construisons quelque chose ensemble.",
    contact_text: "Disponible pour de nouveaux postes, des missions freelance et des collaborations intéressantes. Je réponds généralement sous un ou deux jours.",
    send_email: "Envoyer un e-mail", copied: "Adresse e-mail copiée",
    back_top: "Retour en haut ↑",
    live_site: "Voir le site", source: "Code source", details: "Détails →",
    visit_live: "Voir le site en ligne", view_source: "Voir le code",
    role: "Rôle", year: "Année", type: "Type", close: "Fermer",
    view_details: "Voir les détails de {name}", screenshot: "Capture d'écran de {name}",
    live_demo: "Démo en direct", demo_title: "{name}, démo en direct",
  },
  ar: {
    skip: "انتقل إلى المحتوى",
    nav_work: "المشاريع", nav_about: "نبذة", nav_experience: "الخبرة", nav_contact: "تواصل",
    cta_touch: "تواصل معي",
    theme: "تبديل الوضع الداكن", menu: "فتح القائمة", language: "اللغة",
    view_projects: "شاهد مشاريعي", download_cv: "تحميل السيرة الذاتية",
    stack_label: "التقنيات التي أستخدمها",
    work_eyebrow: "أعمال مختارة", work_title: "مشاريع مميزة",
    work_sub: "بعض المشاريع التي صممتها وطورتها مؤخرا.",
    more_projects: "مشاريع أخرى", filter_all: "الكل", empty: "لا توجد مشاريع في هذه الفئة حاليا.",
    about_eyebrow: "نبذة", about_title: "نبذة عني", skills_title: "المهارات والأدوات",
    exp_eyebrow: "الخبرة", exp_title: "مساري المهني",
    contact_eyebrow: "تواصل", contact_title: "لنبنِ شيئا معا.",
    contact_text: "أرحب بفرص العمل الجديدة والمشاريع الحرة والتعاونات المثيرة للاهتمام. أرد عادة خلال يوم أو يومين.",
    send_email: "أرسل بريدا إلكترونيا", copied: "تم نسخ البريد الإلكتروني",
    back_top: "العودة إلى الأعلى ↑",
    live_site: "الموقع المباشر", source: "الشيفرة المصدرية", details: "التفاصيل ←",
    visit_live: "زيارة الموقع", view_source: "عرض الشيفرة",
    role: "الدور", year: "السنة", type: "النوع", close: "إغلاق",
    view_details: "عرض تفاصيل {name}", screenshot: "لقطة شاشة لـ {name}",
    live_demo: "عرض مباشر", demo_title: "{name}، عرض مباشر",
  },
};

// Current language: ?lang= in the URL, then the saved choice, then the browser language
function detectLanguage() {
  const codes = LANGUAGES.map((l) => l.code);
  const fromUrl = new URLSearchParams(location.search).get("lang");
  if (codes.includes(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem("portfolio-lang");
    if (codes.includes(saved)) return saved;
  } catch (e) {}
  const nav = (navigator.language || "en").slice(0, 2);
  return codes.includes(nav) ? nav : "en";
}

let LANG = detectLanguage();

// Interface text by key, with {name} placeholders
const t = (key, vars = {}) => (UI[LANG][key] ?? UI.en[key] ?? key).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? "");

// Content text: a plain string, or { en, fr, ar } (falls back to English)
const tx = (value) => (value && typeof value === "object" && !Array.isArray(value) ? value[LANG] ?? value.en : value);
