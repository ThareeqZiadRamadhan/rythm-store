import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Footprints,
  Receipt,
  ShoppingBag,
  Tag,
  UserPlus,
  Wallet,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { formatPrice } from "@/lib/data";
import { PAYMENT_LABEL, STATUS_CLASS, STATUS_LABEL, type OrderStatus } from "@/lib/orderStatus";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export const metadata = { title: "Dashboard admin — RYTHM" };
export const dynamic = "force-dynamic";

const TZ = "Asia/Jakarta";
const DAY = 86_400_000;
const RANGES = [7, 30, 90];

const dayKey = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);

const shortDate = (d: Date) =>
  d.toLocaleDateString("id-ID", { day: "numeric", month: "short", timeZone: TZ });

function pct(curr: number, prev: number) {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}

function Trend({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold ${
        up ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {Math.abs(value)}%
    </span>
  );
}

type Summary = { revenue: number; orders: number; pairs: number };
type LowStock = { _id: unknown; name: string; size: number; stock: number };

async function summary(from: Date, to: Date): Promise<Summary> {
  const [r] = await Order.aggregate([
    { $match: { createdAt: { $gte: from, $lt: to }, status: { $ne: "CANCELLED" } } },
    {
      $group: {
        _id: null,
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
        pairs: { $sum: { $sum: "$items.quantity" } },
      },
    },
  ]);
  return { revenue: r?.revenue ?? 0, orders: r?.orders ?? 0, pairs: r?.pairs ?? 0 };
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const admin = await requireAdmin();
  const { range } = await searchParams;
  const days = RANGES.includes(Number(range)) ? Number(range) : 30;

  const now = new Date();
  const from = new Date(now.getTime() - days * DAY);
  const prevFrom = new Date(from.getTime() - days * DAY);
  const match = { createdAt: { $gte: from, $lt: now }, status: { $ne: "CANCELLED" } };
  const lineRevenue = { $multiply: ["$items.price", "$items.quantity"] };

  const [
    curr,
    prev,
    daily,
    topProducts,
    byCategory,
    byPayment,
    statusAgg,
    newUsers,
    prevNewUsers,
    pending,
    activeProducts,
    recent,
    lowStock,
  ] = await Promise.all([
    summary(from, now),
    summary(prevFrom, from),
    Order.aggregate<{ _id: string; revenue: number; orders: number }>([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: TZ } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
    ]),
    Order.aggregate<{ _id: string; name: string; image: string; color: string; qty: number; revenue: number }>([
      { $match: match },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.slug",
          name: { $first: "$items.name" },
          image: { $first: "$items.image" },
          color: { $first: "$items.color" },
          qty: { $sum: "$items.quantity" },
          revenue: { $sum: lineRevenue },
        },
      },
      { $sort: { qty: -1, revenue: -1 } },
      { $limit: 5 },
    ]),
    Order.aggregate<{ _id: string; revenue: number; qty: number }>([
      { $match: match },
      { $unwind: "$items" },
      { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "p" } },
      {
        $group: {
          _id: { $ifNull: [{ $first: "$p.category" }, "Lainnya"] },
          revenue: { $sum: lineRevenue },
          qty: { $sum: "$items.quantity" },
        },
      },
      { $sort: { revenue: -1 } },
    ]),
    Order.aggregate<{ _id: string; n: number; revenue: number }>([
      { $match: match },
      { $group: { _id: "$paymentMethod", n: { $sum: 1 }, revenue: { $sum: "$total" } } },
      { $sort: { n: -1 } },
    ]),
    Order.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    User.countDocuments({ createdAt: { $gte: from, $lt: now } }),
    User.countDocuments({ createdAt: { $gte: prevFrom, $lt: from } }),
    Order.countDocuments({ status: "PENDING" }),
    Product.countDocuments({ isActive: true }),
    Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name").lean(),
    Product.aggregate<LowStock>([
      { $unwind: "$variants" },
      { $match: { "variants.stock": { $lte: 3 } } },
      { $sort: { "variants.stock": 1 } },
      { $limit: 6 },
      { $project: { name: 1, size: "$variants.size", stock: "$variants.stock" } },
    ]),
  ]);

  const aov = curr.orders ? Math.round(curr.revenue / curr.orders) : 0;
  const prevAov = prev.orders ? Math.round(prev.revenue / prev.orders) : 0;

  const kpis = [
    { label: "Pendapatan", value: formatPrice(curr.revenue), trend: pct(curr.revenue, prev.revenue), icon: Wallet },
    { label: "Pesanan", value: String(curr.orders), trend: pct(curr.orders, prev.orders), icon: Receipt },
    { label: "Rata-rata per pesanan", value: formatPrice(aov), trend: pct(aov, prevAov), icon: ShoppingBag },
    { label: "Pasang terjual", value: String(curr.pairs), trend: pct(curr.pairs, prev.pairs), icon: Footprints },
  ];

  const byDay = new Map(daily.map((d) => [d._id, d]));
  const series = Array.from({ length: days }, (_, i) => {
    const date = new Date(now.getTime() - (days - 1 - i) * DAY);
    const hit = byDay.get(dayKey(date));
    return { key: dayKey(date), date, revenue: hit?.revenue ?? 0, orders: hit?.orders ?? 0 };
  });
  const maxRev = Math.max(1, ...series.map((s) => s.revenue));

  const maxCat = Math.max(1, ...byCategory.map((c) => c.revenue));
  const totalPayments = byPayment.reduce((s, p) => s + p.n, 0);
  const statusCount = Object.fromEntries(statusAgg.map((s) => [s._id, s.n])) as Record<string, number>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Halo, {admin.name.split(" ")[0]}</h1>
          <p className="mt-2 text-sm text-black/50">
            Performa toko {days} hari terakhir, dibanding {days} hari sebelumnya.
          </p>
        </div>
        <div className="flex rounded-full bg-[#f7f7f2] p-1">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin?range=${r}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                r === days ? "bg-[#11120f] text-white" : "text-black/60 hover:text-black"
              }`}
            >
              {r} hari
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, trend, icon: Icon }) => (
          <div key={label} className="rounded-3xl bg-[#f7f7f2] p-6">
            <div className="flex items-center justify-between">
              <div className="grid size-10 place-items-center rounded-full bg-white">
                <Icon size={18} strokeWidth={1.7} />
              </div>
              <Trend value={trend} />
            </div>
            <p className="mt-5 truncate text-2xl font-black tracking-tight xl:text-3xl">{value}</p>
            <p className="mt-1 text-sm text-black/50">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/admin/orders?status=PENDING"
          className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm hover:border-amber-400"
        >
          <Clock size={18} className="text-amber-700" />
          <span className="font-bold">{pending}</span> pesanan menunggu konfirmasi
          <ArrowRight size={16} className="ml-auto" />
        </Link>
        <div className="flex items-center gap-3 rounded-2xl bg-[#f7f7f2] px-4 py-3 text-sm">
          <Tag size={18} />
          <span className="font-bold">{activeProducts}</span> produk aktif di toko
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-[#f7f7f2] px-4 py-3 text-sm">
          <UserPlus size={18} />
          <span className="font-bold">{newUsers}</span> pengguna baru
          <span className="ml-auto">
            <Trend value={pct(newUsers, prevNewUsers)} />
          </span>
        </div>
      </div>

      <section className="rounded-3xl bg-[#f7f7f2] p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-black">Pendapatan harian</h2>
          <p className="text-sm text-black/50">Tertinggi {formatPrice(maxRev === 1 ? 0 : maxRev)} per hari</p>
        </div>
        <div className="mt-6 flex h-52 items-end gap-[3px]">
          {series.map((s) => (
            <div key={s.key} className="group relative flex h-full flex-1 items-end">
              <div
                className={`w-full rounded-t-[3px] transition-colors ${
                  s.revenue ? "bg-[#11120f] group-hover:bg-[#8daa13]" : "bg-black/10"
                }`}
                style={{ height: `${s.revenue ? Math.max(3, (s.revenue / maxRev) * 100) : 2}%` }}
              />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#11120f] px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                <p className="font-bold">{shortDate(s.date)}</p>
                <p>{formatPrice(s.revenue)}</p>
                <p className="text-white/60">{s.orders} pesanan</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-black/45">
          <span>{shortDate(series[0].date)}</span>
          <span>{shortDate(series[Math.floor(series.length / 2)].date)}</span>
          <span>{shortDate(series[series.length - 1].date)}</span>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl bg-[#f7f7f2] p-6">
          <h2 className="text-lg font-black">Produk terlaris</h2>
          {topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-black/50">Belum ada penjualan di periode ini.</p>
          ) : (
            <ol className="mt-4 space-y-2">
              {topProducts.map((p, i) => (
                <li key={p._id} className="flex items-center gap-3 rounded-2xl bg-white p-3">
                  <span className="w-5 text-center text-sm font-black text-black/30">{i + 1}</span>
                  <img
                    src={p.image}
                    alt=""
                    className="size-11 shrink-0 rounded-xl object-cover mix-blend-multiply"
                    style={{ backgroundColor: p.color || "#eeeeea" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{p.name}</p>
                    <p className="text-xs text-black/50">{p.qty} pasang terjual</p>
                  </div>
                  <p className="text-sm font-bold">{formatPrice(p.revenue)}</p>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="rounded-3xl bg-[#f7f7f2] p-6">
          <h2 className="text-lg font-black">Penjualan per kategori</h2>
          {byCategory.length === 0 ? (
            <p className="mt-4 text-sm text-black/50">Belum ada penjualan di periode ini.</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {byCategory.map((c) => (
                <li key={c._id}>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{c._id}</span>
                    <span className="text-black/60">
                      {formatPrice(c.revenue)} · {c.qty} pasang
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-[#11120f]"
                      style={{ width: `${(c.revenue / maxCat) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          <h3 className="mt-8 text-sm font-black">Metode pembayaran</h3>
          {byPayment.length === 0 ? (
            <p className="mt-2 text-sm text-black/50">-</p>
          ) : (
            <ul className="mt-3 grid gap-2 sm:grid-cols-3">
              {byPayment.map((p) => (
                <li key={p._id} className="rounded-2xl bg-white p-3">
                  <p className="text-xs text-black/50">{PAYMENT_LABEL[p._id] ?? p._id}</p>
                  <p className="mt-1 text-xl font-black">
                    {Math.round((p.n / Math.max(1, totalPayments)) * 100)}%
                  </p>
                  <p className="text-xs text-black/50">{p.n} pesanan</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-3xl bg-[#f7f7f2] p-6">
        <h2 className="text-lg font-black">Semua pesanan per status</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-5">
          {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
            <Link
              key={s}
              href={`/admin/orders?status=${s}`}
              className="rounded-2xl bg-white p-4 transition hover:ring-1 hover:ring-black/20"
            >
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_CLASS[s]}`}>
                {STATUS_LABEL[s]}
              </span>
              <p className="mt-3 text-2xl font-black">{statusCount[s] ?? 0}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-3xl bg-[#f7f7f2] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black">Pesanan terbaru</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-bold hover:underline">
              Semua <ArrowRight size={16} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-black/50">Belum ada pesanan.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {recent.map((o) => {
                const st = o.status as OrderStatus;
                const customer = o.user as unknown as { name?: string } | null;
                return (
                  <li key={o.orderNumber} className="flex items-center gap-3 rounded-2xl bg-white p-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm font-bold">{o.orderNumber}</p>
                      <p className="truncate text-xs text-black/50">{customer?.name ?? "User dihapus"}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_CLASS[st]}`}>
                      {STATUS_LABEL[st]}
                    </span>
                    <span className="w-28 text-right text-sm font-bold">{formatPrice(o.total)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-3xl bg-[#f7f7f2] p-6">
          <h2 className="flex items-center gap-2 text-lg font-black">
            <AlertTriangle size={18} className="text-amber-600" /> Stok menipis
          </h2>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-black/50">Semua ukuran stoknya aman.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {lowStock.map((s) => (
                <li
                  key={`${String(s._id)}-${s.size}`}
                  className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm"
                >
                  <span className="truncate font-semibold">
                    {s.name} <span className="font-normal text-black/50">· EU {s.size}</span>
                  </span>
                  <span className={`font-bold ${s.stock === 0 ? "text-red-600" : "text-amber-700"}`}>
                    {s.stock === 0 ? "Habis" : `Sisa ${s.stock}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/products"
            className="mt-4 flex items-center gap-1 text-sm font-bold hover:underline"
          >
            Atur stok <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </div>
  );
}
