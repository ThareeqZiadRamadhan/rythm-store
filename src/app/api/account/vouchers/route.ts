import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { getVoucherLists } from "@/lib/vouchers";
import Voucher from "@/models/Voucher";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// Klaim voucher berdasarkan kode
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Silakan masuk dulu." }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const code = String(body.code ?? "").trim().toUpperCase();
    if (!code) {
      return NextResponse.json({ error: "Masukkan kode voucher." }, { status: 400 });
    }

    await connectDB();
    const voucher = await Voucher.findOne({ code });
    if (!voucher) {
      return NextResponse.json({ error: "Kode voucher tidak ditemukan." }, { status: 404 });
    }
    if (!voucher.isActive || (voucher.expiresAt && voucher.expiresAt < new Date())) {
      return NextResponse.json({ error: "Voucher ini sudah tidak berlaku." }, { status: 400 });
    }

    const already = await User.exists({ _id: session.sub, "vouchers.voucher": voucher._id });
    if (already) {
      return NextResponse.json({ error: "Voucher ini sudah kamu klaim." }, { status: 409 });
    }

    // Ambil satu jatah kuota secara atomik (aman walau banyak yang klaim bersamaan)
    const reserved = await Voucher.findOneAndUpdate(
      {
        _id: voucher._id,
        isActive: true,
        $or: [
          { quota: { $lte: 0 } },
          { quota: { $exists: false } },
          { $expr: { $lt: [{ $ifNull: ["$claimedCount", 0] }, "$quota"] } },
        ],
      },
      { $inc: { claimedCount: 1 } },
      { new: true }
    );
    if (!reserved) {
      return NextResponse.json({ error: "Maaf, kuota voucher ini sudah habis." }, { status: 409 });
    }

    const pushed = await User.updateOne(
      { _id: session.sub, "vouchers.voucher": { $ne: voucher._id } },
      { $push: { vouchers: { voucher: voucher._id, claimedAt: new Date() } } }
    );

    if (pushed.modifiedCount === 0) {
      // Gagal disimpan ke akun: kembalikan jatah kuotanya
      await Voucher.updateOne({ _id: voucher._id }, { $inc: { claimedCount: -1 } });
      return NextResponse.json(
        { error: "Voucher gagal disimpan. Coba lagi." },
        { status: 409 }
      );
    }

    return NextResponse.json(await getVoucherLists(session.sub), { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan di server." }, { status: 500 });
  }
}
