import { requireAdmin } from "@/lib/admin";
import UserForm from "@/components/admin/UserForm";

export const metadata = { title: "Add admin — Admin RYTHM" };

export default async function NewAdminPage() {
  await requireAdmin({ superadmin: true });
  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Add admin</h1>
      <p className="mb-8 mt-2 text-sm text-black/50">
        The admin account can sign in and manage the store right away.
      </p>
      <UserForm />
    </div>
  );
}
