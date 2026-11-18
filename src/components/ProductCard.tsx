"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/data";
import type { Product } from "@/lib/catalog-types";
import { useStore } from "@/lib/store";
import WishlistButton from "@/components/WishlistButton";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const router = useRouter();
  const soldOut = product.totalStock <= 0;
  const quickSize = 42;
  const canQuickAdd = (product.stock[quickSize] ?? 0) > 0;

  function quickAdd() {
    if (canQuickAdd) {
      addToCart(
        {
          slug: product.slug,
          name: product.name,
          image: product.image,
          color: product.color,
          price: product.price,
        },
        quickSize,
      );
      return;
    }
    router.push(`/shop/${product.slug}`);
  }

  return (
    <article className="group">
      <div
        className="relative aspect-[4/4.5] overflow-hidden rounded-[28px]"
        style={{ backgroundColor: product.color }}
      >
        {soldOut ? (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-[#11120f] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Stok habis
          </span>
        ) : (
          product.tag && (
            <span className="absolute left-4 top-4 z-10 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider">
              {product.tag}
            </span>
          )
        )}
        <WishlistButton slug={product.slug} className="absolute right-4 top-4 z-10" />
        <Link href={`/shop/${product.slug}`} className="block h-full">
          <img
            src={product.image}
            alt={product.name}
            className={`h-full w-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105 ${
              soldOut ? "opacity-60 grayscale" : ""
            }`}
          />
        </Link>
        {!soldOut && (
          <button
            onClick={quickAdd}
            className="absolute bottom-4 left-4 right-4 flex translate-y-4 items-center justify-center gap-2 rounded-full bg-[#11120f] px-5 py-3.5 text-sm font-bold text-white opacity-0 transition-all duration-300 hover:bg-[#789600] group-hover:translate-y-0 group-hover:opacity-100"
          >
            {canQuickAdd ? (
              <>
                <Plus size={17} /> Tambah cepat
              </>
            ) : (
              "Pilih ukuran"
            )}
          </button>
        )}
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
