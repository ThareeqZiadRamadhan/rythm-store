"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/data";
import { freeShippingText, type PublicSettings } from "@/lib/settings-types";

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

const digits = (s: string) => s.replace(/\D/g, "");

export default function SettingsForm({ initial }: { initial: PublicSettings }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initial.announcementEnabled);
  const [text, setText] = useState(initial.announcementText);
  const [fee, setFee] = useState(String(initial.shippingFee));
  const [min, setMin] = useState(String(initial.freeShippingMin));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const rule = { shippingFee: Number(fee) || 0, freeShippingMin: Number(min) || 0 };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          announcementEnabled: enabled,
          announcementText: text,
          shippingFee: rule.shippingFee,
          freeShippingMin: rule.freeShippingMin,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ ok: false, text: data.error ?? "Gagal menyimpan pengaturan." });
        return;
      }
      setMsg({ ok: true, text: "Pengaturan tersimpan dan langsung berlaku di toko." });
      router.refresh();
    } catch {
      setMsg({ ok: false, text: "Tidak bisa terhubung ke server." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="max-w-3xl space-y-6">
      <section className="space-y-4 rounded-3xl bg-[#f7f7f2] p-6">
        <h2 className="text-lg font-black">Pengumuman</h2>
        <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="size-5 accent-black"
          />
          Tampilkan bar pengumuman di atas navbar
        </label>
        <F label="Teks pengumuman" hint={`${text.length}/120 karakter`}>
          <input
            className={input}
            value={text}
            maxLength={120}
            onChange={(e) => setText(e.target.value)}
            placeholder="Misal: Diskon 20% akhir tahun, pakai kode GAJIAN20"
          />
        </F>
        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-black/40">Pratinjau</p>
          {enabled ? (
            <div className="rounded-lg bg-[#11120f] px-5 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              {text || "…"}
            </div>
          ) : (
            <p className="text-sm text-black/45">Bar pengumuman disembunyikan.</p>
          )}
        </div>
      </section>

      <section className="space-y-4 rounded-3xl bg-[#f7f7f2] p-6">
        <h2 className="text-lg font-black">Ongkos kirim</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <F label="Ongkir per pesanan (Rp)" hint="0 = selalu gratis ongkir">
            <input className={input} inputMode="numeric" value={fee} onChange={(e) => setFee(digits(e.target.value))} />
          </F>
          <F label="Gratis ongkir mulai belanja (Rp)" hint="0 = tidak ada gratis ongkir berdasarkan minimum">
            <input className={input} inputMode="numeric" value={min} onChange={(e) => setMin(digits(e.target.value))} />
          </F>
        </div>
        <div className="rounded-2xl bg-white p-4 text-sm">
          <p className="font-bold">Yang dilihat pembeli</p>
          <p className="mt-1 text-black/60">{freeShippingText(rule)}.</p>
          {rule.shippingFee > 0 && (
            <p className="mt-1 text-black/60">
              Contoh: belanja {formatPrice(500000)} → ongkir{" "}
              <span className="font-bold">
                {rule.freeShippingMin > 0 && 500000 >= rule.freeShippingMin ? "gratis" : formatPrice(rule.shippingFee)}
              </span>
            </p>
          )}
        </div>
      </section>

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
        className="flex h-12 items-center gap-2 rounded-full bg-[#11120f] px-8 text-sm font-bold text-white hover:bg-black/80 disabled:opacity-60"
      >
        {saving && <Loader2 size={16} className="animate-spin" />}
        Simpan pengaturan
      </button>
    </form>
  );
}
