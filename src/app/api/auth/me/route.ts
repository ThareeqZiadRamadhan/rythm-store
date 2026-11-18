import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  try {
    await connectDB();
    const user = await User.findById(session.sub).select("name email role").lean();

    // Akun sudah dihapus dari database, anggap tidak login.
    if (!user) return NextResponse.json({ user: null });

    return NextResponse.json({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}