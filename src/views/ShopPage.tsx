"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/catalog-types";

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

const HEADINGS: Record<
  string,
  { crumb: string; words: [string, string]; catSuffix: string; desc: string }
> = {
  all: {
    crumb: "Koleksi",
    words: ["Semua", "Sepatu"],
    catSuffix: "",
    desc: "Sepatu lari, lifestyle, dan training dari RYTHM/. Dibuat untuk dipakai setiap hari, dari pagi sampai malam.",
  },
  men: {
    crumb: "Pria",
    words: ["Sepatu", "Pria"],
    catSuffix: "Pria",
    desc: "Koleksi pria dan unisex, dari sepatu lari ringan sampai sneakers harian.",
  },
  women: {
    crumb: "Wanita",
    words: ["Sepatu", "Wanita"],
    catSuffix: "Wanita",
    desc: "Koleksi wanita dan unisex, nyaman dipakai seharian dan tetap rapi dilihat.",
  },
  new: {
    crumb: "Terbaru",
    words: ["Baru", "Mendarat"],
    catSuffix: "Terbaru",
    desc: "Model paling baru dari RYTHM/. Ambil sebelum ukuranmu habis.",
  },
  sale: {
    crumb: "Sale",
    words: ["Harga", "Spesial"],
    catSuffix: "Diskon",
    desc: "Sepatu bagus dengan harga lebih ringan. Stok terbatas.",
  },
};

const CATEGORY_DESC: Record<string, string> = {
  Running: "Ringan, empuk, dan responsif. Untuk lari pagi, latihan interval, sampai race day.",
  Lifestyle: "Sneakers harian untuk kuliah, kerja, dan nongkrong. Nyaman dari pagi sampai malam.",
  Training: "Stabil dan mantap untuk gym, HIIT, dan latihan beban.",
};

const SORT_LABELS: Record<SortKey, string> = {
  featured: "Unggulan",
  "price-asc": "Harga terendah",
  "price-desc": "Harga tertinggi",
  name: "Nama A–Z",
};

// Konten lama geser ke kiri, konten baru masuk dari kanan (seperti Amble)
function withSlide(update: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    update();
    return;
  }
  doc.startViewTransition(() => flushSync(update));
}

