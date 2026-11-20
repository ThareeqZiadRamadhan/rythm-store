"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export type UserFormValues = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

const input =
  "h-11 w-full rounded-lg border border-black/15 bg-white px-3.5 text-sm outline-none transition focus:border-black";

function F({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-black/45">{hint}</span>}
    </label>
  );
}

export default function UserForm({ id, initial }: { id?: string; initial?: UserFormValues }) {
  const router = useRouter();
  const editing = Boolean(id);

  const [f, setF] = useState<UserFormValues>(
    initial ?? { name: "", email: "", phone: "", password: "" }
  );
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof UserFormValues>(k: K, v: UserFormValues[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!editing || f.password) {
      if (f.password.length < 8) return setError("Password must be at least 8 characters.");
    }
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/admin/users/${id}` : "/api/admin/users", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not save the admin account.");
        setSaving(false);
        return;
      }
      router.push("/admin/users");
      router.refresh();
    } catch {
      setError("Could not connect to the server.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-4 rounded-3xl bg-[#f7f7f2] p-6">
        <F label="Full name">
          <input
            className={input}
            value={f.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Budi Santoso"
            required
          />
        </F>

        <div className="grid gap-4 md:grid-cols-2">
          <F label="Email">
            <input
              type="email"
              className={input}
              value={f.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="budi@example.com"
              required
            />
          </F>
          <F label="Phone number" hint="e.g. 081234567890 or +6281234567890.">
            <input
              type="tel"
              className={input}
              value={f.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="081234567890"
              required
            />
          </F>
        </div>

        <F
          label={editing ? "New password" : "Password"}
          hint={
            editing
              ? "Leave empty to keep the current password. At least 8 characters."
              : "At least 8 characters. Share it with the admin so they can sign in."
          }
        >
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              className={`${input} pr-11`}
              value={f.password}
              onChange={(e) => set("password", e.target.value)}
              autoComplete="new-password"
              required={!editing}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-black/50 hover:bg-black/5"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </F>

        <p className="rounded-2xl border border-black/10 bg-white p-4 text-xs text-black/55">
          <span className="font-bold text-black">Admin permissions:</span> dashboard, products & stock, order
          processing and review moderation. Admins cannot manage vouchers, users, store settings or the activity
          log.
        </p>
      </section>

      <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
        <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#dbe9a6] text-lg font-bold text-[#4a5d00]">
            {(f.name.trim().charAt(0) || "?").toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-bold">{f.name || "Admin name"}</p>
            <p className="truncate text-xs text-black/50">{f.email || "email@contoh.com"}</p>
            <span className="mt-1 inline-block rounded-full bg-[#c7ea4c] px-2.5 py-0.5 text-[11px] font-bold">
              Admin
            </span>
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#11120f] text-sm font-bold text-white hover:bg-black/80 disabled:opacity-60"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {editing ? "Save changes" : "Add admin"}
        </button>
        <Link
          href="/admin/users"
          className="flex h-12 w-full items-center justify-center rounded-full border border-black/15 text-sm font-bold hover:bg-black/5"
        >
          Cancel
        </Link>
      </aside>
    </form>
  );
}
