import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { restoreCancelledOrder } from "@/lib/orderCancel";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

/**
 * Pelanggan membatalkan pesanannya sendiri.
 * Hanya boleh selama status masih "Menunggu konfirmasi" (PENDING).
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Silakan masuk dulu." }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "ID pesanan tidak valid." }, { status: 400 });
  }

  try {
    await connectDB();

    // Atomik: hanya berhasil kalau pesanan milik user ini DAN masih PENDING.
    // Kalau admin memproses di saat yang sama, salah satunya pasti gagal.
    const order = await Order.findOneAndUpdate(
      { _id: id, user: session.sub, status: "PENDING" },
      { $set: { status: "CANCELLED", cancelledBy: "USER" } },
      { new: true }
    );

    if (!order) {
      const exists = await Order.findOne({ _id: id, user: session.sub }).select("status").lean();
      if (!exists) {
        return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
      }
      return NextResponse.json(
        {
          error:
            exists.status === "CANCELLED"
              ? "Pesanan ini sudah dibatalkan."
              : "Pesanan sudah diproses toko sehingga tidak bisa dibatalkan.",
        },
        { status: 409 }
      );
    }

    await restoreCancelledOrder(order);
    return NextResponse.json({ status: "CANCELLED" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan di server." }, { status: 500 });
  }
}
