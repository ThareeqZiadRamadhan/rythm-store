import Link from "next/link";
import { ArrowRight, PenLine, RefreshCw, Ruler, StickyNote } from "lucide-react";
import SizeFinder from "@/components/SizeFinder";
import { getProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/data";

export const metadata = { title: "Cari ukuranmu — RYTHM" };
export const dynamic = "force-dynamic";

const steps = [
  {
    icon: StickyNote,
    title: "Berdiri di atas kertas",
    text: "Letakkan kertas di lantai yang keras dengan satu sisi pendeknya menempel ke dinding. Berdiri di atasnya memakai kaus kaki yang biasa kamu pakai, tumit menempel ke dinding.",
  },
  {
    icon: PenLine,
    title: "Tandai jari terpanjang",
    text: "Minta orang lain menandai ujung jari terpanjangmu dengan pensil yang dipegang tegak. Jari terpanjang tidak selalu jempol.",
  },
  {
    icon: Ruler,
    title: "Ukur, lalu geser",
    text: "Ukur dari dinding sampai tanda, lalu isi atau geser angkanya di atas. Ukur kedua kaki dan pakai hasil yang lebih panjang.",
  },
];

const FIT_NOTES: Record<string, string> = {
  Running:
    "Pas sesuai ukuran dengan tumit yang mengunci. Kalau di antara dua ukuran, naik satu ukuran untuk lari jarak jauh.",
  Lifestyle: "Pas sesuai ukuran dengan ruang jari yang lega. Kaki lebar tetap nyaman di ukuran biasanya.",
  Training:
    "Pas sesuai ukuran dengan bagian tengah sedikit lebih ramping untuk stabilitas. Kalau di antara dua ukuran, naik satu.",
};

export default async function FitPage() {
  const products = await getProducts();
  const groups = ["Running", "Lifestyle", "Training"]
    .map((category) => ({ category, items: products.filter((p) => p.category === category) }))
    .filter((g) => g.items.length > 0);

  return (
    <main>
      <section className="mx-auto max-w-[1440px] px-5 pt-10 md:px-10 md:pt-14">
        <nav aria-label="Breadcrumb" className="text-sm text-black/50">
          <Link href="/" className="hover:text-black">
            Beranda
          </Link>{" "}
          / <span className="text-black">Cari ukuran</span>
        </nav>
        <h1 className="mt-6 font-display text-5xl uppercase leading-none md:text-7xl">Cari ukuranmu.</h1>
        <p className="mt-4 max-w-xl text-black/60">
          Ukur kakimu dalam dua menit, lalu dapatkan ukuran yang pas untuk semua sepatu RYTHM.
        </p>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-10 md:px-10 md:py-14">
        <SizeFinder />
      </section>

      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto max-w-[1440px] px-5 py-14 md:px-10 md:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#789600]">2 menit</p>
          <h2 className="mt-3 font-display text-4xl uppercase leading-none md:text-6xl">Cara mengukur</h2>
          <div className="mt-10 grid gap-px bg-black/10 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="bg-white p-8 md:p-10">
                <div className="flex items-center justify-between">
                  <Icon size={30} strokeWidth={1.5} />
                  <span className="font-display text-5xl text-black/15">0{i + 1}</span>
                </div>
                <h3 className="mt-8 text-xl font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-black/55">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {groups.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-5 py-14 md:px-10 md:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#789600]">Per model</p>
          <h2 className="mt-3 font-display text-4xl uppercase leading-none md:text-6xl">Ukuran tiap sepatu</h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {groups.map((g) => (
              <div key={g.category} className="rounded-3xl border border-black/10 bg-white p-6">
                <h3 className="text-xl font-black">{g.category}</h3>
                <p className="mt-2 text-sm leading-6 text-black/60">{FIT_NOTES[g.category]}</p>
                <ul className="mt-5 space-y-2">
                  {g.items.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/shop/${p.slug}`}
                        className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-[#f7f7f2]"
                      >
                        <span className="size-12 shrink-0 overflow-hidden rounded-xl" style={{ backgroundColor: p.color }}>
                          <img src={p.image} alt="" className="h-full w-full object-cover mix-blend-multiply" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-bold">{p.name}</span>
                          <span className="block text-xs text-black/50">{formatPrice(p.price)}</span>
                        </span>
                        <ArrowRight size={16} className="text-black/40" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1440px] px-5 pb-16 md:px-10 md:pb-24">
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-[#11120f] p-8 text-white md:flex-row md:items-center md:p-10">
          <div className="flex items-center gap-4">
            <RefreshCw size={28} className="text-[#c7ea4c]" />
            <div>
              <p className="text-xl font-black">Masih ragu? Tukar ukuran gratis.</p>
              <p className="mt-1 text-sm text-white/60">Penukaran ukuran bisa diajukan hingga 14 hari setelah barang diterima.</p>
            </div>
          </div>
          <Link
            href="/shop"
            className="rounded-full bg-[#c7ea4c] px-6 py-3.5 text-sm font-black text-[#11120f] hover:bg-[#d6f25e]"
          >
            Lihat koleksi
          </Link>
        </div>
      </section>
    </main>
  );
}
