import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;

import '../data/menu.dart';

import '../i18n.dart';
import '../state/store.dart';
import '../widgets.dart';

/// Home page of the demo: pick a view.
class Launcher extends StatelessWidget {
  const Launcher({super.key});

  @override
  Widget build(BuildContext context) => LangBuilder(builder: _build);

  Widget _build(BuildContext context) {
    final items = [
      (Icons.devices, 'openDemo', 'openDemoText', '/demo', true),
      (Icons.phone_iphone, 'openMenu', 'openMenuText', '/table/5', false),
      (Icons.soup_kitchen, 'openKitchen', 'openKitchenText', '/kitchen', false),
      (Icons.qr_code_2, 'openTables', 'openTablesText', '/tables', false),
    ];
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 760),
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Row(children: [
                  const Logo(size: 44),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(t('restaurant'), style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Brand.ink)),
                      Text(t('tagline'), style: const TextStyle(color: Brand.muted)),
                    ]),
                  ),
                  const LangSwitch(),
                ]),
                const SizedBox(height: 28),
                Text(t('launcherTitle'), style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w800, height: 1.15, color: Brand.ink)),
                const SizedBox(height: 10),
                Text(t('launcherText'), style: const TextStyle(fontSize: 16, color: Brand.muted, height: 1.5)),
                const SizedBox(height: 24),
                LayoutBuilder(builder: (context, c) {
                  final twoCols = c.maxWidth >= 560;
                  return Wrap(spacing: 14, runSpacing: 14, children: [
                    for (final (icon, title, text, route, primary) in items)
                      SizedBox(
                        width: twoCols ? (c.maxWidth - 14) / 2 : c.maxWidth,
                        child: _LaunchCard(icon: icon, title: t(title), text: t(text), primary: primary,
                            onTap: () => Navigator.of(context).pushNamed(route)),
                      ),
                  ]);
                }),
                const SizedBox(height: 24),
                Row(children: [
                  Expanded(child: Text(t('demoNote'), style: const TextStyle(color: Brand.muted, fontSize: 13))),
                  TextButton.icon(onPressed: store.reset, icon: const Icon(Icons.refresh, size: 18), label: Text(t('resetDemo'))),
                ]),
                Align(
                  alignment: AlignmentDirectional.centerStart,
                  child: TextButton.icon(
                    onPressed: () => _showCredits(context),
                    icon: const Icon(Icons.photo_library_outlined, size: 18),
                    label: Text(t('photoCredits')),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Dish photos come from Wikimedia Commons; their licenses require crediting the authors.
Future<void> _showCredits(BuildContext context) async {
  final credits = Map<String, dynamic>.from(jsonDecode(await rootBundle.loadString('assets/credits.json')));
  if (!context.mounted) return;
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      title: Text(t('photoCredits')),
      content: SizedBox(
        width: 460,
        child: ListView(shrinkWrap: true, children: [
          for (final e in credits.entries)
            ListTile(
              dense: true,
              contentPadding: EdgeInsets.zero,
              title: Text(dishById[e.key]?.name.text ?? e.key, style: const TextStyle(fontWeight: FontWeight.w600)),
              subtitle: Text('${e.value['author']} · ${e.value['license']} · Wikimedia Commons'),
            ),
        ]),
      ),
      actions: [TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('OK'))],
    ),
  );
}

class _LaunchCard extends StatelessWidget {
  final IconData icon;
  final String title, text;
  final bool primary;
  final VoidCallback onTap;
  const _LaunchCard({required this.icon, required this.title, required this.text, required this.primary, required this.onTap});

  @override
  Widget build(BuildContext context) => Material(
        color: primary ? Brand.blue : Colors.white,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Row(children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: primary ? Colors.white24 : const Color(0xFFF1ECE2), borderRadius: BorderRadius.circular(14)),
                child: Icon(icon, color: primary ? Colors.white : Brand.blue),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(title, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: primary ? Colors.white : Brand.ink)),
                  const SizedBox(height: 3),
                  Text(text, style: TextStyle(fontSize: 13.5, color: primary ? Colors.white70 : Brand.muted)),
                ]),
              ),
              Icon(Icons.chevron_right, color: primary ? Colors.white : Brand.muted),
            ]),
          ),
        ),
      );
}
