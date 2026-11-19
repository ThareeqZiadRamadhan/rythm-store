"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, Minus, Plus, ShoppingBag, Truck, X } from "lucide-react";
import { formatPrice } from "@/lib/data";
import { SettingsProvider } from "@/lib/settings-context";
import type { PublicSettings } from "@/lib/settings-types";
import { StoreProvider, useStore } from "@/lib/store";
import { AccountMenu, MobileAccountLinks, useSession } from "@/components/AccountMenu";
import SearchButton from "@/components/SearchButton";

const navItems = [
  ["Koleksi", "/shop"],
  ["Terbaru", "/new"],
  ["Pria", "/men"],
  ["Wanita", "/women"],
  ["Sale", "/sale"],
];

const FOOTER_LINKS: { title: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Koleksi", href: "/shop" },
      { label: "Terbaru", href: "/new" },
      { label: "Sale", href: "/sale" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "Lacak pesanan", href: "/account/orders" },
      { label: "Cari ukuran", href: "/fit" },
      { label: "Pengiriman", href: "/bantuan#pengiriman" },
      { label: "Retur", href: "/bantuan#retur" },
    ],
  },
  {
    title: "Follow",
    links: [
      { label: "Instagram", href: "https://www.instagram.com/", external: true },
      { label: "TikTok", href: "https://www.tiktok.com/", external: true },
      { label: "Pinterest", href: "https://www.pinterest.com/", external: true },
    ],
  },
];

function Shell({ children, settings }: { children: ReactNode; settings: PublicSettings }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart, cartOpen, setCartOpen, updateCart } = useStore();
  const { user, ready, logout } = useSession();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Halaman admin punya tampilan sendiri: tanpa navbar, footer, banner, dan keranjang toko
  if (pathname.startsWith("/admin")) {
    return <div className="min-h-screen bg-[#f1f1ec] text-[#11120f]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f2] text-[#11120f]">
      {settings.announcementEnabled && settings.announcementText && (
        <div className="bg-[#11120f] px-5 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          {settings.announcementText}
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f7f2]/92 backdrop-blur-xl">
        <div className="mx-auto grid h-[76px] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-5 md:px-10">
          {/* Kiri: menu */}
          <div className="flex items-center justify-start">
            <button
              className="grid size-10 place-items-center rounded-full border border-black/15 lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Buka menu"
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
            <nav className="hidden items-center gap-8 lg:flex">
              {navItems.map(([label, path]) => {
                const isActive = pathname === path || pathname.startsWith(path + "/");
                return (
                  <Link
                    key={path}
                    href={path}
                    className={`text-[15px] font-semibold transition-colors hover:text-[#769500] ${
                      isActive ? "text-[#769500]" : ""
                    } ${path === "/sale" ? "!text-[#e2533f]" : ""}`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Tengah: logo */}
          <Link href="/" className="justify-self-center text-[25px] font-black tracking-[-0.08em]">
            RYTHM<span className="text-[#8daa13]">/</span>
          </Link>

          {/* Kanan: cari, akun, keranjang */}
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <SearchButton />
            <AccountMenu user={user} ready={ready} onLogout={logout} />

            <button
              className="relative grid size-10 place-items-center rounded-full transition-colors hover:bg-black/5"
              onClick={() => setCartOpen(true)}
              aria-label="Keranjang"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 grid size-5 place-items-center rounded-full bg-[#b8df2e] text-[10px] font-black">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="absolute inset-x-0 top-full flex flex-col border-b border-black/10 bg-[#f7f7f2] p-5 shadow-xl lg:hidden">
            {navItems.map(([label, path]) => (
              <Link
                key={path}
                href={path}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold hover:bg-black/5"
              >
                {label}
              </Link>
            ))}
            <MobileAccountLinks
              user={user}
              ready={ready}
              onLogout={logout}
              onNavigate={() => setMenuOpen(false)}
            />
          </nav>
        )}
      </header>

      {children}

      <footer className="border-t border-black/10 px-5 py-12 md:px-10">
        <div className="mx-auto grid max-w-[1440px] gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="text-3xl font-black tracking-[-0.08em]">
              RYTHM<span className="text-[#8daa13]">/</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-black/50">
              Independent sneaker label untuk mereka yang memilih jalannya sendiri.
            </p>
          </div>
          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-black uppercase tracking-[0.18em]">{group.title}</h4>
              <div className="mt-4 flex flex-col gap-3 text-sm text-black/50">
                {group.links.map((link) =>
                  link.external ? (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-fit transition-colors hover:text-black"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link key={link.label} href={link.href} className="w-fit transition-colors hover:text-black">
                      {link.label}
                    </Link>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </footer>

      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Tutup keranjang"
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#f7f7f2] shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
              <div>
                <h2 className="text-xl font-black">Keranjang kamu</h2>
                <p className="mt-1 text-xs text-black/45">{cartCount} item dipilih</p>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                aria-label="Tutup keranjang"
                className="grid size-10 place-items-center rounded-full border border-black/10"
              >
                <X size={19} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="grid size-20 place-items-center rounded-full bg-black/5">
                    <ShoppingBag size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-6 text-xl font-black">Masih kosong.</h3>
                  <p className="mt-2 text-sm text-black/45">
                    Sepatu incaranmu menunggu untuk diajak jalan.
                  </p>
                  <Link
                    href="/shop"
                    onClick={() => setCartOpen(false)}
                    className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-bold text-white"
                  >
                    Mulai belanja
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={`${item.slug}-${item.size}`} className="flex gap-4">
                      <Link
                        href={`/shop/${item.slug}`}
                        onClick={() => setCartOpen(false)}
                        className="size-24 shrink-0 overflow-hidden rounded-2xl"
                        style={{ backgroundColor: item.color }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover mix-blend-multiply"
                        />
                      </Link>
                      <div className="flex flex-1 flex-col justify-between py-1">
                        <div>
                          <h3 className="font-bold">{item.name}</h3>
                          <p className="mt-1 text-xs text-black/45">Size {item.size}</p>
                        </div>
                        <div className="flex items-end justify-between">
                          <div className="flex items-center rounded-full border border-black/15">
                            <button
                              onClick={() => updateCart(item.slug, item.size, -1)}
                              aria-label="Kurangi"
                              className="grid size-8 place-items-center"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateCart(item.slug, item.size, 1)}
                              aria-label="Tambah"
                              className="grid size-8 place-items-center"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <p className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-black/10 bg-white p-6">
                <div className="mb-4 flex items-center gap-2 text-xs text-black/50">
                  <Truck size={15} />{" "}
                  {settings.shippingFee === 0 ||
                  (settings.freeShippingMin > 0 && subtotal >= settings.freeShippingMin)
                    ? "Pesananmu bebas ongkir"
                    : settings.freeShippingMin > 0
                      ? `Tambah ${formatPrice(settings.freeShippingMin - subtotal)} lagi untuk gratis ongkir`
                      : `Ongkir ${formatPrice(settings.shippingFee)} per pesanan`}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Subtotal</span>
                  <span className="text-xl font-black">{formatPrice(subtotal)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-[#c7ea4c] px-6 py-4 font-black"
                >
                  Lanjut checkout <ArrowRight size={18} />
                </Link>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

export default function Layout({
  children,
  settings,
}: {
  children: ReactNode;
  settings: PublicSettings;
}) {
  return (
    <SettingsProvider value={settings}>
      <StoreProvider>
        <Shell settings={settings}>{children}</Shell>
      </StoreProvider>
    </SettingsProvider>
  );
}
