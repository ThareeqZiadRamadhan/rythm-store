"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/data";
import type { Product } from "@/lib/catalog-types";
import WishlistButton from "@/components/WishlistButton";

// Sudut melengkung ke dalam di sekitar tab harga
const NOTCH = "radial-gradient(circle at 0 100%, transparent 20px, #fff 20.5px)";

function niceCategory(c: string) {
  return c ? c.charAt(0).toUpperCase() + c.slice(1).toLowerCase() : "";
}

function Badge({ product, soldOut }: { product: Product; soldOut: boolean }) {
  if (soldOut) {
    return (
      <span className="rounded-full bg-[#11120f] px-3.5 py-1.5 text-[13px] font-medium text-white">
        Sold out
      </span>
    );
  }
  if (product.oldPrice) {
    return (
      <span className="rounded-full bg-[#e5483b] px-3.5 py-1.5 text-[13px] font-medium text-white">
        Sale
      </span>
    );
  }
  if (!product.tag) return null;
  const isNew = /new/i.test(product.tag);
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#111]">
      <span className={`h-2 w-2 rounded-full ${isNew ? "bg-[#e5483b]" : "bg-[#111]"}`} />
      {product.tag}
    </span>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const soldOut = product.totalStock <= 0;
  const href = `/shop/${product.slug}`;

  return (
    <article className="group rounded-[28px] bg-white p-2 ring-1 ring-black/[0.06] transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
      {/* Kotak foto */}
      <div className="relative aspect-square overflow-hidden rounded-[22px] bg-[#ededea]">
        <Link href={href} className="absolute inset-0 block">
          <img
            src={product.image}
            alt={product.name}
            className={`h-full w-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105 ${
              soldOut ? "opacity-60 grayscale" : ""
            }`}
          />
        </Link>

        <div className="absolute left-3 top-3 z-10">
          <Badge product={product} soldOut={soldOut} />
        </div>

        {/* Tab harga di pojok kanan atas */}
        <div className="absolute right-0 top-0 z-10 rounded-bl-[20px] bg-white pb-3 pl-5 pr-2 pt-1 text-right">
          <span className="pointer-events-none absolute right-full top-0 h-5 w-5" style={{ background: NOTCH }} />
          <span className="pointer-events-none absolute right-0 top-full h-5 w-5" style={{ background: NOTCH }} />
          {product.oldPrice ? (
            <p className="flex items-baseline gap-2 whitespace-nowrap">
              <span className="text-[13px] text-black/40 line-through">{formatPrice(product.oldPrice)}</span>
              <span className="text-lg font-semibold tracking-tight text-[#e5483b]">
                {formatPrice(product.price)}
              </span>
            </p>
          ) : (
            <p className="whitespace-nowrap text-lg font-semibold tracking-tight text-[#111]">
              {formatPrice(product.price)}
            </p>
          )}
        </div>

        <WishlistButton slug={product.slug} className="absolute bottom-3 right-3 z-10" />
      </div>

      {/* Nama, kategori, tombol */}
      <div className="flex items-center justify-between gap-3 px-3 pb-3 pt-5">
        <Link href={href} className="min-w-0">
          <h3 className="truncate text-[19px] font-semibold tracking-tight text-[#111]">{product.name}</h3>
          <p className="mt-0.5 text-[15px] text-black/45">{niceCategory(product.category)}</p>
        </Link>

        {soldOut ? (
          <span className="shrink-0 rounded-full bg-black/[0.06] px-5 py-3 text-[15px] font-medium text-black/40">
            Sold out
          </span>
        ) : (
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#11120f] px-5 py-3 text-[15px] font-medium text-white transition hover:bg-black/75"
          >
            <ShoppingBag size={17} strokeWidth={1.8} /> Beli
          </Link>
        )}
      </div>
    </article>
  );
}