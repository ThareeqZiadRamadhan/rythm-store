import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();

  return (
    <section className="mx-auto grid max-w-[1400px] gap-6 px-5 py-10 md:grid-cols-[240px_1fr] md:items-start md:px-10 md:py-14">
      <AdminNav role={admin.role} />
      <div className="min-w-0 rounded-3xl border border-black/10 bg-white p-6 md:p-10">
        {children}
      </div>
    </section>
  );
}
