import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { adminApi } from "@/lib/admin";
import { logActivity } from "@/lib/activity";
import { NEXT_STATUS, STATUS_LABEL, type OrderStatus } from "@/lib/orderStatus";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import Voucher from "@/models/Voucher";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminApi();
  if (g.error) return g.error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "ID pesanan tidak valid." }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const next = String(body.status ?? "") as OrderStatus;
    if (!(next in STATUS_LABEL)) {
      return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
    }

    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });

    const current = order.status as OrderStatus;
    if (!NEXT_STATUS[current].includes(next)) {
      return NextResponse.json(
        { error: `Status tidak bisa diubah dari ${STATUS_LABEL[current]} ke ${STATUS_LABEL[next]}.` },
        { status: 400 }
      );
    }

    const updated = await Order.findOneAndUpdate(
      { _id: id, status: current },
      { $set: { status: next } },
      { new: true }
    );
    if (!updated) {
      return NextResponse.json(
        { error: "Pesanan baru saja diubah. Muat ulang halaman." },
        { status: 409 }
      );
    }

    let note = "";
    if (next === "CANCELLED") {
      for (const it of order.items) {
        await Product.updateOne(
          { _id: it.product, "variants.size": it.size },
          { $inc: { "variants.$.stock": it.quantity } }
        );
      }
      note = "; stok dikembalikan";
      if (order.voucherCode) {
        const v = await Voucher.findOne({ code: order.voucherCode }).select("_id").lean();
        if (v) {
          await User.updateOne(
            { _id: order.user, "vouchers.voucher": v._id },
            { $unset: { "vouchers.$.usedAt": "" } }
          );
          note += `, voucher ${order.voucherCode} dikembalikan`;
        }
      }
    }

    await logActivity(
      g.admin,
      "order.status",
      order.orderNumber,
      `${STATUS_LABEL[current]} → ${STATUS_LABEL[next]}${note}`
    );

    return NextResponse.json({ status: next });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan di server." }, { status: 500 });
  }
}
