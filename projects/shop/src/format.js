// A product's price is the current (discounted) price; derive the "was" price
export function originalPrice(price, discount) {
  const d = discount || 0;
  return d >= 5 ? Math.round(price / (1 - d / 100) / 100) * 100 : null;
}

export const FREE_SHIPPING_FROM = 50000;

// Delivery price (DA) and delay (days) per wilaya zone, for home delivery or stop desk pickup
const RATES = {
  1: { home: 400, desk: 250, days: [1, 2] },
  2: { home: 600, desk: 400, days: [2, 3] },
  3: { home: 800, desk: 550, days: [3, 4] },
  4: { home: 1200, desk: 900, days: [4, 6] },
};

export const deliveryDays = (wilaya) => RATES[wilaya.zone].days;

// Returns null until a wilaya is chosen
export function shippingCost(wilaya, method, subtotal) {
  if (!wilaya) return null;
  if (subtotal >= FREE_SHIPPING_FROM) return 0;
  return RATES[wilaya.zone][method];
}

export const ORDER_STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled", "returned"];
