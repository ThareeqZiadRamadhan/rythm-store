"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

export default function DeleteUserButton({ id, email }: { id: string; email: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    const ok = window.confirm(
      `Delete the admin account ${email}?\n\nIt will be signed out immediately and will not be able to sign in again. This cannot be undone.`
    );
    if (!ok) return;
    setBusy(true);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return window.alert(data.error ?? "Could not delete the account.");
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      aria-label={`Delete ${email}`}
      title="Delete account"
      className="grid size-9 place-items-center rounded-full text-red-600 transition hover:bg-red-50 disabled:opacity-50"
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  );
}
