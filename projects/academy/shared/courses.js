// The academy's courses. Titles and summaries are in the three site languages;
// lessons and quizzes are in the language the course is taught in (`language`).
// Lesson content uses a small markdown subset: paragraphs, "- " lists, **bold**, `code` and ``` blocks.

export const CATEGORIES = ["dev", "lang", "office", "business", "school"];
export const LEVELS = ["beginner", "intermediate", "advanced"];

export const COURSES = [
  {
    slug: "web-dev",
    title: { fr: "Développement web : HTML, CSS & JavaScript", ar: "تطوير الويب: HTML وCSS وJavaScript", en: "Web development: HTML, CSS & JavaScript" },
    summary: {
      fr: "Créez vos premières pages web et rendez-les interactives, jusqu'à la page vitrine d'un vrai commerce.",
      ar: "أنشئ أولى صفحاتك على الويب واجعلها تفاعلية، وصولا إلى صفحة عرض لمحل حقيقي.",
      en: "Build your first web pages and make them interactive, up to a showcase page for a real shop.",
    },
    category: "dev", level: "beginner", language: "fr", teacher: "yacine@cirta-academy.dz",
    priceDA: 18000, hours: 36, format: "hybrid", days: ["sat", "tue"], time: "18:00–20:00", start: "2026-11-07", seats: 18,
    color: "#3b5bdb",
    outcomes: ["Structurer une page avec HTML sémantique", "Mettre en page avec Flexbox", "Écrire du JavaScript simple", "Publier un site en ligne"],
    lessons: [
      { id: "l1", title: "Comment fonctionne le web", minutes: 25, content: "Quand vous tapez une adresse, votre navigateur envoie une **requête** à un serveur, qui répond avec des fichiers : HTML, CSS, JavaScript et images.\n\n- **HTML** décrit le contenu et sa structure\n- **CSS** décrit l'apparence\n- **JavaScript** ajoute le comportement\n\nLe navigateur assemble ces trois couches pour afficher la page. Ouvrez les outils de développement (touche F12) sur n'importe quel site et regardez l'onglet *Réseau* : chaque ligne est un fichier demandé au serveur." },
      { id: "l2", title: "HTML : structurer une page", minutes: 40, content: "Une page HTML est un arbre de balises. Utilisez des balises qui ont du sens : on parle de HTML **sémantique**.\n\n```\n<header>\n  <h1>Boulangerie El Djazair</h1>\n</header>\n<main>\n  <section>\n    <h2>Nos pains</h2>\n    <p>Pain maison cuit chaque matin.</p>\n  </section>\n</main>\n```\n\n- Un seul `h1` par page\n- Des titres dans l'ordre : `h2`, puis `h3`\n- Un `alt` sur chaque image, pour les lecteurs d'écran" },
      { id: "l3", title: "CSS : mise en page avec Flexbox", minutes: 45, content: "Flexbox place des éléments sur une ligne ou une colonne et gère l'espace entre eux.\n\n```\n.cartes {\n  display: flex;\n  gap: 16px;\n  flex-wrap: wrap;\n}\n.carte { flex: 1 1 220px; }\n```\n\nAvec `flex-wrap: wrap`, les cartes passent à la ligne sur un téléphone : votre page devient **responsive** sans media query." },
      { id: "l4", title: "JavaScript : variables et fonctions", minutes: 45, content: "Une variable garde une valeur, une fonction regroupe des instructions réutilisables.\n\n```\nconst prix = 1200;\nfunction avecLivraison(montant) {\n  return montant + 400;\n}\nconsole.log(avecLivraison(prix)); // 1600\n```\n\nUtilisez `const` par défaut et `let` seulement quand la valeur doit changer." },
      { id: "l5", title: "Manipuler le DOM", minutes: 50, content: "Le DOM est la page vue par JavaScript. On peut lire et modifier n'importe quel élément.\n\n```\nconst bouton = document.querySelector('#commander');\nbouton.addEventListener('click', () => {\n  bouton.textContent = 'Merci !';\n});\n```\n\n- `querySelector` trouve un élément\n- `addEventListener` réagit à un clic, une saisie…\n- `textContent` change le texte" },
      { id: "l6", title: "Projet : page vitrine d'un commerce", minutes: 90, content: "Choisissez un commerce de votre quartier et construisez sa page :\n\n- un en-tête avec le nom et un slogan\n- trois produits en cartes Flexbox\n- un bouton qui affiche le numéro de téléphone au clic\n- une carte Google Maps intégrée\n\nPubliez ensuite la page gratuitement sur **GitHub Pages** et envoyez le lien à votre formateur." },
    ],
    quiz: {
      passMark: 60,
      questions: [
        { id: "q1", q: "Quelle couche décrit l'apparence d'une page ?", options: ["HTML", "CSS", "JavaScript", "HTTP"], answer: 1, explain: "Le CSS gère les couleurs, les polices et la mise en page." },
        { id: "q2", q: "Combien de balises h1 une page devrait-elle avoir ?", options: ["Aucune", "Une seule", "Une par section", "Autant que nécessaire"], answer: 1, explain: "Un seul h1, qui résume la page." },
        { id: "q3", q: "Quelle propriété fait passer les éléments flex à la ligne ?", options: ["flex-wrap: wrap", "display: block", "gap: 16px", "align-items: center"], answer: 0, explain: "flex-wrap: wrap autorise le retour à la ligne." },
        { id: "q4", q: "Que retourne avecLivraison(1000) si la fonction ajoute 400 ?", options: ["1000", "400", "1400", "\"1000400\""], answer: 2, explain: "1000 + 400 = 1400." },
        { id: "q5", q: "Quelle méthode réagit à un clic ?", options: ["querySelector", "addEventListener", "textContent", "console.log"], answer: 1, explain: "addEventListener('click', …) exécute une fonction au clic." },
      ],
    },
  },
  {
    slug: "python",
    title: { fr: "Python pour débutants", ar: "بايثون للمبتدئين", en: "Python for beginners" },
    summary: {
      fr: "Apprenez à programmer avec Python : logique, listes, fichiers, et un petit outil de gestion de stock.",
      ar: "تعلم البرمجة بلغة بايثون: المنطق والقوائم والملفات، وأداة صغيرة لتسيير المخزون.",
      en: "Learn to program with Python: logic, lists, files, and a small stock management tool.",
    },
    category: "dev", level: "beginner", language: "fr", teacher: "yacine@cirta-academy.dz",
    priceDA: 15000, hours: 30, format: "online", days: ["sun", "wed"], time: "19:00–21:00", start: "2026-11-08", seats: 25,
    color: "#2b8a3e",
    outcomes: ["Écrire des programmes Python simples", "Utiliser listes et dictionnaires", "Lire et écrire des fichiers CSV", "Découper un problème en fonctions"],
    lessons: [
      { id: "l1", title: "Premiers pas : variables et types", minutes: 35, content: "Python lit votre programme ligne par ligne.\n\n```\nnom = \"Amine\"\nage = 21\nprint(f\"{nom} a {age} ans\")\n```\n\n- `str` pour le texte\n- `int` et `float` pour les nombres\n- `bool` pour vrai / faux" },
      { id: "l2", title: "Conditions et boucles", minutes: 45, content: "Les conditions choisissent un chemin, les boucles répètent.\n\n```\nfor note in [12, 8, 15]:\n    if note >= 10:\n        print(note, \"admis\")\n    else:\n        print(note, \"rattrapage\")\n```\n\nEn Python, l'**indentation** fait partie de la syntaxe : 4 espaces par niveau." },
      { id: "l3", title: "Listes et dictionnaires", minutes: 45, content: "Une liste garde des éléments dans l'ordre, un dictionnaire associe une clé à une valeur.\n\n```\nstock = {\"lait\": 24, \"pain\": 60}\nstock[\"lait\"] -= 2\nprint(stock)\n```\n\nLes dictionnaires sont parfaits pour représenter un produit, un client ou une commande." },
      { id: "l4", title: "Fonctions", minutes: 40, content: "Une fonction porte un nom clair et fait une seule chose.\n\n```\ndef total(prix, quantite):\n    return prix * quantite\n\nprint(total(150, 3))  # 450\n```\n\nSi une fonction dépasse 20 lignes, demandez-vous si elle ne fait pas deux choses." },
      { id: "l5", title: "Projet : gestion de stock en CSV", minutes: 80, content: "Écrivez un programme qui :\n\n- lit `stock.csv` avec le module `csv`\n- affiche les produits sous 10 unités\n- enregistre une vente et met le fichier à jour\n\nBonus : calculez la valeur totale du stock." },
    ],
    quiz: {
      passMark: 60,
      questions: [
        { id: "q1", q: "Quel type a la valeur 3.5 ?", options: ["int", "float", "str", "bool"], answer: 1, explain: "Un nombre à virgule est un float." },
        { id: "q2", q: "Qu'est-ce qui délimite un bloc en Python ?", options: ["Les accolades", "L'indentation", "Les parenthèses", "Le mot end"], answer: 1, explain: "Python utilise l'indentation." },
        { id: "q3", q: "Comment lire la valeur de la clé \"lait\" ?", options: ["stock(lait)", "stock[\"lait\"]", "stock.lait()", "stock{lait}"], answer: 1, explain: "On accède à un dictionnaire avec des crochets." },
        { id: "q4", q: "Que renvoie total(150, 3) ?", options: ["153", "450", "1503", "None"], answer: 1, explain: "150 × 3 = 450." },
        { id: "q5", q: "Quel module lit un fichier CSV ?", options: ["os", "csv", "math", "json"], answer: 1, explain: "Le module csv de la bibliothèque standard." },
      ],
    },
  },
  {
    slug: "business-english",
    title: { fr: "Anglais professionnel (niveau B1)", ar: "الإنجليزية المهنية (مستوى B1)", en: "Business English (B1 level)" },
    summary: {
      fr: "Gagnez en aisance à l'oral et à l'écrit : e-mails, réunions, appels et entretiens d'embauche.",
      ar: "اكتسب الثقة في التحدث والكتابة: الرسائل والاجتماعات والمكالمات ومقابلات العمل.",
      en: "Speak and write with confidence: emails, meetings, phone calls and job interviews.",
    },
    category: "lang", level: "intermediate", language: "en", teacher: "nadia@cirta-academy.dz",
    priceDA: 12000, hours: 24, format: "onsite", days: ["mon", "thu"], time: "17:30–19:00", start: "2026-11-09", seats: 14,
    color: "#c2255c",
    outcomes: ["Write clear professional emails", "Take part in a meeting", "Handle a phone call", "Present yourself in an interview"],
    lessons: [
      { id: "l1", title: "Writing a professional email", minutes: 35, content: "A good email has one goal and a clear subject line.\n\n- **Subject:** say what you need (\"Quote request: 200 printed flyers\")\n- **Opening:** \"Dear Ms Haddad,\" or \"Hello Karim,\"\n- **Body:** one short paragraph per idea\n- **Closing:** \"Best regards,\" followed by your name and role\n\nRead it once out loud before you press send." },
      { id: "l2", title: "Meetings: useful phrases", minutes: 40, content: "You don't need perfect grammar to take part in a meeting, you need the right phrases.\n\n- To give an opinion: \"In my view…\", \"I'd suggest…\"\n- To agree: \"That's a good point.\"\n- To disagree politely: \"I see it a bit differently.\"\n- To check: \"Just to make sure I understand…\"" },
      { id: "l3", title: "On the phone", minutes: 30, content: "Phone calls are harder because you can't see the other person.\n\n- \"Could you speak a little more slowly, please?\"\n- \"Could you spell that for me?\"\n- \"Let me read that back to you.\"\n\nAlways end by confirming the next step and the date." },
      { id: "l4", title: "Job interviews", minutes: 45, content: "Prepare three short stories about your work using the **STAR** method: Situation, Task, Action, Result.\n\nPractise answers to:\n\n- \"Tell me about yourself.\"\n- \"Why do you want this job?\"\n- \"Describe a problem you solved.\"\n\nFinish with one question of your own about the team or the role." },
    ],
    quiz: {
      passMark: 60,
      questions: [
        { id: "q1", q: "Which subject line is the most useful?", options: ["Hello", "Question", "Quote request: 200 printed flyers", "Urgent!!!"], answer: 2, explain: "It says exactly what the email is about." },
        { id: "q2", q: "Which phrase disagrees politely?", options: ["You're wrong.", "I see it a bit differently.", "No way.", "That's a good point."], answer: 1, explain: "It disagrees without attacking the person." },
        { id: "q3", q: "What does the R in STAR stand for?", options: ["Reason", "Role", "Result", "Review"], answer: 2, explain: "Situation, Task, Action, Result." },
        { id: "q4", q: "What should you do at the end of a phone call?", options: ["Hang up quickly", "Confirm the next step", "Ask for their age", "Repeat your name"], answer: 1, explain: "Confirm what happens next and when." },
      ],
    },
  },
  {
    slug: "digital-marketing",
    title: { fr: "Marketing digital pour petits commerces", ar: "التسويق الرقمي للمحلات الصغيرة", en: "Digital marketing for small shops" },
    summary: {
      fr: "Instagram, Facebook et WhatsApp Business : attirez des clients avec un petit budget et mesurez vos résultats.",
      ar: "إنستغرام وفيسبوك وواتساب للأعمال: اجذب الزبائن بميزانية صغيرة وقس نتائجك.",
      en: "Instagram, Facebook and WhatsApp Business: win customers on a small budget and measure your results.",
    },
    category: "business", level: "beginner", language: "fr", teacher: "nadia@cirta-academy.dz",
    priceDA: 14000, hours: 20, format: "hybrid", days: ["sat"], time: "10:00–13:00", start: "2026-11-14", seats: 20,
    color: "#e8590c",
    outcomes: ["Définir sa cible et son message", "Planifier un mois de publications", "Lancer une petite publicité", "Lire les statistiques Meta"],
    lessons: [
      { id: "l1", title: "Votre client idéal", minutes: 30, content: "Avant de publier, décrivez votre client en trois lignes : qui il est, ce qu'il cherche, ce qui l'empêche d'acheter.\n\n- *Qui :* étudiantes de 18 à 25 ans à Constantine\n- *Besoin :* des vêtements tendance à petit prix\n- *Frein :* peur de la taille qui ne va pas\n\nChaque publication doit répondre à ce frein." },
      { id: "l2", title: "Un mois de contenu en une heure", minutes: 45, content: "Utilisez trois piliers de contenu et alternez-les :\n\n- **Montrer** le produit (photo, vidéo courte)\n- **Rassurer** (avis clients, coulisses, livraison)\n- **Engager** (sondage, question en story)\n\nPréparez 12 publications d'un coup dans Canva, puis programmez-les avec Meta Business Suite." },
      { id: "l3", title: "WhatsApp Business", minutes: 30, content: "Configurez un message d'accueil, des réponses rapides et un catalogue.\n\nUne bonne réponse rapide donne le prix, le délai de livraison et la prochaine étape : « Le modèle est à 2 500 DA, livraison 48 h à Constantine. Quelle taille vous faut-il ? »" },
      { id: "l4", title: "Mesurer ce qui marche", minutes: 35, content: "Notez chaque semaine dans un tableau : portée, visites du profil, messages reçus, commandes.\n\nComparez à la semaine précédente, gardez le format qui a le mieux marché et abandonnez celui qui a le moins marché. Ne jugez pas une publication sur les *likes* seuls." },
    ],
    quiz: {
      passMark: 60,
      questions: [
        { id: "q1", q: "Quel pilier contient les avis clients ?", options: ["Montrer", "Rassurer", "Engager", "Vendre"], answer: 1, explain: "Les avis rassurent un client qui hésite." },
        { id: "q2", q: "Quel outil gratuit programme vos publications ?", options: ["Meta Business Suite", "Excel", "Google Maps", "CapCut"], answer: 0, explain: "Meta Business Suite programme sur Facebook et Instagram." },
        { id: "q3", q: "Que doit contenir une réponse rapide WhatsApp ?", options: ["Seulement « Bonjour »", "Prix, délai et prochaine étape", "Un long texte", "Un lien vers TikTok"], answer: 1, explain: "Le client doit savoir quoi faire ensuite." },
        { id: "q4", q: "Quel indicateur est le moins fiable seul ?", options: ["Messages reçus", "Commandes", "Likes", "Visites du profil"], answer: 2, explain: "Un like ne dit pas si la personne va acheter." },
      ],
    },
  },
  {
    slug: "excel",
    title: { fr: "Excel & bureautique pour l'entreprise", ar: "إكسل والمكتبية للمؤسسات", en: "Excel & office skills for business" },
    summary: {
      fr: "Formules, tableaux croisés dynamiques et tableaux de bord : gagnez des heures chaque semaine.",
      ar: "الصيغ والجداول المحورية ولوحات المتابعة: وفّر ساعات من العمل كل أسبوع.",
      en: "Formulas, pivot tables and dashboards: save hours of work every week.",
    },
    category: "office", level: "intermediate", language: "ar", teacher: "karim@cirta-academy.dz",
    priceDA: 10000, hours: 18, format: "onsite", days: ["sun", "tue"], time: "16:00–18:00", start: "2026-11-08", seats: 16,
    color: "#087f5b",
    outcomes: ["كتابة الصيغ الأساسية دون أخطاء", "تنظيم البيانات في جداول", "إنشاء جدول محوري", "تصميم لوحة متابعة بسيطة"],
    lessons: [
      { id: "l1", title: "الصيغ الأساسية", minutes: 35, content: "كل صيغة تبدأ بعلامة `=`.\n\n```\n=SUM(B2:B20)\n=AVERAGE(C2:C20)\n=IF(D2>=10;\"ناجح\";\"راسب\")\n```\n\n- استعمل `$` لتثبيت خلية عند نسخ الصيغة: `$B$1`\n- اكتب أسماء أعمدة واضحة في السطر الأول" },
      { id: "l2", title: "تنظيم البيانات في جدول", minutes: 30, content: "حوّل بياناتك إلى **جدول** (Ctrl + T): تتوسع الصيغ تلقائيا وتظهر أزرار التصفية.\n\n- سطر واحد لكل عملية\n- عمود واحد لكل معلومة\n- لا خلايا مدمجة داخل البيانات" },
      { id: "l3", title: "الجداول المحورية", minutes: 45, content: "الجدول المحوري يلخص آلاف الأسطر في ثوان.\n\nمثال: مبيعات حسب الولاية وحسب الشهر. ضع **الولاية** في الأسطر، و**الشهر** في الأعمدة، و**المبلغ** في القيم.\n\nحدّث الجدول بعد إضافة بيانات جديدة بالزر *تحديث*." },
      { id: "l4", title: "لوحة متابعة بسيطة", minutes: 50, content: "اجمع في ورقة واحدة: ثلاثة أرقام رئيسية، ومنحنى للمبيعات، وجدولا لأفضل خمسة منتجات.\n\nاستعمل ألوانا قليلة، وضع أهم رقم في الأعلى على اليمين حيث تبدأ العين بالقراءة." },
    ],
    quiz: {
      passMark: 60,
      questions: [
        { id: "q1", q: "بأي علامة تبدأ كل صيغة؟", options: ["#", "=", "+", "@"], answer: 1, explain: "كل صيغة في إكسل تبدأ بعلامة =." },
        { id: "q2", q: "ما الذي يثبت الخلية عند نسخ الصيغة؟", options: ["$B$1", "B1!", "(B1)", "#B1"], answer: 0, explain: "علامة $ تثبت العمود والسطر." },
        { id: "q3", q: "ما اختصار تحويل البيانات إلى جدول؟", options: ["Ctrl + S", "Ctrl + T", "Ctrl + P", "Alt + F4"], answer: 1, explain: "Ctrl + T ينشئ جدولا." },
        { id: "q4", q: "ماذا نضع في منطقة القيم في الجدول المحوري؟", options: ["الولاية", "الشهر", "المبلغ", "اسم الزبون"], answer: 2, explain: "القيم هي الأرقام التي نريد جمعها." },
      ],
    },
  },
  {
    slug: "bac-maths",
    title: { fr: "Préparation au Bac : Mathématiques", ar: "التحضير للبكالوريا: الرياضيات", en: "Baccalaureate prep: Mathematics" },
    summary: {
      fr: "Révision des chapitres clés du Bac scientifique avec méthodes, exercices types et sujets corrigés.",
      ar: "مراجعة الفصول الأساسية لبكالوريا الشعب العلمية مع الطرق والتمارين النموذجية والمواضيع المصححة.",
      en: "Review of the key chapters of the science Baccalaureate, with methods, typical exercises and solved papers.",
    },
    category: "school", level: "advanced", language: "ar", teacher: "karim@cirta-academy.dz",
    priceDA: 8000, hours: 40, format: "onsite", days: ["fri", "sat"], time: "09:00–11:00", start: "2026-11-06", seats: 24,
    color: "#5f3dc4",
    outcomes: ["دراسة دالة كاملة", "حساب النهايات والمشتقات", "حل المتتاليات العددية", "إدارة الوقت يوم الامتحان"],
    lessons: [
      { id: "l1", title: "النهايات", minutes: 50, content: "لحساب نهاية عند اللانهاية لدالة كثيرة حدود، نأخذ الحد الأعلى درجة.\n\n```\nlim (2x³ − 5x + 1) = lim 2x³ = +∞   عندما x → +∞\n```\n\nفي حالة عدم التعيين ∞/∞ نخرج الحد الأعلى درجة عاملا مشتركا في البسط والمقام." },
      { id: "l2", title: "الاشتقاق ودراسة التغيرات", minutes: 55, content: "إشارة المشتقة تعطي اتجاه تغير الدالة:\n\n- f′(x) > 0: الدالة متزايدة\n- f′(x) < 0: الدالة متناقصة\n- f′(x) = 0 مع تغير الإشارة: قيمة حدية\n\nلخّص النتائج دائما في **جدول التغيرات**." },
      { id: "l3", title: "المتتاليات العددية", minutes: 50, content: "المتتالية الحسابية: uₙ₊₁ = uₙ + r، والهندسية: uₙ₊₁ = q × uₙ.\n\n- الحد العام للحسابية: uₙ = u₀ + n·r\n- الحد العام للهندسية: uₙ = u₀ · qⁿ\n\nلإثبات أن متتالية هندسية، احسب uₙ₊₁ / uₙ وبيّن أنه ثابت." },
      { id: "l4", title: "الدالة الأسية واللوغاريتمية", minutes: 55, content: "تذكر الخواص الأساسية:\n\n- eᵃ · eᵇ = eᵃ⁺ᵇ\n- ln(a·b) = ln a + ln b\n- ln(eˣ) = x\n\nالدالة الأسية موجبة تماما ومتزايدة على ℝ." },
      { id: "l5", title: "منهجية يوم الامتحان", minutes: 30, content: "اقرأ الموضوع كاملا في أول عشر دقائق، وابدأ بالتمرين الذي تتقنه أكثر.\n\n- اترك سطرا بين الأسئلة\n- اكتب النتيجة في إطار\n- خصص 15 دقيقة في النهاية للمراجعة" },
    ],
    quiz: {
      passMark: 60,
      questions: [
        { id: "q1", q: "إذا كانت f′(x) > 0 على مجال، فإن f:", options: ["متناقصة", "متزايدة", "ثابتة", "غير معرفة"], answer: 1, explain: "المشتقة الموجبة تعني دالة متزايدة." },
        { id: "q2", q: "الحد العام لمتتالية حسابية هو:", options: ["u₀ · qⁿ", "u₀ + n·r", "n² + r", "u₀ / n"], answer: 1, explain: "uₙ = u₀ + n·r." },
        { id: "q3", q: "ln(a·b) يساوي:", options: ["ln a · ln b", "ln a + ln b", "ln a − ln b", "a · ln b"], answer: 1, explain: "اللوغاريتم يحول الجداء إلى مجموع." },
        { id: "q4", q: "نهاية 2x³ − 5x + 1 عندما x → +∞ هي:", options: ["0", "1", "−∞", "+∞"], answer: 3, explain: "الحد الأعلى درجة 2x³ يؤول إلى +∞." },
        { id: "q5", q: "كم دقيقة تخصص للمراجعة في نهاية الامتحان؟", options: ["0", "5", "15", "60"], answer: 2, explain: "حوالي 15 دقيقة لإعادة قراءة الأجوبة." },
      ],
    },
  },
];
