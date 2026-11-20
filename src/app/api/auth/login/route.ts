import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { createSession, verifyPassword } from "@/lib/auth";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email }).select("+passwordHash");
    const valid = user ? await verifyPassword(password, user.passwordHash) : false;

    // Pesan sama untuk email salah maupun password salah.
    if (!user || !valid) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { error: "Your account has been deactivated. Please contact RYTHM support for more information." },
        { status: 403 }
      );
    }

    await createSession({
      sub: String(user._id),
      name: user.name,
      role: user.role as "USER" | "ADMIN" | "SUPERADMIN",
    });

    return NextResponse.json({
      user: { id: String(user._id), name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong on the server." }, { status: 500 });
  }
}