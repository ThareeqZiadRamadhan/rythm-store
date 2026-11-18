import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { adminApi } from "@/lib/admin";
import { logActivity } from "@/lib/activity";
import User, { ROLES } from "@/models/User";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  USER: "Pelanggan",
  ADMIN: "Admin",
  SUPERADMIN: "Superadmin",
};

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminApi({ superadmin: true });
  if (g.error) return g.error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "ID user tidak valid." }, { status: 400 });
  }
  if (id === g.admin.id) {
    return NextResponse.json({ error: "Kamu tidak bisa mengubah role sendiri." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const role = String(body.role ?? "");
  if (!(ROLES as readonly string[]).includes(role)) {
    return NextResponse.json({ error: "Role tidak valid." }, { status: 400 });
  }

  const target = await User.findById(id).select("email role").lean();
  if (!target) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
  if (target.role === role) return NextResponse.json({ role });

  await User.updateOne({ _id: id }, { $set: { role } });
  await logActivity(
    g.admin,
    "user.role",
    target.email,
    `${ROLE_LABEL[target.role ?? "USER"]} → ${ROLE_LABEL[role]}`
  );

  return NextResponse.json({ role });
}
