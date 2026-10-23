# Dar El Bahdja: QR-code table ordering (Flutter)

A Flutter app for an Algerian restaurant. Guests scan the QR code on their table, order from their phone, and the kitchen follows every order live. One codebase for **web** and **Android**.

> Demo: data is stored on the device (browser localStorage on the web). A real restaurant would add a small server so phones and the kitchen share the same data.

## Screens
| Route | Screen |
|---|---|
| `#/` | Home: pick a view |
| `#/demo` | **Live demo:** the guest's phone (table 5) and the kitchen screen side by side |
| `#/table/5` | Guest menu for table 5 (what the QR code opens) |
| `#/table/5/orders` | The guest's orders with live status, waiter call and bill request |
| `#/kitchen` | Kitchen display: tickets in New / Preparing / Ready columns, with timers |
| `#/tables` | QR codes to print for each table |

Add `?lang=ar` or `?lang=en` before the `#` to open in Arabic or English (French by default).

## Features
- **Menu:** 16 Algerian dishes with photos, descriptions and prices in dinars, grouped in 5 categories; spicy, vegetarian and house-special tags.
- **Ordering:** quantity, notes per dish ("no onions"), cart sheet, and one tap to send to the kitchen.
- **Live status:** Received → Preparing → Ready → Served, shown as a progress bar on the guest's phone.
- **Kitchen display:** ticket timers that turn red after 15 minutes, notes highlighted, plus waiter and bill requests.
- **Three languages:** French, Arabic and English, with a right-to-left layout for Arabic.
- **QR codes:** one per table, generated in the app.
- **Sync:** state is a `ChangeNotifier` saved with `shared_preferences`; open tabs (for example a guest tab and a kitchen tab) pick up each other's changes within a second.

## Code
```
lib/
  main.dart              app, theme, routes
  i18n.dart              FR/AR/EN texts, money formatting, language switch
  data/menu.dart         categories and dishes
  state/store.dart       carts, orders, waiter/bill requests, persistence & sync
  screens/               launcher, menu, orders, kitchen, tables, demo
  widgets.dart           shared UI pieces (brand colors, phone frame, steppers…)
test/widget_test.dart    order flow and formatting tests
assets/dishes/           dish photos (credits in assets/credits.json)
app/                     web build used by the portfolio
```

## Run
```
flutter pub get
flutter run -d chrome
```

## Test
```
flutter test
```

## Build the web version
```
flutter build web --release
```
Then copy `build/web` to `app/`. `web/index.html` uses a relative base (`./`), so the build works from any folder.

## Photo credits
Dish photos come from [Wikimedia Commons](https://commons.wikimedia.org) under free licenses (CC0, public domain, CC BY, CC BY-SA). Authors, licenses and source links are listed in `assets/credits.json`.
