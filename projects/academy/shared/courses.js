import { clip } from "./media.js";

// The atelier's courses. Titles and summaries are in the three site languages;
// lessons and quizzes are in the language the course is taught in (`language`).
// Each lesson has a video and written notes (a small markdown subset: paragraphs,
// "- " lists, **bold**, *italic*, `code`). Lessons marked `free` are open before payment.

export const CATEGORIES = ["basics", "patterns", "traditional", "alterations"];
export const LEVELS = ["beginner", "intermediate", "advanced"];

const TEACHER = "yasmina@atelier-yasmina.dz";

export const COURSES = [
  {
    slug: "bases-couture",
    title: { fr: "Les bases de la couture à la machine", ar: "أساسيات الخياطة بالآلة", en: "Machine sewing basics" },
    summary: {
      fr: "Apprivoisez votre machine, maîtrisez les points essentiels et réalisez vos premières coutures propres et bien finies.",
      ar: "تعرّفي على آلتك، وأتقني الغرز الأساسية، وأنجزي أولى خياطاتك بشكل نظيف ومتقن.",
      en: "Get to know your machine, master the essential stitches and sew your first clean, well-finished seams.",
    },
    category: "basics", level: "beginner", language: "fr", teacher: TEACHER,
    priceDA: 7000, hours: 12, format: "hybrid", days: ["sat"], time: "10:00–12:00", start: "2026-11-07", seats: 30,
    color: "#b8475f",
    outcomes: ["Enfiler et régler sa machine seule", "Coudre droit et en zigzag", "Assembler et repasser une couture", "Faire des finitions propres"],
    lessons: [
      { id: "l1", title: "Connaître sa machine", minutes: 12, free: true, video: clip("machine"),
        content: "Avant de coudre, repérez les parties de la machine :\n\n- le **volant**, qui fait monter et descendre l'aiguille\n- le **pied-de-biche**, qui tient le tissu\n- les **griffes**, qui font avancer le tissu\n- le **sélecteur de point** et la **longueur de point**\n\nCousez toujours lentement au début : la pédale se dose comme un accélérateur." },
      { id: "l2", title: "Enfiler la machine et régler la tension", minutes: 15, video: clip("machine-seam"),
        content: "Suivez les numéros gravés sur la machine pour le fil du haut, puis remontez le fil de la canette en faisant un tour de volant.\n\n- Fils qui bouclent **dessous** : tension du haut trop faible\n- Fils qui bouclent **dessus** : tension du haut trop forte\n\nFaites toujours un essai sur une chute du même tissu." },
      { id: "l3", title: "Le point droit", minutes: 10, video: clip("straight-stitch"),
        content: "Le point droit sert à assembler. Réglez une longueur de **2,5 mm** pour la plupart des tissus.\n\nGardez le bord du tissu sur le repère de 1 cm de la plaque : c'est votre **valeur de couture**. Faites un point arrière au début et à la fin pour bloquer." },
      { id: "l4", title: "Le point zigzag", minutes: 10, video: clip("zigzag-stitch"),
        content: "Le zigzag empêche le tissu de s'effilocher et convient aux tissus extensibles.\n\n- **Largeur** : 3 à 5 mm pour surfiler un bord\n- **Longueur** : 1,5 à 2 mm\n\nPlacez le bord du tissu au milieu du pied pour que l'aiguille pique une fois dans le tissu, une fois dans le vide." },
      { id: "l5", title: "Assembler et repasser une couture", minutes: 20, video: clip("sew-seam"),
        content: "Épinglez endroit contre endroit, épingles perpendiculaires au bord, et retirez-les juste avant le pied.\n\nAprès la couture, repassez **à plat** pour fondre les points, puis ouvrez les valeurs de couture au fer. Une couture bien repassée change tout le rendu du vêtement." },
      { id: "l6", title: "Finitions : surjet et ourlet", minutes: 18, video: clip("overlock"),
        content: "La surjeteuse coud, coupe et surfile en un seul passage. Sans surjeteuse, un zigzag sur le bord fait l'affaire.\n\nPour un ourlet simple : repliez 1 cm, repassez, repliez 2 cm, repassez, puis piquez au point droit près du bord." },
    ],
    quiz: {
      passMark: 60,
      questions: [
        { id: "q1", q: "Quelle pièce tient le tissu pendant la couture ?", options: ["Le volant", "Le pied-de-biche", "La canette", "Le sélecteur"], answer: 1, explain: "Le pied-de-biche appuie sur le tissu pour qu'il avance régulièrement." },
        { id: "q2", q: "Les fils bouclent sous le tissu. Que faire ?", options: ["Baisser la tension du haut", "Augmenter la tension du haut", "Changer de tissu", "Coudre plus vite"], answer: 1, explain: "Des boucles dessous signifient que le fil du haut n'est pas assez tendu." },
        { id: "q3", q: "Quelle longueur de point pour un assemblage classique ?", options: ["0,5 mm", "2,5 mm", "6 mm", "10 mm"], answer: 1, explain: "2,5 mm convient à la plupart des tissus." },
        { id: "q4", q: "À quoi sert le point zigzag sur un bord ?", options: ["À froncer", "À empêcher l'effilochage", "À faire un ourlet invisible", "À broder"], answer: 1, explain: "Le zigzag surfile le bord et l'empêche de s'effilocher." },
        { id: "q5", q: "Comment repasse-t-on une couture ?", options: ["Jamais", "D'abord à plat, puis ouverte", "Seulement sur l'endroit", "À la vapeur sans toucher"], answer: 1, explain: "À plat pour fondre les points, puis valeurs de couture ouvertes." },
      ],
    },
  },
  {
    slug: "patronage",
    title: { fr: "Patronage : mesures et patron de base", ar: "الباترون: المقاسات والنموذج الأساسي", en: "Pattern making: measurements and a basic block" },
    summary: {
      fr: "Prenez des mesures justes, tracez un patron de base du corsage et adaptez-le à chaque cliente.",
      ar: "خذي مقاسات دقيقة، وارسمي النموذج الأساسي للصدرية، وكيّفيه مع كل زبونة.",
      en: "Take accurate measurements, draft a basic bodice block and adapt it to each client.",
    },
    category: "patterns", level: "intermediate", language: "fr", teacher: TEACHER,
    priceDA: 9000, hours: 16, format: "hybrid", days: ["tue"], time: "17:00–19:00", start: "2026-11-10", seats: 20,
    color: "#5f3dc4",
    outcomes: ["Prendre 12 mesures sans erreur", "Tracer un corsage de base", "Placer un patron sur le droit-fil", "Corriger un patron après essayage"],
    lessons: [
      { id: "l1", title: "Les repères du corps", minutes: 10, free: true, video: clip("mannequin"),
        content: "Avant de mesurer, on marque les **lignes de repère** : milieu devant, milieu dos, tour de poitrine, taille et hanches.\n\nSur une cliente, nouez un ruban à la taille : il reste en place pendant toute la prise de mesures." },
      { id: "l2", title: "Prendre les mesures", minutes: 20, video: clip("measure-cut"),
        content: "Mesurez par-dessus des vêtements fins, le mètre ruban ni serré ni lâche.\n\n- **Tour de poitrine**, **tour de taille**, **tour de hanches**\n- **Longueur taille dos** : de la 7e vertèbre à la taille\n- **Carrure** et **longueur d'épaule**\n\nNotez tout sur une fiche à son nom : vous la réutiliserez à chaque commande." },
      { id: "l3", title: "Tracer le patron de base", minutes: 30, video: clip("tailor"),
        content: "Le corsage de base se trace à partir d'un rectangle : largeur = demi-tour de poitrine + aisance, hauteur = longueur taille dos.\n\nPlacez ensuite l'encolure, l'épaule, l'emmanchure et la **pince de poitrine**. Vérifiez que les côtés devant et dos ont la même longueur." },
      { id: "l4", title: "Placer le patron et couper", minutes: 20, video: clip("measure-cut"),
        content: "Le **droit-fil** du patron doit être parallèle à la lisière du tissu. Mesurez aux deux extrémités pour en être sûre.\n\nAjoutez 1 cm de valeur de couture et 3 cm d'ourlet, épinglez, puis coupez en longs coups de ciseaux, sans soulever le tissu." },
      { id: "l5", title: "Essayage et corrections", minutes: 25, video: clip("tailor"),
        content: "Faites un premier essayage sur une toile bon marché.\n\n- Plis horizontaux : le corsage est trop long à cet endroit\n- Tissu qui tire : il manque de l'ampleur\n\nReportez chaque correction sur le patron papier, pas seulement sur la toile." },
    ],
    quiz: {
      passMark: 60,
      questions: [
        { id: "q1", q: "Où se mesure la longueur taille dos ?", options: ["De l'épaule au genou", "De la 7e vertèbre à la taille", "Du cou à la hanche", "Du milieu devant au milieu dos"], answer: 1, explain: "On mesure de la vertèbre saillante du cou jusqu'à la taille." },
        { id: "q2", q: "Le droit-fil du patron doit être :", options: ["En biais", "Perpendiculaire à la lisière", "Parallèle à la lisière", "N'importe comment"], answer: 2, explain: "Parallèle à la lisière, sinon le vêtement vrille." },
        { id: "q3", q: "Quelle valeur de couture ajouter en général ?", options: ["0 cm", "1 cm", "5 cm", "10 cm"], answer: 1, explain: "1 cm est la valeur standard." },
        { id: "q4", q: "Des plis horizontaux à l'essayage indiquent :", options: ["Un manque d'ampleur", "Une longueur en trop", "Un mauvais fil", "Une pince trop courte"], answer: 1, explain: "Le tissu a trop de longueur à cet endroit." },
      ],
    },
  },
  {
    slug: "gandoura",
    title: { fr: "Gandoura d'intérieur : de la coupe à la couture", ar: "قندورة الدار: من القص إلى الخياطة", en: "House gandoura: from cutting to sewing" },
    summary: {
      fr: "Cousez une gandoura confortable de A à Z : choix du tissu, mesures, coupe, assemblage et finitions de l'encolure.",
      ar: "خيطي قندورة مريحة من البداية إلى النهاية: اختيار القماش والمقاسات والقص والتجميع وتشطيب الرقبة.",
      en: "Sew a comfortable gandoura from start to finish: fabric, measurements, cutting, assembly and neckline finish.",
    },
    category: "traditional", level: "beginner", language: "ar", teacher: TEACHER,
    priceDA: 8000, hours: 14, format: "hybrid", days: ["sun", "wed"], time: "14:00–16:00", start: "2026-11-08", seats: 20,
    color: "#087f5b",
    outcomes: ["اختيار القماش المناسب وحساب الكمية", "قص القندورة من المقاسات", "خياطة الجوانب والأكمام", "تشطيب الرقبة والحاشية"],
    lessons: [
      { id: "l1", title: "اختيار القماش وحساب الكمية", minutes: 10, free: true, video: clip("tailor"),
        content: "للقندورة اليومية اختاري قماشا قطنيا أو **فيسكوز** يتنفس ولا يتجعد كثيرا.\n\nالكمية: **مرتان طول القندورة** زائد 30 سم للأكمام، بعرض قماش 1,50 م.\n\nاغسلي القماش وكويه قبل القص لأن بعض الأقمشة تنكمش." },
      { id: "l2", title: "أخذ المقاسات", minutes: 15, video: clip("measure-cut"),
        content: "نحتاج أربعة مقاسات فقط:\n\n- **الطول** من الكتف إلى الكعب\n- **محيط الصدر** و**محيط الأرداف**\n- **طول الكم**\n\nأضيفي 10 إلى 15 سم من الراحة إلى محيط الأرداف لأن القندورة فضفاضة." },
      { id: "l3", title: "القص", minutes: 20, video: clip("measure-cut"),
        content: "اطوي القماش على الطول، وضعي خط الوسط على الطي حتى تخرج الأمامية قطعة واحدة.\n\nارسمي بالطباشير ثم قصي ببطء، واتركي **1 سم** للخياطة في كل الجوانب." },
      { id: "l4", title: "خياطة الجوانب والأكمام", minutes: 25, video: clip("sew-seam"),
        content: "ابدئي بخياطة الأكمام على الكتفين، ثم أغلقي الجانب من طرف الكم إلى أسفل القندورة **في خياطة واحدة**.\n\nاتركي فتحة 20 سم في أسفل الجانبين لسهولة المشي." },
      { id: "l5", title: "تشطيب الرقبة والحاشية", minutes: 20, video: clip("overlock"),
        content: "شطبي حواف الخياطة بالسورجي أو بغرزة زيقزاق.\n\nللرقبة استعملي **شريطا مائلا** (biais) بلون متناسق، وللحاشية اطوي 1 سم ثم 2 سم وخيطي قريبا من الحافة." },
    ],
    quiz: {
      passMark: 60,
      questions: [
        { id: "q1", q: "كم قماشا نحتاج تقريبا لقندورة؟", options: ["نصف الطول", "مرتان الطول + 30 سم", "متر واحد دائما", "ثلاثة أمتار دائما"], answer: 1, explain: "مرتان طول القندورة مع 30 سم للأكمام." },
        { id: "q2", q: "لماذا نغسل القماش قبل القص؟", options: ["ليصبح أنعم فقط", "لأنه قد ينكمش", "لتغيير لونه", "لا داعي لذلك"], answer: 1, explain: "بعض الأقمشة تنكمش بعد الغسلة الأولى." },
        { id: "q3", q: "كم سنتيمترا نترك للخياطة؟", options: ["0", "1", "5", "10"], answer: 1, explain: "نترك 1 سم في كل الجوانب." },
        { id: "q4", q: "بماذا نشطب الرقبة؟", options: ["بشريط مائل", "بالغراء", "بدون تشطيب", "بالدبابيس"], answer: 0, explain: "الشريط المائل يعطي رقبة نظيفة ومرنة." },
      ],
    },
  },
  {
    slug: "medjboud",
    title: { fr: "Broderie medjboud au fil d'or", ar: "طرز المجبود بالخيط الذهبي", en: "Medjboud gold-thread embroidery" },
    summary: {
      fr: "La broderie de la gandoura constantinoise : carton, fil d'or, points de base et entretien d'une pièce brodée.",
      ar: "طرز القندورة القسنطينية: الكرتون والخيط الذهبي والغرز الأساسية والعناية بالقطعة المطرزة.",
      en: "The embroidery of the Constantine gandoura: card templates, gold thread, core stitches and caring for an embroidered piece.",
    },
    category: "traditional", level: "advanced", language: "ar", teacher: TEACHER,
    priceDA: 12000, hours: 24, format: "onsite", days: ["thu"], time: "09:30–12:30", start: "2026-11-12", seats: 16,
    color: "#9c6b12",
    outcomes: ["تحضير الكرتون ونقل الرسم", "التحكم في الخيط الذهبي", "إنجاز غرزة المجبود المتراصة", "العناية بالقطعة المطرزة وحفظها"],
    lessons: [
      { id: "l1", title: "ما هو المجبود؟", minutes: 10, free: true, video: clip("embroidery"),
        content: "المجبود طرز قسنطيني تقليدي بالخيط الذهبي، يُنجز فوق **قطع من الكرتون** تعطي الرسم بروزه.\n\nنجده على القندورة القسنطينية من القطيفة، وعلى أغطية الأعراس والمحافظ." },
      { id: "l2", title: "تحضير الكرتون والرسم", minutes: 25, video: clip("embroidery"),
        content: "انقلي الرسم على ورق، ثم قصي **الكرتون** على شكل كل ورقة أو زهرة.\n\nثبتي قطع الكرتون على القطيفة بغرز صغيرة، وتأكدي أن القماش مشدود جيدا على **المرمة** (الإطار)." },
      { id: "l3", title: "غرزة المجبود", minutes: 35, video: clip("embroidery"),
        content: "يمر الخيط الذهبي **فوق** الكرتون، ويُثبت من الخلف بخيط رفيع قوي.\n\n- اجعلي الخيوط متراصة دون أن تتراكب\n- حافظي على نفس الشد من البداية إلى النهاية\n- ابدئي دائما من وسط الشكل نحو الأطراف" },
      { id: "l4", title: "العناية بالقطعة المطرزة", minutes: 10, video: clip("tailor"),
        content: "لا تغسلي القطعة المطرزة بالذهب في الآلة. نظفيها بفرشاة ناعمة، واحفظيها مطوية في **قماش قطني** بعيدا عن الرطوبة.\n\nلا تكويها أبدا مباشرة على الطرز: ضعي منشفة سميكة تحتها واكويها من الخلف." },
    ],
    quiz: {
      passMark: 60,
      questions: [
        { id: "q1", q: "ما الذي يعطي المجبود بروزه؟", options: ["الغراء", "قطع الكرتون", "القطن", "الخرز"], answer: 1, explain: "الخيط الذهبي يمر فوق قطع الكرتون." },
        { id: "q2", q: "من أين نبدأ طرز الشكل؟", options: ["من الطرف", "من الوسط", "من الأسفل دائما", "لا يهم"], answer: 1, explain: "البدء من الوسط يحافظ على توازن الشكل." },
        { id: "q3", q: "كيف نكوي قطعة مطرزة؟", options: ["مباشرة على الطرز", "من الخلف فوق منشفة", "بالبخار من الأمام", "لا تكوى"], answer: 1, explain: "من الخلف فوق منشفة سميكة لحماية البروز." },
      ],
    },
  },
  {
    slug: "retouches",
    title: { fr: "Retouches : ourlets, cintrage et fermetures", ar: "التعديلات: الحواشي والتضييق والسحابات", en: "Alterations: hems, taking in and zips" },
    summary: {
      fr: "Les retouches les plus demandées en atelier, pour vos vêtements ou pour lancer une petite activité.",
      ar: "أكثر التعديلات طلبا في الورشة، لملابسك أو لبدء نشاط صغير.",
      en: "The alterations clients ask for most, for your own clothes or to start a small business.",
    },
    category: "alterations", level: "beginner", language: "fr", teacher: TEACHER,
    priceDA: 6000, hours: 8, format: "online", days: [], time: "", start: "2026-11-01", seats: 60,
    color: "#1971c2",
    outcomes: ["Raccourcir un pantalon proprement", "Cintrer une robe ou une chemise", "Remplacer une fermeture éclair", "Fixer un prix juste pour une retouche"],
    lessons: [
      { id: "l1", title: "Raccourcir un pantalon", minutes: 15, free: true, video: clip("machine-seam"),
        content: "Faites essayer le pantalon avec les chaussures que la cliente portera. Épinglez l'ourlet, puis vérifiez que les deux jambes ont la même longueur **à plat**.\n\nCoupez en gardant 4 cm, surfilez, repliez et piquez." },
      { id: "l2", title: "Cintrer une robe", minutes: 20, video: clip("sew-seam"),
        content: "Retournez la robe sur l'envers, épinglez l'ampleur à retirer sur les coutures de côté, en dégradé jusqu'à zéro.\n\nFaufilez d'abord et faites essayer : on ne recoupe le tissu qu'une fois la cliente satisfaite." },
      { id: "l3", title: "Remplacer une fermeture éclair", minutes: 25, video: clip("straight-stitch"),
        content: "Décousez l'ancienne fermeture en notant comment elle était posée. Utilisez le **pied pour fermeture** pour coudre au plus près des dents.\n\nCousez un côté de haut en bas, puis l'autre dans le même sens pour éviter les plis." },
      { id: "l4", title: "Fixer ses prix", minutes: 10, video: clip("tailor"),
        content: "Comptez le temps passé, le fil et les fournitures, puis comparez avec les ateliers de votre quartier.\n\nAffichez une liste de prix claire : ourlet simple, ourlet de jean, cintrage, fermeture. Les clientes reviennent quand elles savent à quoi s'attendre." },
    ],
    quiz: {
      passMark: 60,
      questions: [
        { id: "q1", q: "Avec quoi la cliente doit-elle essayer un pantalon à raccourcir ?", options: ["Pieds nus", "Ses chaussures habituelles", "Des pantoufles", "Peu importe"], answer: 1, explain: "La longueur dépend de la hauteur des chaussures." },
        { id: "q2", q: "Quel pied utiliser pour une fermeture éclair ?", options: ["Le pied standard", "Le pied pour fermeture", "Le pied à boutonnière", "Aucun pied"], answer: 1, explain: "Il permet de coudre au plus près des dents." },
        { id: "q3", q: "Quand recoupe-t-on le tissu en cintrant ?", options: ["Tout de suite", "Après l'essayage validé", "Jamais", "Avant de mesurer"], answer: 1, explain: "On faufile, on fait essayer, puis on coupe." },
      ],
    },
  },
];
