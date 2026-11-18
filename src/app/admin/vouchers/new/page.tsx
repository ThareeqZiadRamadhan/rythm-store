import { requireAdmin } from "@/lib/admin";
import VoucherForm from "@/components/admin/VoucherForm";

export const metadata = { title: "Buat voucher — Admin RYTHM" };

export default async function NewVoucherPage() {
  await requireAdmin({ superadmin: true });
  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Buat voucher</h1>
      <p className="mb-8 mt-2 text-sm text-black/50">Voucher aktif langsung muncul di halaman Voucher saya pelanggan.</p>
      <VoucherForm />
    </div>
  );
}
