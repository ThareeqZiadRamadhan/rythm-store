import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { getVoucherLists } from "@/lib/vouchers";
import VoucherCenter from "@/components/VoucherCenter";

export const metadata = { title: "Voucher saya — RYTHM" };
export const dynamic = "force-dynamic";

export default async function VouchersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();
  const { claimed, available } = await getVoucherLists(session.sub);

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Voucher saya</h1>
      <p className="mb-8 mt-2 text-sm text-black/50">Voucher dan promo untuk akunmu.</p>
      <VoucherCenter initialClaimed={claimed} initialAvailable={available} />
    </div>
  );
}