export default function ShopPage({
  mode = "all",
  products,
  size,
}: {
  mode?: string;
  products: Product[];
  /** Filter ukuran EU dari halaman /fit, hanya produk yang stoknya tersedia */
  size?: number;
}) {
  const heading = HEADINGS[mode] ?? HEADINGS.all;

  const [category, setCategory] = useState("Semua");
  const [selectedSize, setSelectedSize] = useState<number | null>(size ?? null);
  const [hideSoldOut, setHideSoldOut] = useState(false);
  const [sort, setSort] = useState<SortKey>("featured");
  const [filtersOpen, setFiltersOpen] = useState(Boolean(size));

  // Produk sesuai halaman (pria / wanita / baru / sale)
  const modeProducts = useMemo(() => {
    let list = products;
    if (mode === "new") list = list.filter((p) => p.tag === "New");
    if (mode === "sale") list = list.filter((p) => p.oldPrice);
    if (mode === "men") list = list.filter((p) => p.gender !== "Wanita");
    if (mode === "women") list = list.filter((p) => p.gender !== "Pria");
    return list;
  }, [mode, products]);

  // Tab kategori diambil dari produk yang ada
  const categories = useMemo(
    () => ["Semua", ...Array.from(new Set(modeProducts.map((p) => p.category))).sort()],
    [modeProducts],
  );

  // Semua ukuran yang pernah ada di produk
  const sizes = useMemo(() => {
    const set = new Set<number>();
    modeProducts.forEach((p) => Object.keys(p.stock).forEach((k) => set.add(Number(k))));
    return Array.from(set).sort((a, b) => a - b);
  }, [modeProducts]);

  const visibleProducts = useMemo(() => {
    let list = modeProducts;
    if (category !== "Semua") list = list.filter((p) => p.category === category);
    if (selectedSize) list = list.filter((p) => (p.stock[selectedSize] ?? 0) > 0);
    if (hideSoldOut) list = list.filter((p) => p.totalStock > 0);

    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    // Yang stoknya habis selalu ditaruh paling akhir
    return sorted.sort((a, b) => Number(a.totalStock <= 0) - Number(b.totalStock <= 0));
  }, [modeProducts, category, selectedSize, hideSoldOut, sort]);

  const hasCategory = category !== "Semua";
  const titleParts = !hasCategory
    ? [
        { text: heading.words[0], dim: false },
        { text: heading.words[1], dim: true },
      ]
    : heading.catSuffix
      ? [
          { text: category, dim: false },
          { text: heading.catSuffix, dim: true },
        ]
      : [
          { text: "Sepatu", dim: true },
          { text: category, dim: false },
        ];
  const description = hasCategory
    ? (CATEGORY_DESC[category] ?? `Pilihan sepatu ${category.toLowerCase()} dari RYTHM/.`)
    : heading.desc;

  const activeFilters = (selectedSize ? 1 : 0) + (hideSoldOut ? 1 : 0);

  function resetAll() {
    setCategory("Semua");
    setSelectedSize(null);
    setHideSoldOut(false);
  }

  return (
    <main className="shop-vt bg-[#f4f4f1]">
      <div className="mx-auto max-w-[1440px] px-5 pb-20 md:px-10">
        {/* Header */}
        <section className="pb-12 pt-12 md:pb-16 md:pt-20">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2.5 text-[15px]">
            <Link href="/" className="text-black/50 transition hover:text-black">
              Beranda
            </Link>
            <span className="text-black/30">/</span>
            {hasCategory ? (
              <button
                type="button"
                onClick={() => withSlide(() => setCategory("Semua"))}
                className="text-black/50 transition hover:text-black"
              >
                {heading.crumb}
              </button>
            ) : (
              <span className="text-[#111]">{heading.crumb}</span>
            )}
            {hasCategory && (
              <>
                <span className="text-black/30">/</span>
                <span className="text-[#111]">{category}</span>
              </>
            )}
          </nav>

          <h1
            className="mt-6 uppercase leading-[0.85]"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontWeight: 700,
              letterSpacing: "-0.06em",
              fontSize: "clamp(52px, 7.5vw, 116px)",
            }}
          >
            {titleParts.map((part, i) => (
              <span key={part.text + i} className={part.dim ? "text-[#a3a3a0]" : "text-[#111]"}>
                {i > 0 ? " " : ""}
                {part.text}
              </span>
            ))}
          </h1>

          <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-black/65">{description}</p>
        </section>

        {/* Tab kategori + filter + urutkan */}
        <div className="flex flex-col gap-4 border-b border-black/10 lg:flex-row lg:items-end lg:justify-between">
          <div className="hide-scrollbar -mb-px flex gap-8 overflow-x-auto">
            {categories.map((item) => {
              const active = category === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => withSlide(() => setCategory(item))}
                  className={`relative shrink-0 pb-4 text-[18px] transition ${
                    active ? "text-[#111]" : "text-black/45 hover:text-[#111]"
                  }`}
                >
                  {item}
                  {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#111]" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pb-4">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              className="inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-3 text-[16px] text-[#111] ring-1 ring-black/[0.06] transition hover:ring-black/20"
            >
              <SlidersHorizontal size={18} strokeWidth={1.8} />
              Filter
              {activeFilters > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#111] px-1.5 text-[11px] font-semibold text-white">
                  {activeFilters}
                </span>
              )}
            </button>

            <label className="relative inline-flex items-center gap-2 rounded-full bg-white py-3 pl-5 pr-11 text-[16px] ring-1 ring-black/[0.06] transition hover:ring-black/20">
              <span className="text-black/45">Urutkan</span>
              <span className="text-[#111]">{SORT_LABELS[sort]}</span>
              <ChevronDown size={18} className="pointer-events-none absolute right-4 text-[#111]" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Urutkan produk"
                className="absolute inset-0 cursor-pointer opacity-0"
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                  <option key={k} value={k}>
                    {SORT_LABELS[k]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Panel filter */}
        {filtersOpen && (
          <div className="mt-5 rounded-[24px] bg-white p-6 ring-1 ring-black/[0.06] md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-[15px] font-medium text-[#111]">Ukuran EU (yang tersedia)</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizes.map((s) => {
                    const active = selectedSize === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(active ? null : s)}
                        className={`h-11 min-w-14 rounded-full px-4 text-[15px] transition ${
                          active
                            ? "bg-[#111] text-white"
                            : "bg-[#f1f1ee] text-[#111] hover:bg-[#e6e6e2]"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                <Link href="/fit" className="mt-3 inline-block text-sm text-black/50 underline underline-offset-4 hover:text-black">
                  Belum tahu ukuranmu? Cari ukuranmu
                </Link>
              </div>

              <label className="flex cursor-pointer items-center gap-3 text-[15px] text-[#111]">
                <input
                  type="checkbox"
                  checked={hideSoldOut}
                  onChange={(e) => setHideSoldOut(e.target.checked)}
                  className="h-5 w-5 accent-[#111]"
                />
                Sembunyikan stok habis
              </label>
            </div>
          </div>
        )}

        {/* Ringkasan filter aktif */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <p className="text-[15px] text-black/50">{visibleProducts.length} produk</p>
          {selectedSize && (
            <button
              type="button"
              onClick={() => setSelectedSize(null)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#111] px-3.5 py-1.5 text-sm text-white hover:bg-black/80"
            >
              Ukuran EU {selectedSize} <X size={14} />
            </button>
          )}
          {hideSoldOut && (
            <button
              type="button"
              onClick={() => setHideSoldOut(false)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#111] px-3.5 py-1.5 text-sm text-white hover:bg-black/80"
            >
              Tanpa stok habis <X size={14} />
            </button>
          )}
        </div>

        {/* Grid produk */}
        {visibleProducts.length > 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[28px] bg-white py-28 text-center ring-1 ring-black/[0.06]">
            <p className="text-2xl font-semibold tracking-tight text-[#111]">
              Belum ada sepatu yang cocok dengan filter ini.
            </p>
            <button
              type="button"
              onClick={resetAll}
              className="mt-6 rounded-full bg-[#111] px-6 py-3 text-[15px] font-medium text-white hover:bg-black/80"
            >
              Hapus semua filter
            </button>
          </div>
        )}
      </div>
    </main>
  );
}