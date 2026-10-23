import 'package:flutter/material.dart';

import '../i18n.dart';
import '../state/store.dart';
import '../widgets.dart';

/// The guest's orders at their table, with live status from the kitchen.
class OrdersScreen extends StatelessWidget {
  final int table;
  const OrdersScreen({super.key, required this.table});

  @override
  Widget build(BuildContext context) => LangBuilder(builder: _build);

  Widget _build(BuildContext context) {
    return ListenableBuilder(
      listenable: store,
      builder: (context, _) {
        final orders = store.ordersOf(table);
        return Scaffold(
          // No language switch here: there's little room on a phone (it's on the menu screen)
          appBar: AppBar(title: Text(t('myOrders'), style: const TextStyle(fontWeight: FontWeight.w800))),
          body: ListView(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
            children: [
              if (orders.isNotEmpty && orders.first.status == OrderStatus.received)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(children: [
                    const Icon(Icons.check_circle, color: Color(0xFF16A34A)),
                    const SizedBox(width: 8),
                    Text(t('orderSent'), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
                  ]),
                ),
              for (final o in orders) _OrderCard(order: o),
              const SizedBox(height: 8),
              Row(children: [
                Expanded(child: _RequestButton(table: table, kind: 'waiter', icon: Icons.room_service_outlined)),
                const SizedBox(width: 10),
                Expanded(child: _RequestButton(table: table, kind: 'bill', icon: Icons.receipt_outlined)),
              ]),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(minimumSize: const Size(48, 50), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                onPressed: () => Navigator.of(context).canPop()
                    ? Navigator.of(context).pop()
                    : Navigator.of(context).pushReplacementNamed('/table/$table'),
                icon: const Icon(Icons.restaurant_menu),
                label: Text(t('orderMore')),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _OrderCard extends StatelessWidget {
  final Order order;
  const _OrderCard({required this.order});

  @override
  Widget build(BuildContext context) {
    final steps = OrderStatus.values;
    final current = order.status.index;
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Text(t('orderN', {'n': order.number}), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
          const Spacer(),
          StatusChip(order.status),
        ]),
        const SizedBox(height: 14),
        // Progress: received → preparing → ready → served
        Row(children: [
          for (var i = 0; i < steps.length; i++) ...[
            AnimatedContainer(
              duration: const Duration(milliseconds: 400),
              width: 26,
              height: 26,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: i <= current ? statusColor(order.status) : const Color(0xFFE9E4DA),
              ),
              child: Icon(i < current ? Icons.check : _stepIcon(steps[i]), size: 15, color: i <= current ? Colors.white : Brand.muted),
            ),
            if (i < steps.length - 1)
              Expanded(
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 400),
                  height: 3,
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  color: i < current ? statusColor(order.status) : const Color(0xFFE9E4DA),
                ),
              ),
          ],
        ]),
        const SizedBox(height: 10),
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 300),
          child: Text(t('statusHint_${order.status.name}'),
              key: ValueKey(order.status), style: const TextStyle(color: Brand.muted, fontSize: 13.5)),
        ),
        const Divider(height: 24),
        for (final l in order.lines)
          Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Row(children: [
              Text('${l.qty}×', style: const TextStyle(fontWeight: FontWeight.w700, color: Brand.blue)),
              const SizedBox(width: 8),
              Expanded(child: Text(l.dish.name.text)),
              Text(money(l.total), style: const TextStyle(color: Brand.muted)),
            ]),
          ),
        const SizedBox(height: 6),
        Row(children: [
          Text(t('total'), style: const TextStyle(fontWeight: FontWeight.w700)),
          const Spacer(),
          Text(money(order.total), style: const TextStyle(fontWeight: FontWeight.w800)),
        ]),
      ]),
    );
  }

  IconData _stepIcon(OrderStatus s) => switch (s) {
        OrderStatus.received => Icons.inbox_outlined,
        OrderStatus.preparing => Icons.soup_kitchen_outlined,
        OrderStatus.ready => Icons.notifications_active_outlined,
        OrderStatus.served => Icons.restaurant,
      };
}

class _RequestButton extends StatelessWidget {
  final int table;
  final String kind;
  final IconData icon;
  const _RequestButton({required this.table, required this.kind, required this.icon});

  @override
  Widget build(BuildContext context) {
    final pending = store.requests.any((r) => r.table == table && r.kind == kind);
    return FilledButton.tonalIcon(
      style: FilledButton.styleFrom(
        backgroundColor: const Color(0xFFE3EEF0),
        foregroundColor: Brand.blueDark,
        minimumSize: const Size(48, 50),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
      onPressed: pending
          ? null
          : () {
              store.request(table, kind);
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(t('requestSent')), behavior: SnackBarBehavior.floating));
            },
      icon: Icon(pending ? Icons.hourglass_top : icon, size: 19),
      label: Text(t(kind == 'waiter' ? 'callWaiter' : 'askBill'), textAlign: TextAlign.center),
    );
  }
}
