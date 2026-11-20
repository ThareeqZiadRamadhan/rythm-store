"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";

export default function VoucherRowActions({
  id,
  code,
  isActive,
}: {
  id: string;
  code: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"toggle" | "delete" | null>(null);

  async function toggle() {
    setBusy("toggle");
    const res = await fetch(`/api/admin/vouchers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return window.alert(data.error ?? "Could not update the status.");
    router.refresh();
  }

  async function remove() {
    if (!window.confirm(`Delete voucher ${code}?`)) return;
    setBusy("delete");
    const res = await fetch(`/api/admin/vouchers/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return window.alert(data.error ?? "Could not delete the voucher.");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={toggle}
        disabled={busy !== null}
        role="switch"
        aria-checked={isActive}
        aria-label={isActive ? `Deactivate ${code}` : `Activate ${code}`}
        className={`relative mr-2 inline-block h-6 w-11 shrink-0 rounded-full p-0 transition-colors disabled:opacity-50 ${
          isActive ? "bg-[#8daa13]" : "bg-black/20"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 ${
            isActive ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <Link
        href={`/admin/vouchers/${id}`}
        aria-label={`Edit ${code}`}
        className="grid size-9 place-items-center rounded-full transition hover:bg-black/5"
      >
        <Pencil size={16} />
      </Link>
      <button
        onClick={remove}
        disabled={busy !== null}
        aria-label={`Delete ${code}`}
        className="grid size-9 place-items-center rounded-full text-red-600 transition hover:bg-red-50 disabled:opacity-50"
      >
        {busy === "delete" ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
      </button>
    </div>
  );
}
