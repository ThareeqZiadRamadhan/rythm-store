import { notFound, redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export type AdminRole = "ADMIN" | "SUPERADMIN";
export type AdminUser = { id: string; name: string; role: AdminRole };

async function findAdmin(superadmin: boolean) {
  const session = await getSession();
  if (!session) return { session: false, admin: null as AdminUser | null };

  await connectDB();
  const user = await User.findById(session.sub).select("name role").lean();
  const role = user?.role;
  const allowed = superadmin ? role === "SUPERADMIN" : role === "ADMIN" || role === "SUPERADMIN";
  if (!user || !allowed) return { session: true, admin: null as AdminUser | null };

  return {
    session: true,
    admin: { id: session.sub, name: user.name, role: role as AdminRole },
  };
}

/** Untuk halaman: belum login -> /login, bukan admin -> 404. */
export async function requireAdmin(opts: { superadmin?: boolean } = {}) {
  const { session, admin } = await findAdmin(Boolean(opts.superadmin));
  if (!session) redirect("/login");
  if (!admin) notFound();
  return admin;
}

/** Untuk API: mengembalikan admin, atau response error 401/403. */
export async function adminApi(
  opts: { superadmin?: boolean } = {}
): Promise<{ admin: AdminUser; error?: undefined } | { admin?: undefined; error: NextResponse }> {
  const { session, admin } = await findAdmin(Boolean(opts.superadmin));
  if (!session) {
    return { error: NextResponse.json({ error: "Silakan masuk dulu." }, { status: 401 }) };
  }
  if (!admin) {
    return { error: NextResponse.json({ error: "Akses ditolak." }, { status: 403 }) };
  }
  return { admin };
}
