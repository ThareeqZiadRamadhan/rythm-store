import { formatPrice } from "@/lib/data";

export type VoucherType = "PERCENT" | "FIXED";

export type VoucherInput = {
  code: string;
  title: string;
  description: string;
  type: VoucherType;
  value: number;
  minSpend: number;
  maxDiscount: number;
  quota: number;
  expiresAt: Date | null;
  isActive: boolean;
};

const str = (v: unknown) => String(v ?? "").trim();
const num = (v: unknown) => Math.max(0, Math.round(Number(v) || 0));

/** Tanggal "YYYY-MM-DD" (WIB) dari sebuah Date. */
export function toDateInput(d: Date | string | null | undefined) {
  if (!d) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(d));
}

export function describeVoucher(v: { type: string; value: number; minSpend: number; maxDiscount: number }) {
  const nilai = v.type === "PERCENT" ? `${v.value}%` : formatPrice(v.value);
  const maks = v.type === "PERCENT" && v.maxDiscount > 0 ? `, maks. ${formatPrice(v.maxDiscount)}` : "";
  const min = v.minSpend > 0 ? `, min. belanja ${formatPrice(v.minSpend)}` : "";
  return `${nilai}${maks}${min}`;
}

/** Validasi data voucher dari form superadmin. */
export function parseVoucherInput(raw: unknown): { data: VoucherInput } | { error: string } {
  const b = (raw ?? {}) as Record<string, unknown>;

  const code = str(b.code).toUpperCase().replace(/\s+/g, "");
  if (!/^[A-Z0-9]{3,20}$/.test(code)) {
    return { error: "Kode harus 3–20 huruf atau angka, tanpa spasi." };
  }

  const title = str(b.title);
  if (title.length < 3) return { error: "Judul voucher minimal 3 karakter." };

  const type = str(b.type) as VoucherType;
  if (type !== "PERCENT" && type !== "FIXED") return { error: "Pilih jenis voucher." };

  const value = num(b.value);
  if (type === "PERCENT" && (value < 1 || value > 90)) {
    return { error: "Diskon persen harus antara 1% dan 90%." };
  }
  if (type === "FIXED" && value < 1000) {
    return { error: "Potongan nominal minimal Rp1.000." };
  }

  const minSpend = num(b.minSpend);
  const maxDiscount = type === "PERCENT" ? num(b.maxDiscount) : 0;
  if (type === "FIXED" && minSpend > 0 && value > minSpend) {
    return { error: "Potongan tidak boleh lebih besar dari minimum belanja." };
  }

  const quota = num(b.quota);

  const exp = str(b.expiresAt);
  let expiresAt: Date | null = null;
  if (exp) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(exp)) return { error: "Tanggal berakhir tidak valid." };
    expiresAt = new Date(`${exp}T23:59:59+07:00`);
  }

  return {
    data: {
      code,
      title,
      description: str(b.description),
      type,
      value,
      minSpend,
      maxDiscount,
      quota,
      expiresAt,
      isActive: b.isActive !== false,
    },
  };
}
