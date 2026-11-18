"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, History, LayoutDashboard, Package, Settings, Tag, Ticket, Users } from "lucide-react";

export default function AdminNav({ role }: { role: "ADMIN" | "SUPERADMIN" }) {
  const pathname = usePathname();
  const isSuper = role === "SUPERADMIN";

  const items = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Produk", icon: Tag },
    { href: "/admin/orders", label: "Pesanan", icon: Package },
  ];
  const superItems = [
    { href: "/admin/vouchers", label: "Voucher", icon: Ticket },
    { href: "/admin/users", label: "Pengguna", icon: Users },
    { href: "/admin/activity", label: "Log aktivitas", icon: History },
    { href: "/admin/settings", label: "Pengaturan", icon: Settings },
  ];

  const renderLink = ({ href, label, icon: Icon }: (typeof items)[number]) => {
    const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
          active ? "bg-[#11120f] text-white" : "hover:bg-black/5"
        }`}
      >
        <Icon size={18} strokeWidth={1.7} />
        {label}
      </Link>
    );
  };

  return (
    <nav
      aria-label="Menu admin"
      className="flex gap-2 overflow-x-auto rounded-3xl border border-black/10 bg-white p-3 md:sticky md:top-28 md:flex-col md:gap-1 md:overflow-visible"
    >
      <p className="hidden px-4 pb-1 pt-2 text-[11px] font-black uppercase tracking-[0.18em] text-black/40 md:block">
        Operasional
      </p>
      {items.map(renderLink)}

      {isSuper && (
        <>
          <p className="hidden px-4 pb-1 pt-4 text-[11px] font-black uppercase tracking-[0.18em] text-black/40 md:block">
            Superadmin
          </p>
          {superItems.map(renderLink)}
        </>
      )}

      <div className="my-1 hidden h-px bg-black/10 md:block" />
      <Link
        href="/"
        className="flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-black/55 hover:bg-black/5 hover:text-black"
      >
        <ArrowLeft size={18} strokeWidth={1.7} />
        Kembali ke toko
      </Link>
    </nav>
  );
}
