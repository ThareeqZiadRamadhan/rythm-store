import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const COOKIE_NAME = "rythm_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

export type Role = "USER" | "ADMIN" | "SUPERADMIN";

export type SessionPayload = {
  sub: string; // id user
  name: string;
  role: Role;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET belum diisi di .env.local");
  return new TextEncoder().encode(secret);
}

export const hashPassword = (plain: string) => bcrypt.hash(plain, 10);
export const verifyPassword = (plain: string, hash: string) =>
  bcrypt.compare(plain, hash);

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ name: payload.name, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  let sub: string;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub) return null;
    sub = payload.sub;
  } catch {
    return null;
  }

  // Cek ke database: akun yang dihapus atau diblokir langsung dianggap keluar,
  // dan nama/role selalu yang terbaru.
  try {
    await connectDB();
    const user = await User.findById(sub).select("name role isBlocked").lean();
    if (!user || user.isBlocked) return null;
    return { sub, name: user.name, role: (user.role as Role) ?? "USER" };
  } catch {
    return null;
  }
}