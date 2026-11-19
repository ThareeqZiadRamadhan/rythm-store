import { normalizePhone } from "@/lib/phone";

export type AdminInput = {
  name: string;
  email: string;
  phone: string;
  /** Kosong saat edit berarti password tidak diubah. */
  password: string;
};

/**
 * Validasi data akun admin dari form superadmin (tambah & edit).
 * Role tidak diambil dari input: akun yang dikelola di sini selalu ADMIN.
 * Saat tambah, password wajib. Saat edit, password boleh kosong.
 */
export function parseAdminInput(
  body: Record<string, unknown>,
  opts: { requirePassword: boolean }
): { data: AdminInput; error?: undefined } | { data?: undefined; error: string } {
  const name = String(body.name ?? "").trim().replace(/\s+/g, " ");
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (name.length < 2 || name.length > 60) return { error: "Nama wajib diisi (2–60 karakter)." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Format email belum benar." };

  const phone = normalizePhone(String(body.phone ?? "").trim());
  if (!phone) return { error: "Nomor HP belum benar. Contoh: 081234567890." };

  if (opts.requirePassword || password) {
    if (password.length < 8) return { error: "Password minimal 8 karakter." };
  }

  return { data: { name, email, phone, password } };
}
