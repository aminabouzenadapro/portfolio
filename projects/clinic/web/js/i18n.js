// Interface texts in French, Arabic and English. Practitioner and appointment texts come from the API.
// "err:<message>" entries translate the API's English error messages.
import { reactive } from "vue";

export const LANGS = [{ code: "fr", label: "FR" }, { code: "ar", label: "ع" }, { code: "en", label: "EN" }];
const KEY = "elamel-lang";

const fr = {
  brandSub: "Centre médical", menu: "Menu", language: "Langue", navBook: "Prendre RDV", navManage: "Mon rendez-vous", navAgenda: "Agenda", patients: "Patients", stats: "Statistiques",
  staffSpace: "Espace personnel", signIn: "Se connecter", signOut: "Se déconnecter", roleReception: "Accueil", roleDoctor: "Médecin", reset: "Réinitialiser",
  demoTag: "Démo", demoText: "Le vrai back-end PHP tourne dans votre navigateur (WebAssembly).", resetConfirm: "Remettre la démo à zéro ? Les rendez-vous ajoutés seront effacés.",
  footer: "Centre médical El Amel · Constantine · Projet de démonstration",
  bootTitle: "Démarrage du serveur PHP…", bootLead: "Ce site exécute son API PHP directement dans votre navigateur, avec une base SQLite.",
  boot_runtime: "PHP 8.3 (WebAssembly)", boot_app: "Code de l'application", boot_data: "Base de données et agenda",
  bootHint: "Quelques secondes au premier chargement.", bootFailed: "Le démarrage a échoué. Vérifiez votre connexion et rechargez la page.",
  heroEyebrow: "Centre médical El Amel · Constantine", heroTitle: "Votre rendez-vous en deux minutes, 24 h/24.",
  heroLead: "Médecin généraliste, dentiste et pédiatre au même endroit. Choisissez un créneau libre, recevez la confirmation par SMS.",
  heroPoint1: "Créneaux mis à jour en temps réel", heroPoint2: "Rappel SMS la veille", heroPoint3: "Annulation en ligne jusqu'à 2 h avant",
  manageMine: "Gérer mon rendez-vous", chooseDoctor: "Choisissez votre praticien", nextFree: "Prochain créneau", todayAt: "Aujourd'hui · {time}", noSlot14: "Aucun créneau libre sur 14 jours",
  ourTeam: "Notre équipe", book: "Prendre rendez-vous", address: "Adresse", addressText: "Cité Daksi, Constantine (à côté de la pharmacie)", openingHours: "Horaires",
  openingText: "Samedi – jeudi · fermé le vendredi", reception: "Accueil",
  allDoctors: "Tous les praticiens", reason: "Motif", when: "Date et heure", price: "Tarif", payAtClinic: "réglé au cabinet",
  step1: "Motif", step2: "Créneau", step3: "Vos coordonnées", step1Title: "Quel est le motif de votre visite ?", step2Title: "Choisissez un créneau", step3Title: "Vos coordonnées",
  earlier: "Plus tôt", later: "Plus tard", slotsN: "{n} libre(s)", closedShort: "Fermé", morning: "Matin", afternoon: "Après-midi",
  patientName: "Nom et prénom du patient", mobile: "Téléphone mobile", birthYear: "Année de naissance", emailOptional: "E-mail (facultatif)", smsLang: "Langue des SMS",
  consent: "J'accepte de recevoir des SMS de confirmation et de rappel pour ce rendez-vous.", sending: "Envoi…", confirmBooking: "Confirmer le rendez-vous de {time}",
  myAppointment: "Mon rendez-vous", enterPhone: "Pour voir le rendez-vous {ref}, entrez le numéro de téléphone utilisé lors de la réservation.", show: "Afficher",
  bookedDone: "Rendez-vous confirmé ! Un SMS de confirmation vous a été envoyé.", doctor: "Praticien", patient: "Patient", where: "Lieu", reference: "Référence",
  smsInfo: "Vous recevrez un SMS de rappel la veille.", addCalendar: "Ajouter à l'agenda", print: "Imprimer", cancelAppt: "Annuler le rendez-vous",
  cancelConfirm: "Annuler ce rendez-vous ? Le créneau sera proposé à d'autres patients.", lateCancel: "Moins de 2 h avant le rendez-vous : appelez l'accueil pour annuler.", bookAnother: "Prendre un autre rendez-vous",
  fromThisPhone: "Réservés depuis ce téléphone", findByRef: "Retrouver un rendez-vous",
  status_booked: "Confirmé", status_arrived: "Arrivé", status_done: "Vu", status_no_show: "Absent", status_cancelled: "Annulé",
  staffLead: "Accueil et médecins du centre.", email: "E-mail", password: "Mot de passe", demoAccounts: "Comptes de démonstration :",
  previousDay: "Jour précédent", nextDay: "Jour suivant", today: "Aujourd'hui", chooseDate: "Choisir une date", appointments: "rendez-vous",
  newAppt: "Nouveau RDV", walkIn: "Sans rendez-vous", blockTime: "Bloquer un créneau", blocked: "Bloqué", remove: "Supprimer", close: "Fermer",
  yearsOld: "{n} ans", time: "Heure", source: "Origine", source_online: "En ligne", source_phone: "Téléphone", source_walk_in: "Sans rendez-vous",
  markArrived: "Arrivé", markDone: "Vu", markNoShow: "Absent", note: "Note", notePlaceholder: "Visible par l'équipe uniquement", saveNote: "Enregistrer la note", noteSaved: "Note enregistrée",
  history: "Historique", cancelConfirmStaff: "Annuler ce rendez-vous ? Le patient recevra un SMS.", noSlotDay: "Aucun créneau libre ce jour-là.", save: "Enregistrer",
  who: "Pour", wholeClinic: "Tout le centre", allDay: "Toute la journée", from: "De", to: "À", reasonBlock: "Motif", reasonPlaceholder: "Congé, formation, réunion…", block: "Bloquer",
  toCall: "{n} patient(s) déjà inscrit(s) sur cette période : pensez à les appeler.", ok: "OK", removeBlock: "Supprimer ce blocage ?",
  searchPatient: "Nom ou téléphone…", visitsN: "{n} visite(s)", noShowsN: "{n} absence(s)", noResults: "Aucun résultat.", bornIn: "né(e) en {y}", patientSince: "patient depuis le {d}", pickPatient: "Choisissez un patient pour voir son historique.",
  lastNDays: "{n} derniers jours", noShowRate: "taux d'absence", onlineShare: "réservés en ligne", perDay: "Rendez-vous par jour", occupancy: "Taux d'occupation des agendas", appointmentsN: "{n} rendez-vous",
  smsTitle: "SMS envoyés", smsLead: "Confirmations, rappels et annulations envoyés aux patients.", sendReminders: "Envoyer les rappels de demain", remindersSent: "{n} rappel(s) envoyé(s) pour demain.",
  sms_confirm: "Confirmation", sms_reminder: "Rappel", sms_cancel: "Annulation", noSms: "Aucun SMS pour l'instant.",
  "err:Not found": "Introuvable.", "err:Server error": "Erreur du serveur.", "err:Practitioner not found": "Praticien introuvable.", "err:Appointment type not found": "Motif introuvable.",
  "err:Please enter a valid mobile number (05, 06 or 07 + 8 digits)": "Numéro mobile invalide (05, 06 ou 07 + 8 chiffres).",
  "err:Please enter the patient's full name": "Veuillez saisir le nom complet du patient.", "err:Please enter a valid email": "Veuillez saisir un e-mail valide.",
  "err:Please enter a valid birth year": "Année de naissance invalide.", "err:Please accept to receive SMS about this appointment": "Veuillez accepter de recevoir les SMS du rendez-vous.",
  "err:Please choose a time slot": "Veuillez choisir un créneau.", "err:This time slot is no longer available": "Ce créneau vient d'être pris. Choisissez-en un autre.",
  "err:You already have 2 upcoming appointments": "Vous avez déjà 2 rendez-vous à venir.", "err:No appointment matches this reference and phone number": "Aucun rendez-vous ne correspond à cette référence et à ce numéro.",
  "err:This appointment can no longer be cancelled": "Ce rendez-vous ne peut plus être annulé.", "err:Less than 2 hours before the appointment: please call the clinic": "Moins de 2 h avant le rendez-vous : appelez l'accueil.",
  "err:Appointment not found": "Rendez-vous introuvable.", "err:Wrong email or password": "E-mail ou mot de passe incorrect.", "err:Please sign in": "Veuillez vous connecter.",
  "err:Your account can't do this": "Votre compte n'a pas accès à cette action.", "err:Invalid date": "Date invalide.", "err:This appointment is cancelled": "Ce rendez-vous est annulé.",
  "err:Invalid status": "Statut invalide.", "err:This appointment is not today yet": "Ce rendez-vous n'est pas encore aujourd'hui.", "err:The end must be after the start": "La fin doit être après le début.",
  "err:Patient not found": "Patient introuvable.", "err:Invalid JSON": "Requête invalide.",
};

