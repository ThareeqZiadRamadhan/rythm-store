import { requireAdmin } from "@/lib/admin";
import UserForm from "@/components/admin/UserForm";

export const metadata = { title: "Tambah admin — Admin RYTHM" };

export default async function NewAdminPage() {
  await requireAdmin({ superadmin: true });
  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Tambah admin</h1>
      <p className="mb-8 mt-2 text-sm text-black/50">
        Akun admin bisa langsung dipakai untuk login dan mengelola toko.
      </p>
      <UserForm />
    </div>
  );
}
