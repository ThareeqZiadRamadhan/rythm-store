"use client";

import { useState } from "react";
import { Check, Loader2, Ticket } from "lucide-react";
import { formatPrice } from "@/lib/data";
import type { VoucherDTO } from "@/lib/vouchers";

type BtnState = "idle" | "loading" | "done";
type Phase = { code: string; step: "loading" | "done" | "leaving" } | null;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function stubLabel(v: VoucherDTO) {
  if (v.type === "PERCENT") return `${v.value}%`;
  return v.value >= 1000 ? `Rp${Math.round(v.value / 1000)}K` : formatPrice(v.value);
}

function formatDate(iso: string | null) {
  if (!iso) return "No expiry date";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const statusText = { ACTIVE: "Active", USED: "Used", EXPIRED: "Expired" } as const;

function QuotaBar({ v }: { v: VoucherDTO }) {
  if (v.quota <= 0 || v.remaining === null) return null;
  const low = v.remaining <= Math.max(3, Math.ceil(v.quota * 0.1));
  const used = Math.min(100, (v.claimedCount / v.quota) * 100);
  return (
    <div className="mt-3 max-w-[240px]">
      <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            v.soldOut ? "bg-black/30" : low ? "bg-red-500" : "bg-[#8daa13]"
          }`}
          style={{ width: `${used}%` }}
        />
      </div>
      <p
        className={`mt-1 text-xs font-semibold ${
          v.soldOut ? "text-black/40" : low ? "text-red-600" : "text-black/50"
        }`}
      >
        {v.soldOut
          ? "Fully claimed"
          : low
          ? `Only ${v.remaining} left!`
          : `${v.remaining} of ${v.quota} left`}
      </p>
    </div>
  );
}

function VoucherCard({
  v,
  onClaim,
  btn = "idle",
  busy = false,
  leaving = false,
  highlight = false,
}: {
  v: VoucherDTO;
  onClaim?: (code: string) => void;
  btn?: BtnState;
  busy?: boolean;
  leaving?: boolean;
  highlight?: boolean;
}) {
  const inactive = v.status !== "ACTIVE" || (Boolean(onClaim) && v.soldOut);
  return (
    <div
      className={`flex overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
        leaving ? "scale-95 opacity-0" : "scale-100 opacity-100"
      } ${highlight ? "border-[#8daa13] ring-2 ring-[#c7ea4c]" : "border-black/10"} ${
        onClaim && v.soldOut ? "opacity-60" : ""
      }`}
      style={highlight ? { animation: "vc-in .5s ease-out" } : undefined}
    >
      <div
        className={`flex w-28 shrink-0 flex-col items-center justify-center px-3 py-5 text-center ${
          inactive ? "bg-black/10 text-black/40" : "bg-[#c7ea4c] text-[#11120f]"
        }`}
      >
        <span className="text-2xl font-black leading-none tracking-tight">{stubLabel(v)}</span>
        <span className="mt-1 text-[11px] font-bold uppercase tracking-wider">
          {v.type === "PERCENT" ? "Discount" : "Off"}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 border-l border-dashed border-black/20 p-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <p className="truncate font-bold">{v.title}</p>
          {v.description && <p className="mt-0.5 text-sm text-black/55">{v.description}</p>}
          <p className="mt-2 text-xs text-black/45">
            {v.minSpend > 0 && <>Min. spend {formatPrice(v.minSpend)} · </>}
            {v.type === "PERCENT" && v.maxDiscount > 0 && <>Maks. {formatPrice(v.maxDiscount)} · </>}
            Valid until {formatDate(v.expiresAt)}
          </p>
          <span className="mt-2 inline-block rounded-md bg-black/5 px-2 py-1 font-mono text-xs font-bold tracking-wider">
            {v.code}
          </span>
          {onClaim && <QuotaBar v={v} />}
        </div>

        {onClaim ? (
          v.soldOut ? (
            <span className="flex h-10 w-24 shrink-0 items-center justify-center self-start rounded-full bg-black/10 text-sm font-bold text-black/40 sm:self-center">
              Gone
            </span>
          ) : (
            <button
              onClick={() => onClaim(v.code)}
              disabled={btn !== "idle" || busy}
              className={`flex h-10 w-24 shrink-0 items-center justify-center self-start rounded-full text-sm font-bold text-white transition-colors duration-300 sm:self-center ${
                btn === "done" ? "bg-green-600" : "bg-[#11120f] hover:bg-black/80"
              } ${btn === "idle" && busy ? "opacity-50" : ""} disabled:cursor-default`}
            >
              {btn === "loading" && <Loader2 size={18} className="animate-spin" />}
              {btn === "done" && (
                <Check size={20} strokeWidth={3} style={{ animation: "vc-pop .35s ease-out" }} />
              )}
              {btn === "idle" && "Claim"}
            </button>
          )
        ) : (
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full px-3 py-1 text-xs font-bold sm:self-center ${
              v.status !== "ACTIVE" ? "bg-black/10 text-black/50" : "bg-green-50 text-green-700"
            }`}
          >
            {v.status === "ACTIVE" && <Check size={13} />}
            {statusText[v.status]}
          </span>
        )}
      </div>
    </div>
  );
}

