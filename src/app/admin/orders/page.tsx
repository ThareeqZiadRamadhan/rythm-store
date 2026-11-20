import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatPrice } from "@/lib/data";
import { PAYMENT_LABEL, STATUS_LABEL, type OrderStatus } from "@/lib/orderStatus";
import Order from "@/models/Order";
import OrderStatusControl from "@/components/admin/OrderStatusControl";

export const metadata = { title: "Orders — Admin RYTHM" };
export const dynamic = "force-dynamic";

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const active = status && status in STATUS_LABEL ? (status as OrderStatus) : null;

  const [orders, countAgg] = await Promise.all([
    Order.find(active ? { status: active } : {})
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("user", "name email")
      .lean(),
    Order.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
  ]);

  const counts = Object.fromEntries(countAgg.map((c) => [c._id, c.n])) as Record<string, number>;
  const total = countAgg.reduce((s, c) => s + c.n, 0);

  const tabs: { key: OrderStatus | null; label: string; n: number }[] = [
    { key: null, label: "All", n: total },
    ...(Object.keys(STATUS_LABEL) as OrderStatus[]).map((k) => ({
      key: k,
      label: STATUS_LABEL[k],
      n: counts[k] ?? 0,
    })),
  ];

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Orders</h1>
      <p className="mt-2 text-sm text-black/50">Manage customer orders and update their status.</p>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.key ? `/admin/orders?status=${t.key}` : "/admin/orders"}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              active === t.key ? "bg-[#11120f] text-white" : "bg-[#f7f7f2] hover:bg-black/10"
            }`}
          >
            {t.label} <span className="opacity-60">({t.n})</span>
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-black/15 p-10 text-center text-sm text-black/50">
          No orders in this category.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => {
            const customer = o.user as unknown as { name?: string; email?: string } | null;
            const addr = o.shippingAddress;
            return (
              <article key={o.orderNumber} className="rounded-3xl bg-[#f7f7f2] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-sm font-bold">{o.orderNumber}</p>
                    <p className="mt-1 text-xs text-black/50">
                      {new Date(o.createdAt).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <OrderStatusControl id={String(o._id)} status={o.status as OrderStatus} />
                    {o.status === "CANCELLED" && o.cancelledBy === "USER" && (
                      <span className="text-xs text-black/50">Cancelled by customer</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 text-sm md:grid-cols-[1.2fr_1fr_auto]">
                  <ul className="space-y-1">
                    {o.items.map((it, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="font-semibold">{it.name}</span>
                        <span className="text-black/50">
                          EU {it.size} × {it.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-black/60">
                    <p className="font-semibold text-black">{customer?.name ?? "Deleted user"}</p>
                    <p className="truncate">{customer?.email}</p>
                    <p className="mt-1">
                      {addr?.recipient} · {addr?.city}, {addr?.province}
                    </p>
                  </div>
                  <div className="md:text-right">
                    <p className="text-lg font-black">{formatPrice(o.total)}</p>
                    <p className="text-xs text-black/50">
                      {PAYMENT_LABEL[o.paymentMethod] ?? o.paymentMethod}
                      {o.voucherCode ? ` · ${o.voucherCode}` : ""}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
