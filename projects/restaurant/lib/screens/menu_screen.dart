import 'package:flutter/material.dart';

import '../data/menu.dart';
import '../i18n.dart';
import '../state/store.dart';
import '../widgets.dart';

/// What a guest sees after scanning their table's QR code.
class MenuScreen extends StatefulWidget {
  final int table;
  const MenuScreen({super.key, required this.table});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  final _scroll = ScrollController();
  final _sectionKeys = {for (final c in categories) c.id: GlobalKey()};
  String _active = categories.first.id;

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  void _jumpTo(String categoryId) {
    setState(() => _active = categoryId);
    final ctx = _sectionKeys[categoryId]?.currentContext;
    if (ctx != null) Scrollable.ensureVisible(ctx, duration: const Duration(milliseconds: 450), curve: Curves.easeOutCubic);
  }

  @override
  Widget build(BuildContext context) => LangBuilder(builder: _build);

  Widget _build(BuildContext context) {
    return ListenableBuilder(
      listenable: store,
      builder: (context, _) {
        final count = store.cartCount(widget.table);
        final active = store.activeOrdersAt(widget.table);
        return Scaffold(
          appBar: AppBar(
            titleSpacing: 16,
            title: Row(children: [
              const Logo(size: 34),
              const SizedBox(width: 10),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(t('restaurant'), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17, color: Brand.ink)),
                  Text(t('table', {'n': widget.table}), style: const TextStyle(fontSize: 12.5, color: Brand.muted)),
                ]),
              ),
            ]),
            actions: [
              if (active > 0)
                IconButton(
                  tooltip: t('myOrders'),
                  onPressed: () => Navigator.of(context).pushNamed('/table/${widget.table}/orders'),
                  icon: Badge(label: Text('$active'), backgroundColor: Brand.saffron, child: const Icon(Icons.receipt_long_outlined)),
                ),
              const Padding(padding: EdgeInsetsDirectional.only(end: 12), child: LangSwitch()),
            ],
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(52),
              child: SizedBox(
                height: 52,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  children: [
                    for (final c in categories)
                      Padding(
                        padding: const EdgeInsetsDirectional.only(end: 8),
                        child: ChoiceChip(
                          label: Text(c.name.text),
                          selected: _active == c.id,
                          onSelected: (_) => _jumpTo(c.id),
                          selectedColor: Brand.blue,
                          labelStyle: TextStyle(color: _active == c.id ? Colors.white : Brand.ink, fontWeight: FontWeight.w600),
                          showCheckmark: false,
                          shape: const StadiumBorder(),
                          side: const BorderSide(color: Color(0xFFE2DBCF)),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
          body: ListView(
            controller: _scroll,
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 110),
            children: [
              _WelcomeCard(table: widget.table),
              for (final c in categories) ...[
                Padding(
                  key: _sectionKeys[c.id],
                  padding: const EdgeInsets.only(top: 22, bottom: 10),
                  child: Text(c.name.text, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Brand.ink)),
                ),
                for (final d in dishes.where((d) => d.category == c.id))
                  _DishTile(dish: d, onTap: () => _openDish(context, d)),
              ],
            ],
          ),
          bottomNavigationBar: AnimatedSwitcher(
            duration: const Duration(milliseconds: 250),
            transitionBuilder: (child, a) => SizeTransition(sizeFactor: a, child: child),
            child: count == 0
                ? const SizedBox.shrink()
                : SafeArea(
                    key: const ValueKey('bar'),
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
                      child: FilledButton(
                        onPressed: () => _openCart(context),
                        child: Row(children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                            decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(8)),
                            child: Text('$count'),
                          ),
                          const SizedBox(width: 12),
                          Expanded(child: Text(t('viewCart'))),
                          Text(money(store.cartTotal(widget.table))),
                        ]),
                      ),
                    ),
                  ),
          ),
        );
      },
    );
  }

  void _openDish(BuildContext context, Dish dish) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      backgroundColor: Colors.white,
      builder: (_) => _DishSheet(dish: dish, table: widget.table),
    );
  }

  void _openCart(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      backgroundColor: Colors.white,
      builder: (_) => _CartSheet(table: widget.table, onSent: () {
        Navigator.of(context).pushNamed('/table/${widget.table}/orders');
      }),
    );
  }
}

class _WelcomeCard extends StatelessWidget {
  final int table;
  const _WelcomeCard({required this.table});

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.only(top: 8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [Brand.blue, Brand.blueDark]),
          borderRadius: BorderRadius.circular(18),
        ),
        child: Row(children: [
          const Icon(Icons.table_restaurant, color: Brand.saffron, size: 30),
          const SizedBox(width: 12),
          Expanded(child: Text(t('welcome'), style: const TextStyle(color: Colors.white, fontSize: 14.5, height: 1.4))),
        ]),
      );
}