const ar = {
  brandSub: "مركز طبي", menu: "القائمة", language: "اللغة", navBook: "حجز موعد", navManage: "موعدي", navAgenda: "الأجندة", patients: "المرضى", stats: "الإحصائيات",
  staffSpace: "فضاء المستخدمين", signIn: "تسجيل الدخول", signOut: "تسجيل الخروج", roleReception: "الاستقبال", roleDoctor: "طبيب", reset: "إعادة الضبط",
  demoTag: "نسخة تجريبية", demoText: "الواجهة الخلفية الحقيقية بلغة PHP تعمل داخل متصفحك (WebAssembly).", resetConfirm: "إعادة النسخة التجريبية إلى بدايتها؟ ستُحذف المواعيد المضافة.",
  footer: "مركز الأمل الطبي · قسنطينة · مشروع تجريبي",
  bootTitle: "تشغيل خادم PHP…", bootLead: "يشغّل هذا الموقع واجهة PHP الخاصة به داخل متصفحك مباشرة مع قاعدة SQLite.",
  boot_runtime: "PHP 8.3 (WebAssembly)", boot_app: "شيفرة التطبيق", boot_data: "قاعدة البيانات والأجندة",
  bootHint: "بضع ثوان في أول تحميل.", bootFailed: "فشل التشغيل. تحقق من الاتصال وأعد تحميل الصفحة.",
  heroEyebrow: "مركز الأمل الطبي · قسنطينة", heroTitle: "موعدك في دقيقتين، على مدار الساعة.",
  heroLead: "طبيبة عامة وطبيب أسنان وطبيبة أطفال في مكان واحد. اختر موعدا متاحا واستلم التأكيد برسالة قصيرة.",
  heroPoint1: "مواعيد محدثة في الوقت الحقيقي", heroPoint2: "رسالة تذكير قبل يوم", heroPoint3: "إلغاء عبر الإنترنت حتى ساعتين قبل الموعد",
  manageMine: "إدارة موعدي", chooseDoctor: "اختر الطبيب", nextFree: "أقرب موعد", todayAt: "اليوم · {time}", noSlot14: "لا توجد مواعيد متاحة خلال 14 يوما",
  ourTeam: "فريقنا", book: "احجز موعدا", address: "العنوان", addressText: "حي الدقسي، قسنطينة (بجانب الصيدلية)", openingHours: "أوقات العمل",
  openingText: "السبت – الخميس · مغلق يوم الجمعة", reception: "الاستقبال",
  allDoctors: "كل الأطباء", reason: "سبب الزيارة", when: "التاريخ والساعة", price: "السعر", payAtClinic: "يُدفع في العيادة",
  step1: "السبب", step2: "الموعد", step3: "معلوماتك", step1Title: "ما سبب زيارتك؟", step2Title: "اختر موعدا", step3Title: "معلوماتك",
  earlier: "قبل", later: "بعد", slotsN: "المواعيد: {n}", closedShort: "مغلق", morning: "صباحا", afternoon: "مساء",
  patientName: "اسم ولقب المريض", mobile: "رقم الهاتف النقال", birthYear: "سنة الميلاد", emailOptional: "البريد الإلكتروني (اختياري)", smsLang: "لغة الرسائل",
  consent: "أوافق على استلام رسائل التأكيد والتذكير الخاصة بهذا الموعد.", sending: "جار الإرسال…", confirmBooking: "تأكيد موعد الساعة {time}",
  myAppointment: "موعدي", enterPhone: "لعرض الموعد {ref}، أدخل رقم الهاتف المستعمل عند الحجز.", show: "عرض",
  bookedDone: "تم تأكيد الموعد! أرسلنا لك رسالة تأكيد.", doctor: "الطبيب", patient: "المريض", where: "المكان", reference: "المرجع",
  smsInfo: "ستصلك رسالة تذكير قبل يوم.", addCalendar: "إضافة إلى الرزنامة", print: "طباعة", cancelAppt: "إلغاء الموعد",
  cancelConfirm: "إلغاء هذا الموعد؟ سيُعرض على مرضى آخرين.", lateCancel: "أقل من ساعتين قبل الموعد: اتصل بالاستقبال للإلغاء.", bookAnother: "حجز موعد آخر",
  fromThisPhone: "المحجوزة من هذا الهاتف", findByRef: "البحث عن موعد",
  status_booked: "مؤكد", status_arrived: "حاضر", status_done: "تم الفحص", status_no_show: "غائب", status_cancelled: "ملغى",
  staffLead: "الاستقبال وأطباء المركز.", email: "البريد الإلكتروني", password: "كلمة المرور", demoAccounts: "حسابات تجريبية:",
  previousDay: "اليوم السابق", nextDay: "اليوم التالي", today: "اليوم", chooseDate: "اختيار تاريخ", appointments: "مواعيد",
  newAppt: "موعد جديد", walkIn: "دون موعد", blockTime: "حجب وقت", blocked: "محجوب", remove: "حذف", close: "إغلاق",
  yearsOld: "{n} سنة", time: "الساعة", source: "المصدر", source_online: "عبر الإنترنت", source_phone: "بالهاتف", source_walk_in: "دون موعد",
  markArrived: "حاضر", markDone: "تم الفحص", markNoShow: "غائب", note: "ملاحظة", notePlaceholder: "يراها الفريق فقط", saveNote: "حفظ الملاحظة", noteSaved: "تم حفظ الملاحظة",
  history: "السجل", cancelConfirmStaff: "إلغاء هذا الموعد؟ ستصل المريض رسالة.", noSlotDay: "لا توجد مواعيد متاحة في هذا اليوم.", save: "حفظ",
  who: "لـ", wholeClinic: "كل المركز", allDay: "طوال اليوم", from: "من", to: "إلى", reasonBlock: "السبب", reasonPlaceholder: "عطلة، تكوين، اجتماع…", block: "حجب",
  toCall: "مرضى مسجلون في هذه الفترة: {n}، لا تنس الاتصال بهم.", ok: "حسنا", removeBlock: "حذف هذا الحجب؟",
  searchPatient: "الاسم أو الهاتف…", visitsN: "الزيارات: {n}", noShowsN: "الغيابات: {n}", noResults: "لا توجد نتائج.", bornIn: "مواليد {y}", patientSince: "مريض منذ {d}", pickPatient: "اختر مريضا لعرض سجله.",
  lastNDays: "آخر {n} يوما", noShowRate: "نسبة الغياب", onlineShare: "محجوزة عبر الإنترنت", perDay: "المواعيد يوميا", occupancy: "نسبة امتلاء الأجندات", appointmentsN: "المواعيد: {n}",
  smsTitle: "الرسائل المرسلة", smsLead: "رسائل التأكيد والتذكير والإلغاء المرسلة إلى المرضى.", sendReminders: "إرسال تذكيرات الغد", remindersSent: "تم إرسال {n} تذكير لمواعيد الغد.",
  sms_confirm: "تأكيد", sms_reminder: "تذكير", sms_cancel: "إلغاء", noSms: "لا توجد رسائل بعد.",
  "err:Not found": "غير موجود.", "err:Server error": "خطأ في الخادم.", "err:Practitioner not found": "الطبيب غير موجود.", "err:Appointment type not found": "السبب غير موجود.",
  "err:Please enter a valid mobile number (05, 06 or 07 + 8 digits)": "رقم الهاتف غير صحيح (05 أو 06 أو 07 + 8 أرقام).",
  "err:Please enter the patient's full name": "يرجى إدخال الاسم الكامل للمريض.", "err:Please enter a valid email": "يرجى إدخال بريد إلكتروني صحيح.",
  "err:Please enter a valid birth year": "سنة الميلاد غير صحيحة.", "err:Please accept to receive SMS about this appointment": "يرجى الموافقة على استلام رسائل الموعد.",
  "err:Please choose a time slot": "يرجى اختيار موعد.", "err:This time slot is no longer available": "حُجز هذا الموعد للتو. اختر موعدا آخر.",
  "err:You already have 2 upcoming appointments": "لديك موعدان قادمان بالفعل.", "err:No appointment matches this reference and phone number": "لا يوجد موعد بهذا المرجع وهذا الرقم.",
  "err:This appointment can no longer be cancelled": "لم يعد ممكنا إلغاء هذا الموعد.", "err:Less than 2 hours before the appointment: please call the clinic": "أقل من ساعتين قبل الموعد: اتصل بالاستقبال.",
  "err:Appointment not found": "الموعد غير موجود.", "err:Wrong email or password": "البريد الإلكتروني أو كلمة المرور غير صحيحة.", "err:Please sign in": "يرجى تسجيل الدخول.",
  "err:Your account can't do this": "لا يملك حسابك صلاحية هذا الإجراء.", "err:Invalid date": "تاريخ غير صحيح.", "err:This appointment is cancelled": "هذا الموعد ملغى.",
  "err:Invalid status": "حالة غير صحيحة.", "err:This appointment is not today yet": "هذا الموعد ليس اليوم بعد.", "err:The end must be after the start": "يجب أن تكون النهاية بعد البداية.",
  "err:Patient not found": "المريض غير موجود.", "err:Invalid JSON": "طلب غير صالح.",
};

