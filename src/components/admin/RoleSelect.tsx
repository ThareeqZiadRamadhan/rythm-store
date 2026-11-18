"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const labels = { USER: "Pelanggan", ADMIN: "Admin", SUPERADMIN: "Superadmin" } as const;
type Role = keyof typeof labels;

export default function RoleSelect({ id, role, self }: { id: string; role: Role; self: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState<Role>(role);
  const [busy, setBusy] = useState(false);

  async function change(next: Role) {
    if (!window.confirm(`Ubah role menjadi ${labels[next]}?`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: next }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      window.alert(data.error ?? "Gagal mengubah role.");
      return;
    }
    setValue(next);
    router.refresh();
  }

  if (self) {
    return <span className="text-sm font-semibold text-black/50">{labels[value]} (kamu)</span>;
  }

  return (
    <select
      value={value}
      disabled={busy}
      onChange={(e) => change(e.target.value as Role)}
      className="h-9 rounded-lg border border-black/15 bg-white px-2.5 text-sm font-semibold outline-none focus:border-black disabled:opacity-50"
    >
      {(Object.keys(labels) as Role[]).map((r) => (
        <option key={r} value={r}>
          {labels[r]}
        </option>
      ))}
    </select>
  );
}
