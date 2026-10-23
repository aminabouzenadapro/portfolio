import 'dart:async';

import 'package:flutter/material.dart';

import '../i18n.dart';
import '../state/store.dart';
import '../widgets.dart';

/// Kitchen display: tickets move from New → Preparing → Ready → Served.
class KitchenScreen extends StatelessWidget {
  final bool embedded; // inside the demo screen: no back button, smaller header
  const KitchenScreen({super.key, this.embedded = false});

  @override
  Widget build(BuildContext context) => LangBuilder(builder: _build);

  Widget _build(BuildContext context) {
    return Theme(
      data: ThemeData(useMaterial3: true, brightness: Brightness.dark, colorSchemeSeed: Brand.blue, scaffoldBackgroundColor: Brand.kitchenBg),
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: Brand.kitchenBg,
          automaticallyImplyLeading: !embedded,
          titleSpacing: embedded ? 16 : null,
          title: Row(children: [
            const Icon(Icons.soup_kitchen, color: Brand.saffron),
            const SizedBox(width: 10),
            Text('${t('kitchen')} · ${t('restaurant')}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
          ]),
          actions: [
            const Padding(padding: EdgeInsetsDirectional.only(end: 16), child: _Clock()),
            if (!embedded) const Padding(padding: EdgeInsetsDirectional.only(start: 12, end: 12), child: LangSwitch(dark: true)),
          ],
        ),
        body: ListenableBuilder(
          listenable: store,
          builder: (context, _) => Column(children: [
            _RequestsBar(),
            Expanded(
              child: LayoutBuilder(builder: (context, c) {
                final columns = [OrderStatus.received, OrderStatus.preparing, OrderStatus.ready];
                // Side-by-side columns when there's room, otherwise stacked
                if (c.maxWidth >= 640) {
                  return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    for (final s in columns) Expanded(child: _Column(status: s)),
                  ]);
                }
                return ListView(children: [for (final s in columns) _Column(status: s, scrollable: false)]);
              }),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Text(t('servedToday', {'n': store.servedToday}), style: const TextStyle(color: Colors.white54, fontSize: 13)),
            ),
          ]),
        ),
      ),
    );
  }
}

class _Clock extends StatefulWidget {
  const _Clock();
  @override
  State<_Clock> createState() => _ClockState();
}

class _ClockState extends State<_Clock> {
  late final Timer _timer;
  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 15), (_) => setState(() {}));
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final now = TimeOfDay.now();
    return Center(
      child: Text('${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}',
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16, fontFeatures: [FontFeature.tabularFigures()])),
    );
  }
}

class _RequestsBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    if (store.requests.isEmpty) return const SizedBox.shrink();
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
      color: const Color(0xFF422006),
      child: Wrap(spacing: 8, runSpacing: 8, children: [
        for (final r in store.requests)
          Container(
            padding: const EdgeInsetsDirectional.only(start: 12, end: 4),
            decoration: BoxDecoration(color: Brand.saffron, borderRadius: BorderRadius.circular(99)),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(r.kind == 'bill' ? Icons.receipt_long : Icons.room_service, color: Brand.blueDark, size: 18),
              const SizedBox(width: 6),
              Text(t(r.kind == 'bill' ? 'req_bill' : 'req_waiter', {'n': r.table}),
                  style: const TextStyle(color: Brand.blueDark, fontWeight: FontWeight.w700)),
              TextButton(
                onPressed: () => store.resolve(r),
                style: TextButton.styleFrom(foregroundColor: Brand.blueDark, visualDensity: VisualDensity.compact),
                child: Text(t('done'), style: const TextStyle(fontWeight: FontWeight.w800)),
              ),
            ]),
          ),
      ]),
    );
  }
}

class _Column extends StatelessWidget {
  final OrderStatus status;
  final bool scrollable;
  const _Column({required this.status, this.scrollable = true});

  @override
  Widget build(BuildContext context) {
    final orders = store.byStatus(status);
    final header = Padding(
      padding: const EdgeInsets.fromLTRB(4, 4, 4, 10),
      child: Row(children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: statusColor(status), shape: BoxShape.circle)),
        const SizedBox(width: 8),
        Text(t('col_${status.name}'), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
        const SizedBox(width: 6),
        Text('${orders.length}', style: const TextStyle(color: Colors.white54, fontWeight: FontWeight.w700)),
      ]),
    );
    final tickets = [
      for (final o in orders)
        _Ticket(key: ValueKey('${o.number}-${o.status.name}'), order: o),
      if (orders.isEmpty)
        Padding(padding: const EdgeInsets.symmetric(vertical: 24), child: Center(child: Text(t('noOrders'), style: const TextStyle(color: Colors.white38)))),
    ];
    return Padding(
      padding: const EdgeInsets.all(8),
      child: scrollable
          ? Column(children: [header, Expanded(child: ListView(children: tickets))])
          : Column(children: [header, ...tickets]),
    );
  }
}

class _Ticket extends StatelessWidget {
  final Order order;
  const _Ticket({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final minutes = DateTime.now().difference(order.createdAt).inMinutes;
    final late = minutes >= 15 && order.status != OrderStatus.ready;
    final (label, icon) = switch (order.status) {
      OrderStatus.received => (t('start'), Icons.play_arrow_rounded),
      OrderStatus.preparing => (t('markReady'), Icons.check_rounded),
      _ => (t('markServed'), Icons.room_service_rounded),
    };
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: const Duration(milliseconds: 380),
      curve: Curves.easeOutCubic,
      builder: (context, v, child) => Opacity(opacity: v, child: Transform.translate(offset: Offset(0, (1 - v) * 16), child: child)),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          color: Brand.kitchenCard,
          borderRadius: BorderRadius.circular(14),
          border: BorderDirectional(start: BorderSide(color: statusColor(order.status), width: 5)),
        ),
        padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Text(t('table', {'n': order.table}), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
            const SizedBox(width: 8),
            Text('#${order.number}', style: const TextStyle(color: Colors.white54)),
            const Spacer(),
            Icon(Icons.timer_outlined, size: 15, color: late ? const Color(0xFFF87171) : Colors.white54),
            const SizedBox(width: 3),
            Text(minutes < 1 ? t('justNow') : t('ago', {'n': minutes}),
                style: TextStyle(fontSize: 12.5, color: late ? const Color(0xFFF87171) : Colors.white60, fontWeight: late ? FontWeight.w700 : null)),
          ]),
          const SizedBox(height: 8),
          for (final l in order.lines)
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                SizedBox(width: 30, child: Text('${l.qty}×', style: const TextStyle(fontWeight: FontWeight.w800, color: Brand.saffron, fontSize: 15))),
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(l.dish.name.text, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14.5)),
                    if (l.note.isNotEmpty)
                      Text('→ ${l.note}', style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 12.5, fontStyle: FontStyle.italic)),
                  ]),
                ),
              ]),
            ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: () => store.advance(order),
              style: FilledButton.styleFrom(
                backgroundColor: statusColor(OrderStatus.values[order.status.index + 1]),
                foregroundColor: Colors.white,
                minimumSize: const Size(40, 42),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              icon: Icon(icon, size: 19),
              label: Text(label, style: const TextStyle(fontWeight: FontWeight.w700)),
            ),
          ),
        ]),
      ),
    );
  }
}
