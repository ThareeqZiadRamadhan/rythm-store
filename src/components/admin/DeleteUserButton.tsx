"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

export default function DeleteUserButton({ id, email }: { id: string; email: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    const ok = window.confirm(
      `Hapus akun admin ${email}?\n\nAkun langsung keluar dan tidak bisa login lagi. Tindakan ini tidak bisa dibatalkan.`
    );
    if (!ok) return;
    setBusy(true);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return window.alert(data.error ?? "Gagal menghapus akun.");
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      aria-label={`Hapus ${email}`}
      title="Hapus akun"
      className="grid size-9 place-items-center rounded-full text-red-600 transition hover:bg-red-50 disabled:opacity-50"
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  );
}
