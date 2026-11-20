import { requireAdmin } from "@/lib/admin";
import VoucherForm from "@/components/admin/VoucherForm";

export const metadata = { title: "Create voucher — Admin RYTHM" };

export default async function NewVoucherPage() {
  await requireAdmin({ superadmin: true });
  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Create voucher</h1>
      <p className="mb-8 mt-2 text-sm text-black/50">Active vouchers appear right away on customers' My vouchers page.</p>
      <VoucherForm />
    </div>
  );
}
