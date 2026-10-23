/* =====================================================================
   BUSINESS SETTINGS — edit this file to adapt the site to another shop.
   Every text has a French (fr) and Arabic (ar) version.
   The contact details below are demo placeholders: replace them.
   ===================================================================== */

export const BUSINESS = {
  name: { fr: "Dzair Tech", ar: "دزاير تك" },
  initial: { fr: "D", ar: "د" },
  tagline: {
    fr: "Smartphones, ordinateurs et accessoires high-tech, garantis et livrés partout en Algérie.",
    ar: "هواتف ذكية، حواسيب وإكسسوارات تقنية، مضمونة وتصل إلى كل أنحاء الجزائر.",
  },
  heroTitle: {
    fr: "La tech qu'il vous faut, au meilleur prix.",
    ar: "كل ما تحتاجه من تكنولوجيا، بأفضل سعر.",
  },
  since: 2019,

  phone: "0550 00 00 00",
  email: "contact@exemple.dz",
  instagram: { handle: "@dzairtech.demo", url: "https://www.instagram.com/" },
  facebook: { handle: "Dzair Tech", url: "https://www.facebook.com/" },
  address: { fr: "Bab Ezzouar, Alger", ar: "باب الزوار، الجزائر" },
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bab%20Ezzouar%2C%20Alger",
  hours: [
    { days: { fr: "Samedi – Jeudi", ar: "السبت – الخميس" }, time: { fr: "10h – 20h", ar: "10:00 – 20:00" } },
    { days: { fr: "Vendredi", ar: "الجمعة" }, time: { fr: "14h – 20h", ar: "14:00 – 20:00" } },
  ],

  story: {
    fr: [
      "Dzair Tech a ouvert ses portes en 2019 à Bab Ezzouar, avec une idée simple : vendre des produits high-tech 100 % originaux, au juste prix, avec un vrai service après-vente.",
      "Aujourd'hui, notre équipe teste chaque appareil avant l'expédition, vous conseille par téléphone et livre dans les 58 wilayas. Tous nos produits sont garantis 12 mois.",
    ],
    ar: [
      "افتتح دزاير تك أبوابه سنة 2019 في باب الزوار بفكرة بسيطة: بيع منتجات تقنية أصلية 100٪، بسعر عادل، مع خدمة ما بعد البيع حقيقية.",
      "اليوم، يختبر فريقنا كل جهاز قبل الشحن، وينصحك عبر الهاتف ويوصل إلى 58 ولاية. جميع منتجاتنا مضمونة لمدة 12 شهرا.",
    ],
  },
  storyImage: "products/macbook-air.jpg",
  stats: [
    { value: "2019", label: { fr: "Depuis", ar: "منذ" } },
    { value: "+12 000", label: { fr: "Clients", ar: "زبون" } },
    { value: "12 mois", label: { fr: "De garantie", ar: "ضمان" } },
  ],

  testimonials: [
    {
      name: "Yacine", city: { fr: "Alger", ar: "الجزائر" }, rating: 5,
      text: {
        fr: "J'ai commandé un Galaxy A55, reçu en 24 h, scellé et avec la facture. Prix correct et équipe sérieuse.",
        ar: "طلبت هاتف غالاكسي A55 ووصلني خلال 24 ساعة، مختوما ومع الفاتورة. سعر معقول وفريق جاد.",
      },
    },
    {
      name: "Imane", city: { fr: "Oran", ar: "وهران" }, rating: 5,
      text: {
        fr: "Ils m'ont bien conseillée pour choisir mon ordinateur pour la fac. Livraison en stop desk très pratique.",
        ar: "نصحوني جيدا في اختيار حاسوبي للجامعة. التوصيل إلى مكتب التوصيل عملي جدا.",
      },
    },
    {
      name: "Riad", city: { fr: "Sétif", ar: "سطيف" }, rating: 4,
      text: {
        fr: "Manette PS5 et casque Sony reçus en parfait état. Le paiement à la livraison, c'est rassurant.",
        ar: "استلمت يد PS5 وسماعة سوني في حالة ممتازة. الدفع عند الاستلام يبعث على الاطمئنان.",
      },
    },
  ],

  faq: [
    {
      q: { fr: "Vos produits sont-ils originaux ?", ar: "هل منتجاتكم أصلية؟" },
      a: {
        fr: "Oui, tous nos produits sont neufs, originaux et scellés. Chaque commande est livrée avec une facture et un bon de garantie.",
        ar: "نعم، جميع منتجاتنا جديدة وأصلية ومختومة. تُسلّم كل طلبية مع فاتورة ووصل ضمان.",
      },
    },
    {
      q: { fr: "Quelle est la garantie ?", ar: "ما مدة الضمان؟" },
      a: {
        fr: "12 mois sur tous les appareils. En cas de panne, rapportez-le en boutique ou envoyez-le-nous : nous le réparons ou l'échangeons.",
        ar: "12 شهرا على جميع الأجهزة. في حال وجود عطل، أحضره إلى المحل أو أرسله إلينا: نصلحه أو نستبدله.",
      },
    },
    {
      q: { fr: "En combien de temps suis-je livré ?", ar: "متى تصلني الطلبية؟" },
      a: {
        fr: "De 1 à 2 jours pour Alger et ses environs, et de 2 à 6 jours pour les autres wilayas. Nous vous appelons pour confirmer avant l'expédition.",
        ar: "من يوم إلى يومين للجزائر العاصمة وضواحيها، ومن 2 إلى 6 أيام لباقي الولايات. نتصل بك للتأكيد قبل الشحن.",
      },
    },
    {
      q: { fr: "Puis-je vérifier le produit à la livraison ?", ar: "هل يمكنني فحص المنتج عند الاستلام؟" },
      a: {
        fr: "Oui. Vous ouvrez le colis devant le livreur et vous payez seulement si tout est conforme.",
        ar: "نعم. تفتح الطرد أمام عامل التوصيل ولا تدفع إلا إذا كان كل شيء مطابقا.",
      },
    },
  ],
};
