"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/data";
import { CATEGORIES, GENDERS, SIZES, slugify, type ProductInput } from "@/lib/productInput";

const input =
  "h-11 w-full rounded-lg border border-black/15 bg-white px-3.5 text-sm outline-none transition focus:border-black";
const area =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-black";

function F({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-black/45">{hint}</span>}
    </label>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-3xl bg-[#f7f7f2] p-6">
      <h2 className="text-lg font-black">{title}</h2>
      {children}
    </section>
  );
}

export default function ProductForm({ id, initial }: { id?: string; initial?: ProductInput }) {
  const router = useRouter();
  const editing = Boolean(id);

  const [f, setF] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    category: initial?.category ?? "Lifestyle",
    gender: initial?.gender ?? "Unisex",
    price: initial ? String(initial.price) : "",
    oldPrice: initial?.oldPrice ? String(initial.oldPrice) : "",
    image: initial?.image ?? "",
    gallery: initial?.gallery.join("\n") ?? "",
    color: initial?.color ?? "#eeeeea",
    colorName: initial?.colorName ?? "",
    tag: initial?.tag ?? "",
    description: initial?.description ?? "",
    features: initial?.features.join("\n") ?? "",
    isActive: initial?.isActive ?? true,
  });
  const [slugTouched, setSlugTouched] = useState(editing);
  const [stock, setStock] = useState<Record<number, string>>(() =>
    Object.fromEntries(
      SIZES.map((s) => [s, String(initial?.variants.find((v) => v.size === s)?.stock ?? 10)])
    )
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof typeof f>(key: K, value: (typeof f)[K]) {
    setF((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
  }

  const totalStock = SIZES.reduce((s, size) => s + (Number(stock[size]) || 0), 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/admin/products/${id}` : "/api/admin/products", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...f,
          variants: SIZES.map((size) => ({ size, stock: Number(stock[size]) || 0 })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan produk.");
        setSaving(false);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-6">
        <Card title="Info produk">
          <div className="grid gap-4 md:grid-cols-2">
            <F label="Nama produk">
              <input className={input} value={f.name} onChange={(e) => set("name", e.target.value)} />
            </F>
            <F label="Slug" hint={`Alamat halaman: /shop/${f.slug || "..."}`}>
              <input
                className={input}
                value={f.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
              />
            </F>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <F label="Kategori">
              <select
                className={input}
                value={f.category}
                onChange={(e) => set("category", e.target.value as typeof f.category)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </F>
            <F label="Gender">
              <select
                className={input}
                value={f.gender}
                onChange={(e) => set("gender", e.target.value as typeof f.gender)}
              >
                {GENDERS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </F>
            <F label="Label" hint="Opsional, misal New atau Limited">
              <input className={input} value={f.tag} onChange={(e) => set("tag", e.target.value)} />
            </F>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <F label="Harga jual (Rp)">
              <input
                className={input}
                inputMode="numeric"
                value={f.price}
                onChange={(e) => set("price", e.target.value.replace(/\D/g, ""))}
              />
            </F>
            <F label="Harga coret (Rp)" hint="Opsional, untuk produk diskon">
              <input
                className={input}
                inputMode="numeric"
                value={f.oldPrice}
                onChange={(e) => set("oldPrice", e.target.value.replace(/\D/g, ""))}
              />
            </F>
          </div>
          <F label="Deskripsi">
            <textarea
              className={area}
              rows={4}
              value={f.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </F>
          <F label="Fitur" hint="Satu fitur per baris">
            <textarea
              className={area}
              rows={4}
              value={f.features}
              onChange={(e) => set("features", e.target.value)}
            />
          </F>
        </Card>

        <Card title="Gambar dan warna">
          <F label="URL gambar utama" hint="Misal /shoes/nama-produk.png atau URL Unsplash">
            <input className={input} value={f.image} onChange={(e) => set("image", e.target.value)} />
          </F>
          <F label="Galeri" hint="Satu URL per baris. Kosongkan untuk memakai gambar utama saja.">
            <textarea
              className={area}
              rows={3}
              value={f.gallery}
              onChange={(e) => set("gallery", e.target.value)}
            />
          </F>
          <div className="grid gap-4 md:grid-cols-2">
            <F label="Warna latar">
              <span className="flex gap-2">
                <input
                  type="color"
                  value={f.color}
                  onChange={(e) => set("color", e.target.value)}
                  className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-black/15 bg-white p-1"
                />
                <input className={input} value={f.color} onChange={(e) => set("color", e.target.value)} />
              </span>
            </F>
            <F label="Nama warna">
              <input
                className={input}
                value={f.colorName}
                onChange={(e) => set("colorName", e.target.value)}
                placeholder="Misal Volt Green/Black"
              />
            </F>
          </div>
        </Card>

        <Card title="Stok per ukuran">
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {SIZES.map((size) => (
              <label key={size} className="block text-center">
                <span className="mb-1 block text-xs font-bold text-black/50">EU {size}</span>
                <input
                  className={`${input} px-2 text-center`}
                  inputMode="numeric"
                  value={stock[size]}
                  onChange={(e) =>
                    setStock((s) => ({ ...s, [size]: e.target.value.replace(/\D/g, "") }))
                  }
                />
              </label>
            ))}
          </div>
          <p className="text-sm text-black/55">Total stok: {totalStock} pasang</p>
        </Card>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
        <div className="overflow-hidden rounded-3xl bg-[#f7f7f2]">
          <div className="aspect-square" style={{ backgroundColor: f.color }}>
            {f.image && (
              <img src={f.image} alt="" className="h-full w-full object-cover mix-blend-multiply" />
            )}
          </div>
          <div className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-black/45">{f.category}</p>
            <p className="mt-1 font-bold">{f.name || "Nama produk"}</p>
            <p className="mt-1 font-black">{f.price ? formatPrice(Number(f.price)) : "Rp 0"}</p>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-[#f7f7f2] p-4 text-sm font-semibold">
          <input
            type="checkbox"
            checked={f.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
            className="size-5 accent-black"
          />
          Tampilkan di toko
        </label>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#11120f] text-sm font-bold text-white hover:bg-black/80 disabled:opacity-60"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {editing ? "Simpan perubahan" : "Tambah produk"}
        </button>
        <Link
          href="/admin/products"
          className="flex h-12 w-full items-center justify-center rounded-full border border-black/15 text-sm font-bold hover:bg-black/5"
        >
          Batal
        </Link>
      </aside>
    </form>
  );
}
