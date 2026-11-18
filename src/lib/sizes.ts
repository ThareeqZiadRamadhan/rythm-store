/** Tabel ukuran RYTHM. cm = panjang kaki. Satu sumber untuk slider, halaman /fit, dan filter koleksi. */
export const SIZE_CHART = [
  { eu: 38, cm: 24.0, usM: 6, usW: 7.5, uk: 5 },
  { eu: 39, cm: 24.5, usM: 6.5, usW: 8, uk: 5.5 },
  { eu: 40, cm: 25.0, usM: 7, usW: 8.5, uk: 6 },
  { eu: 41, cm: 26.0, usM: 8, usW: 9.5, uk: 7 },
  { eu: 42, cm: 26.5, usM: 8.5, usW: 10, uk: 7.5 },
  { eu: 43, cm: 27.5, usM: 9.5, usW: 11, uk: 8.5 },
  { eu: 44, cm: 28.0, usM: 10, usW: 11.5, uk: 9 },
  { eu: 45, cm: 29.0, usM: 11, usW: 12.5, uk: 10 },
] as const;

export type SizeRow = (typeof SIZE_CHART)[number];

export const RULER_MAX_CM = 30;
/** Panjang sepatu kira-kira panjang kaki + 1,5 cm. */
export const SHOE_EXTRA_CM = 1.5;
/** Kaki lebar dianggap sedikit lebih panjang supaya rekomendasinya naik bila di batas. */
const WIDE_EXTRA_CM = 0.3;

/** Format angka gaya Indonesia: 26.5 -> "26,5", 28 -> "28". */
export function fmtNum(n: number, digits = 1) {
  const s = n.toFixed(digits).replace(".", ",");
  return s.endsWith(",0") ? s.slice(0, -2) : s;
}

/** Ukuran contoh yang dipakai untuk menggambar sepatu di slider beranda. */
export function sampleSizeFor(gender: string) {
  const eu = gender === "Wanita" ? 38 : 42;
  const row = SIZE_CHART.find((r) => r.eu === eu)!;
  return { ...row, shoeCm: row.cm + SHOE_EXTRA_CM };
}

export type SizeResult =
  | { status: "ok"; row: SizeRow }
  | { status: "small" }
  | { status: "large" };

/** Ambil ukuran terkecil yang panjangnya cukup. Di antara dua ukuran, otomatis pilih yang lebih besar. */
export function recommendSize(footCm: number, wide: boolean): SizeResult {
  const effective = footCm + (wide ? WIDE_EXTRA_CM : 0);
  if (effective < SIZE_CHART[0].cm - 1.5) return { status: "small" };
  const row = SIZE_CHART.find((r) => r.cm >= effective - 0.05);
  return row ? { status: "ok", row } : { status: "large" };
}
