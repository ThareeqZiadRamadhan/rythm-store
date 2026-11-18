import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AccountNav from "@/components/AccountNav";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <section className="mx-auto grid max-w-[1200px] gap-6 px-5 py-10 md:grid-cols-[250px_1fr] md:items-start md:px-10 md:py-14">
      <AccountNav />
      <div className="min-w-0 rounded-3xl border border-black/10 bg-white p-6 md:p-10">
        {children}
      </div>
    </section>
  );
}