const en = {
  brandSub: "Medical center", menu: "Menu", language: "Language", navBook: "Book", navManage: "My appointment", navAgenda: "Agenda", patients: "Patients", stats: "Statistics",
  staffSpace: "Staff", signIn: "Sign in", signOut: "Sign out", roleReception: "Reception", roleDoctor: "Doctor", reset: "Reset",
  demoTag: "Demo", demoText: "The real PHP back end runs in your browser (WebAssembly).", resetConfirm: "Reset the demo? Added appointments will be erased.",
  footer: "El Amel medical center · Constantine · Demo project",
  bootTitle: "Starting the PHP server…", bootLead: "This site runs its PHP API right in your browser, with a SQLite database.",
  boot_runtime: "PHP 8.3 (WebAssembly)", boot_app: "Application code", boot_data: "Database and agenda",
  bootHint: "A few seconds on the first visit.", bootFailed: "Startup failed. Check your connection and reload the page.",
  heroEyebrow: "El Amel medical center · Constantine", heroTitle: "Book your appointment in two minutes, any time.",
  heroLead: "A general practitioner, a dentist and a pediatrician in one place. Pick a free slot and get the confirmation by SMS.",
  heroPoint1: "Slots updated in real time", heroPoint2: "SMS reminder the day before", heroPoint3: "Cancel online up to 2 hours before",
  manageMine: "Manage my appointment", chooseDoctor: "Choose your doctor", nextFree: "Next free slot", todayAt: "Today · {time}", noSlot14: "No free slot in the next 14 days",
  ourTeam: "Our team", book: "Book an appointment", address: "Address", addressText: "Cité Daksi, Constantine (next to the pharmacy)", openingHours: "Opening hours",
  openingText: "Saturday – Thursday · closed on Friday", reception: "Reception",
  allDoctors: "All doctors", reason: "Reason", when: "Date and time", price: "Fee", payAtClinic: "paid at the clinic",
  step1: "Reason", step2: "Time", step3: "Your details", step1Title: "What is the reason for your visit?", step2Title: "Choose a time", step3Title: "Your details",
  earlier: "Earlier", later: "Later", slotsN: "{n} slots", closedShort: "Closed", morning: "Morning", afternoon: "Afternoon",
  patientName: "Patient's full name", mobile: "Mobile number", birthYear: "Year of birth", emailOptional: "Email (optional)", smsLang: "SMS language",
  consent: "I agree to receive confirmation and reminder SMS for this appointment.", sending: "Sending…", confirmBooking: "Confirm the {time} appointment",
  myAppointment: "My appointment", enterPhone: "To see appointment {ref}, enter the phone number used to book it.", show: "Show",
  bookedDone: "Appointment confirmed! A confirmation SMS has been sent.", doctor: "Doctor", patient: "Patient", where: "Where", reference: "Reference",
  smsInfo: "You'll get a reminder SMS the day before.", addCalendar: "Add to calendar", print: "Print", cancelAppt: "Cancel appointment",
  cancelConfirm: "Cancel this appointment? The slot will be offered to other patients.", lateCancel: "Less than 2 hours before: call the reception to cancel.", bookAnother: "Book another appointment",
  fromThisPhone: "Booked from this phone", findByRef: "Find an appointment",
  status_booked: "Booked", status_arrived: "Arrived", status_done: "Seen", status_no_show: "No-show", status_cancelled: "Cancelled",
  staffLead: "Reception and doctors of the center.", email: "Email", password: "Password", demoAccounts: "Demo accounts:",
  previousDay: "Previous day", nextDay: "Next day", today: "Today", chooseDate: "Choose a date", appointments: "appointments",
  newAppt: "New appointment", walkIn: "Walk-in", blockTime: "Block time", blocked: "Blocked", remove: "Remove", close: "Close",
  yearsOld: "{n} years old", time: "Time", source: "Booked", source_online: "Online", source_phone: "By phone", source_walk_in: "Walk-in",
  markArrived: "Arrived", markDone: "Seen", markNoShow: "No-show", note: "Note", notePlaceholder: "Visible to the team only", saveNote: "Save note", noteSaved: "Note saved",
  history: "History", cancelConfirmStaff: "Cancel this appointment? The patient will get an SMS.", noSlotDay: "No free slot that day.", save: "Save",
  who: "For", wholeClinic: "The whole center", allDay: "All day", from: "From", to: "To", reasonBlock: "Reason", reasonPlaceholder: "Leave, training, meeting…", block: "Block",
  toCall: "{n} patient(s) already booked in that period: remember to call them.", ok: "OK", removeBlock: "Remove this block?",
  searchPatient: "Name or phone…", visitsN: "{n} visit(s)", noShowsN: "{n} no-show(s)", noResults: "No results.", bornIn: "born in {y}", patientSince: "patient since {d}", pickPatient: "Pick a patient to see their history.",
  lastNDays: "last {n} days", noShowRate: "no-show rate", onlineShare: "booked online", perDay: "Appointments per day", occupancy: "Agenda occupancy", appointmentsN: "{n} appointments",
  smsTitle: "SMS sent", smsLead: "Confirmations, reminders and cancellations sent to patients.", sendReminders: "Send tomorrow's reminders", remindersSent: "{n} reminder(s) sent for tomorrow.",
  sms_confirm: "Confirmation", sms_reminder: "Reminder", sms_cancel: "Cancellation", noSms: "No SMS yet.",
};

const STRINGS = { fr, ar, en };

function initial() {
  const q = new URLSearchParams(location.search).get("lang");
  if (STRINGS[q]) return q;
  try { if (STRINGS[localStorage.getItem(KEY)]) return localStorage.getItem(KEY); } catch { /* storage unavailable */ }
  return "fr";
}

export const i18n = reactive({ lang: initial() });
function apply() {
  document.documentElement.lang = i18n.lang;
  document.documentElement.dir = i18n.lang === "ar" ? "rtl" : "ltr";
}
apply();

export function setLang(l) {
  i18n.lang = l;
  try { localStorage.setItem(KEY, l); } catch { /* storage unavailable */ }
  apply();
}
export const t = (key, vars = {}) => (STRINGS[i18n.lang][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? "");
export const tr = (obj) => (obj ? obj[i18n.lang] || obj.fr || obj.en || "" : "");
export const errMsg = (e) => STRINGS[i18n.lang]["err:" + e?.message] ?? e?.message ?? "Error";
