"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Package, Settings, Ticket, User } from "lucide-react";

const items = [
  { href: "/account", label: "Profil", icon: User },
  { href: "/account/orders", label: "Pesanan saya", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/vouchers", label: "Voucher saya", icon: Ticket },
  { href: "/account/settings", label: "Pengaturan", icon: Settings },
];

export default function AccountNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Menu akun"
      className="flex gap-2 overflow-x-auto rounded-3xl border border-black/10 bg-white p-3 md:sticky md:top-28 md:flex-col md:gap-1 md:overflow-visible"
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/account" ? pathname === href : pathname.startsWith(href);
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
      })}
    </nav>
  );
}
