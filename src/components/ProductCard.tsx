"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice, type Product } from "@/lib/data";
import { useStore } from "@/lib/store";
import WishlistButton from "@/components/WishlistButton";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const router = useRouter();

  // Tambah cepat ukuran EU 42. Kalau habis, buka halaman produk untuk pilih ukuran lain.
  async function quickAdd() {
    try {
      const r = await fetch(`/api/products/${product.slug}/stock`, { cache: "no-store" });
      const d = await r.json();
      if ((d.stock?.[42] ?? 0) > 0) {
        addToCart(product.id, 42);
        return;
      }
    } catch {}
    router.push(`/shop/${product.slug}`);
  }

  return (
    <article className="group">
      <div
        className="relative aspect-[4/4.5] overflow-hidden rounded-[28px]"
        style={{ backgroundColor: product.color }}
      >
        {product.tag && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider">
            {product.tag}
          </span>
        )}
        <WishlistButton slug={product.slug} className="absolute right-4 top-4 z-10" />
        <Link href={`/shop/${product.slug}`} className="block h-full">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
        <button
          onClick={quickAdd}
          className="absolute bottom-4 left-4 right-4 flex translate-y-4 items-center justify-center gap-2 rounded-full bg-[#11120f] px-5 py-3.5 text-sm font-bold text-white opacity-0 transition-all duration-300 hover:bg-[#789600] group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Plus size={17} /> Tambah cepat
        </button>
      </div>
      <Link
        href={`/shop/${product.slug}`}
        className="mt-5 flex items-start justify-between gap-4 px-1"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-black/45">
            {product.category}
          </p>
          <h3 className="mt-1 text-lg font-bold tracking-tight">{product.name}</h3>
        </div>
        <div className="text-right">
          <p className="font-bold">{formatPrice(product.price)}</p>
          {product.oldPrice && (
            <p className="mt-1 text-xs text-black/35 line-through">
              {formatPrice(product.oldPrice)}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
