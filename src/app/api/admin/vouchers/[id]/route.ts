import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { adminApi } from "@/lib/admin";
import { logActivity } from "@/lib/activity";
import { describeVoucher, parseVoucherInput, toDateInput } from "@/lib/voucherInput";
import Voucher from "@/models/Voucher";
import User from "@/models/User";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const quotaText = (q: number) => (q > 0 ? `${q}` : "unlimited");

export async function PATCH(req: Request, { params }: Ctx) {
  const g = await adminApi({ superadmin: true });
  if (g.error) return g.error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid voucher ID." }, { status: 400 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const v = await Voucher.findById(id);
    if (!v) return NextResponse.json({ error: "Voucher not found." }, { status: 404 });

    if (Object.keys(body).length === 1 && "isActive" in body) {
      v.isActive = Boolean(body.isActive);
      await v.save();
      await logActivity(g.admin, "voucher.update", v.code, v.isActive ? "activated" : "deactivated");
      return NextResponse.json({ isActive: v.isActive });
    }

    const parsed = parseVoucherInput({ ...body, code: v.code });
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const d = parsed.data;

    const claimed = v.claimedCount ?? 0;
    if (d.quota > 0 && d.quota < claimed) {
      return NextResponse.json(
        { error: `Quota cannot be lower than the number already claimed (${claimed}).` },
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
    if (v.title !== d.title) changes.push(`title "${v.title}" → "${d.title}"`);
    if (describeVoucher(before) !== describeVoucher(d)) {
      changes.push(`${describeVoucher(before)} → ${describeVoucher(d)}`);
    }
    if ((v.quota ?? 0) !== d.quota) {
      changes.push(`quota ${quotaText(v.quota ?? 0)} → ${quotaText(d.quota)}`);
    }
    if (toDateInput(v.expiresAt) !== toDateInput(d.expiresAt)) {
      changes.push(
        `valid until ${toDateInput(v.expiresAt) || "unlimited"} → ${toDateInput(d.expiresAt) || "unlimited"}`
      );
    }
    if (Boolean(v.isActive) !== d.isActive) changes.push(d.isActive ? "activated" : "deactivated");
    if ((v.description ?? "") !== d.description) changes.push("description");

    await Voucher.updateOne({ _id: id }, { $set: d });
    if (changes.length) await logActivity(g.admin, "voucher.update", v.code, changes.join("; "));

    return NextResponse.json({ id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong on the server." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await adminApi({ superadmin: true });
  if (g.error) return g.error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid voucher ID." }, { status: 400 });
  }

  try {
    const claimed = await User.countDocuments({ "vouchers.voucher": id });
    if (claimed > 0) {
      return NextResponse.json(
        {
          error: `This voucher has been claimed by ${claimed} ${claimed === 1 ? "user" : "users"}. Deactivate it instead to keep order history intact.`,
        },
        { status: 409 }
      );
    }

    const deleted = await Voucher.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Voucher not found." }, { status: 404 });

    await logActivity(g.admin, "voucher.delete", deleted.code, deleted.title);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong on the server." }, { status: 500 });
  }
}