class _DishTile extends StatelessWidget {
  final Dish dish;
  final VoidCallback onTap;
  const _DishTile({required this.dish, required this.onTap});

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Material(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          child: InkWell(
            borderRadius: BorderRadius.circular(18),
            onTap: onTap,
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                DishImage(dish, width: 96, height: 96),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(dish.name.text, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15.5, color: Brand.ink)),
                    const SizedBox(height: 4),
                    Text(dish.description.text,
                        maxLines: 2, overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 13, color: Brand.muted, height: 1.35)),
                    const SizedBox(height: 8),
                    Row(children: [
                      Text(money(dish.price), style: const TextStyle(fontWeight: FontWeight.w800, color: Brand.blue, fontSize: 15)),
                      const SizedBox(width: 8),
                      for (final tag in dish.tags)
                        Padding(
                          padding: const EdgeInsetsDirectional.only(end: 4),
                          child: Tooltip(message: tagLabel(tag), child: Icon(tagIcon(tag), size: 16, color: tagColor(tag))),
                        ),
                      const Spacer(),
                      Container(
                        decoration: const BoxDecoration(color: Brand.blue, shape: BoxShape.circle),
                        padding: const EdgeInsets.all(5),
                        child: const Icon(Icons.add, color: Colors.white, size: 18),
                      ),
                    ]),
                  ]),
                ),
              ]),
            ),
          ),
        ),
      );
}

class _DishSheet extends StatefulWidget {
  final Dish dish;
  final int table;
  const _DishSheet({required this.dish, required this.table});

  @override
  State<_DishSheet> createState() => _DishSheetState();
}

class _DishSheetState extends State<_DishSheet> {
  int _qty = 1;
  final _note = TextEditingController();

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final d = widget.dish;
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
          DishImage(d, height: 190, width: double.infinity),
          const SizedBox(height: 14),
          Text(d.name.text, style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w800, color: Brand.ink)),
          const SizedBox(height: 6),
          Text(d.description.text, style: const TextStyle(fontSize: 14.5, color: Brand.muted, height: 1.45)),
          const SizedBox(height: 10),
          Wrap(spacing: 8, runSpacing: 6, children: [
            _InfoChip(icon: Icons.schedule, label: t('prep', {'n': d.prepMinutes}), color: Brand.muted),
            for (final tag in d.tags) _InfoChip(icon: tagIcon(tag), label: tagLabel(tag), color: tagColor(tag)),
          ]),
          const SizedBox(height: 16),
          TextField(
            controller: _note,
            maxLength: 80,
            decoration: InputDecoration(
              hintText: t('note'),
              counterText: '',
              filled: true,
              fillColor: const Color(0xFFF6F2EA),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 16),
          Row(children: [
            QtyStepper(value: _qty, onChanged: (v) => setState(() => _qty = v)),
            const SizedBox(width: 12),
            Expanded(
              child: FilledButton(
                onPressed: () {
                  store.addToCart(widget.table, d.id, _qty, _note.text.trim());
                  Navigator.of(context).pop();
                },
                child: Text(t('addToOrder', {'price': money(d.price * _qty)})),
              ),
            ),
          ]),
        ]),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  const _InfoChip({required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(99)),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 15, color: color),
          const SizedBox(width: 5),
          Text(label, style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: color)),
        ]),
      );
}

class _CartSheet extends StatelessWidget {
  final int table;
  final VoidCallback onSent;
  const _CartSheet({required this.table, required this.onSent});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: store,
      builder: (context, _) {
        final lines = store.cartOf(table);
        return ConstrainedBox(
          constraints: BoxConstraints(maxHeight: MediaQuery.sizeOf(context).height * 0.8),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: [
              Text(t('yourOrder'), style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w800, color: Brand.ink)),
              Text(t('table', {'n': table}), style: const TextStyle(color: Brand.muted)),
              const SizedBox(height: 12),
              if (lines.isEmpty)
                Padding(padding: const EdgeInsets.all(24), child: Text(t('emptyCart'), textAlign: TextAlign.center))
              else
                Flexible(
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: lines.length,
                    separatorBuilder: (_, _) => const Divider(height: 18),
                    itemBuilder: (context, i) {
                      final l = lines[i];
                      return Row(children: [
                        DishImage(l.dish, width: 52, height: 52, radius: BorderRadius.circular(10)),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(l.dish.name.text, style: const TextStyle(fontWeight: FontWeight.w700)),
                            if (l.note.isNotEmpty)
                              Text('« ${l.note} »', style: const TextStyle(fontSize: 12.5, color: Brand.muted, fontStyle: FontStyle.italic)),
                            Text(money(l.total), style: const TextStyle(color: Brand.blue, fontWeight: FontWeight.w700)),
                          ]),
                        ),
                        QtyStepper(value: l.qty, min: 0, onChanged: (v) => store.setQty(table, l, v)),
                      ]);
                    },
                  ),
                ),
              const Divider(height: 28),
              Row(children: [
                Text(t('total'), style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
                const Spacer(),
                Text(money(store.cartTotal(table)), style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w800, color: Brand.ink)),
              ]),
              const SizedBox(height: 6),
              Text(t('payAtTable'), style: const TextStyle(fontSize: 12.5, color: Brand.muted)),
              const SizedBox(height: 14),
              FilledButton.icon(
                onPressed: lines.isEmpty
                    ? null
                    : () {
                        store.placeOrder(table);
                        Navigator.of(context).pop();
                        onSent();
                      },
                icon: const Icon(Icons.send_rounded, size: 19),
                label: Text(t('sendOrder')),
              ),
            ]),
          ),
        );
      },
    );
  }
}
