import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'i18n.dart';
import 'screens/demo_screen.dart';
import 'screens/kitchen_screen.dart';
import 'screens/launcher.dart';
import 'screens/menu_screen.dart';
import 'screens/orders_screen.dart';
import 'screens/tables_screen.dart';
import 'state/store.dart';
import 'widgets.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await store.init();
  // ?lang=ar / ?lang=en in the address picks the language
  final requested = Uri.base.queryParameters['lang'];
  appLang.value = Lang.values.where((l) => l.name == requested).firstOrNull ?? Lang.fr;
  runApp(const BahdjaApp());
}

class BahdjaApp extends StatelessWidget {
  const BahdjaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder(
      valueListenable: appLang,
      builder: (context, lang, _) => MaterialApp(
        title: 'Dar El Bahdja',
        debugShowCheckedModeBanner: false,
        locale: lang.locale,
        supportedLocales: [for (final l in Lang.values) l.locale],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(seedColor: Brand.blue, primary: Brand.blue, secondary: Brand.saffron, surface: Colors.white),
          scaffoldBackgroundColor: Brand.cream,
          appBarTheme: const AppBarTheme(backgroundColor: Brand.cream, surfaceTintColor: Colors.transparent, elevation: 0),
          filledButtonTheme: FilledButtonThemeData(
            style: FilledButton.styleFrom(
              backgroundColor: Brand.blue,
              minimumSize: const Size(48, 50),
              textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
          ),
        ),
        initialRoute: '/',
        onGenerateRoute: (settings) => MaterialPageRoute(settings: settings, builder: (_) => routeFor(settings.name ?? '/')),
      ),
    );
  }
}

/// Screens by address: /, /demo, /kitchen, /tables, /table/5, /table/5/orders
Widget routeFor(String name) {
  final parts = Uri.parse(name).pathSegments;
  if (parts.isEmpty) return const Launcher();
  switch (parts.first) {
    case 'demo':
      return const DemoScreen();
    case 'kitchen':
      return const KitchenScreen();
    case 'tables':
      return const TablesScreen();
    case 'table':
      final n = int.tryParse(parts.length > 1 ? parts[1] : '') ?? 1;
      final table = n.clamp(1, 99);
      return parts.length > 2 && parts[2] == 'orders' ? OrdersScreen(table: table) : MenuScreen(table: table);
  }
  return const Launcher();
}
