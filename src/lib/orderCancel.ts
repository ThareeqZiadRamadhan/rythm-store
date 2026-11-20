import type { Types } from "mongoose";
import Product from "@/models/Product";
import User from "@/models/User";
import Voucher from "@/models/Voucher";

type CancelledOrder = {
  user: Types.ObjectId | string;
  items: { product: Types.ObjectId | string; size: number; quantity: number }[];
  voucherCode?: string | null;
};

/**
 * Kembalikan stok dan voucher dari pesanan yang dibatalkan.
 * Dipakai oleh admin (ubah status) dan pelanggan (batalkan pesanan sendiri).
 * Panggil hanya SETELAH status berhasil diubah ke CANCELLED secara atomik,
 * supaya stok tidak dikembalikan dua kali.
 * Mengembalikan catatan singkat untuk log aktivitas.
 */
export async function restoreCancelledOrder(order: CancelledOrder): Promise<string> {
  for (const it of order.items) {
    await Product.updateOne(
      { _id: it.product, "variants.size": it.size },
      { $inc: { "variants.$.stock": it.quantity } }
    );
  }
  let note = "; stock restored";

  if (order.voucherCode) {
    const v = await Voucher.findOne({ code: order.voucherCode }).select("_id").lean();
    if (v) {
      await User.updateOne(
        { _id: order.user, "vouchers.voucher": v._id },
        { $unset: { "vouchers.$.usedAt": "" } }
      );
      note += `, voucher ${order.voucherCode} restored`;
    }
  }
  return note;
}
