"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/data";
import { calcDiscount } from "@/lib/pricing";

export type VoucherFormValues = {
  code: string;
  title: string;
  description: string;
  type: "PERCENT" | "FIXED";
  value: string;
  minSpend: string;
  maxDiscount: string;
  quota: string;
  expiresAt: string;
  isActive: boolean;
};

const input =
  "h-11 w-full rounded-lg border border-black/15 bg-white px-3.5 text-sm outline-none transition focus:border-black disabled:bg-black/5 disabled:text-black/50";

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

export default function VoucherForm({ id, initial }: { id?: string; initial?: VoucherFormValues }) {
  const router = useRouter();
  const editing = Boolean(id);

  const [f, setF] = useState<VoucherFormValues>(
    initial ?? {
      code: "",
      title: "",
      description: "",
      type: "PERCENT",
      value: "10",
      minSpend: "500000",
      maxDiscount: "100000",
      quota: "0",
      expiresAt: "",
      isActive: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof VoucherFormValues>(k: K, v: VoucherFormValues[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  const rule = {
    type: f.type,
    value: Number(f.value) || 0,
    minSpend: Number(f.minSpend) || 0,
    maxDiscount: f.type === "PERCENT" ? Number(f.maxDiscount) || 0 : 0,
  };
  const sample = Math.max(rule.minSpend, 1_000_000);
  const sampleDiscount = calcDiscount(rule, sample);
  const stub =
    f.type === "PERCENT" ? `${rule.value}%` : `Rp${Math.round(rule.value / 1000)}rb`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/admin/vouchers/${id}` : "/api/admin/vouchers", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan voucher.");
        setSaving(false);
        return;
      }
      router.push("/admin/vouchers");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-4 rounded-3xl bg-[#f7f7f2] p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <F label="Kode voucher" hint={editing ? "Kode tidak bisa diubah setelah dibuat." : "Huruf dan angka, 3–20 karakter."}>
            <input
              className={`${input} font-mono uppercase`}
              value={f.code}
              disabled={editing}
              onChange={(e) => set("code", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              placeholder="LEBARAN25"
            />
          </F>
          <F label="Judul">
            <input
              className={input}
              value={f.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Diskon Lebaran 25%"
            />
          </F>
        </div>

        <F label="Deskripsi" hint="Opsional, tampil di halaman Voucher saya.">
          <input
            className={input}
            value={f.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </F>

        <div>
          <span className="mb-1.5 block text-sm font-bold">Jenis voucher</span>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["PERCENT", "Diskon persen", "Contoh: 10% dengan batas maksimum"],
                ["FIXED", "Potongan nominal", "Contoh: potong Rp100.000"],
              ] as const
            ).map(([val, label, desc]) => (
              <button
                key={val}
                type="button"
                onClick={() => set("type", val)}
                className={`rounded-2xl border p-4 text-left transition ${
                  f.type === val ? "border-black bg-white ring-1 ring-black" : "border-black/15 hover:border-black/40"
                }`}
              >
                <span className="block font-bold">{label}</span>
                <span className="mt-0.5 block text-xs text-black/50">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <F label={f.type === "PERCENT" ? "Diskon (%)" : "Potongan (Rp)"}>
            <input
              className={input}
              inputMode="numeric"
              value={f.value}
              onChange={(e) => set("value", digits(e.target.value))}
            />
          </F>
          <F label="Minimum belanja (Rp)" hint="0 = tanpa minimum">
            <input
              className={input}
              inputMode="numeric"
              value={f.minSpend}
              onChange={(e) => set("minSpend", digits(e.target.value))}
            />
          </F>
          {f.type === "PERCENT" && (
            <F label="Maks. potongan (Rp)" hint="0 = tanpa batas">
              <input
                className={input}
                inputMode="numeric"
                value={f.maxDiscount}
                onChange={(e) => set("maxDiscount", digits(e.target.value))}
              />
            </F>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <F label="Kuota klaim" hint="Jumlah maksimal yang bisa mengklaim. 0 = tanpa batas.">
            <input
              className={input}
              inputMode="numeric"
              value={f.quota}
              onChange={(e) => set("quota", digits(e.target.value))}
            />
          </F>
          <F label="Berlaku sampai" hint="Kosongkan kalau tanpa batas. Berakhir 23.59 WIB.">
            <input
              type="date"
              className={input}
              value={f.expiresAt}
              onChange={(e) => set("expiresAt", e.target.value)}
            />
          </F>
        </div>

        <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={f.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
            className="size-5 accent-black"
          />
          Aktif (bisa diklaim dan dipakai)
        </label>
      </section>

      <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
        <div className="flex overflow-hidden rounded-2xl border border-black/10 bg-white">
          <div
            className={`flex w-24 shrink-0 flex-col items-center justify-center px-2 py-5 text-center ${
              f.isActive ? "bg-[#c7ea4c]" : "bg-black/10 text-black/40"
            }`}
          >
            <span className="text-xl font-black leading-none">{stub}</span>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-wider">
              {f.type === "PERCENT" ? "Diskon" : "Potongan"}
            </span>
          </div>
          <div className="min-w-0 border-l border-dashed border-black/20 p-3">
            <p className="truncate font-bold">{f.title || "Judul voucher"}</p>
            <span className="mt-1 inline-block rounded-md bg-black/5 px-2 py-0.5 font-mono text-xs font-bold">
              {f.code || "KODE"}
            </span>
            <p className="mt-1 text-xs text-black/50">
              {Number(f.quota) > 0 ? `Kuota ${Number(f.quota)} orang` : "Tanpa batas kuota"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-[#f7f7f2] p-4 text-sm">
          <p className="font-bold">Contoh hitungan</p>
          <p className="mt-1 text-black/60">
            Belanja {formatPrice(sample)} → potongan{" "}
            <span className="font-bold text-green-700">{formatPrice(sampleDiscount)}</span>
          </p>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#11120f] text-sm font-bold text-white hover:bg-black/80 disabled:opacity-60"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {editing ? "Simpan perubahan" : "Buat voucher"}
        </button>
        <Link
          href="/admin/vouchers"
          className="flex h-12 w-full items-center justify-center rounded-full border border-black/15 text-sm font-bold hover:bg-black/5"
        >
          Batal
        </Link>
      </aside>
    </form>
  );
}
