import Link from "next/link";
import { ArrowRight, PenLine, RefreshCw, Ruler, StickyNote } from "lucide-react";
import SizeFinder from "@/components/SizeFinder";
import { getProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/data";

export const metadata = { title: "Find your size — RYTHM" };
export const dynamic = "force-dynamic";

const steps = [
  {
    icon: StickyNote,
    title: "Stand on paper",
    text: "Place a sheet of paper on a hard floor with one short edge against a wall. Stand on it in the socks you usually wear, with your heel touching the wall.",
  },
  {
    icon: PenLine,
    title: "Mark your longest toe",
    text: "Ask someone to mark the tip of your longest toe with a pencil held upright. Your longest toe is not always your big toe.",
  },
  {
    icon: Ruler,
    title: "Measure, then slide",
    text: "Measure from the wall to the mark, then slide the number above to match. Measure both feet and use the longer one.",
  },
];

const FIT_NOTES: Record<string, string> = {
  Running:
    "True to size with a locked-in heel. If you are between sizes, go half a size up for long runs.",
  Lifestyle: "True to size with a roomy toe box. Wide feet stay comfortable in their usual size.",
  Training:
    "True to size with a slightly narrower midfoot for stability. If you are between sizes, size up.",
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
            Home
          </Link>{" "}
          / <span className="text-black">Find your size</span>
        </nav>
        <h1 className="mt-6 font-display text-5xl uppercase leading-none md:text-7xl">Find your size.</h1>
        <p className="mt-4 max-w-xl text-black/60">
          Measure your foot in two minutes and get the right size for every RYTHM shoe.
        </p>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-10 md:px-10 md:py-14">
        <SizeFinder />
      </section>

      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto max-w-[1440px] px-5 py-14 md:px-10 md:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#789600]">2 minutes</p>
          <h2 className="mt-3 font-display text-4xl uppercase leading-none md:text-6xl">How to measure</h2>
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
          <h2 className="mt-3 font-display text-4xl uppercase leading-none md:text-6xl">Fit by model</h2>
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
              <p className="text-xl font-black">Still unsure? Exchange sizes for free.</p>
              <p className="mt-1 text-sm text-white/60">Size exchanges can be requested up to 14 days after delivery.</p>
            </div>
          </div>
          <Link
            href="/shop"
            className="rounded-full bg-[#c7ea4c] px-6 py-3.5 text-sm font-black text-[#11120f] hover:bg-[#d6f25e]"
          >
            Shop the collection
          </Link>
        </div>
      </section>
    </main>
  );
}
