import { DEFAULT_SETTINGS } from "@/lib/settings-types";

export type ShippingRule = { shippingFee: number; freeShippingMin: number };

// Nilai bawaan (dipakai kalau pengaturan toko belum diisi)
export const FREE_SHIPPING_MIN = DEFAULT_SETTINGS.freeShippingMin;
export const SHIPPING_FEE = DEFAULT_SETTINGS.shippingFee;

export function shippingFor(subtotal: number, rule: ShippingRule = DEFAULT_SETTINGS) {
  if (subtotal === 0 || rule.shippingFee === 0) return 0;
  if (rule.freeShippingMin > 0 && subtotal >= rule.freeShippingMin) return 0;
  return rule.shippingFee;
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
