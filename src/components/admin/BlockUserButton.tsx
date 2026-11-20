"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Ban, Loader2, RotateCcw } from "lucide-react";

export default function BlockUserButton({
  id,
  email,
  blocked,
}: {
  id: string;
  email: string;
  blocked: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const question = blocked
      ? `Unblock the account ${email}?`
      : `Block the account ${email}? It will be signed out immediately and will not be able to sign in or check out.`;
    if (!window.confirm(question)) return;

    setBusy(true);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBlocked: !blocked }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return window.alert(data.error ?? "Could not update the account status.");
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition disabled:opacity-50 ${
        blocked
          ? "bg-[#11120f] text-white hover:bg-black/80"
          : "border border-red-200 text-red-600 hover:bg-red-50"
      }`}
    >
      {busy ? <Loader2 size={13} className="animate-spin" /> : blocked ? <RotateCcw size={13} /> : <Ban size={13} />}
      {blocked ? "Unblock" : "Block"}
    </button>
  );
}
