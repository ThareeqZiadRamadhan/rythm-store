import { formatPrice } from "@/lib/data";

export type PublicSettings = {
  announcementEnabled: boolean;
  announcementText: string;
  /** 0 = selalu gratis ongkir */
  shippingFee: number;
  /** 0 = tidak ada gratis ongkir berdasarkan minimum belanja */
  freeShippingMin: number;
};

export const DEFAULT_SETTINGS: PublicSettings = {
  announcementEnabled: true,
  announcementText: "Free shipping across Indonesia on orders over Rp999,000",
  shippingFee: 25000,
  freeShippingMin: 999000,
};

/** Kalimat aturan ongkir untuk ditampilkan ke pembeli. */
export function freeShippingText(s: Pick<PublicSettings, "shippingFee" | "freeShippingMin">) {
  if (s.shippingFee === 0) return "Free shipping across Indonesia";
  if (s.freeShippingMin > 0) {
    return `Free shipping across Indonesia on orders over ${formatPrice(s.freeShippingMin)}`;
  }
  return `Shipping ${formatPrice(s.shippingFee)} anywhere in Indonesia`;
}
