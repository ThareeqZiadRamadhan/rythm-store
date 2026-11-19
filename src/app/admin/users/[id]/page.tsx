import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin";
import User from "@/models/User";
import UserForm from "@/components/admin/UserForm";

export const metadata = { title: "Edit admin — Admin RYTHM" };
export const dynamic = "force-dynamic";

export default async function EditAdminPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin({ superadmin: true });
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  // Hanya akun admin yang bisa diedit dari sini.
  const u = await User.findOne({ _id: id, role: "ADMIN" }).select("name email phone").lean();
  if (!u) notFound();

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Edit admin</h1>
      <p className="mb-8 mt-2 text-sm text-black/50">{u.email}</p>
      <UserForm
        id={id}
        initial={{ name: u.name, email: u.email, phone: u.phone ?? "", password: "" }}
      />
    </div>
  );
}
