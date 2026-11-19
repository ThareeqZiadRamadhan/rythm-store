import { redirect } from "next/navigation";
import AuthPage from "@/views/AuthPage";
import { getSession } from "@/lib/auth";

export const metadata = { title: "Daftar — RYTHM" };

export default async function RegisterPage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "ADMIN" || session.role === "SUPERADMIN" ? "/admin" : "/");
  }
  return <AuthPage mode="register" />;
}
