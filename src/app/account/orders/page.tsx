import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Package } from "lucide-react";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { formatPrice } from "@/lib/data";
import Order from "@/models/Order";
import AccountEmpty from "@/components/AccountEmpty";
import CancelOrderButton from "@/components/CancelOrderButton";

export const metadata = { title: "My orders — RYTHM" };
export const dynamic = "force-dynamic";

const statusMap = {
  PENDING: { label: "Awaiting confirmation", cls: "bg-amber-100 text-amber-800" },
  PROCESSING: { label: "Processing", cls: "bg-sky-100 text-sky-800" },
  SHIPPED: { label: "Shipped", cls: "bg-indigo-100 text-indigo-800" },
  DELIVERED: { label: "Delivered", cls: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelled", cls: "bg-black/10 text-black/50" },
} as const;

const paymentLabel = {
  TRANSFER: "Bank transfer",
  EWALLET: "E-wallet",
  COD: "Cash on delivery (COD)",
} as const;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { new: newOrder } = await searchParams;

  await connectDB();
  const orders = await Order.find({ user: session.sub }).sort({ createdAt: -1 }).lean();

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">My orders</h1>
      <p className="mb-8 mt-2 text-sm text-black/50">Your order history and status.</p>

      {orders.length === 0 ? (
        <AccountEmpty
          icon={Package}
          title="No orders yet"
          text="Orders you place will show up here."
          href="/shop"
          cta="Start shopping"
        />
      ) : (
        <div className="space-y-5">
          {orders.map((o) => {
            const status = statusMap[o.status as keyof typeof statusMap] ?? statusMap.PENDING;
            const isNew = newOrder === o.orderNumber;
            const pairs = o.items.reduce((s, i) => s + i.quantity, 0);
            const date = new Date(o.createdAt).toLocaleString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            const addr = o.shippingAddress;

            return (
              <article
                key={o.orderNumber}
                className={`rounded-3xl bg-[#f7f7f2] p-5 md:p-6 ${
                  isNew ? "ring-2 ring-[#c7ea4c]" : ""
                }`}
              >
                {isNew && (
                  <div className="mb-5 flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                    <CheckCircle2 size={18} /> Order placed successfully. Thank you!
                  </div>
                )}

                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-bold">{o.orderNumber}</p>
                    <p className="mt-1 text-xs text-black/50">
                      {date} · {pairs} {pairs === 1 ? "pair" : "pairs"}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.cls}`}>
                    {status.label}
                  </span>
                </div>

                <ul className="mt-5 space-y-3">
                  {o.items.map((it, i) => (
                    <li key={i} className="flex items-center gap-3 rounded-2xl bg-white p-3">
                      <Link
                        href={`/shop/${it.slug}`}
                        className="size-16 shrink-0 overflow-hidden rounded-xl"
                        style={{ backgroundColor: it.color || "#eeeeea" }}
                      >
                        <img
                          src={it.image}
                          alt={it.name}
                          className="h-full w-full object-cover mix-blend-multiply"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{it.name}</p>
                        <p className="text-xs text-black/50">
                          EU {it.size} · {it.quantity} × {formatPrice(it.price)}
                        </p>
                      </div>
                      <p className="text-sm font-bold">{formatPrice(it.price * it.quantity)}</p>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 grid gap-5 border-t border-black/10 pt-5 text-sm md:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-black/40">
                      Ship to
                    </p>
                    <p className="mt-1 font-bold">
                      {addr?.recipient} <span className="font-normal text-black/50">· {addr?.phone}</span>
                    </p>
                    <p className="text-black/60">
                      {addr?.street}, {addr?.city}, {addr?.province} {addr?.postalCode}
                    </p>
                    <p className="mt-3 text-xs font-bold uppercase tracking-wider text-black/40">
                      Payment
                    </p>
                    <p className="mt-1">
                      {paymentLabel[o.paymentMethod as keyof typeof paymentLabel] ?? o.paymentMethod}
                    </p>
                  </div>

                  <dl className="space-y-1.5">
                    <div className="flex justify-between">
                      <dt className="text-black/60">Subtotal</dt>
                      <dd>{formatPrice(o.subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-black/60">Shipping</dt>
                      <dd>{o.shippingFee === 0 ? "Free" : formatPrice(o.shippingFee)}</dd>
                    </div>
                    {(o.discount ?? 0) > 0 && (
                      <div className="flex justify-between text-green-700">
                        <dt>Voucher {o.voucherCode}</dt>
                        <dd>-{formatPrice(o.discount ?? 0)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-black/10 pt-2 text-base">
                      <dt className="font-bold">Total</dt>
                      <dd className="font-black">{formatPrice(o.total)}</dd>
                    </div>
                  </dl>
                </div>

                {o.status === "PENDING" && (
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-5">
                    <p className="text-xs text-black/50">
                      You can cancel this order until the store starts processing it.
                    </p>
                    <CancelOrderButton id={String(o._id)} orderNumber={o.orderNumber} />
                  </div>
                )}
                {o.status === "CANCELLED" && (
                  <p className="mt-5 border-t border-black/10 pt-5 text-xs text-black/50">
                    {o.cancelledBy === "USER" ? "You cancelled this order." : "This order was cancelled by the store."}{" "}
                    Stock and any voucher used have been restored.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
