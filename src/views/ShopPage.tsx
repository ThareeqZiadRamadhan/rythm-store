"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/data";

const categories = ["Semua", "Running", "Lifestyle", "Training"];

export default function ShopPage({ mode = "all" }: { mode?: string }) {
  const [category, setCategory] = useState("Semua");

  const visibleProducts = useMemo(() => {
    let list = products;
    if (mode === "new") list = products.filter((product) => product.tag === "New");
    if (mode === "sale") list = products.filter((product) => product.oldPrice);
    if (mode === "men") list = products.filter((product) => product.gender !== "Wanita");
    if (mode === "women") list = products.filter((product) => product.gender !== "Pria");
    if (category !== "Semua") list = list.filter((product) => product.category === category);
    return list;
  }, [category, mode]);

  const title =
    mode === "new"
      ? "Baru mendarat."
      : mode === "sale"
        ? "Good shoes, better price."
        : mode === "men"
          ? "Sepatu pria."
          : mode === "women"
            ? "Sepatu wanita."
            : "Temukan ritmemu.";

  return (
    <main>
      <section className="border-b border-black/10 bg-[#dfff47] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <p className="text-xs font-bold uppercase tracking-[0.22em]">RYTHM collection</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.06em] md:text-8xl">
            {title}
          </h1>
        </div>
      </section>
      <section className="mx-auto max-w-[1440px] px-5 py-14 md:px-10 md:py-20">
        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold ${
                category === item
                  ? "border-black bg-black text-white"
                  : "border-black/15 hover:border-black"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        {visibleProducts.length > 0 ? (
          <div className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
            <p className="text-2xl font-black">Belum ada koleksi di kategori ini.</p>
            <button
              onClick={() => setCategory("Semua")}
              className="mt-5 rounded-full bg-black px-6 py-3 text-sm font-bold text-white"
            >
              Lihat semua
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
