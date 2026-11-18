"use client";

import {
  ArrowRight,
  Bell,
  PackageCheck,
  Percent,
  RefreshCw,
  Ruler,
  Search,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";
import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";
import MemberCta from "@/components/MemberCta";
import type { Product } from "@/lib/catalog-types";



const perks = [
  { icon: Truck, title: "Gratis ongkir", text: "Untuk pembelian mulai Rp999 ribu" },
  { icon: RefreshCw, title: "Tukar size mudah", text: "Jaminan penukaran hingga 14 hari" },
  { icon: ShieldCheck, title: "Produk autentik", text: "100% original, tanpa kompromi" },
];

const steps = [
  {
    icon: Search,
    title: "Pilih sepatu",
    text: "Jelajahi koleksi, lihat foto dan detail produk dengan jelas.",
  },
  {
    icon: Ruler,
    title: "Pilih ukuran",
    text: "Tentukan size EU 38–45. Salah ukuran? Bisa ditukar dalam 14 hari.",
  },
  {
    icon: PackageCheck,
    title: "Bayar dan terima",
    text: "Selesaikan pesanan, pesananmu kami kemas dan kirim ke alamatmu.",
  },
];

const memberBenefits = [
  { icon: Zap, title: "Akses lebih awal", text: "Beli rilisan terbatas sebelum dibuka untuk umum." },
  { icon: Percent, title: "Voucher member", text: "Potongan khusus yang bisa diklaim di akunmu." },
  { icon: Bell, title: "Wishlist tersimpan", text: "Simpan sepatu incaran, buka dari perangkat mana saja." },
];

function SectionHeading({
  eyebrow,
  title,
  href,
}: {
  eyebrow: string;
  title: string;
  href?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#789600]">
          {eyebrow}
        </p>
        <h2 className="font-display text-4xl font-normal uppercase leading-none md:text-6xl">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="hidden items-center gap-2 text-sm font-bold underline-offset-4 hover:underline md:flex"
        >
          Lihat semua <ArrowRight size={18} />
        </Link>
      )}
    </div>
  );
}

export default function HomePage({ products }: { products: Product[] }) {
  const pick = (match: (p: Product) => boolean, fromEnd = false) => {
    const list = fromEnd ? [...products].reverse() : products;
    return (list.find(match) ?? products[0])?.image;
  };
  const categoryTiles = [
    { label: "Pria", href: "/men", image: pick((p) => p.gender === "Pria"), sale: false },
    { label: "Wanita", href: "/women", image: pick((p) => p.gender === "Wanita"), sale: false },
    { label: "Terbaru", href: "/new", image: pick((p) => p.tag === "New", true), sale: false },
    { label: "Sale", href: "/sale", image: pick((p) => Boolean(p.oldPrice)), sale: true },
  ].filter((t): t is { label: string; href: string; image: string; sale: boolean } => Boolean(t.image));

  return (
    <>
      {/* 1. Hero */}
      <HeroSlider products={products} />

      {/* 2. Kepercayaan */}
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto grid max-w-[1440px] md:grid-cols-3 md:divide-x md:divide-black/10">
          {perks.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex items-center gap-5 border-b border-black/10 px-8 py-7 last:border-b-0 md:border-b-0"
            >
              <Icon size={28} strokeWidth={1.6} className="shrink-0" />
              <div>
                <h3 className="font-bold">{title}</h3>
                <p className="mt-1 text-sm text-black/50">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Produk */}
      <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
        <SectionHeading eyebrow="Curated for you" title="Lagi banyak dicari" href="/shop" />
        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 lg:grid-cols-4">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <Link
          href="/shop"
          className="mt-10 flex items-center justify-center gap-2 text-sm font-bold underline-offset-4 hover:underline md:hidden"
        >
          Lihat semua <ArrowRight size={18} />
        </Link>
      </section>

      {/* 4. Kategori */}
      <section className="mx-auto max-w-[1440px] px-5 pb-16 md:px-10 md:pb-24">
        <SectionHeading eyebrow="Jelajahi" title="Belanja per kategori" />
        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {categoryTiles.map((tile) => (
            <Link
              key={tile.label}
              href={tile.href}
              className="group relative block aspect-[4/5] overflow-hidden bg-[#111]"
            >
              <img
                src={tile.image}
                alt={tile.label}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between">
                <span
                  className={`font-display text-4xl font-normal uppercase leading-none md:text-5xl ${
                    tile.sale ? "text-[#ff6b57]" : "text-white"
                  }`}
                >
                  {tile.label}
                </span>
                <ArrowRight
                  size={22}
                  className="mb-1 text-white transition-transform group-hover:translate-x-1"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Cara belanja */}
      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
          <SectionHeading eyebrow="Mudah" title="Cara belanja" />
          <div className="mt-10 grid gap-px bg-black/10 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="bg-white p-8 md:p-10">
                <div className="flex items-center justify-between">
                  <Icon size={32} strokeWidth={1.5} />
                  <span className="font-display text-5xl font-normal text-black/15">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-8 text-xl font-bold">{title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-black/55">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Member */}
      <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid overflow-hidden bg-[#111] text-white lg:grid-cols-[0.8fr_1.2fr]">
          <img
            src="https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=85"
            alt="Sepatu klasik dalam koleksi RYTHM"
            className="h-64 w-full object-cover lg:h-full lg:min-h-[420px]"
          />
          <div className="flex flex-col justify-center px-6 py-10 md:px-12 md:py-12">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#c7ea4c]">
              RYTHM Circle
            </span>
            <h2 className="mt-4 max-w-lg font-display text-4xl font-normal uppercase leading-[0.95] md:text-5xl">
              Gabung jadi member RYTHM.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/60 md:text-base">
              Daftar gratis untuk voucher member, wishlist yang tersimpan, dan riwayat pesanan.
            </p>

            <ul className="mt-6 grid gap-4 sm:grid-cols-3">
              {memberBenefits.map(({ icon: Icon, title, text }) => (
                <li key={title} className="border-t border-white/15 pt-4">
                  <Icon size={20} strokeWidth={1.6} className="text-[#c7ea4c]" />
                  <p className="mt-3 text-sm font-bold">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-white/50">{text}</p>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <MemberCta />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
