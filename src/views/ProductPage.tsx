"use client";

import Link from "next/link";
import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Heart, Truck } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { formatPrice } from "@/lib/data";
import type { Product } from "@/lib/catalog-types";
import { useStore } from "@/lib/store";
import { useWishlist } from "@/lib/wishlist";
import { useSettings } from "@/lib/settings-context";
import { freeShippingText } from "@/lib/settings-types";
import ProductReviews, { Stars } from "@/components/ProductReviews";

const sizes = [38, 39, 40, 41, 42, 43, 44, 45];

// Durasi geser foto (milidetik) dan jenis gerakan. "linear" = kecepatan konstan.
const SLIDE_MS = 600;
const SLIDE_EASING = "linear";

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-black/10">
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-lg font-medium [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown size={22} className="transition-transform group-open:rotate-180" />
      </summary>
      <div className="pb-6 text-[15px] leading-7 text-black/70">{children}</div>
    </details>
  );
}

type Rating = { average: number; count: number };

export default function ProductPage({
  product,
  related,
  rating = { average: 0, count: 0 },
}: {
  product: Product;
  related: Product[];
  rating?: Rating;
}) {
  // key membuat semua state (foto aktif, ukuran) di-reset saat pindah ke produk lain
  return <ProductDetail key={product.id} product={product} related={related} rating={rating} />;
}

