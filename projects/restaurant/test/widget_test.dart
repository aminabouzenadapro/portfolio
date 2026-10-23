import 'package:dar_el_bahdja/i18n.dart';
import 'package:dar_el_bahdja/state/store.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    await store.init();
    store.reset();
  });

  test('prices are formatted in dinars', () {
    appLang.value = Lang.fr;
    expect(money(1200), '1 200 DA');
    appLang.value = Lang.ar;
    expect(money(350), '350 د.ج');
    appLang.value = Lang.fr;
  });

  test('an order goes from the cart to the kitchen and through every step', () {
    store.addToCart(5, 'couscous', 2, '');
    store.addToCart(5, 'citronnade', 1, 'sans sucre');
    expect(store.cartCount(5), 3);
    expect(store.cartTotal(5), 2 * 1400 + 200);

    final order = store.placeOrder(5);
    expect(store.cartCount(5), 0);
    expect(order.status, OrderStatus.received);
    expect(store.byStatus(OrderStatus.received), contains(order));

    store.advance(order);
    store.advance(order);
    store.advance(order);
    expect(order.status, OrderStatus.served);
    store.advance(order); // already served: stays served
    expect(order.status, OrderStatus.served);
  });

  test('a table can call a waiter once until the request is handled', () {
    store.request(5, 'waiter');
    store.request(5, 'waiter');
    expect(store.requests.where((r) => r.table == 5).length, 1);
    store.resolve(store.requests.firstWhere((r) => r.table == 5));
    expect(store.requests.where((r) => r.table == 5), isEmpty);
  });
}
