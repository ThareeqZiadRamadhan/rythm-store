import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { createSession, hashPassword } from "@/lib/auth";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "First and last name are required." }, { status: 400 });
    }
    if (!/^\+\d{9,15}$/.test(phone)) {
      return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    await connectDB();

    const exists = await User.exists({ email });
    if (exists) {
      return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
    }

    // Role selalu USER. Role tidak pernah diambil dari input client.
    const user = await User.create({
      name: `${firstName} ${lastName}`,
      phone,
      email,
      passwordHash: await hashPassword(password),
      role: "USER",
    });

    await createSession({ sub: String(user._id), name: user.name, role: "USER" });

    return NextResponse.json(
      { user: { id: String(user._id), name: user.name, email: user.email, role: user.role } },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong on the server." }, { status: 500 });
  }
}