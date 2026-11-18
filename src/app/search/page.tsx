import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { searchProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  return { title: q ? `Cari "${q}" — RYTHM` : "Cari — RYTHM" };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const term = q.trim();
  const results = term ? await searchProducts(term) : [];

  return (
    <main>
      <section className="border-b border-black/10 bg-[#dfff47] px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1440px]">
          <p className="text-xs font-bold uppercase tracking-[0.22em]">Hasil pencarian</p>
          <h1 className="mt-4 max-w-4xl break-words text-4xl font-black leading-[0.95] tracking-[-0.05em] md:text-7xl">
            {term ? `“${term}”` : "Cari sepatu."}
          </h1>
          {term && <p className="mt-4 text-sm font-semibold">{results.length} produk ditemukan</p>}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-14 md:px-10 md:py-20">
        {results.length > 0 ? (
          <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-2xl font-black">
              {term ? "Belum ada yang cocok." : "Ketik nama sepatu di kolom pencarian."}
            </p>
            <p className="mt-2 text-sm text-black/50">Coba kata lain, atau jelajahi kategori:</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                ["Koleksi", "/shop"],
                ["Pria", "/men"],
                ["Wanita", "/women"],
                ["Terbaru", "/new"],
                ["Sale", "/sale"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-semibold hover:border-black"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
