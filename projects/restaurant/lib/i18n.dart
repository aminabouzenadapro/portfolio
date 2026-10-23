import 'package:flutter/widgets.dart';

/// App language: French (default), Arabic or English.
enum Lang { fr, ar, en }

/// Current language; widgets listen to it and rebuild on change.
final ValueNotifier<Lang> appLang = ValueNotifier(Lang.fr);

extension LangX on Lang {
  bool get rtl => this == Lang.ar;
  Locale get locale => Locale(name);
  String get label => const {'fr': 'FR', 'ar': 'ع', 'en': 'EN'}[name]!;
}

/// Rebuilds its subtree whenever the language changes (wrap each screen in it).
class LangBuilder extends StatelessWidget {
  final WidgetBuilder builder;
  const LangBuilder({super.key, required this.builder});

  @override
  Widget build(BuildContext context) => ValueListenableBuilder(valueListenable: appLang, builder: (context, _, _) => builder(context));
}

/// A text in the three languages.
class L10n {
  final String fr, ar, en;
  const L10n(this.fr, this.ar, this.en);
  String get text => switch (appLang.value) { Lang.fr => fr, Lang.ar => ar, Lang.en => en };
  @override
  String toString() => text;
}

/// Interface texts. Use `t('key')`, with `{name}` placeholders filled by [vars].
String t(String key, [Map<String, Object> vars = const {}]) {
  var s = (_strings[key] ?? L10n(key, key, key)).text;
  vars.forEach((k, v) => s = s.replaceAll('{$k}', '$v'));
  return s;
}

/// Prices in Algerian dinars: "1 200 DA" / "1 200 د.ج"
String money(int amount) {
  final digits = amount.toString();
  final buf = StringBuffer();
  for (var i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 == 0) buf.write(' ');
    buf.write(digits[i]);
  }
  return appLang.value == Lang.ar ? '$buf د.ج' : '$buf DA';
}

