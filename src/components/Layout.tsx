"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, Minus, Plus, ShoppingBag, Truck, X } from "lucide-react";
import { formatPrice, products } from "@/lib/data";
import { StoreProvider, useStore } from "@/lib/store";
import { AccountMenu, MobileAccountLinks, useSession } from "@/components/AccountMenu";

const navItems = [
  ["Koleksi", "/shop"],
  ["Terbaru", "/new"],
  ["Pria", "/men"],
  ["Wanita", "/women"],
  ["Sale", "/sale"],
];

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart, cartOpen, setCartOpen, updateCart } = useStore();
  const { user, ready, logout } = useSession();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-[#f7f7f2] text-[#11120f]">
      <div className="bg-[#11120f] px-5 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
        Gratis ongkir seluruh Indonesia untuk pembelian di atas Rp999.000
      </div>
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f7f2]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 md:px-10">
          <button
            className="grid size-10 place-items-center rounded-full border border-black/15 lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Buka menu"
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
          <Link href="/" className="text-[25px] font-black tracking-[-0.08em]">
            RYTHM<span className="text-[#8daa13]">/</span>
          </Link>
          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map(([label, path]) => {
              const isActive = pathname === path || pathname.startsWith(path + "/");
              return (
                <Link
                  key={path}
                  href={path}
                  className={`text-sm font-semibold transition-colors hover:text-[#769500] ${
                    isActive ? "text-[#769500]" : ""
                  } ${path === "/sale" ? "!text-[#e2533f]" : ""}`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
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
          {[
            ["Shop", "Koleksi", "Terbaru", "Sale"],
            ["Bantuan", "Lacak pesanan", "Pengiriman", "Retur"],
            ["Follow", "Instagram", "TikTok", "Pinterest"],
          ].map(([title, ...links]) => (
            <div key={title}>
              <h4 className="text-xs font-black uppercase tracking-[0.18em]">{title}</h4>
              <div className="mt-4 flex flex-col gap-3 text-sm text-black/50">
                {links.map((link) => (
                  <span key={link}>{link}</span>
                ))}
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
                  {cart.map((item) => {
                    const product = products.find((entry) => entry.id === item.productId);
                    if (!product) return null;
                    return (
                      <div key={`${item.productId}-${item.size}`} className="flex gap-4">
                        <Link
                          href={`/shop/${product.slug}`}
                          onClick={() => setCartOpen(false)}
                          className="size-24 shrink-0 overflow-hidden rounded-2xl"
                          style={{ backgroundColor: product.color }}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover mix-blend-multiply"
                          />
                        </Link>
                        <div className="flex flex-1 flex-col justify-between py-1">
                          <div>
                            <h3 className="font-bold">{product.name}</h3>
                            <p className="mt-1 text-xs text-black/45">Size {item.size}</p>
                          </div>
                          <div className="flex items-end justify-between">
                            <div className="flex items-center rounded-full border border-black/15">
                              <button
                                onClick={() => updateCart(item.productId, item.size, -1)}
                                className="grid size-8 place-items-center"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="w-6 text-center text-xs font-bold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCart(item.productId, item.size, 1)}
                                className="grid size-8 place-items-center"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                            <p className="text-sm font-bold">
                              {formatPrice(product.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-black/10 bg-white p-6">
                <div className="mb-4 flex items-center gap-2 text-xs text-black/50">
                  <Truck size={15} />{" "}
                  {subtotal >= 999000
                    ? "Pesananmu bebas ongkir"
                    : `Tambah ${formatPrice(999000 - subtotal)} lagi untuk gratis ongkir`}
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

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <Shell>{children}</Shell>
    </StoreProvider>
  );
}