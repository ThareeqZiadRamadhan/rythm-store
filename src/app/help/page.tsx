import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Help — RYTHM" };

export default async function HelpPage() {
  const settings = await getSettings();

  const shippingCost =
    settings.shippingFee === 0
      ? "Every order ships free anywhere in Indonesia."
      : settings.freeShippingMin > 0
        ? `Shipping is ${formatPrice(settings.shippingFee)} per order, and free on orders of ${formatPrice(settings.freeShippingMin)} or more.`
        : `Shipping is ${formatPrice(settings.shippingFee)} per order anywhere in Indonesia.`;

  const sections = [
    {
      id: "shipping",
      title: "Shipping",
      items: [
        { q: "How much is shipping?", a: shippingCost },
        {
          q: "How long does delivery take?",
          a: "Orders are processed within 24 hours on business days. Delivery takes an estimated 2–4 days within Java and 3–7 days outside Java.",
        },
        {
          q: "How do I track my order?",
          a: "Open My orders in your account. Your order moves from Awaiting confirmation to Processing, Shipped and finally Delivered.",
        },
      ],
    },
    {
      id: "returns",
      title: "Returns & exchanges",
      items: [
        {
          q: "The size doesn't fit. Can I exchange it?",
          a: "Yes. Request a size exchange within 14 days of delivery, as long as the size you want is still in stock.",
        },
        {
          q: "What can be returned?",
          a: "Shoes that have not been worn outdoors, are undamaged, and are sent back with the original box and tags.",
        },
        {
          q: "How do I request a return?",
          a: "Contact us with your order number and the reason for the return. Our team will reply with instructions for sending the item back.",
        },
      ],
    },
  ];

  return (
    <main className="mx-auto max-w-[1440px] px-5 pb-24 pt-12 md:px-10 md:pt-20">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2.5 text-[15px]">
        <Link href="/" className="text-black/50 transition hover:text-black">
          Home
        </Link>
        <span className="text-black/30">/</span>
        <span>Help</span>
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
        Help <span className="text-[#a3a3a0]">Center</span>
      </h1>
      <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-black/65">
        Everything you need to know about shipping, order tracking and size exchanges.
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
          Find your size
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
