import CREDITS from "./credits.json";

// Initial catalog. The admin dashboard can add, edit and delete products;
// changes are kept in the browser (see store/db.js).

export const CATEGORIES = [
  { slug: "smartphones", icon: "phone", name: { fr: "Smartphones", ar: "هواتف ذكية" } },
  { slug: "ordinateurs", icon: "laptop", name: { fr: "Ordinateurs & tablettes", ar: "حواسيب ولوحات" } },
  { slug: "audio", icon: "headphones", name: { fr: "Audio", ar: "صوتيات" } },
  { slug: "montres", icon: "watch", name: { fr: "Montres connectées", ar: "ساعات ذكية" } },
  { slug: "gaming", icon: "gamepad", name: { fr: "Gaming", ar: "ألعاب الفيديو" } },
  { slug: "accessoires", icon: "plug", name: { fr: "Accessoires", ar: "إكسسوارات" } },
];

// ---- helpers to keep the data short ----
const COLORS = {
  noir: ["Noir", "أسود", "#1f2937"], blanc: ["Blanc", "أبيض", "#f5f5f4"], argent: ["Argent", "فضي", "#cbd5e1"],
  bleu: ["Bleu", "أزرق", "#2563eb"], bleuNuit: ["Bleu nuit", "أزرق داكن", "#1e3a5f"], cobalt: ["Bleu cobalt", "أزرق كوبالت", "#1d4ed8"],
  rose: ["Rose", "وردي", "#f9a8d4"], vert: ["Vert", "أخضر", "#86efac"], jaune: ["Jaune", "أصفر", "#fde047"],
  rouge: ["Rouge", "أحمر", "#dc2626"], lilas: ["Lilas", "بنفسجي", "#c4b5fd"], gris: ["Gris graphite", "رمادي", "#4b5563"],
  minuit: ["Minuit", "منتصف الليل", "#111827"], lumiere: ["Lumière stellaire", "ضوء النجوم", "#efe7da"],
};
// Color option; `extra` adds a price difference for some colors, e.g. { cobalt: 1500 }
const color = (names, extra = {}) => ({
  key: "color",
  values: names.map((n) => ({ id: n, label: { fr: COLORS[n][0], ar: COLORS[n][1] }, swatch: COLORS[n][2], delta: extra[n] || 0 })),
});
// Other options: [id, French label, Arabic label, price difference]
const opt = (key, values) => ({
  key,
  values: values.map(([id, fr, ar, delta = 0]) => ({ id, label: { fr, ar: ar || fr }, delta })),
});
// Spec row: label key (translated in strings.js) and value
const spec = (key, fr, ar) => ({ key, value: { fr, ar: ar || fr } });

