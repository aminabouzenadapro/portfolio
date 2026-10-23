import 'package:flutter/material.dart';

import '../i18n.dart';
import '../main.dart' show routeFor;
import '../widgets.dart';
import 'kitchen_screen.dart';

/// Showcase: the guest's phone (table 5) and the kitchen screen side by side,
/// sharing the same live data. On narrow screens, tabs switch between them.
class DemoScreen extends StatefulWidget {
  const DemoScreen({super.key});

  @override
  State<DemoScreen> createState() => _DemoScreenState();
}

class _DemoScreenState extends State<DemoScreen> {
  // The phone keeps its own navigation (menu → orders) inside the frame
  final _phoneNav = GlobalKey<NavigatorState>();
  int _tab = 0;

  Widget get _phone => ScaffoldMessenger(
        child: Navigator(
          key: _phoneNav,
          // Start directly on the menu (no intermediate routes, so no back arrow)
          onGenerateInitialRoutes: (_, _) => [
            MaterialPageRoute(settings: const RouteSettings(name: '/table/5'), builder: (_) => routeFor('/table/5')),
          ],
          onGenerateRoute: (s) => MaterialPageRoute(settings: s, builder: (_) => routeFor(s.name ?? '/table/5')),
        ),
      );

  @override
  Widget build(BuildContext context) => LangBuilder(builder: _build);

  Widget _build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(children: [
          const Logo(size: 30),
          const SizedBox(width: 10),
          Flexible(child: Text(t('openDemo'), style: const TextStyle(fontWeight: FontWeight.w800))),
        ]),
        actions: const [Padding(padding: EdgeInsetsDirectional.only(end: 12), child: LangSwitch())],
      ),
      body: LayoutBuilder(builder: (context, c) {
        if (c.maxWidth >= 900) {
          // The phone keeps a real phone shape: its width follows the available height
          final phoneWidth = ((c.maxHeight - 90) * 390 / 800).clamp(300.0, 420.0);
          return Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
            child: Column(children: [
              Text(t('demoHint'), style: const TextStyle(color: Brand.muted)),
              const SizedBox(height: 14),
              Expanded(
                child: Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                  SizedBox(
                    width: phoneWidth,
                    child: _Labeled(label: t('guestPhone'), icon: Icons.phone_iphone, child: Center(child: PhoneFrame(child: _phone))),
                  ),
                  const SizedBox(width: 24),
                  Expanded(
                    child: _Labeled(
                      label: t('kitchenScreen'),
                      icon: Icons.soup_kitchen,
                      expand: true,
                      child: ClipRRect(borderRadius: BorderRadius.circular(18), child: const KitchenScreen(embedded: true)),
                    ),
                  ),
                ]),
              ),
            ]),
          );
        }
        // Narrow screens: one view at a time
        return Column(children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
            child: SegmentedButton<int>(
              segments: [
                ButtonSegment(value: 0, icon: const Icon(Icons.phone_iphone), label: Text(t('openMenu'))),
                ButtonSegment(value: 1, icon: const Icon(Icons.soup_kitchen), label: Text(t('kitchen'))),
              ],
              selected: {_tab},
              onSelectionChanged: (s) => setState(() => _tab = s.first),
            ),
          ),
          Expanded(child: IndexedStack(index: _tab, children: [_phone, const KitchenScreen(embedded: true)])),
        ]);
      }),
    );
  }
}

class _Labeled extends StatelessWidget {
  final String label;
  final IconData icon;
  final Widget child;
  final bool expand;
  const _Labeled({required this.label, required this.icon, required this.child, this.expand = false});

  @override
  Widget build(BuildContext context) => Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Row(mainAxisSize: expand ? MainAxisSize.max : MainAxisSize.min, children: [
          Icon(icon, size: 18, color: Brand.blue),
          const SizedBox(width: 6),
          Text(label, style: const TextStyle(fontWeight: FontWeight.w700, color: Brand.ink)),
        ]),
        const SizedBox(height: 10),
        Expanded(child: child),
      ]);
}
