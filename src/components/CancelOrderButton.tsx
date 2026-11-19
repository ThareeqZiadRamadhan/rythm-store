"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, XCircle } from "lucide-react";

export default function CancelOrderButton({ id, orderNumber }: { id: string; orderNumber: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleCancel() {
    const ok = window.confirm(
      `Batalkan pesanan ${orderNumber}?\n\nStok dan voucher yang dipakai akan dikembalikan. Pesanan yang sudah dibatalkan tidak bisa diaktifkan lagi.`
    );
    if (!ok) return;

    setBusy(true);
    const res = await fetch(`/api/account/orders/${id}/cancel`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) window.alert(data.error ?? "Gagal membatalkan pesanan.");
    router.refresh();
  }

  return (
    <button
      onClick={handleCancel}
      disabled={busy}
      className="flex h-10 items-center gap-2 rounded-full border border-red-200 bg-white px-4 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
    >
      {busy ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
      Batalkan pesanan
    </button>
  );
}
