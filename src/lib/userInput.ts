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

  if (name.length < 2 || name.length > 60) return { error: "Name is required (2–60 characters)." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Please enter a valid email address." };

  const phone = normalizePhone(String(body.phone ?? "").trim());
  if (!phone) return { error: "Please enter a valid phone number, e.g. 081234567890." };

  if (opts.requirePassword || password) {
    if (password.length < 8) return { error: "Password must be at least 8 characters." };
  }

  return { data: { name, email, phone, password } };
}
