import 'package:flutter/material.dart';

import 'data/menu.dart';
import 'i18n.dart';
import 'state/store.dart';

/// Brand colors: Mediterranean blue of the Algiers Casbah, with saffron.
class Brand {
  static const blue = Color(0xFF0E5E6F);
  static const blueDark = Color(0xFF0A4652);
  static const saffron = Color(0xFFE4A11B);
  static const cream = Color(0xFFFAF6EF);
  static const ink = Color(0xFF1D2327);
  static const muted = Color(0xFF6B7378);
  static const kitchenBg = Color(0xFF111827);
  static const kitchenCard = Color(0xFF1F2937);
}

Color statusColor(OrderStatus s) => switch (s) {
      OrderStatus.received => const Color(0xFF2563EB),
      OrderStatus.preparing => const Color(0xFFD97706),
      OrderStatus.ready => const Color(0xFF16A34A),
      OrderStatus.served => const Color(0xFF6B7280),
    };

/// FR | ع | EN switch
class LangSwitch extends StatelessWidget {
  final bool dark;
  const LangSwitch({super.key, this.dark = false});

  @override
  Widget build(BuildContext context) {
    final fg = dark ? Colors.white : Brand.ink;
    return ValueListenableBuilder(
      valueListenable: appLang,
      builder: (context, lang, _) => Container(
        padding: const EdgeInsets.all(3),
        decoration: BoxDecoration(
          color: dark ? Colors.white10 : Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: dark ? Colors.white24 : const Color(0xFFE5E0D6)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (final l in Lang.values)
              Semantics(
                button: true,
                selected: l == lang,
                child: InkWell(
                  borderRadius: BorderRadius.circular(7),
                  onTap: () => appLang.value = l,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                    decoration: BoxDecoration(
                      color: l == lang ? (dark ? Colors.white24 : Brand.blue) : Colors.transparent,
                      borderRadius: BorderRadius.circular(7),
                    ),
                    child: Text(l.label,
                        style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w700,
                            color: l == lang ? Colors.white : fg.withValues(alpha: 0.7))),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// Dish photo with a soft placeholder while loading
class DishImage extends StatelessWidget {
  final Dish dish;
  final double? width, height;
  final BorderRadius radius;
  const DishImage(this.dish, {super.key, this.width, this.height, this.radius = const BorderRadius.all(Radius.circular(14))});

  @override
  Widget build(BuildContext context) => ClipRRect(
        borderRadius: radius,
        child: Image.asset(
          dish.image,
          width: width,
          height: height,
          fit: BoxFit.cover,
          errorBuilder: (_, _, _) => Container(
            width: width, height: height, color: const Color(0xFFEDE6DA),
            child: const Icon(Icons.restaurant, color: Brand.muted),
          ),
        ),
      );
}

class StatusChip extends StatelessWidget {
  final OrderStatus status;
  const StatusChip(this.status, {super.key});

  @override
  Widget build(BuildContext context) {
    final c = statusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: c.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(99)),
      child: Text(t('status_${status.name}'), style: TextStyle(color: c, fontWeight: FontWeight.w700, fontSize: 12.5)),
    );
  }
}

class QtyStepper extends StatelessWidget {
  final int value;
  final ValueChanged<int> onChanged;
  final int min;
  const QtyStepper({super.key, required this.value, required this.onChanged, this.min = 1});

  @override
  Widget build(BuildContext context) => Container(
        decoration: BoxDecoration(border: Border.all(color: const Color(0xFFDCD5C8)), borderRadius: BorderRadius.circular(99)),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          IconButton(
            visualDensity: VisualDensity.compact,
            onPressed: value > min ? () => onChanged(value - 1) : null,
            icon: Icon(value == 1 && min == 0 ? Icons.delete_outline : Icons.remove, size: 18),
          ),
          Text('$value', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
          IconButton(visualDensity: VisualDensity.compact, onPressed: () => onChanged(value + 1), icon: const Icon(Icons.add, size: 18)),
        ]),
      );
}

/// Phone-shaped frame used on the demo screen
class PhoneFrame extends StatelessWidget {
  final Widget child;
  const PhoneFrame({super.key, required this.child});

  @override
  Widget build(BuildContext context) => AspectRatio(
        aspectRatio: 390 / 800,
        child: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: const Color(0xFF0B0F14),
            borderRadius: BorderRadius.circular(42),
            boxShadow: const [BoxShadow(color: Color(0x40000000), blurRadius: 30, offset: Offset(0, 16))],
          ),
          child: ClipRRect(borderRadius: BorderRadius.circular(32), child: child),
        ),
      );
}

/// Restaurant logo: initial in a saffron circle
class Logo extends StatelessWidget {
  final double size;
  const Logo({super.key, this.size = 36});

  @override
  Widget build(BuildContext context) => Container(
        width: size,
        height: size,
        alignment: Alignment.center,
        decoration: const BoxDecoration(color: Brand.saffron, shape: BoxShape.circle),
        child: Text(appLang.value == Lang.ar ? 'ب' : 'B',
            style: TextStyle(color: Brand.blueDark, fontWeight: FontWeight.w800, fontSize: size * 0.48)),
      );
}

String tagLabel(String tag) => t(tag);

IconData tagIcon(String tag) => switch (tag) {
      'spicy' => Icons.local_fire_department,
      'veg' => Icons.eco,
      _ => Icons.star_rounded,
    };

Color tagColor(String tag) => switch (tag) {
      'spicy' => const Color(0xFFDC2626),
      'veg' => const Color(0xFF16A34A),
      _ => Brand.saffron,
    };
