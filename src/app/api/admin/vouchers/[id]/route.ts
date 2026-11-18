import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { adminApi } from "@/lib/admin";
import { logActivity } from "@/lib/activity";
import { describeVoucher, parseVoucherInput, toDateInput } from "@/lib/voucherInput";
import Voucher from "@/models/Voucher";
import User from "@/models/User";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const quotaText = (q: number) => (q > 0 ? `${q}` : "tanpa batas");

export async function PATCH(req: Request, { params }: Ctx) {
  const g = await adminApi({ superadmin: true });
  if (g.error) return g.error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "ID voucher tidak valid." }, { status: 400 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const v = await Voucher.findById(id);
    if (!v) return NextResponse.json({ error: "Voucher tidak ditemukan." }, { status: 404 });

    if (Object.keys(body).length === 1 && "isActive" in body) {
      v.isActive = Boolean(body.isActive);
      await v.save();
      await logActivity(g.admin, "voucher.update", v.code, v.isActive ? "diaktifkan" : "dinonaktifkan");
      return NextResponse.json({ isActive: v.isActive });
    }

    const parsed = parseVoucherInput({ ...body, code: v.code });
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const d = parsed.data;

    const claimed = v.claimedCount ?? 0;
    if (d.quota > 0 && d.quota < claimed) {
      return NextResponse.json(
        { error: `Kuota tidak bisa lebih kecil dari yang sudah diklaim (${claimed}).` },
        { status: 400 }
      );
    }

    const before = {
      type: v.type,
      value: v.value,
      minSpend: v.minSpend ?? 0,
      maxDiscount: v.maxDiscount ?? 0,
    };
    const changes: string[] = [];
    if (v.title !== d.title) changes.push(`judul "${v.title}" → "${d.title}"`);
    if (describeVoucher(before) !== describeVoucher(d)) {
      changes.push(`${describeVoucher(before)} → ${describeVoucher(d)}`);
    }
    if ((v.quota ?? 0) !== d.quota) {
      changes.push(`kuota ${quotaText(v.quota ?? 0)} → ${quotaText(d.quota)}`);
    }
    if (toDateInput(v.expiresAt) !== toDateInput(d.expiresAt)) {
      changes.push(
        `berlaku s.d. ${toDateInput(v.expiresAt) || "tanpa batas"} → ${toDateInput(d.expiresAt) || "tanpa batas"}`
      );
    }
    if (Boolean(v.isActive) !== d.isActive) changes.push(d.isActive ? "diaktifkan" : "dinonaktifkan");
    if ((v.description ?? "") !== d.description) changes.push("deskripsi");

    await Voucher.updateOne({ _id: id }, { $set: d });
    if (changes.length) await logActivity(g.admin, "voucher.update", v.code, changes.join("; "));

    return NextResponse.json({ id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan di server." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await adminApi({ superadmin: true });
  if (g.error) return g.error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "ID voucher tidak valid." }, { status: 400 });
  }

  try {
    const claimed = await User.countDocuments({ "vouchers.voucher": id });
    if (claimed > 0) {
      return NextResponse.json(
        {
          error: `Voucher sudah diklaim ${claimed} pengguna. Nonaktifkan saja supaya riwayat pesanan tetap utuh.`,
        },
        { status: 409 }
      );
    }

    const deleted = await Voucher.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Voucher tidak ditemukan." }, { status: 404 });

    await logActivity(g.admin, "voucher.delete", deleted.code, deleted.title);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan di server." }, { status: 500 });
  }
}
