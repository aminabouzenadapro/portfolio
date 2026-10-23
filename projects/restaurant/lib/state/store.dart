import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../data/menu.dart';

enum OrderStatus { received, preparing, ready, served }

class OrderLine {
  final String dishId;
  int qty;
  String note;
  OrderLine(this.dishId, this.qty, [this.note = '']);

  Dish get dish => dishById[dishId]!;
  int get total => dish.price * qty;

  Map<String, dynamic> toJson() => {'d': dishId, 'q': qty, 'n': note};
  factory OrderLine.fromJson(Map<String, dynamic> j) => OrderLine(j['d'], j['q'], j['n'] ?? '');
}

class Order {
  final int number;
  final int table;
  final List<OrderLine> lines;
  OrderStatus status;
  final DateTime createdAt;
  DateTime updatedAt;

  Order(this.number, this.table, this.lines, this.status, this.createdAt, this.updatedAt);

  int get total => lines.fold(0, (s, l) => s + l.total);
  int get itemCount => lines.fold(0, (s, l) => s + l.qty);

  Map<String, dynamic> toJson() => {
        'no': number, 't': table, 'l': [for (final l in lines) l.toJson()],
        's': status.name, 'c': createdAt.millisecondsSinceEpoch, 'u': updatedAt.millisecondsSinceEpoch,
      };
  factory Order.fromJson(Map<String, dynamic> j) => Order(
        j['no'], j['t'], [for (final l in j['l']) OrderLine.fromJson(Map<String, dynamic>.from(l))],
        OrderStatus.values.byName(j['s']),
        DateTime.fromMillisecondsSinceEpoch(j['c']), DateTime.fromMillisecondsSinceEpoch(j['u']),
      );
}

/// A table asking for a waiter or for the bill.
class TableRequest {
  final String id;
  final int table;
  final String kind; // 'waiter' | 'bill'
  final DateTime at;
  TableRequest(this.id, this.table, this.kind, this.at);

  Map<String, dynamic> toJson() => {'id': id, 't': table, 'k': kind, 'a': at.millisecondsSinceEpoch};
  factory TableRequest.fromJson(Map<String, dynamic> j) =>
      TableRequest(j['id'], j['t'], j['k'], DateTime.fromMillisecondsSinceEpoch(j['a']));
}

/// Shared state for guests and kitchen. Saved on the device (browser localStorage
/// on the web); other open tabs pick up changes within a second, so a guest tab
/// and a kitchen tab stay in sync. A real deployment would use a server instead.
class RestaurantStore extends ChangeNotifier {
  static const _key = 'bahdja_state_v1';
  static final instance = RestaurantStore._();
  RestaurantStore._();

  SharedPreferences? _prefs;
  Timer? _poll;
  String _lastSaved = '';

