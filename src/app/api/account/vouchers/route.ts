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
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const code = String(body.code ?? "").trim().toUpperCase();
    if (!code) {
      return NextResponse.json({ error: "Please enter a voucher code." }, { status: 400 });
    }

    await connectDB();
    const voucher = await Voucher.findOne({ code });
    if (!voucher) {
      return NextResponse.json({ error: "Voucher code not found." }, { status: 404 });
    }
    if (!voucher.isActive || (voucher.expiresAt && voucher.expiresAt < new Date())) {
      return NextResponse.json({ error: "This voucher is no longer valid." }, { status: 400 });
    }

    const already = await User.exists({ _id: session.sub, "vouchers.voucher": voucher._id });
    if (already) {
      return NextResponse.json({ error: "You've already claimed this voucher." }, { status: 409 });
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
      return NextResponse.json({ error: "Sorry, this voucher has been fully claimed." }, { status: 409 });
    }

    const pushed = await User.updateOne(
      { _id: session.sub, "vouchers.voucher": { $ne: voucher._id } },
      { $push: { vouchers: { voucher: voucher._id, claimedAt: new Date() } } }
    );

    if (pushed.modifiedCount === 0) {
      // Gagal disimpan ke akun: kembalikan jatah kuotanya
      await Voucher.updateOne({ _id: voucher._id }, { $inc: { claimedCount: -1 } });
      return NextResponse.json(
        { error: "Could not save the voucher. Please try again." },
        { status: 409 }
      );
    }

    return NextResponse.json(await getVoucherLists(session.sub), { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong on the server." }, { status: 500 });
  }
}
