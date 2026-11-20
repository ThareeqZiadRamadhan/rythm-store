"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Package, Settings, Ticket, User } from "lucide-react";

const items = [
  { href: "/account", label: "Profile", icon: User },
  { href: "/account/orders", label: "My orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/vouchers", label: "My vouchers", icon: Ticket },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export default function AccountNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account menu"
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
