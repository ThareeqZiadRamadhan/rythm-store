import { NextResponse } from "next/server";
import { adminApi } from "@/lib/admin";
import { logActivity } from "@/lib/activity";
import { describeVoucher, parseVoucherInput } from "@/lib/voucherInput";
import Voucher from "@/models/Voucher";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const g = await adminApi({ superadmin: true });
  if (g.error) return g.error;

  try {
    const parsed = parseVoucherInput(await req.json().catch(() => ({})));
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const d = parsed.data;

    if (await Voucher.exists({ code: d.code })) {
      return NextResponse.json({ error: "This voucher code is already in use." }, { status: 409 });
    }

    const v = await Voucher.create(d);
    await logActivity(g.admin, "voucher.create", d.code, `${d.title}; ${describeVoucher(d)}`);

    return NextResponse.json({ id: String(v._id) }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong on the server." }, { status: 500 });
  }
}
