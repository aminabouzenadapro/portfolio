import '../i18n.dart';

class Category {
  final String id;
  final L10n name;
  const Category(this.id, this.name);
}

class Dish {
  final String id;
  final String category;
  final L10n name;
  final L10n description;
  final int price; // DA
  final int prepMinutes;
  final Set<String> tags; // spicy, veg, house

  const Dish({
    required this.id,
    required this.category,
    required this.name,
    required this.description,
    required this.price,
    required this.prepMinutes,
    this.tags = const {},
  });

  String get image => 'assets/dishes/$id.jpg';
}

const categories = [
  Category('starters', L10n('Entrées', 'المقبلات', 'Starters')),
  Category('mains', L10n('Plats', 'الأطباق الرئيسية', 'Mains')),
  Category('street', L10n('Street food', 'أكلات الشارع', 'Street food')),
  Category('desserts', L10n('Desserts', 'الحلويات', 'Desserts')),
  Category('drinks', L10n('Boissons', 'المشروبات', 'Drinks')),
];

const dishes = <Dish>[
  Dish(
    id: 'chorba', category: 'starters', price: 350, prepMinutes: 5, tags: {'house'},
    name: L10n('Chorba frik', 'شوربة فريك', 'Chorba frik'),
    description: L10n('Soupe de blé vert concassé, agneau, tomate et coriandre fraîche.', 'شوربة بالفريك ولحم الخروف والطماطم والكسبر الطازج.', 'Cracked green wheat soup with lamb, tomato and fresh coriander.'),
  ),
  Dish(
    id: 'bourek', category: 'starters', price: 300, prepMinutes: 8,
    name: L10n('Bourek à la viande (x3)', 'بوراك باللحم (3 قطع)', 'Meat bourek (x3)'),
    description: L10n('Feuilles de dioul croustillantes farcies à la viande hachée et au fromage.', 'أوراق ديول مقرمشة محشوة باللحم المفروم والجبن.', 'Crispy dioul pastry filled with minced meat and cheese.'),
  ),
  Dish(
    id: 'hmiss', category: 'starters', price: 400, prepMinutes: 5, tags: {'veg', 'spicy'},
    name: L10n('Salade méchouia', 'سلطة مشوية', 'Grilled pepper salad'),
    description: L10n('Poivrons et tomates grillés, ail, huile d\'olive, œuf et olives.', 'فلفل وطماطم مشوية مع الثوم وزيت الزيتون والبيض والزيتون.', 'Grilled peppers and tomatoes, garlic, olive oil, egg and olives.'),
  ),
  Dish(
    id: 'couscous', category: 'mains', price: 1400, prepMinutes: 15, tags: {'house'},
    name: L10n('Couscous aux légumes et agneau', 'كسكس بالخضر ولحم الخروف', 'Couscous with vegetables and lamb'),
    description: L10n('Graine roulée à la main, sauce rouge, sept légumes et agneau fondant.', 'كسكس مفتول باليد، مرق أحمر، سبع خضر ولحم خروف طري.', 'Hand-rolled semolina, red broth, seven vegetables and tender lamb.'),
  ),
  Dish(
    id: 'rechta', category: 'mains', price: 1200, prepMinutes: 15,
    name: L10n('Rechta algéroise', 'رشتة عاصمية', 'Algiers rechta'),
    description: L10n('Fines nouilles maison, sauce blanche au poulet, navets et pois chiches.', 'عجائن رقيقة محضرة في البيت، مرق أبيض بالدجاج واللفت والحمص.', 'Thin homemade noodles, white chicken broth, turnips and chickpeas.'),
  ),
  Dish(
    id: 'chakhchoukha', category: 'mains', price: 1300, prepMinutes: 18, tags: {'spicy'},
    name: L10n('Chakhchoukha de Biskra', 'شخشوخة بسكرية', 'Biskra chakhchoukha'),
    description: L10n('Galette émiettée arrosée d\'une sauce rouge épicée à l\'agneau et aux pois chiches.', 'رقاق مفتت مسقي بمرق أحمر حار بلحم الخروف والحمص.', 'Shredded flatbread soaked in a spicy red lamb and chickpea sauce.'),
  ),
  Dish(
    id: 'tajine-zitoune', category: 'mains', price: 1100, prepMinutes: 14,
    name: L10n('Tajine de kefta', 'طاجين الكفتة', 'Kefta tajine'),
    description: L10n('Boulettes de viande mijotées en sauce tomate épicée, servies avec du pain maison.', 'كريات لحم مطهوة في مرق طماطم متبل، تقدم مع خبز الدار.', 'Meatballs simmered in spiced tomato sauce, served with homemade bread.'),
  ),
  Dish(
    id: 'brochettes', category: 'mains', price: 1500, prepMinutes: 16,
    name: L10n('Brochettes grillées', 'مشاوي على الفحم', 'Charcoal-grilled skewers'),
    description: L10n('Brochettes d\'agneau marinées, grillées au feu de bois, frites et salade.', 'أسياخ لحم خروف متبلة مشوية على الحطب مع البطاطا المقلية والسلطة.', 'Marinated lamb skewers grilled over wood fire, with fries and salad.'),
  ),
  Dish(
    id: 'mhadjeb', category: 'street', price: 150, prepMinutes: 6, tags: {'veg', 'spicy'},
    name: L10n('Mhadjeb', 'المحاجب', 'Mhadjeb'),
    description: L10n('Crêpe feuilletée farcie d\'une sauce tomate et oignon épicée.', 'رقاقة مورقة محشوة بصلصة الطماطم والبصل الحارة.', 'Flaky flatbread filled with spicy tomato and onion sauce.'),
  ),
  Dish(
    id: 'garantita', category: 'street', price: 120, prepMinutes: 4, tags: {'veg'},
    name: L10n('Garantita', 'كرانطيطة', 'Garantita'),
    description: L10n('Flan de pois chiches au cumin, servi chaud dans un pain, harissa en option.', 'كرانطيطة بالحمص والكمون، تقدم ساخنة في الخبز مع الهريسة حسب الرغبة.', 'Chickpea flan with cumin, served hot in bread, harissa on request.'),
  ),
  Dish(
    id: 'makrout', category: 'desserts', price: 250, prepMinutes: 2, tags: {'house'},
    name: L10n('Makrout aux dattes (x3)', 'مقروط بالتمر (3 قطع)', 'Date makrout (x3)'),
    description: L10n('Losanges de semoule fourrés aux dattes et trempés dans le miel.', 'معينات سميد محشوة بالتمر ومغموسة في العسل.', 'Semolina diamonds filled with dates and dipped in honey.'),
  ),
  Dish(
    id: 'zlabia', category: 'desserts', price: 200, prepMinutes: 2,
    name: L10n('Zlabia', 'زلابية', 'Zlabia'),
    description: L10n('Spirales croustillantes frites et nappées de sirop parfumé.', 'لوالب مقرمشة مقلية ومغطاة بشراب معطر.', 'Crispy fried spirals soaked in scented syrup.'),
  ),
  Dish(
    id: 'baklawa', category: 'desserts', price: 300, prepMinutes: 2,
    name: L10n('Baklawa aux amandes', 'بقلاوة باللوز', 'Almond baklawa'),
    description: L10n('Feuilles fines, amandes, eau de fleur d\'oranger et miel.', 'أوراق رقيقة ولوز وماء الزهر والعسل.', 'Thin pastry layers, almonds, orange blossom water and honey.'),
  ),
  Dish(
    id: 'the-menthe', category: 'drinks', price: 150, prepMinutes: 3,
    name: L10n('Thé à la menthe', 'شاي بالنعناع', 'Mint tea'),
    description: L10n('Thé vert infusé à la menthe fraîche, servi bien chaud.', 'شاي أخضر منقوع بالنعناع الطازج، يقدم ساخنا.', 'Green tea brewed with fresh mint, served hot.'),
  ),
  Dish(
    id: 'citronnade', category: 'drinks', price: 200, prepMinutes: 3,
    name: L10n('Citronnade maison', 'عصير الليمون', 'Homemade lemonade'),
    description: L10n('Citrons pressés, menthe et eau de fleur d\'oranger.', 'ليمون معصور ونعناع وماء الزهر.', 'Fresh lemons, mint and orange blossom water.'),
  ),
  Dish(
    id: 'cafe', category: 'drinks', price: 120, prepMinutes: 2,
    name: L10n('Café', 'قهوة', 'Coffee'),
    description: L10n('Café serré, servi avec un carré de chocolat.', 'قهوة مركزة تقدم مع قطعة شوكولاتة.', 'Strong coffee, served with a square of chocolate.'),
  ),
];

final dishById = {for (final d in dishes) d.id: d};

/// Number of tables in the dining room
const tableCount = 8;
