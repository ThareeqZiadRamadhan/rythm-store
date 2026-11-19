import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const name = (admin as { name?: string }).name ?? "Admin";

  return (
    <div className="min-h-screen bg-[#f1f1ec]">
      <AdminNav role={admin.role} name={name} />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-[1280px] px-5 py-8 md:px-10 md:py-10">
          <div className="min-w-0 rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] md:p-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
