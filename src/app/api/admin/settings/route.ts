import { NextResponse } from "next/server";
import { adminApi } from "@/lib/admin";
import { logActivity } from "@/lib/activity";
import { formatPrice } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import StoreSetting from "@/models/StoreSetting";

export const dynamic = "force-dynamic";

const num = (v: unknown) => Math.max(0, Math.round(Number(v) || 0));
const money = (n: number) => (n === 0 ? "0" : formatPrice(n));

export async function PATCH(req: Request) {
  const g = await adminApi({ superadmin: true });
  if (g.error) return g.error;

  try {
    const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const announcementEnabled = b.announcementEnabled !== false;
    const announcementText = String(b.announcementText ?? "").trim();
    const shippingFee = num(b.shippingFee);
    const freeShippingMin = num(b.freeShippingMin);

    if (announcementEnabled && announcementText.length < 3) {
      return NextResponse.json({ error: "Announcement text must be at least 3 characters." }, { status: 400 });
    }
    if (announcementText.length > 120) {
      return NextResponse.json({ error: "Announcement text can be at most 120 characters." }, { status: 400 });
    }
    if (shippingFee > 1_000_000) {
      return NextResponse.json({ error: "Shipping fee can be at most Rp1,000,000." }, { status: 400 });
    }

    const before = await getSettings();
    await StoreSetting.updateOne(
      { key: "store" },
      { $set: { announcementEnabled, announcementText, shippingFee, freeShippingMin } },
      { upsert: true }
    );

    const changes: string[] = [];
    if (before.announcementEnabled !== announcementEnabled) {
      changes.push(announcementEnabled ? "announcement shown" : "announcement hidden");
    }
    if (before.announcementText !== announcementText) changes.push(`announcement: "${announcementText}"`);
    if (before.shippingFee !== shippingFee) {
      changes.push(`shipping ${money(before.shippingFee)} → ${money(shippingFee)}`);
    }
    if (before.freeShippingMin !== freeShippingMin) {
      changes.push(`free shipping threshold ${money(before.freeShippingMin)} → ${money(freeShippingMin)}`);
    }
    if (changes.length) await logActivity(g.admin, "settings.update", "Store", changes.join("; "));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong on the server." }, { status: 500 });
  }
}
