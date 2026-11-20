import { NextResponse } from "next/server";
import { adminApi } from "@/lib/admin";
import { logActivity } from "@/lib/activity";
import { hashPassword } from "@/lib/auth";
import { parseAdminInput } from "@/lib/userInput";
import User from "@/models/User";

export const dynamic = "force-dynamic";

/**
 * Superadmin menambah akun admin.
 * Pelanggan dibuat lewat halaman daftar, dan superadmin hanya satu (dari seed),
 * jadi role akun baru dari sini selalu ADMIN.
 */
export async function POST(req: Request) {
  const g = await adminApi({ superadmin: true });
  if (g.error) return g.error;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = parseAdminInput(body, { requirePassword: true });
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { name, email, phone, password } = parsed.data;

  if (await User.exists({ email })) {
    return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
  }

  const user = await User.create({
    name,
    email,
    phone,
    role: "ADMIN",
    passwordHash: await hashPassword(password),
  });

  await logActivity(g.admin, "user.create", email, name);
  return NextResponse.json({ id: String(user._id) }, { status: 201 });
}
