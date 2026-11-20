"use client";

import { useState } from "react";

const inputClass =
  "h-12 w-full rounded-lg border border-black/15 bg-white px-4 text-sm outline-none transition placeholder:text-black/35 focus:border-black";

export default function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (next.length < 8) {
      return setMsg({ ok: false, text: "Your new password must be at least 8 characters." });
    }
    if (next !== confirm) {
      return setMsg({ ok: false, text: "Passwords do not match." });
    }

    setSaving(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ ok: false, text: data.error ?? "Could not change your password." });
        return;
      }
      setCurrent("");
      setNext("");
      setConfirm("");
      setMsg({ ok: true, text: "Your password has been changed." });
    } catch {
      setMsg({ ok: false, text: "Could not connect to the server." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-5 rounded-3xl bg-[#f7f7f2] p-6 md:p-8"
    >
      <h2 className="text-lg font-black">Change password</h2>

      <div>
        <label className="mb-2 block text-sm font-bold">Current password</label>
        <input
          type="password"
          className={inputClass}
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-bold">New password</label>
        <input
          type="password"
          className={inputClass}
          value={next}
          onChange={(e) => setNext(e.target.value)}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-bold">Confirm new password</label>
        <input
          type="password"
          className={inputClass}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
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
        disabled={saving || !current || !next || !confirm}
        className="h-12 rounded-full bg-[#11120f] px-8 text-sm font-bold text-white hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving..." : "Change password"}
      </button>
    </form>
  );
}
