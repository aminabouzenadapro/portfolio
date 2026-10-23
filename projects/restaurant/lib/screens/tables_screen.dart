import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../data/menu.dart';
import '../i18n.dart';
import '../state/store.dart';
import '../widgets.dart';

/// Address encoded in a table's QR code (the menu for that table)
String tableUrl(int table) {
  final base = Uri.base;
  return '${base.origin}${base.path}#/table/$table';
}

class TablesScreen extends StatelessWidget {
  const TablesScreen({super.key});

  @override
  Widget build(BuildContext context) => LangBuilder(builder: _build);

  Widget _build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(t('tables'), style: const TextStyle(fontWeight: FontWeight.w800)),
        actions: const [Padding(padding: EdgeInsetsDirectional.only(end: 12), child: LangSwitch())],
      ),
      body: ListenableBuilder(
        listenable: store,
        builder: (context, _) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(t('tablesText'), style: const TextStyle(color: Brand.muted, fontSize: 14.5)),
            const SizedBox(height: 16),
            Wrap(spacing: 14, runSpacing: 14, children: [
              for (var n = 1; n <= tableCount; n++) _TableCard(table: n),
            ]),
          ],
        ),
      ),
    );
  }
}

class _TableCard extends StatelessWidget {
  final int table;
  const _TableCard({required this.table});

  @override
  Widget build(BuildContext context) {
    final active = store.activeOrdersAt(table);
    return Container(
      width: 200,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: const Color(0xFFE7E1D6))),
      child: Column(children: [
        Row(children: [
          Text(t('table', {'n': table}), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
          const Spacer(),
          Container(width: 9, height: 9, decoration: BoxDecoration(shape: BoxShape.circle, color: active > 0 ? Brand.saffron : const Color(0xFF16A34A))),
        ]),
        const SizedBox(height: 10),
        QrImageView(
          data: tableUrl(table),
          size: 150,
          padding: EdgeInsets.zero,
          eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.circle, color: Brand.blueDark),
          dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.circle, color: Brand.blueDark),
          semanticsLabel: t('table', {'n': table}),
        ),
        const SizedBox(height: 8),
        Text(active > 0 ? t('busy', {'n': active}) : t('free'), style: const TextStyle(color: Brand.muted, fontSize: 12.5)),
        const SizedBox(height: 8),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton(
            onPressed: () => Navigator.of(context).pushNamed('/table/$table'),
            child: Text(t('openTable')),
          ),
        ),
      ]),
    );
  }
}