const DATA = [
  {
    id: "iphone-15", category: "smartphones", brand: "Apple", price: 179000, discount: 0, rating: 4.8, reviews: 64, stock: 6, bestseller: true,
    title: { fr: "iPhone 15", ar: "آيفون 15" },
    description: {
      fr: "Écran Super Retina XDR de 6,1 pouces, Dynamic Island, appareil photo principal de 48 Mpx et port USB-C. Produit neuf, scellé, avec garantie.",
      ar: "شاشة Super Retina XDR مقاس 6.1 بوصة، Dynamic Island، كاميرا رئيسية 48 ميغابكسل ومنفذ USB-C. منتج جديد مختوم مع الضمان.",
    },
    options: [opt("storage", [["128", "128 Go", "128 غيغا"], ["256", "256 Go", "256 غيغا", 28000]]), color(["rose", "vert", "noir", "bleu"])],
    specs: [spec("screen", "6,1\" Super Retina XDR OLED", "6.1 بوصة Super Retina XDR OLED"), spec("chip", "Apple A16 Bionic"), spec("camera", "48 Mpx + 12 Mpx", "48 + 12 ميغابكسل"), spec("battery", "Jusqu'à 20 h de vidéo", "حتى 20 ساعة فيديو")],
  },
  {
    id: "galaxy-a55", category: "smartphones", brand: "Samsung", price: 76000, discount: 8, rating: 4.7, reviews: 112, stock: 18, bestseller: true,
    title: { fr: "Samsung Galaxy A55 5G", ar: "سامسونغ غالاكسي A55 5G" },
    description: {
      fr: "Grand écran Super AMOLED 120 Hz, design en métal et verre, 5G et une batterie de 5000 mAh qui tient toute la journée.",
      ar: "شاشة Super AMOLED كبيرة بتردد 120 هرتز، تصميم من المعدن والزجاج، دعم 5G وبطارية 5000 ميلي أمبير تدوم طوال اليوم.",
    },
    options: [opt("storage", [["128", "128 Go", "128 غيغا"], ["256", "256 Go", "256 غيغا", 9000]]), color(["bleuNuit", "lilas", "blanc"])],
    specs: [spec("screen", "6,6\" Super AMOLED 120 Hz", "6.6 بوصة Super AMOLED بتردد 120 هرتز"), spec("chip", "Exynos 1480"), spec("ram", "8 Go", "8 غيغا"), spec("battery", "5000 mAh", "5000 ميلي أمبير")],
  },
  {
    id: "redmi-note-11", category: "smartphones", brand: "Xiaomi", price: 34000, discount: 12, rating: 4.5, reviews: 203, stock: 25,
    title: { fr: "Xiaomi Redmi Note 11", ar: "شاومي ريدمي نوت 11" },
    description: {
      fr: "Le meilleur rapport qualité-prix : écran AMOLED 90 Hz, quatre caméras et charge rapide 33 W.",
      ar: "أفضل قيمة مقابل السعر: شاشة AMOLED بتردد 90 هرتز، أربع كاميرات وشحن سريع 33 واط.",
    },
    options: [opt("storage", [["64", "4 Go + 64 Go", "4 + 64 غيغا"], ["128", "4 Go + 128 Go", "4 + 128 غيغا", 4000]]), color(["gris", "bleu"])],
    specs: [spec("screen", "6,43\" AMOLED 90 Hz", "6.43 بوصة AMOLED بتردد 90 هرتز"), spec("chip", "Snapdragon 680"), spec("camera", "50 Mpx (quatre caméras)", "50 ميغابكسل (أربع كاميرات)"), spec("battery", "5000 mAh, charge 33 W", "5000 ميلي أمبير، شحن 33 واط")],
  },
  {
    id: "macbook-air", category: "ordinateurs", brand: "Apple", price: 235000, discount: 0, rating: 4.9, reviews: 41, stock: 4, bestseller: true,
    title: { fr: "MacBook Air 13\" puce M2", ar: "ماك بوك إير 13 بوصة بشريحة M2" },
    description: {
      fr: "Ultra-fin, silencieux (sans ventilateur) et une autonomie record. Idéal pour les études, le travail et la création.",
      ar: "رفيع جدا وصامت (بدون مروحة) مع عمر بطارية قياسي. مثالي للدراسة والعمل والإبداع.",
    },
    options: [opt("config", [["8-256", "8 Go RAM · 256 Go SSD", "8 غيغا رام · 256 غيغا SSD"], ["16-512", "16 Go RAM · 512 Go SSD", "16 غيغا رام · 512 غيغا SSD", 60000]]), color(["lumiere", "minuit", "argent"])],
    specs: [spec("chip", "Apple M2 (8 cœurs)", "Apple M2 (8 أنوية)"), spec("screen", "13,6\" Liquid Retina", "13.6 بوصة Liquid Retina"), spec("autonomy", "Jusqu'à 18 h", "حتى 18 ساعة"), spec("weight", "1,24 kg", "1.24 كغ")],
  },
  {
    id: "lenovo-ideapad", category: "ordinateurs", brand: "Lenovo", price: 98000, discount: 10, rating: 4.6, reviews: 57, stock: 9,
    title: { fr: "Lenovo IdeaPad Flex 5 14\"", ar: "لينوفو آيديا باد فليكس 5 مقاس 14 بوصة" },
    description: {
      fr: "PC portable convertible à écran tactile qui se retourne à 360° : mode ordinateur, tablette ou présentation.",
      ar: "حاسوب محمول قابل للتحويل بشاشة لمس تدور 360 درجة: وضع الحاسوب أو اللوحة أو العرض.",
    },
    options: [opt("config", [["i5", "Core i5 · 8 Go · 512 Go SSD", "Core i5 · 8 غيغا · 512 غيغا SSD"], ["i7", "Core i7 · 16 Go · 512 Go SSD", "Core i7 · 16 غيغا · 512 غيغا SSD", 24000]])],
    specs: [spec("screen", "14\" Full HD tactile", "14 بوصة Full HD تعمل باللمس"), spec("os", "Windows 11"), spec("weight", "1,5 kg", "1.5 كغ"), spec("connectivity", "Wi-Fi 6, USB-C, HDMI")],
  },
  {
    id: "hp-laptop", category: "ordinateurs", brand: "HP", price: 112000, discount: 0, rating: 4.4, reviews: 38, stock: 7,
    title: { fr: "HP Pavilion 15", ar: "إتش بي بافيليون 15" },
    description: {
      fr: "Un portable polyvalent pour le travail et le multimédia, avec un grand écran et un clavier confortable avec pavé numérique.",
      ar: "حاسوب محمول متعدد الاستعمالات للعمل والوسائط المتعددة، بشاشة كبيرة ولوحة مفاتيح مريحة مع لوحة أرقام.",
    },
    options: [],
    specs: [spec("chip", "Intel Core i5 (12e gén.)", "Intel Core i5 (الجيل 12)"), spec("ram", "16 Go", "16 غيغا"), spec("storage", "SSD 512 Go", "SSD بسعة 512 غيغا"), spec("screen", "15,6\" Full HD", "15.6 بوصة Full HD")],
  },
  {
    id: "ipad", category: "ordinateurs", brand: "Apple", price: 92000, discount: 0, rating: 4.8, reviews: 49, stock: 11,
    title: { fr: "iPad (10e génération)", ar: "آيباد (الجيل العاشر)" },
    description: {
      fr: "Écran Liquid Retina de 10,9 pouces, puce A14 Bionic et USB-C. Parfait pour les cours, les séries et le dessin.",
      ar: "شاشة Liquid Retina مقاس 10.9 بوصة، شريحة A14 Bionic ومنفذ USB-C. مثالي للدروس والمسلسلات والرسم.",
    },
    options: [opt("storage", [["64", "64 Go", "64 غيغا"], ["256", "256 Go", "256 غيغا", 26000]]), color(["rose", "bleu", "argent", "jaune"])],
    specs: [spec("screen", "10,9\" Liquid Retina", "10.9 بوصة Liquid Retina"), spec("chip", "Apple A14 Bionic"), spec("connectivity", "Wi-Fi 6, USB-C"), spec("autonomy", "Jusqu'à 10 h", "حتى 10 ساعات")],
  },
  {
    id: "headphones", category: "audio", brand: "Sony", price: 48000, discount: 15, rating: 4.8, reviews: 88, stock: 14,
    title: { fr: "Casque Sony WH-1000XM3", ar: "سماعة سوني WH-1000XM3" },
    description: {
      fr: "Casque sans fil à réduction de bruit active, réputé pour son confort et la qualité de son son. Idéal en voyage et au bureau.",
      ar: "سماعة لاسلكية مع خاصية إلغاء الضوضاء، معروفة براحتها وجودة صوتها. مثالية للسفر والمكتب.",
    },
    options: [color(["noir", "argent"])],
    specs: [spec("features", "Réduction de bruit active", "إلغاء الضوضاء النشط"), spec("autonomy", "30 h", "30 ساعة"), spec("connectivity", "Bluetooth, NFC, jack 3,5 mm", "بلوتوث، NFC، منفذ 3.5 ملم"), spec("charge", "10 min = 5 h d'écoute", "10 دقائق = 5 ساعات استماع")],
  },
  {
    id: "airpods-pro", category: "audio", brand: "Apple", price: 49000, discount: 0, rating: 4.7, reviews: 96, stock: 20, bestseller: true,
    title: { fr: "AirPods Pro (2e génération)", ar: "إيربودز برو (الجيل الثاني)" },
    description: {
      fr: "Écouteurs sans fil avec réduction active du bruit, mode Transparence et audio spatial personnalisé.",
      ar: "سماعات لاسلكية مع إلغاء نشط للضوضاء، وضع الشفافية وصوت محيطي مخصص.",
    },
    options: [],
    specs: [spec("features", "Réduction de bruit, audio spatial", "إلغاء الضوضاء، صوت محيطي"), spec("autonomy", "6 h (30 h avec le boîtier)", "6 ساعات (30 ساعة مع العلبة)"), spec("charge", "Boîtier MagSafe USB-C", "علبة MagSafe بمنفذ USB-C"), spec("water", "IP54")],
  },
  {
    id: "jbl-flip", category: "audio", brand: "JBL", price: 19500, discount: 0, rating: 4.6, reviews: 74, stock: 22,
    title: { fr: "Enceinte JBL Flip", ar: "مكبر صوت JBL Flip" },
    description: {
      fr: "Enceinte Bluetooth portable au son puissant, étanche, à emporter partout : plage, terrasse ou camping.",
      ar: "مكبر صوت بلوتوث محمول بصوت قوي ومقاوم للماء، يرافقك في كل مكان: الشاطئ أو السطح أو التخييم.",
    },
    options: [color(["noir", "bleu", "rouge"])],
    specs: [spec("water", "IP67 (étanche)", "IP67 (مقاوم للماء)"), spec("autonomy", "12 h", "12 ساعة"), spec("connectivity", "Bluetooth 5.1", "بلوتوث 5.1"), spec("features", "PartyBoost (jumelage de plusieurs enceintes)", "PartyBoost (ربط عدة مكبرات)")],
  },
  {
    id: "apple-watch", category: "montres", brand: "Apple", price: 54000, discount: 0, rating: 4.7, reviews: 33, stock: 8,
    title: { fr: "Apple Watch SE (2e génération)", ar: "ساعة آبل SE (الجيل الثاني)" },
    description: {
      fr: "Suivi de l'activité, du sommeil et du rythme cardiaque, détection des chutes et notifications au poignet.",
      ar: "تتبع النشاط والنوم ونبضات القلب، اكتشاف السقوط والإشعارات على معصمك.",
    },
    options: [opt("size", [["40", "40 mm", "40 ملم"], ["44", "44 mm", "44 ملم", 4000]])],
    specs: [spec("features", "Suivi santé, détection des chutes", "تتبع الصحة، اكتشاف السقوط"), spec("water", "Étanche jusqu'à 50 m", "مقاومة للماء حتى 50 مترا"), spec("autonomy", "18 h", "18 ساعة"), spec("compat", "iPhone uniquement", "آيفون فقط")],
  },
  {
    id: "mi-band", category: "montres", brand: "Xiaomi", price: 6500, discount: 10, rating: 4.5, reviews: 158, stock: 40,
    title: { fr: "Xiaomi Mi Smart Band 6", ar: "سوار شاومي Mi Smart Band 6" },
    description: {
      fr: "Bracelet connecté à grand écran AMOLED : pas, sommeil, fréquence cardiaque, oxygène dans le sang et 30 modes sportifs.",
      ar: "سوار ذكي بشاشة AMOLED كبيرة: الخطوات، النوم، نبضات القلب، أكسجين الدم و30 وضعا رياضيا.",
    },
    options: [],
    specs: [spec("screen", "1,56\" AMOLED", "1.56 بوصة AMOLED"), spec("features", "SpO2, 30 modes sportifs", "SpO2، 30 وضعا رياضيا"), spec("autonomy", "Jusqu'à 14 jours", "حتى 14 يوما"), spec("compat", "Android et iPhone", "أندرويد وآيفون")],
  },
  {
    id: "ps5", category: "gaming", brand: "Sony", price: 125000, discount: 0, rating: 4.9, reviews: 52, stock: 3, bestseller: true,
    title: { fr: "Console PlayStation 5", ar: "جهاز بلايستيشن 5" },
    description: {
      fr: "Chargements quasi instantanés grâce au SSD, jeux en 4K et manette DualSense à retour haptique incluse.",
      ar: "تحميل شبه فوري بفضل قرص SSD، ألعاب بدقة 4K ويد تحكم DualSense بردود فعل لمسية مرفقة.",
    },
    options: [opt("edition", [["standard", "Standard (lecteur Blu-ray)", "عادية (مع قارئ أقراص)"], ["digital", "Digital Edition", "النسخة الرقمية", -15000]])],
    specs: [spec("storage", "SSD 825 Go", "SSD بسعة 825 غيغا"), spec("features", "4K jusqu'à 120 i/s, ray tracing", "4K حتى 120 إطارا، تتبع الأشعة"), spec("included", "1 manette DualSense", "يد تحكم DualSense واحدة")],
  },
  {
    id: "dualsense", category: "gaming", brand: "Sony", price: 13500, discount: 0, rating: 4.7, reviews: 67, stock: 15,
    title: { fr: "Manette DualSense PS5", ar: "يد تحكم DualSense لجهاز PS5" },
    description: {
      fr: "Retour haptique et gâchettes adaptatives pour ressentir chaque action du jeu. Micro intégré et recharge USB-C.",
      ar: "ردود فعل لمسية وأزرار تكيفية لتشعر بكل حركة في اللعبة. ميكروفون مدمج وشحن عبر USB-C.",
    },
    options: [color(["blanc", "noir", "cobalt"], { cobalt: 1500 })],
    specs: [spec("features", "Retour haptique, gâchettes adaptatives", "ردود فعل لمسية، أزرار تكيفية"), spec("connectivity", "Bluetooth, USB-C", "بلوتوث، USB-C"), spec("compat", "PS5, PC", "PS5، الحاسوب")],
  },
  {
    id: "keyboard", category: "gaming", brand: "", price: 9500, discount: 0, rating: 4.4, reviews: 45, stock: 30,
    title: { fr: "Clavier mécanique RGB", ar: "لوحة مفاتيح ميكانيكية RGB" },
    description: {
      fr: "Clavier gaming à switches mécaniques, rétroéclairage RGB personnalisable et structure en aluminium.",
      ar: "لوحة مفاتيح للألعاب بمفاتيح ميكانيكية، إضاءة RGB قابلة للتخصيص وهيكل من الألمنيوم.",
    },
    options: [opt("switch", [["red", "Rouges (linéaires)", "حمراء (خطية)"], ["blue", "Bleus (clic)", "زرقاء (بنقرة)"], ["brown", "Marron (tactiles)", "بنية (لمسية)"]]), opt("layout", [["azerty", "AZERTY"], ["qwerty", "QWERTY"]])],
    specs: [spec("features", "Rétroéclairage RGB, anti-ghosting", "إضاءة RGB، مانع التداخل"), spec("connectivity", "USB, câble tressé", "USB، كابل مضفور")],
  },
  {
    id: "mouse", category: "accessoires", brand: "Logitech", price: 17500, discount: 0, rating: 4.8, reviews: 61, stock: 12,
    title: { fr: "Souris Logitech MX Master 3S", ar: "فأرة لوجيتك MX Master 3S" },
    description: {
      fr: "La souris préférée des pros : ergonomique, ultra-précise, aux clics silencieux, et utilisable sur trois appareils.",
      ar: "الفأرة المفضلة للمحترفين: مريحة، دقيقة جدا، بنقرات صامتة، وتعمل مع ثلاثة أجهزة.",
    },
    options: [],
    specs: [spec("sensor", "8000 DPI, fonctionne sur verre", "8000 DPI، تعمل على الزجاج"), spec("connectivity", "Bluetooth + récepteur USB", "بلوتوث + مستقبل USB"), spec("autonomy", "70 jours, recharge USB-C", "70 يوما، شحن USB-C")],
  },
  {
    id: "powerbank", category: "accessoires", brand: "Anker", price: 6800, discount: 0, rating: 4.6, reviews: 92, stock: 35, bestseller: true,
    title: { fr: "Batterie externe Anker 20 000 mAh", ar: "بطارية خارجية أنكر 20000 ميلي أمبير" },
    description: {
      fr: "Rechargez votre smartphone jusqu'à quatre fois, même pendant les coupures d'électricité. Charge rapide USB-C.",
      ar: "اشحن هاتفك حتى أربع مرات، حتى أثناء انقطاع الكهرباء. شحن سريع عبر USB-C.",
    },
    options: [],
    specs: [spec("capacity", "20 000 mAh", "20000 ميلي أمبير"), spec("power", "USB-C Power Delivery 20 W", "USB-C بقدرة 20 واط"), spec("connectivity", "2 ports (USB-C + USB-A)", "منفذان (USB-C و USB-A)")],
  },
  {
    id: "charger", category: "accessoires", brand: "", price: 3200, discount: 0, rating: 4.5, reviews: 70, stock: 50,
    title: { fr: "Chargeur rapide USB-C GaN 30 W", ar: "شاحن سريع USB-C GaN بقدرة 30 واط" },
    description: {
      fr: "Compact et puissant grâce à la technologie GaN. Recharge rapide pour iPhone, Samsung, iPad et la plupart des appareils USB-C.",
      ar: "صغير وقوي بفضل تقنية GaN. شحن سريع لأجهزة آيفون وسامسونغ وآيباد ومعظم أجهزة USB-C.",
    },
    options: [],
    specs: [spec("power", "30 W Power Delivery", "30 واط Power Delivery"), spec("features", "Technologie GaN, compact", "تقنية GaN، صغير الحجم"), spec("compat", "iPhone, Samsung, iPad, USB-C", "آيفون، سامسونغ، آيباد، USB-C")],
  },
];

export const SEED_PRODUCTS = DATA.map((p) => ({
  ...p,
  image: `products/${p.id}.jpg`,
  credit: CREDITS[p.id] || null,
  warranty: 12,
  active: true,
}));

// Unit price for a set of chosen option values ({ storage: "256", color: "noir" })
export function priceWithOptions(product, choice = {}) {
  return (product.options || []).reduce((sum, o) => {
    const v = o.values.find((x) => x.id === choice[o.key]);
    return sum + (v?.delta || 0);
  }, product.price);
}

export const defaultChoice = (product) =>
  Object.fromEntries((product.options || []).map((o) => [o.key, o.values[0].id]));
