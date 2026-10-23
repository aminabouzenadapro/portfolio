// The 58 wilayas of Algeria. `zone` sets the delivery price:
// 1 = Algiers area, 2 = North, 3 = High plateaus & South, 4 = Far South
const FAR_SOUTH = [1, 11, 33, 37, 49, 50, 52, 53, 54, 56];
const SOUTH = [3, 7, 8, 17, 30, 32, 39, 45, 47, 51, 55, 57, 58];
const ALGIERS_AREA = [9, 16, 35, 42];

const LIST = [
  [1, "Adrar", "أدرار"], [2, "Chlef", "الشلف"], [3, "Laghouat", "الأغواط"], [4, "Oum El Bouaghi", "أم البواقي"],
  [5, "Batna", "باتنة"], [6, "Béjaïa", "بجاية"], [7, "Biskra", "بسكرة"], [8, "Béchar", "بشار"],
  [9, "Blida", "البليدة"], [10, "Bouira", "البويرة"], [11, "Tamanrasset", "تمنراست"], [12, "Tébessa", "تبسة"],
  [13, "Tlemcen", "تلمسان"], [14, "Tiaret", "تيارت"], [15, "Tizi Ouzou", "تيزي وزو"], [16, "Alger", "الجزائر"],
  [17, "Djelfa", "الجلفة"], [18, "Jijel", "جيجل"], [19, "Sétif", "سطيف"], [20, "Saïda", "سعيدة"],
  [21, "Skikda", "سكيكدة"], [22, "Sidi Bel Abbès", "سيدي بلعباس"], [23, "Annaba", "عنابة"], [24, "Guelma", "قالمة"],
  [25, "Constantine", "قسنطينة"], [26, "Médéa", "المدية"], [27, "Mostaganem", "مستغانم"], [28, "M'Sila", "المسيلة"],
  [29, "Mascara", "معسكر"], [30, "Ouargla", "ورقلة"], [31, "Oran", "وهران"], [32, "El Bayadh", "البيض"],
  [33, "Illizi", "إليزي"], [34, "Bordj Bou Arréridj", "برج بوعريريج"], [35, "Boumerdès", "بومرداس"], [36, "El Tarf", "الطارف"],
  [37, "Tindouf", "تندوف"], [38, "Tissemsilt", "تيسمسيلت"], [39, "El Oued", "الوادي"], [40, "Khenchela", "خنشلة"],
  [41, "Souk Ahras", "سوق أهراس"], [42, "Tipaza", "تيبازة"], [43, "Mila", "ميلة"], [44, "Aïn Defla", "عين الدفلى"],
  [45, "Naâma", "النعامة"], [46, "Aïn Témouchent", "عين تموشنت"], [47, "Ghardaïa", "غرداية"], [48, "Relizane", "غليزان"],
  [49, "Timimoun", "تيميمون"], [50, "Bordj Badji Mokhtar", "برج باجي مختار"], [51, "Ouled Djellal", "أولاد جلال"], [52, "Béni Abbès", "بني عباس"],
  [53, "In Salah", "عين صالح"], [54, "In Guezzam", "عين قزام"], [55, "Touggourt", "تقرت"], [56, "Djanet", "جانت"],
  [57, "El M'Ghair", "المغير"], [58, "El Meniaa", "المنيعة"],
];

export const WILAYAS = LIST.map(([code, fr, ar]) => ({
  code,
  name: { fr, ar },
  zone: ALGIERS_AREA.includes(code) ? 1 : FAR_SOUTH.includes(code) ? 4 : SOUTH.includes(code) ? 3 : 2,
}));

export const wilayaByCode = (code) => WILAYAS.find((w) => w.code === Number(code));