function ProductDetail({
  product,
  related,
  rating,
}: {
  product: Product;
  related: Product[];
  rating: Rating;
}) {
  const { addToCart } = useStore();
  const { has, toggle } = useWishlist();
  const settings = useSettings();
  const frameRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [size, setSize] = useState<number | null>(null);
  const [sizeError, setSizeError] = useState(false);

  const gallery = product.gallery.length ? product.gallery : [product.image];
  const total = gallery.length;
  const liked = has(product.slug);
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  const stockOf = (s: number) => product.stock[s] ?? 0;
  const soldOut = sizes.every((s) => stockOf(s) <= 0);

  const goTo = (target: number) => {
    setIndex(Math.max(0, Math.min(total - 1, target)));
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    startX.current = event.clientX;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    let delta = event.clientX - startX.current;
    if ((index === 0 && delta > 0) || (index === total - 1 && delta < 0)) delta *= 0.3;
    setDragX(delta);
  };

  const onPointerEnd = () => {
    if (!dragging) return;
    const width = frameRef.current?.clientWidth ?? 1;
    const threshold = width * 0.15;
    if (dragX < -threshold) goTo(index + 1);
    else if (dragX > threshold) goTo(index - 1);
    setDragging(false);
    setDragX(0);
  };

  const handleAdd = () => {
    if (!size) {
      setSizeError(true);
      return;
    }
    if (stockOf(size) <= 0) return;
    addToCart(
      {
        slug: product.slug,
        name: product.name,
        image: product.image,
        color: product.color,
        price: product.price,
      },
      size,
    );
  };

  return (
    <main className="bg-white text-[#111]">
      <div className="mx-auto max-w-[1440px] px-5 py-8 md:px-10 lg:py-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-14">
          {/* Galeri */}
          <div className="lg:sticky lg:top-24 lg:grid lg:grid-cols-[72px_minmax(0,1fr)] lg:gap-4 lg:self-start">
            <div className="hidden flex-col gap-3 lg:flex">
              {gallery.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  onClick={() => goTo(i)}
                  aria-label={`Lihat foto ${i + 1}`}
                  className={`size-[72px] overflow-hidden rounded-md border-2 bg-[#f5f5f5] transition-colors ${
                    index === i ? "border-black" : "border-transparent hover:border-black/40"
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover mix-blend-multiply" />
                </button>
              ))}
            </div>

            <div className="relative bg-[#f5f5f5] lg:h-[calc(100vh-8rem)] lg:max-h-[720px] lg:min-h-[480px]">
              <div
                ref={frameRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerEnd}
                onPointerCancel={onPointerEnd}
                className={`touch-pan-y select-none overflow-hidden lg:h-full ${
                  dragging ? "cursor-grabbing" : "cursor-grab"
                }`}
              >
                <div
                  className="flex will-change-transform lg:h-full"
                  style={{
                    transform: `translate3d(calc(${-index * 100}% + ${dragX}px), 0, 0)`,
                    transition: dragging ? "none" : `transform ${SLIDE_MS}ms ${SLIDE_EASING}`,
                  }}
                >
                  {gallery.map((src, i) => (
                    <div key={`${src}-${i}`} className="aspect-[4/5] w-full shrink-0 lg:aspect-auto lg:h-full">
                      <img
                        src={src}
                        alt={`${product.name} foto ${i + 1}`}
                        draggable={false}
                        className="pointer-events-none h-full w-full object-cover mix-blend-multiply"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <span className="absolute bottom-4 left-4 rounded-full bg-white px-3 py-1.5 text-xs font-medium">
                {index + 1} / {total}
              </span>
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={() => goTo(index - 1)}
                  disabled={index === 0}
                  aria-label="Foto sebelumnya"
                  className="grid size-11 place-items-center rounded-full bg-white shadow transition hover:bg-[#e5e5e5] disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => goTo(index + 1)}
                  disabled={index === total - 1}
                  aria-label="Foto berikutnya"
                  className="grid size-11 place-items-center rounded-full bg-white shadow transition hover:bg-[#e5e5e5] disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Panel info */}
          <div>
            {product.tag && <p className="text-sm font-medium text-[#d33918]">{product.tag}</p>}
            <h1 className="text-2xl font-medium md:text-[28px]">{product.name}</h1>
            <p className="mt-1">Sepatu {product.category}</p>
            {rating.count > 0 && (
              <a
                href="#ulasan"
                onClick={() => {
                  const d = document.getElementById("ulasan") as HTMLDetailsElement | null;
                  if (d) d.open = true;
                }}
                className="mt-2 inline-flex items-center gap-2 text-sm hover:underline"
              >
                <Stars value={rating.average} size={14} />
                <span className="font-medium">{rating.average.toFixed(1)}</span>
                <span className="text-black/50">· {rating.count} ulasan</span>
              </a>
            )}

            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-medium">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <>
                  <span className="text-black/45 line-through">{formatPrice(product.oldPrice)}</span>
                  <span className="text-sm font-medium text-[#007d48]">Hemat {discount}%</span>
                </>
              )}
            </div>

            <div className="mt-7">
              <div className="size-16 overflow-hidden rounded-md border-2 border-black bg-[#f5f5f5]">
                <img
                  src={product.image}
                  alt={product.colorName}
                  className="h-full w-full object-cover mix-blend-multiply"
                />
              </div>
              {product.colorName && (
                <p className="mt-2 text-sm text-black/60">Warna: {product.colorName}</p>
              )}
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <p className="font-medium">Pilih ukuran</p>
                <Link
                  href="/fit"
                  className="text-sm text-black/55 underline-offset-4 hover:text-black hover:underline"
                >
                  Panduan ukuran
                </Link>
              </div>
              <div
                className={`mt-3 grid grid-cols-3 gap-2 rounded-lg ${
                  sizeError ? "p-1 ring-1 ring-[#d33918]" : ""
                }`}
              >
                {sizes.map((item) => {
                  const out = stockOf(item) <= 0;
                  return (
                    <button
                      key={item}
                      disabled={out}
                      aria-label={out ? `EU ${item}, stok habis` : `EU ${item}`}
                      onClick={() => {
                        setSize(item);
                        setSizeError(false);
                      }}
                      className={`h-12 rounded-md border transition-colors ${
                        out
                          ? "cursor-not-allowed border-black/10 bg-black/[0.03] text-black/30 line-through"
                          : size === item
                            ? "border-black ring-1 ring-black"
                            : "border-black/20 hover:border-black"
                      }`}
                    >
                      EU {item}
                    </button>
                  );
                })}
              </div>
              {sizeError && (
                <p className="mt-2 text-sm text-[#d33918]">Pilih ukuran terlebih dahulu.</p>
              )}
              {size !== null && stockOf(size) > 0 && stockOf(size) <= 3 && (
                <p className="mt-2 text-sm font-medium text-[#d33918]">
                  Sisa {stockOf(size)} pasang untuk EU {size}.
                </p>
              )}
            </div>

            <button
              onClick={handleAdd}
              disabled={soldOut}
              className="mt-8 w-full rounded-full bg-[#111] px-6 py-5 text-base font-medium text-white transition-colors hover:bg-black/70 disabled:cursor-not-allowed disabled:bg-black/20"
            >
              {soldOut ? "Stok habis" : "Tambah ke keranjang"}
            </button>
            <button
              onClick={() => toggle(product.slug)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-black/25 px-6 py-5 text-base font-medium transition-colors hover:border-black"
            >
              {liked ? "Tersimpan di wishlist" : "Favorit"}
              <Heart size={20} className={liked ? "fill-[#e2533f] text-[#e2533f]" : ""} />
            </button>

            <p className="mt-5 flex items-center gap-2 text-sm text-black/60">
              <Truck size={16} /> {freeShippingText(settings)}
            </p>

            {product.description && <p className="mt-8 leading-7">{product.description}</p>}

            <div className="mt-8 border-t border-black/10">
              <Accordion title="Detail produk" defaultOpen>
                <ul className="list-disc space-y-1 pl-5">
                  {product.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                  {product.colorName && <li>Warna ditampilkan: {product.colorName}</li>}
                </ul>
              </Accordion>
              <Accordion title="Pengiriman & pengembalian">
                <p>
                  {freeShippingText(settings)}. Estimasi
                  pengiriman 2–5 hari kerja. Pengembalian dapat diajukan maksimal 14 hari setelah
                  barang diterima, selama produk belum dipakai.
                </p>
              </Accordion>
              <ProductReviews slug={product.slug} />
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-5 pb-20 pt-6 md:px-10">
          <h2 className="text-2xl font-medium">Kamu mungkin juga suka</h2>
          <div className="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