export default function VoucherCenter({
  initialClaimed,
  initialAvailable,
}: {
  initialClaimed: VoucherDTO[];
  initialAvailable: VoucherDTO[];
}) {
  const [claimed, setClaimed] = useState(initialClaimed);
  const [available, setAvailable] = useState(initialAvailable);
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>(null);
  const [highlightCode, setHighlightCode] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const busy = phase !== null;

  async function claim(c: string) {
    if (busy) return;
    setMsg(null);
    setPhase({ code: c, step: "loading" });

    try {
      const [res] = await Promise.all([
        fetch("/api/account/vouchers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: c }),
        }),
        sleep(700),
      ]);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setPhase(null);
        setMsg({ ok: false, text: data.error ?? "Could not claim the voucher." });
        // Muat ulang daftar supaya sisa kuota terbaru tampil
        if (res.status === 409) {
          const fresh = await fetch("/api/account/vouchers/list", { cache: "no-store" })
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null);
          if (fresh) {
            setClaimed(fresh.claimed);
            setAvailable(fresh.available);
          }
        }
        return;
      }

      setPhase({ code: c, step: "done" });
      await sleep(800);
      setPhase({ code: c, step: "leaving" });
      await sleep(350);
      setClaimed(data.claimed);
      setAvailable(data.available);
      setCode("");
      setPhase(null);
      setHighlightCode(c.toUpperCase());
      setTimeout(() => setHighlightCode(null), 2200);
    } catch {
      setPhase(null);
      setMsg({ ok: false, text: "Could not connect to the server." });
    }
  }

  const btnFor = (c: string): BtnState =>
    phase?.code === c ? (phase.step === "loading" ? "loading" : "done") : "idle";

  return (
    <div className="space-y-10">
      <style>{`
        @keyframes vc-pop { 0% { transform: scale(.4); opacity: 0 } 70% { transform: scale(1.2) } 100% { transform: scale(1); opacity: 1 } }
        @keyframes vc-in { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
      `}</style>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim()) claim(code.trim());
        }}
        className="rounded-3xl bg-[#f7f7f2] p-6"
      >
        <label className="mb-2 block text-sm font-bold">Have a voucher code?</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. WELCOME10"
            className="h-12 flex-1 rounded-lg border border-black/15 bg-white px-4 font-mono text-sm uppercase outline-none placeholder:normal-case placeholder:text-black/35 focus:border-black"
          />
          <button
            type="submit"
            disabled={busy || !code.trim()}
            className="flex h-12 w-28 items-center justify-center rounded-full bg-[#11120f] text-sm font-bold text-white hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {phase?.step === "loading" && phase.code === code.trim() ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "Claim"
            )}
          </button>
        </div>
        {msg && (
          <p
            className={`mt-3 rounded-lg px-4 py-3 text-sm ${
              msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {msg.text}
          </p>
        )}
      </form>

      <section>
        <h2 className="text-lg font-black">Your vouchers</h2>
        <div className="mt-4 space-y-4">
          {claimed.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-black/15 px-6 py-10 text-center">
              <div className="grid size-14 place-items-center rounded-full bg-black/5">
                <Ticket size={22} strokeWidth={1.6} />
              </div>
              <p className="mt-4 font-bold">No vouchers yet</p>
              <p className="mt-1 max-w-xs text-sm text-black/50">
                Claim a voucher from the list below or enter a code above.
              </p>
            </div>
          ) : (
            claimed.map((v) => (
              <VoucherCard key={v.id} v={v} highlight={highlightCode === v.code} />
            ))
          )}
        </div>
      </section>

      {available.length > 0 && (
        <section>
          <h2 className="text-lg font-black">Available vouchers</h2>
          <p className="mt-1 text-sm text-black/50">Claim now, use at checkout.</p>
          <div className="mt-4 space-y-4">
            {available.map((v) => (
              <VoucherCard
                key={v.id}
                v={v}
                onClaim={claim}
                btn={btnFor(v.code)}
                busy={busy}
                leaving={phase?.code === v.code && phase.step === "leaving"}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