  final Map<int, List<OrderLine>> carts = {};
  final List<Order> orders = [];
  final List<TableRequest> requests = [];

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    if (!_load()) _seed();
    _poll = Timer.periodic(const Duration(milliseconds: 900), (_) => _sync());
  }

  @override
  void dispose() {
    _poll?.cancel();
    super.dispose();
  }

  // ---------- Cart ----------
  List<OrderLine> cartOf(int table) => carts[table] ??= [];
  int cartCount(int table) => cartOf(table).fold(0, (s, l) => s + l.qty);
  int cartTotal(int table) => cartOf(table).fold(0, (s, l) => s + l.total);

  void addToCart(int table, String dishId, int qty, String note) {
    final cart = cartOf(table);
    final same = cart.where((l) => l.dishId == dishId && l.note == note).firstOrNull;
    if (same != null) {
      same.qty += qty;
    } else {
      cart.add(OrderLine(dishId, qty, note));
    }
    _changed();
  }

  void setQty(int table, OrderLine line, int qty) {
    if (qty <= 0) {
      cartOf(table).remove(line);
    } else {
      line.qty = qty;
    }
    _changed();
  }

  // ---------- Orders ----------
  Order placeOrder(int table) {
    final number = orders.isEmpty ? 101 : orders.map((o) => o.number).reduce((a, b) => a > b ? a : b) + 1;
    final now = DateTime.now();
    final order = Order(number, table, [for (final l in cartOf(table)) OrderLine(l.dishId, l.qty, l.note)],
        OrderStatus.received, now, now);
    orders.add(order);
    carts[table] = [];
    _changed();
    return order;
  }

  List<Order> ordersOf(int table) =>
      orders.where((o) => o.table == table).toList()..sort((a, b) => b.createdAt.compareTo(a.createdAt));

  List<Order> byStatus(OrderStatus s) =>
      orders.where((o) => o.status == s).toList()..sort((a, b) => a.createdAt.compareTo(b.createdAt));

  int activeOrdersAt(int table) => orders.where((o) => o.table == table && o.status != OrderStatus.served).length;

  /// Moves an order to its next step (received → preparing → ready → served).
  void advance(Order order) {
    if (order.status == OrderStatus.served) return;
    order.status = OrderStatus.values[order.status.index + 1];
    order.updatedAt = DateTime.now();
    _changed();
  }

  int get servedToday {
    final today = DateTime.now();
    return orders.where((o) => o.status == OrderStatus.served && o.updatedAt.day == today.day).length;
  }

  // ---------- Waiter & bill requests ----------
  void request(int table, String kind) {
    requests.removeWhere((r) => r.table == table && r.kind == kind);
    requests.add(TableRequest('${DateTime.now().microsecondsSinceEpoch}', table, kind, DateTime.now()));
    _changed();
  }

  void resolve(TableRequest r) {
    requests.remove(r);
    _changed();
  }

  // ---------- Demo data ----------
  void reset() {
    carts.clear();
    orders.clear();
    requests.clear();
    _seed();
  }

  /// A few orders already in progress at other tables, so the kitchen isn't empty.
  void _seed() {
    final now = DateTime.now();
    Order o(int no, int table, List<OrderLine> lines, OrderStatus s, int minutesAgo) =>
        Order(no, table, lines, s, now.subtract(Duration(minutes: minutesAgo)), now.subtract(Duration(minutes: minutesAgo ~/ 2)));
    orders.addAll([
      o(97, 2, [OrderLine('couscous', 2), OrderLine('citronnade', 2)], OrderStatus.served, 34),
      o(98, 7, [OrderLine('chorba', 3), OrderLine('bourek', 2), OrderLine('the-menthe', 3)], OrderStatus.ready, 16),
      o(99, 3, [OrderLine('brochettes', 1, 'Bien cuit'), OrderLine('rechta', 1)], OrderStatus.preparing, 9),
      o(100, 1, [OrderLine('mhadjeb', 4), OrderLine('garantita', 2, 'Avec harissa'), OrderLine('cafe', 2)], OrderStatus.received, 2),
    ]);
    requests.add(TableRequest('seed', 7, 'bill', now.subtract(const Duration(minutes: 1))));
    _changed();
  }

  // ---------- Persistence & sync ----------
  String _encode() => jsonEncode({
        'carts': {for (final e in carts.entries) '${e.key}': [for (final l in e.value) l.toJson()]},
        'orders': [for (final o in orders) o.toJson()],
        'requests': [for (final r in requests) r.toJson()],
      });

  void _changed() {
    _lastSaved = _encode();
    _prefs?.setString(_key, _lastSaved);
    notifyListeners();
  }

  bool _load() {
    final raw = _prefs?.getString(_key);
    if (raw == null) return false;
    try {
      final j = jsonDecode(raw) as Map<String, dynamic>;
      carts
        ..clear()
        ..addAll({
          for (final e in (j['carts'] as Map).entries)
            int.parse(e.key): [for (final l in e.value) OrderLine.fromJson(Map<String, dynamic>.from(l))]
        });
      orders
        ..clear()
        ..addAll([for (final o in j['orders']) Order.fromJson(Map<String, dynamic>.from(o))]);
      requests
        ..clear()
        ..addAll([for (final r in j['requests']) TableRequest.fromJson(Map<String, dynamic>.from(r))]);
      _lastSaved = raw;
      return true;
    } catch (_) {
      return false; // corrupted or old format: start fresh
    }
  }

  /// Picks up changes saved by another tab (e.g. the kitchen screen).
  Future<void> _sync() async {
    final prefs = _prefs;
    if (prefs == null) return;
    await prefs.reload();
    final raw = prefs.getString(_key);
    if (raw != null && raw != _lastSaved && _load()) notifyListeners();
  }
}

final store = RestaurantStore.instance;
