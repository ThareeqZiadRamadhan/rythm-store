import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin";
import { toDateInput } from "@/lib/voucherInput";
import Voucher from "@/models/Voucher";
import VoucherForm from "@/components/admin/VoucherForm";

export const metadata = { title: "Edit voucher — Admin RYTHM" };
export const dynamic = "force-dynamic";

export default async function EditVoucherPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin({ superadmin: true });
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  const v = await Voucher.findById(id).lean();
  if (!v) notFound();

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Edit voucher</h1>
      <p className="mb-8 mt-2 font-mono text-sm text-black/50">{v.code}</p>
      <VoucherForm
        id={id}
        initial={{
          code: v.code,
          title: v.title,
          description: v.description ?? "",
          type: v.type as "PERCENT" | "FIXED",
          value: String(v.value),
          minSpend: String(v.minSpend ?? 0),
          maxDiscount: String(v.maxDiscount ?? 0),
          quota: String(v.quota ?? 0),
          expiresAt: toDateInput(v.expiresAt),
          isActive: Boolean(v.isActive),
        }}
      />
    </div>
  );
}
