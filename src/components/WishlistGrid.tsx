"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, X } from "lucide-react";
import { formatPrice } from "@/lib/data";
import { useWishlist } from "@/lib/wishlist";
import AccountEmpty from "@/components/AccountEmpty";

export type WishlistItem = {
  slug: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number | null;
  image: string;
  color: string;
};

export default function WishlistGrid({ initial }: { initial: WishlistItem[] }) {
  const [items, setItems] = useState(initial);
  const [removing, setRemoving] = useState<string | null>(null);
  const { toggle } = useWishlist();

  async function remove(slug: string) {
    setRemoving(slug);
    const saved = await toggle(slug);
    if (saved === false) {
      await new Promise((r) => setTimeout(r, 250));
      setItems((list) => list.filter((i) => i.slug !== slug));
    }
    setRemoving(null);
  }

  if (items.length === 0) {
    return (
      <AccountEmpty
        icon={Heart}
        title="Wishlist masih kosong"
        text="Klik ikon hati di produk untuk menyimpannya di sini."
        href="/shop"
        cta="Lihat koleksi"
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((p) => (
        <div
          key={p.slug}
          className={`group relative overflow-hidden rounded-3xl bg-[#f7f7f2] transition-all duration-300 ${
            removing === p.slug ? "scale-95 opacity-0" : ""
          }`}
        >
          <button
            type="button"
            onClick={() => remove(p.slug)}
            aria-label={`Hapus ${p.name} dari wishlist`}
            className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-white/90 shadow-sm transition hover:bg-red-50 hover:text-red-600"
          >
            <X size={16} />
          </button>

          <Link href={`/shop/${p.slug}`} className="block">
            <div className="aspect-square overflow-hidden" style={{ backgroundColor: p.color }}>
              <img
                src={p.image}
                alt={p.name}
                className="h-full w-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-black/45">
                {p.category}
              </p>
              <p className="mt-1 font-bold">{p.name}</p>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="font-black">{formatPrice(p.price)}</span>
                {p.oldPrice && (
                  <span className="text-sm text-black/40 line-through">
                    {formatPrice(p.oldPrice)}
                  </span>
                )}
              </p>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
