"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Loader2, Search, X } from "lucide-react";
import { formatPrice } from "@/lib/data";

type Hit = { slug: string; name: string; category: string; price: number; image: string; color: string };

const SUGGESTIONS = ["Running", "Lifestyle", "Training", "Pria", "Wanita"];

export default function SearchButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tutup saat pindah halaman
  useEffect(() => setOpen(false), [pathname]);

  // Cmd/Ctrl + K untuk membuka, Esc untuk menutup
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Fokus ke input dan kunci scroll halaman saat terbuka
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Cari sambil mengetik (jeda 250 ms)
  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => {
          setHits(d.results ?? []);
          setLoading(false);
        })
        .catch(() => {});
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Cari produk"
        className="grid size-10 place-items-center rounded-full transition-colors hover:bg-black/5"
      >
        <Search size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]">
          <button
            aria-label="Tutup pencarian"
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative mx-auto mt-0 w-full max-w-2xl bg-[#f7f7f2] shadow-2xl md:mt-20 md:rounded-3xl">
            <form onSubmit={submit} className="flex items-center gap-3 border-b border-black/10 px-5 py-4">
              <Search size={20} className="shrink-0 text-black/45" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari sepatu, kategori, atau warna..."
                className="h-10 flex-1 bg-transparent text-lg outline-none placeholder:text-black/35"
              />
              {loading && <Loader2 size={18} className="animate-spin text-black/40" />}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup"
                className="grid size-9 place-items-center rounded-full hover:bg-black/5"
              >
                <X size={18} />
              </button>
            </form>

            <div className="max-h-[70vh] overflow-y-auto p-3">
              {!q.trim() ? (
                <div className="p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/40">Coba cari</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setQ(s)}
                        className="rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-semibold hover:border-black"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="mt-5 text-xs text-black/40">Tip: tekan Cmd+K untuk membuka pencarian.</p>
                </div>
              ) : hits.length === 0 && !loading ? (
                <p className="p-6 text-center text-sm text-black/50">
                  Tidak ada produk yang cocok dengan &ldquo;{q.trim()}&rdquo;.
                </p>
              ) : (
                <>
                  <ul className="space-y-1">
                    {hits.map((h) => (
                      <li key={h.slug}>
                        <Link
                          href={`/shop/${h.slug}`}
                          className="flex items-center gap-4 rounded-2xl p-2.5 transition hover:bg-white"
                        >
                          <span
                            className="size-14 shrink-0 overflow-hidden rounded-xl"
                            style={{ backgroundColor: h.color }}
                          >
                            <img src={h.image} alt="" className="h-full w-full object-cover mix-blend-multiply" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-bold">{h.name}</span>
                            <span className="block text-xs text-black/50">{h.category}</span>
                          </span>
                          <span className="text-sm font-bold">{formatPrice(h.price)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {hits.length > 0 && (
                    <button
                      type="button"
                      onClick={submit}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#11120f] px-4 py-3 text-sm font-bold text-white hover:bg-black/80"
                    >
                      Lihat semua hasil untuk &ldquo;{q.trim()}&rdquo; <ArrowRight size={16} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
