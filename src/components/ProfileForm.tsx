"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClass =
  "h-12 w-full rounded-lg border border-black/15 bg-white px-4 text-sm outline-none transition placeholder:text-black/35 focus:border-black disabled:bg-black/5 disabled:text-black/50";

export default function ProfileForm({
  name: initialName,
  email,
  phone: initialPhone,
}: {
  name: string;
  email: string;
  phone: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ ok: false, text: data.error ?? "Could not save your changes." });
        return;
      }
      setName(data.user.name);
      setPhone(data.user.phone ?? "");
      setMsg({ ok: true, text: "Your profile has been saved." });
      router.refresh();
    } catch {
      setMsg({ ok: false, text: "Could not connect to the server." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl bg-[#f7f7f2] p-6 md:p-8"
    >
      <h2 className="text-lg font-black">Personal details</h2>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold">Full name</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Phone number</label>
          <input
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+62812xxxxxxx"
            inputMode="tel"
            autoComplete="tel"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold">Email</label>
        <input className={inputClass} value={email} disabled />
        <p className="mt-1.5 text-xs text-black/45">Email cannot be changed.</p>
      </div>

      {msg && (
        <p
          className={`rounded-lg px-4 py-3 text-sm ${
            msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {msg.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="h-12 rounded-full bg-[#11120f] px-8 text-sm font-bold text-white hover:bg-black/80 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
