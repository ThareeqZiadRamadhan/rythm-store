import Voucher from "@/models/Voucher";
import User from "@/models/User";

export type VoucherStatus = "ACTIVE" | "USED" | "EXPIRED";

export type VoucherDTO = {
  id: string;
  code: string;
  title: string;
  description: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minSpend: number;
  maxDiscount: number;
  expiresAt: string | null;
  quota: number;
  claimedCount: number;
  /** null = tanpa batas */
  remaining: number | null;
  soldOut: boolean;
  status: VoucherStatus;
};

type RawVoucher = {
  _id: unknown;
  code: string;
  title: string;
  description?: string | null;
  type: string;
  value: number;
  minSpend?: number | null;
  maxDiscount?: number | null;
  quota?: number | null;
  claimedCount?: number | null;
  expiresAt?: Date | null;
};

function toDTO(v: RawVoucher, status: VoucherStatus): VoucherDTO {
  const quota = v.quota ?? 0;
  const claimedCount = v.claimedCount ?? 0;
  const remaining = quota > 0 ? Math.max(0, quota - claimedCount) : null;
  return {
    id: String(v._id),
    code: v.code,
    title: v.title,
    description: v.description ?? "",
    type: v.type as "PERCENT" | "FIXED",
    value: v.value,
    minSpend: v.minSpend ?? 0,
    maxDiscount: v.maxDiscount ?? 0,
    expiresAt: v.expiresAt ? new Date(v.expiresAt).toISOString() : null,
    quota,
    claimedCount,
    remaining,
    soldOut: remaining === 0,
    status,
  };
}

const order: Record<VoucherStatus, number> = { ACTIVE: 0, USED: 1, EXPIRED: 2 };

/** Voucher yang sudah diklaim user + voucher publik yang masih bisa diklaim. */
export async function getVoucherLists(userId: string) {
  const user = await User.findById(userId).select("vouchers").lean();
  const wallet = user?.vouchers ?? [];
  const ownedIds = wallet.map((w) => w.voucher);
  const now = new Date();

  const owned = await Voucher.find({ _id: { $in: ownedIds } }).lean();
  const byId = new Map(owned.map((v) => [String(v._id), v]));

  const claimed: VoucherDTO[] = [];
  for (const w of wallet) {
    const v = byId.get(String(w.voucher));
    if (!v) continue;
    const expired = !v.isActive || (v.expiresAt && new Date(v.expiresAt) < now);
    const status: VoucherStatus = w.usedAt ? "USED" : expired ? "EXPIRED" : "ACTIVE";
    claimed.push(toDTO(v, status));
  }
  claimed.sort((a, b) => order[a.status] - order[b.status]);

  const availableDocs = await Voucher.find({
    isActive: true,
    _id: { $nin: ownedIds },
    $or: [{ expiresAt: { $gt: now } }, { expiresAt: { $exists: false } }, { expiresAt: null }],
  })
    .sort({ createdAt: -1 })
    .lean();

  // Yang kuotanya habis tetap ditampilkan (di urutan akhir) supaya pelanggan tahu
  const available = availableDocs
    .map((v) => toDTO(v, "ACTIVE"))
    .sort((a, b) => Number(a.soldOut) - Number(b.soldOut));

  return { claimed, available };
}
