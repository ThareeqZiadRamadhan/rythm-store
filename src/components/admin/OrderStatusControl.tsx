"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  ACTION_LABEL,
  NEXT_STATUS,
  STATUS_CLASS,
  STATUS_LABEL,
  type OrderStatus,
} from "@/lib/orderStatus";

export default function OrderStatusControl({ id, status }: { id: string; status: OrderStatus }) {
  const router = useRouter();
  const [busy, setBusy] = useState<OrderStatus | null>(null);
  const options = NEXT_STATUS[status];

  async function change(next: OrderStatus) {
    if (next === "CANCELLED" && !window.confirm("Batalkan pesanan ini? Stok dan voucher akan dikembalikan.")) {
      return;
    }
    setBusy(next);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      window.alert(data.error ?? "Gagal mengubah status.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_CLASS[status]}`}>
        {STATUS_LABEL[status]}
      </span>
      {options.map((next) => (
        <button
          key={next}
          onClick={() => change(next)}
          disabled={busy !== null}
          className={`flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition disabled:opacity-50 ${
            next === "CANCELLED"
              ? "border border-red-200 text-red-600 hover:bg-red-50"
              : "bg-[#11120f] text-white hover:bg-black/80"
          }`}
        >
          {busy === next && <Loader2 size={13} className="animate-spin" />}
          {ACTION_LABEL[next]}
        </button>
      ))}
    </div>
  );
}