const _strings = <String, L10n>{
  'restaurant': L10n('Dar El Bahdja', 'دار البهجة', 'Dar El Bahdja'),
  'tagline': L10n('Cuisine algéroise traditionnelle · Alger', 'مطبخ عاصمي تقليدي · الجزائر', 'Traditional Algerian cuisine · Algiers'),

  // Launcher
  'launcherTitle': L10n('Commande à table par QR code', 'الطلب من الطاولة عبر رمز QR', 'QR-code table ordering'),
  'launcherText': L10n(
      'Les clients scannent le QR code de leur table, commandent depuis leur téléphone, et la cuisine reçoit la commande en direct.',
      'يمسح الزبائن رمز QR الموجود على طاولتهم، ويطلبون من هواتفهم، وتصل الطلبية إلى المطبخ مباشرة.',
      'Guests scan the QR code on their table, order from their phone, and the kitchen receives the order live.'),
  'openDemo': L10n('Démo en direct', 'عرض مباشر', 'Live demo'),
  'openDemoText': L10n('Le téléphone du client et l\'écran de la cuisine côte à côte', 'هاتف الزبون وشاشة المطبخ جنبا إلى جنب', 'The guest\'s phone and the kitchen screen side by side'),
  'openMenu': L10n('Menu client', 'قائمة الزبون', 'Guest menu'),
  'openMenuText': L10n('Ce que voit le client après avoir scanné la table 5', 'ما يراه الزبون بعد مسح رمز الطاولة 5', 'What a guest sees after scanning table 5'),
  'openKitchen': L10n('Écran cuisine', 'شاشة المطبخ', 'Kitchen screen'),
  'openKitchenText': L10n('Les commandes arrivent en direct, avec minuteurs', 'تصل الطلبات مباشرة مع المؤقتات', 'Orders arrive live, with timers'),
  'openTables': L10n('Tables & QR codes', 'الطاولات ورموز QR', 'Tables & QR codes'),
  'openTablesText': L10n('Un QR code à imprimer pour chaque table', 'رمز QR للطباعة لكل طاولة', 'A printable QR code for every table'),
  'resetDemo': L10n('Réinitialiser la démo', 'إعادة ضبط العرض', 'Reset demo'),
  'demoNote': L10n('Démo : les données restent dans ce navigateur.', 'نسخة تجريبية: تبقى البيانات في هذا المتصفح.', 'Demo: data stays in this browser.'),

  // Menu
  'table': L10n('Table {n}', 'الطاولة {n}', 'Table {n}'),
  'welcome': L10n('Bienvenue ! Choisissez vos plats, nous vous les apportons à table.', 'مرحبا بكم! اختاروا أطباقكم وسنحضرها إلى طاولتكم.', 'Welcome! Choose your dishes and we\'ll bring them to your table.'),
  'add': L10n('Ajouter', 'أضف', 'Add'),
  'addToOrder': L10n('Ajouter · {price}', 'أضف · {price}', 'Add · {price}'),
  'note': L10n('Une remarque ? (ex. sans oignons)', 'ملاحظة؟ (مثال: بدون بصل)', 'Any request? (e.g. no onions)'),
  'viewCart': L10n('Voir ma commande', 'عرض طلبي', 'View my order'),
  'items': L10n('{n} articles', '{n} عناصر', '{n} items'),
  'yourOrder': L10n('Votre commande', 'طلبك', 'Your order'),
  'total': L10n('Total', 'المجموع', 'Total'),
  'sendOrder': L10n('Envoyer à la cuisine', 'إرسال إلى المطبخ', 'Send to the kitchen'),
  'payAtTable': L10n('Vous payez à table, en espèces ou par carte, à la fin du repas.', 'تدفع على الطاولة نقدا أو بالبطاقة في نهاية الوجبة.', 'You pay at the table, cash or card, at the end of your meal.'),
  'emptyCart': L10n('Votre commande est vide.', 'طلبك فارغ.', 'Your order is empty.'),
  'prep': L10n('{n} min', '{n} د', '{n} min'),
  'spicy': L10n('Épicé', 'حار', 'Spicy'),
  'veg': L10n('Végétarien', 'نباتي', 'Vegetarian'),
  'house': L10n('Spécialité', 'تخصص البيت', 'House special'),
  'myOrders': L10n('Mes commandes', 'طلباتي', 'My orders'),

  // Order status
  'orderSent': L10n('Commande envoyée !', 'تم إرسال الطلب!', 'Order sent!'),
  'orderN': L10n('Commande n° {n}', 'الطلب رقم {n}', 'Order #{n}'),
  'status_received': L10n('Reçue', 'مستلمة', 'Received'),
  'status_preparing': L10n('En préparation', 'قيد التحضير', 'Preparing'),
  'status_ready': L10n('Prête', 'جاهزة', 'Ready'),
  'status_served': L10n('Servie', 'قُدّمت', 'Served'),
  'statusHint_received': L10n('La cuisine a bien reçu votre commande.', 'استلم المطبخ طلبك.', 'The kitchen has your order.'),
  'statusHint_preparing': L10n('Nos cuisiniers préparent vos plats.', 'يحضّر طهاتنا أطباقك.', 'Our cooks are preparing your dishes.'),
  'statusHint_ready': L10n('C\'est prêt ! Un serveur vous l\'apporte.', 'جاهز! سيحضره النادل إليك.', 'It\'s ready! A waiter is bringing it.'),
  'statusHint_served': L10n('Bon appétit !', 'بالهناء والشفاء!', 'Enjoy your meal!'),
  'orderMore': L10n('Commander autre chose', 'اطلب شيئا آخر', 'Order something else'),
  'callWaiter': L10n('Appeler un serveur', 'نداء النادل', 'Call a waiter'),
  'askBill': L10n('Demander l\'addition', 'طلب الفاتورة', 'Ask for the bill'),
  'requestSent': L10n('C\'est noté, un serveur arrive.', 'تم، النادل في الطريق.', 'Got it, a waiter is on the way.'),
  'backToMenu': L10n('Retour au menu', 'العودة إلى القائمة', 'Back to menu'),

  // Kitchen
  'kitchen': L10n('Cuisine', 'المطبخ', 'Kitchen'),
  'col_received': L10n('Nouvelles', 'جديدة', 'New'),
  'col_preparing': L10n('En préparation', 'قيد التحضير', 'Preparing'),
  'col_ready': L10n('Prêtes à servir', 'جاهزة للتقديم', 'Ready to serve'),
  'start': L10n('Commencer', 'ابدأ', 'Start'),
  'markReady': L10n('Prête', 'جاهزة', 'Ready'),
  'markServed': L10n('Servie', 'قُدّمت', 'Served'),
  'servedToday': L10n('{n} servies aujourd\'hui', '{n} قُدّمت اليوم', '{n} served today'),
  'ago': L10n('il y a {n} min', 'منذ {n} د', '{n} min ago'),
  'justNow': L10n('à l\'instant', 'الآن', 'just now'),
  'noOrders': L10n('Aucune commande', 'لا توجد طلبات', 'No orders'),
  'req_waiter': L10n('Table {n} appelle un serveur', 'الطاولة {n} تطلب النادل', 'Table {n} is calling a waiter'),
  'req_bill': L10n('Table {n} demande l\'addition', 'الطاولة {n} تطلب الفاتورة', 'Table {n} wants the bill'),
  'done': L10n('Traité', 'تم', 'Done'),

  // Tables
  'tables': L10n('Tables & QR codes', 'الطاولات ورموز QR', 'Tables & QR codes'),
  'tablesText': L10n('Imprimez ces codes et posez-les sur les tables. Chaque code ouvre le menu de sa table.', 'اطبع هذه الرموز وضعها على الطاولات. كل رمز يفتح قائمة طاولته.', 'Print these codes and place them on the tables. Each code opens the menu for its table.'),
  'free': L10n('Libre', 'شاغرة', 'Free'),
  'busy': L10n('{n} commande(s) en cours', '{n} طلب قيد التنفيذ', '{n} active order(s)'),
  'openTable': L10n('Ouvrir le menu', 'فتح القائمة', 'Open menu'),

  // Demo
  'guestPhone': L10n('Téléphone du client · Table 5', 'هاتف الزبون · الطاولة 5', 'Guest phone · Table 5'),
  'kitchenScreen': L10n('Écran de la cuisine', 'شاشة المطبخ', 'Kitchen screen'),
  'demoHint': L10n('Commandez sur le téléphone, puis faites avancer la commande en cuisine.', 'اطلب من الهاتف، ثم حرّك الطلب في المطبخ.', 'Order on the phone, then move the order along in the kitchen.'),
  'photoCredits': L10n('Crédits photos', 'مصادر الصور', 'Photo credits'),
  'home': L10n('Accueil', 'الرئيسية', 'Home'),
};
