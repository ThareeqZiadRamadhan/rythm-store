import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { adminApi } from "@/lib/admin";
import { logActivity } from "@/lib/activity";
import { hashPassword } from "@/lib/auth";
import { parseAdminInput } from "@/lib/userInput";
import User from "@/models/User";
import Review from "@/models/Review";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const onlyAdmin = () =>
  NextResponse.json({ error: "Only admin accounts can be edited or deleted here." }, { status: 403 });

/** Cek akses superadmin dan ID target. Akun sendiri tidak bisa diubah/dihapus dari panel ini. */
async function guard(params: Ctx["params"]) {
  const g = await adminApi({ superadmin: true });
  if (g.error) return { error: g.error };

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return { error: NextResponse.json({ error: "Invalid user ID." }, { status: 400 }) };
  }
  if (id === g.admin.id) {
    return {
      error: NextResponse.json(
        { error: "You cannot change your own account here. Use the Account page instead." },
        { status: 400 }
      ),
    };
  }

  const target = await User.findById(id).select("name email phone role isBlocked").lean();
  if (!target) return { error: NextResponse.json({ error: "User not found." }, { status: 404 }) };

  return { admin: g.admin, id, target };
}

export async function PATCH(req: Request, { params }: Ctx) {
  const g = await guard(params);
  if (g.error) return g.error;
  const { admin, id, target } = g;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  // Blokir / aktifkan akun (pelanggan atau admin, tidak untuk superadmin)
  if ("isBlocked" in body) {
    if (target.role === "SUPERADMIN") {
      return NextResponse.json({ error: "Superadmin accounts cannot be blocked." }, { status: 403 });
    }
    const blocked = Boolean(body.isBlocked);
    if (Boolean(target.isBlocked) !== blocked) {
      await User.updateOne({ _id: id }, { $set: { isBlocked: blocked } });
      await logActivity(admin, blocked ? "user.block" : "user.unblock", target.email);
    }
    return NextResponse.json({ isBlocked: blocked });
  }

  // Edit data akun admin (nama, email, HP, reset password). Role tidak bisa diubah.
  if (target.role !== "ADMIN") return onlyAdmin();

  const parsed = parseAdminInput(body, { requirePassword: false });
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { name, email, phone, password } = parsed.data;

  if (email !== target.email && (await User.exists({ email, _id: { $ne: id } }))) {
    return NextResponse.json({ error: "This email is already used by another account." }, { status: 409 });
  }

  const changes: string[] = [];
  if (name !== target.name) changes.push("name");
  if (email !== target.email) changes.push(`email ${target.email} → ${email}`);
  if (phone !== (target.phone ?? "")) changes.push("phone number");
  if (password) changes.push("reset password");
  if (changes.length === 0) return NextResponse.json({ ok: true });

  await User.updateOne(
    { _id: id },
    {
      $set: {
        name,
        email,
        phone,
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
      },
    }
  );
  // Nama di ulasan ikut diperbarui supaya konsisten.
  if (name !== target.name) await Review.updateMany({ user: id }, { $set: { userName: name } });

  await logActivity(admin, "user.update", email, changes.join(", "));
  return NextResponse.json({ ok: true });
}

/** Hapus akun admin. Ulasan yang pernah ditulis akun ini ikut dihapus. */
export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await guard(params);
  if (g.error) return g.error;
  const { admin, id, target } = g;

  if (target.role !== "ADMIN") return onlyAdmin();

  await User.deleteOne({ _id: id });
  const { deletedCount } = await Review.deleteMany({ user: id });

  await logActivity(
    admin,
    "user.delete",
    target.email,
    `${target.name}${deletedCount ? ` · ${deletedCount} ${deletedCount === 1 ? "review" : "reviews"} also deleted` : ""}`
  );
  return NextResponse.json({ ok: true });
}
