import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bantuan — RYTHM" };

export default async function BantuanPage() {
  const settings = await getSettings();

  const ongkir =
    settings.shippingFee === 0
      ? "Semua pesanan gratis ongkir ke seluruh Indonesia."
      : settings.freeShippingMin > 0
        ? `Ongkir ${formatPrice(settings.shippingFee)} per pesanan, dan gratis untuk belanja minimal ${formatPrice(settings.freeShippingMin)}.`
        : `Ongkir ${formatPrice(settings.shippingFee)} per pesanan ke seluruh Indonesia.`;

  const sections = [
    {
      id: "pengiriman",
      title: "Pengiriman",
      items: [
        { q: "Berapa ongkos kirimnya?", a: ongkir },
        {
          q: "Berapa lama pesanan sampai?",
          a: "Pesanan diproses 1×24 jam di hari kerja. Estimasi tiba 2–4 hari untuk Pulau Jawa dan 3–7 hari untuk luar Jawa.",
        },
        {
          q: "Bagaimana cara melacak pesanan?",
          a: "Buka menu Pesanan saya di akunmu. Status pesanan berubah dari Menunggu konfirmasi, Diproses, Dikirim, sampai Selesai.",
        },
      ],
    },
    {
      id: "retur",
      title: "Retur & penukaran",
      items: [
        {
          q: "Ukurannya tidak pas, bisa tukar?",
          a: "Bisa. Ajukan penukaran ukuran maksimal 7 hari setelah pesanan diterima, selama stok ukuran yang diminta masih tersedia.",
        },
        {
          q: "Apa syarat barang yang bisa diretur?",
          a: "Sepatu belum dipakai di luar ruangan, tidak rusak, dan dikirim kembali lengkap dengan kotak serta label aslinya.",
        },
        {
          q: "Bagaimana cara mengajukan retur?",
          a: "Hubungi kami dengan menyertakan nomor pesanan dan alasan retur. Tim kami akan membalas dengan langkah pengiriman barang.",
        },
      ],
    },
  ];

  return (
    <main className="mx-auto max-w-[1440px] px-5 pb-24 pt-12 md:px-10 md:pt-20">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2.5 text-[15px]">
        <Link href="/" className="text-black/50 transition hover:text-black">
          Beranda
        </Link>
        <span className="text-black/30">/</span>
        <span>Bantuan</span>
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
        Pusat <span className="text-[#a3a3a0]">Bantuan</span>
      </h1>
      <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-black/65">
        Semua yang perlu kamu tahu soal pengiriman, pelacakan pesanan, dan penukaran ukuran.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full bg-white px-5 py-2.5 text-[15px] ring-1 ring-black/[0.06] transition hover:ring-black/20"
          >
            {s.title}
          </a>
        ))}
        <Link
          href="/fit"
          className="rounded-full bg-white px-5 py-2.5 text-[15px] ring-1 ring-black/[0.06] transition hover:ring-black/20"
        >
          Cari ukuran
        </Link>
      </div>

      <div className="mt-14 grid gap-6">
        {sections.map((s) => (
          <section
            key={s.id}
            id={s.id}
            className="scroll-mt-28 rounded-[28px] bg-white p-6 ring-1 ring-black/[0.06] md:p-10"
          >
            <h2 className="text-3xl font-semibold tracking-tight">{s.title}</h2>
            <div className="mt-6 divide-y divide-black/10">
              {s.items.map((item) => (
                <details key={item.q} className="group py-5" open>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-medium">
                    {item.q}
                    <span className="text-xl text-black/40 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 max-w-2xl leading-relaxed text-black/60">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
