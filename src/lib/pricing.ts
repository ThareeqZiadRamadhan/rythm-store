export const FREE_SHIPPING_MIN = 999000;
export const SHIPPING_FEE = 25000;

export function shippingFor(subtotal: number) {
  return subtotal === 0 || subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
}

export type DiscountRule = {
  type: "PERCENT" | "FIXED";
  value: number;
  minSpend: number;
  maxDiscount: number;
};

/** Potongan voucher untuk subtotal tertentu. 0 kalau minimum belanja belum tercapai. */
export function calcDiscount(v: DiscountRule, subtotal: number) {
  if (subtotal < v.minSpend) return 0;
  let d = v.type === "PERCENT" ? Math.floor((subtotal * v.value) / 100) : v.value;
  if (v.type === "PERCENT" && v.maxDiscount > 0) d = Math.min(d, v.maxDiscount);
  return Math.min(d, subtotal);
}
