"use client";

import { useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import type { AddressDTO } from "@/lib/address";

const inputClass =
  "h-12 w-full rounded-lg border border-black/15 bg-white px-4 text-sm outline-none transition placeholder:text-black/35 focus:border-black";

const emptyForm = {
  label: "Rumah",
  recipient: "",
  phone: "",
  street: "",
  city: "",
  province: "",
  postalCode: "",
  isDefault: false,
};

export default function AddressBook({ initial }: { initial: AddressDTO[] }) {
  const [addresses, setAddresses] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan alamat.");
        return;
      }
      setAddresses(data.addresses);
      setForm(emptyForm);
      setShowForm(false);
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  async function makeDefault(id: string) {
    const res = await fetch(`/api/account/addresses/${id}`, { method: "PATCH" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setAddresses(data.addresses);
  }

  async function remove(id: string) {
    if (!window.confirm("Hapus alamat ini?")) return;
    const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setAddresses(data.addresses);
  }

  return (
    <div className="rounded-3xl bg-[#f7f7f2] p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black">Alamat pengiriman</h2>
          <p className="mt-1 text-sm text-black/50">
            Alamat utama dipakai otomatis saat checkout.
          </p>
        </div>
        {!showForm && addresses.length < 5 && (
          <button
            onClick={() => setShowForm(true)}
            className="flex shrink-0 items-center gap-2 rounded-full bg-[#11120f] px-5 py-2.5 text-sm font-bold text-white hover:bg-black/80"
          >
            <Plus size={16} /> Tambah alamat
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mt-6 space-y-4 rounded-2xl border border-black/10 bg-white p-5"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold">Label alamat</label>
              <input
                className={inputClass}
                value={form.label}
                onChange={(e) => set("label", e.target.value)}
                placeholder="Rumah, Kantor, Kos..."
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold">Nama penerima</label>
              <input
                className={inputClass}
                value={form.recipient}
                onChange={(e) => set("recipient", e.target.value)}
                autoComplete="name"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Nomor HP penerima</label>
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+62812xxxxxxx"
              inputMode="tel"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Alamat lengkap</label>
            <textarea
              value={form.street}
              onChange={(e) => set("street", e.target.value)}
              rows={3}
              placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
              className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-black/35 focus:border-black"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-bold">Kota / kabupaten</label>
              <input
                className={inputClass}
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold">Provinsi</label>
              <input
                className={inputClass}
                value={form.province}
                onChange={(e) => set("province", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold">Kode pos</label>
              <input
                className={inputClass}
                value={form.postalCode}
                onChange={(e) => set("postalCode", e.target.value.replace(/\D/g, "").slice(0, 5))}
                inputMode="numeric"
                placeholder="60294"
              />
            </div>
          </div>

          {addresses.length > 0 && (
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => set("isDefault", e.target.checked)}
                className="size-5 accent-black"
              />
              Jadikan alamat utama
            </label>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="h-11 rounded-full bg-[#11120f] px-7 text-sm font-bold text-white hover:bg-black/80 disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan alamat"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError("");
              }}
              className="h-11 rounded-full border border-black/15 px-7 text-sm font-bold hover:bg-black/5"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-4">
        {addresses.length === 0 && !showForm && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-black/15 px-6 py-10 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-black/5">
              <MapPin size={22} strokeWidth={1.6} />
            </div>
            <p className="mt-4 font-bold">Belum ada alamat</p>
            <p className="mt-1 max-w-xs text-sm text-black/50">
              Tambahkan alamat supaya checkout lebih cepat.
            </p>
          </div>
        )}

        {addresses.map((a) => (
          <div
            key={a.id}
            className={`rounded-2xl border bg-white p-5 ${
              a.isDefault ? "border-black" : "border-black/10"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-bold">
                {a.label}
              </span>
              {a.isDefault && (
                <span className="rounded-full bg-[#c7ea4c] px-3 py-1 text-xs font-bold">
                  Utama
                </span>
              )}
            </div>
            <p className="mt-3 font-bold">
              {a.recipient} <span className="font-normal text-black/50">· {a.phone}</span>
            </p>
            <p className="mt-1 text-sm leading-6 text-black/70">
              {a.street}
              <br />
              {a.city}, {a.province} {a.postalCode}
            </p>
            <div className="mt-4 flex gap-5 text-sm font-semibold">
              {!a.isDefault && (
                <button
                  onClick={() => makeDefault(a.id)}
                  className="underline underline-offset-4 hover:text-[#5f7a00]"
                >
                  Jadikan utama
                </button>
              )}
              <button
                onClick={() => remove(a.id)}
                className="flex items-center gap-1.5 text-red-600 hover:underline"
              >
                <Trash2 size={14} /> Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
