/** Ubah input nomor HP jadi format internasional (+62...). Null kalau tidak valid. */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  let phone: string;
  if (raw.startsWith("+")) phone = "+" + digits;
  else if (digits.startsWith("0")) phone = "+62" + digits.slice(1);
  else if (digits.startsWith("62")) phone = "+" + digits;
  else phone = "+62" + digits;
  return /^\+\d{9,15}$/.test(phone) ? phone : null;
}
