import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  let phone: string;
  if (raw.startsWith("+")) phone = "+" + digits;
  else if (digits.startsWith("0")) phone = "+62" + digits.slice(1);
  else if (digits.startsWith("62")) phone = "+" + digits;
  else phone = "+62" + digits;
  return /^\+\d{9,15}$/.test(phone) ? phone : null;
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Silakan masuk dulu." }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name ?? "").trim();
    const rawPhone = String(body.phone ?? "").trim();

    if (name.length < 2) {
      return NextResponse.json({ error: "Nama minimal 2 karakter." }, { status: 400 });
    }

    let phone = "";
    if (rawPhone) {
      const normalized = normalizePhone(rawPhone);
      if (!normalized) {
        return NextResponse.json({ error: "Nomor HP belum benar." }, { status: 400 });
      }
      phone = normalized;
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(
      session.sub,
      { name, phone },
      { new: true }
    ).select("name email phone");

    if (!user) {
      return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      user: { name: user.name, email: user.email, phone: user.phone ?? "" },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan di server." }, { status: 500 });
  }
}
