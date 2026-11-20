import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { formatPrice } from "@/lib/data";
import Voucher from "@/models/Voucher";
import User from "@/models/User";
import Order from "@/models/Order";
import VoucherRowActions from "@/components/admin/VoucherRowActions";

export const metadata = { title: "Vouchers — Admin RYTHM" };
export const dynamic = "force-dynamic";

export default async function AdminVouchers() {
  await requireAdmin({ superadmin: true });

  const [vouchers, claimAgg, discountAgg] = await Promise.all([
    Voucher.find().sort({ createdAt: -1 }).lean(),
    User.aggregate<{ _id: unknown; claimed: number; used: number }>([
      { $unwind: "$vouchers" },
      {
        $group: {
          _id: "$vouchers.voucher",
          claimed: { $sum: 1 },
          used: { $sum: { $cond: [{ $ifNull: ["$vouchers.usedAt", false] }, 1, 0] } },
        },
      },
    ]),
    Order.aggregate<{ _id: string; total: number }>([
      { $match: { voucherCode: { $exists: true, $ne: null }, status: { $ne: "CANCELLED" } } },
      { $group: { _id: "$voucherCode", total: { $sum: "$discount" } } },
    ]),
  ]);

  const claims = new Map(claimAgg.map((c) => [String(c._id), c]));
  const discounts = new Map(discountAgg.map((d) => [d._id, d.total]));
  const now = new Date();
  const totalDiscount = discountAgg.reduce((s, d) => s + d.total, 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Vouchers</h1>
          <p className="mt-2 text-sm text-black/50">
            {vouchers.length} {vouchers.length === 1 ? "voucher" : "vouchers"} · total discounts given {formatPrice(totalDiscount)}
          </p>
        </div>
        <Link
          href="/admin/vouchers/new"
          className="flex items-center gap-2 rounded-full bg-[#11120f] px-5 py-3 text-sm font-bold text-white hover:bg-black/80"
        >
          <Plus size={16} /> Create voucher
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-black/10">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-[#f7f7f2] text-xs uppercase tracking-wider text-black/50">
            <tr>
              <th className="px-4 py-3 font-bold">Voucher</th>
              <th className="px-4 py-3 font-bold">Value</th>
              <th className="px-4 py-3 font-bold">Valid until</th>
              <th className="px-4 py-3 font-bold">Claim quota</th>
              <th className="px-4 py-3 font-bold">Used</th>
              <th className="px-4 py-3 font-bold">Total discount</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {vouchers.map((v) => {
              const id = String(v._id);
              const c = claims.get(id);
              const expired = Boolean(v.expiresAt && new Date(v.expiresAt) < now);
              const full = (v.quota ?? 0) > 0 && (v.claimedCount ?? 0) >= (v.quota ?? 0);
              const status = !v.isActive
                ? { label: "Inactive", cls: "bg-black/10 text-black/50" }
                : full
                ? { label: "Fully claimed", cls: "bg-amber-100 text-amber-800" }
                : expired
                ? { label: "Expired", cls: "bg-red-100 text-red-700" }
                : { label: "Active", cls: "bg-[#c7ea4c]" };
              return (
                <tr key={id} className="hover:bg-black/[0.02]">
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-black/5 px-2 py-0.5 font-mono text-xs font-bold">
                      {v.code}
                    </span>
                    <p className="mt-1 font-semibold">{v.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold">
                      {v.type === "PERCENT" ? `${v.value}%` : formatPrice(v.value)}
                    </p>
                    <p className="text-xs text-black/50">
                      {(v.minSpend ?? 0) > 0 ? `Min. ${formatPrice(v.minSpend ?? 0)}` : "No minimum"}
                      {v.type === "PERCENT" && (v.maxDiscount ?? 0) > 0
                        ? ` · maks. ${formatPrice(v.maxDiscount ?? 0)}`
                        : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-black/70">
                    {v.expiresAt
                      ? new Date(v.expiresAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          timeZone: "Asia/Jakarta",
                        })
                      : "No limit"}
                  </td>
                  <td className="px-4 py-3">
                    <p>
                      <span className="font-bold">{v.claimedCount ?? 0}</span>
                      <span className="text-black/45"> / {(v.quota ?? 0) > 0 ? v.quota : "∞"}</span>
                    </p>
                    {(v.quota ?? 0) > 0 && (
                      <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-black/10">
                        <div
                          className={`h-full rounded-full ${
                            (v.claimedCount ?? 0) >= (v.quota ?? 0) ? "bg-red-500" : "bg-[#8daa13]"
                          }`}
                          style={{
                            width: `${Math.min(100, ((v.claimedCount ?? 0) / (v.quota ?? 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">{c?.used ?? 0}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(discounts.get(v.code) ?? 0)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.cls}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <VoucherRowActions id={id} code={v.code} isActive={Boolean(v.isActive)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
