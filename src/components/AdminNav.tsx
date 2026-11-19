"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Tag,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { useSession } from "@/components/AccountMenu";

type Role = "ADMIN" | "SUPERADMIN";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produk", icon: Tag },
  { href: "/admin/orders", label: "Pesanan", icon: Package },
];
const SUPER_ITEMS = [
  { href: "/admin/vouchers", label: "Voucher", icon: Ticket },
  { href: "/admin/users", label: "Pengguna", icon: Users },
  { href: "/admin/activity", label: "Log aktivitas", icon: History },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

function Brand() {
  return (
    <Link href="/admin" className="flex items-baseline gap-2">
      <span className="text-[24px] font-black tracking-[-0.08em] text-white">
        RYTHM<span className="text-[#b8df2e]">/</span>
      </span>
      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
        Admin
      </span>
    </Link>
  );
}

export default function AdminNav({ role, name }: { role: Role; name: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useSession();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const isSuper = role === "SUPERADMIN";

  async function handleLogout() {
    setLeaving(true);
    try {
      await logout();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  const renderLink = ({ href, label, icon: Icon }: (typeof ITEMS)[number]) => {
    const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        onClick={() => setOpen(false)}
        className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-medium transition-colors ${
          active ? "bg-white text-[#11120f]" : "text-white/65 hover:bg-white/[0.07] hover:text-white"
        }`}
      >
        <Icon size={18} strokeWidth={1.8} />
        {label}
      </Link>
    );
  };

  return (
    <>
      {/* Bar atas di HP */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between bg-[#11120f] px-5 lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka menu admin"
          className="grid size-10 place-items-center rounded-full text-white hover:bg-white/10"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Latar gelap saat menu HP terbuka */}
      {open && (
        <button
          type="button"
          aria-label="Tutup menu admin"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#11120f] px-4 py-6 transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <Brand />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu admin"
            className="grid size-9 place-items-center rounded-full text-white/70 hover:bg-white/10 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav aria-label="Menu admin" className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto">
          <p className="px-3.5 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">
            Operasional
          </p>
          {ITEMS.map(renderLink)}

          {isSuper && (
            <>
              <p className="px-3.5 pb-2 pt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">
                Superadmin
              </p>
              {SUPER_ITEMS.map(renderLink)}
            </>
          )}
        </nav>

        {/* Profil + aksi */}
        <div className="mt-6 rounded-2xl bg-white/[0.06] p-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#b8df2e] text-sm font-black text-[#11120f]">
              {(name || "A").charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{name || "Admin"}</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#b8df2e]">
                {isSuper ? "Superadmin" : "Admin"}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-white/[0.08] px-3 py-2.5 text-[13px] font-medium text-white/80 hover:bg-white/15 hover:text-white"
            >
              Lihat toko <ArrowUpRight size={14} />
            </a>
            <button
              type="button"
              onClick={handleLogout}
              disabled={leaving}
              className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-white/[0.08] px-3 py-2.5 text-[13px] font-medium text-white/80 hover:bg-[#e2533f] hover:text-white disabled:opacity-50"
            >
              <LogOut size={14} /> {leaving ? "Keluar…" : "Keluar"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}