"use client";

import { ChevronLeft, ChevronRight, Ruler } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/catalog-types";
import { RULER_MAX_CM, fmtNum, sampleSizeFor } from "@/lib/sizes";

const INTERVAL_MS = 5000;
const SLIDE_MS = 900;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
// Busur cincin: lingkaran raksasa yang pusatnya di bawah panggung.
// Garis dari 160° (kiri bawah) sampai 20° (kanan bawah), satu garis tiap 1°.
const RING_FROM = 160;
const RING_TO = 20;
const RING_COUNT = RING_FROM - RING_TO + 1;
const RING_TICKS = Array.from({ length: RING_COUNT }, (_, i) => {
  const deg = RING_FROM - i;
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const r1 = 48.7;
  const r2 = 50;
  const f = (n: number) => Number(n.toFixed(3));
  return { x1: f(50 + r1 * c), y1: f(50 - r1 * s), x2: f(50 + r2 * c), y2: f(50 - r2 * s) };
});
const STAGE_H = "clamp(460px, 70vh, 720px)";
// Lebar area ukur dibatasi supaya sepatu tidak lebih tinggi dari panggung
const MEASURE_W = "min(57vw, 1100px, calc((clamp(460px, 70vh, 720px) - 110px) * 2.2))";

const wordOf = (name: string) => name.split(" ")[0];
const rupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");
const pct = (cm: number) => `${(cm / RULER_MAX_CM) * 100}%`;

export default function HeroSlider({ products }: { products: Product[] }) {
  const slides = products.slice(0, 5);
  const n = slides.length;
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [missing, setMissing] = useState<Record<string, boolean>>({});

  const go = (i: number) => setIndex(((i % n) + n) % n);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);

  useEffect(() => {
    if (reduced || n < 2) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % n), INTERVAL_MS);
    return () => clearTimeout(t);
  }, [index, reduced, n]);

  if (n === 0) return null;

  const current = slides[index];
  const animate = !reduced && n > 1;
  const sample = sampleSizeFor(current.gender);

  return (
    <section className="border-b border-black/10 bg-[#eeeee9]">
      <style>{`
        @keyframes ring-on { to { stroke: #11120f; } }
        .ring-tick { animation: ring-on 180ms linear forwards; }
      `}</style>
      {/* Bar atas */}
      <div className="mx-auto grid max-w-[1440px] items-center gap-3 px-5 pt-6 md:grid-cols-[1fr_auto_1fr] md:px-10">
        <div className="hidden text-sm text-black/55 md:block">
          <p>Drop 01</p>
          <p>RYTHM Collection</p>
        </div>

        <div className="hide-scrollbar flex max-w-full justify-self-center overflow-x-auto rounded-full bg-black/[0.06] p-1.5">
          {slides.map((p, i) => (
            <button
              key={p.id}
              onClick={() => go(i)}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                i === index ? "bg-[#111] text-white" : "text-black/60 hover:text-black"
              }`}
            >
              {wordOf(p.name)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 justify-self-end">
          <button
            onClick={() => go(index - 1)}
            aria-label="Previous"
            className="grid h-11 w-11 place-items-center rounded-xl border border-black/15 bg-white transition-colors hover:bg-black hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="w-14 text-center text-sm tabular-nums text-black/55">
            {index + 1} / {n}
          </span>
          <button
            onClick={() => go(index + 1)}
            aria-label="Next"
            className="grid h-11 w-11 place-items-center rounded-xl border border-black/15 bg-white transition-colors hover:bg-black hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Panggung */}
      <div className="relative mt-4 overflow-hidden" style={{ height: STAGE_H }}>
        {/* Cincin waktu: garis abu-abu menghitam searah jarum jam selama satu slide */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2"
          style={{
            width: `calc(${STAGE_H} * 3.04)`,
            height: `calc(${STAGE_H} * 3.04)`,
            top: `calc(${STAGE_H} * 0.24)`,
          }}
        >
          <svg
            key={`ring-${index}-${animate}`}
            viewBox="0 0 100 100"
            className="h-full w-full overflow-visible"
          >
            {RING_TICKS.map((t, i) => (
              <line
                key={i}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                strokeWidth={0.07}
                strokeLinecap="round"
                className={animate ? "ring-tick" : undefined}
                style={{
                  stroke: "rgba(17, 18, 15, 0.22)",
                  animationDelay: animate ? `${(i / RING_COUNT) * INTERVAL_MS}ms` : undefined,
                }}
              />
            ))}
          </svg>
        </div>

        {/* Kata raksasa di belakang sepatu */}
        <div className="pointer-events-none absolute inset-x-0 top-0 bottom-24 flex items-center justify-center">
          {slides.map((p, i) => {
            const word = wordOf(p.name);
            const active = i === index;
            return (
              <span
                key={p.id}
                aria-hidden
                className="absolute whitespace-nowrap uppercase leading-none text-[#111]"
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontWeight: 700,
                  letterSpacing: "-0.055em",
                  fontSize: `min(calc(${STAGE_H} * 0.56), ${(94 / (word.length * 0.6)).toFixed(2)}vw)`,
                  opacity: active ? 1 : 0,
                  transform: `scale(${active ? 1 : 0.94})`,
                  transition: `opacity ${SLIDE_MS}ms ${EASE}, transform ${SLIDE_MS}ms ${EASE}`,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Area ukur: sepatu + penggaris memakai lebar yang sama */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2" style={{ width: MEASURE_W }}>
          {/* Sepatu, digambar sepanjang ukurannya di penggaris */}
          <div className="absolute inset-x-0 top-6 bottom-[76px]">
            {slides.map((p, i) => {
              const d = (i - index + n) % n;
              const x = d === 0 ? 0 : d === n - 1 ? -35 : 35;
              const active = d === 0;
              const len = sampleSizeFor(p.gender).shoeCm;
              const useFallback = missing[p.slug];
              return (
                <div
                  key={p.id}
                  className="absolute inset-0"
                  style={{
                    transform: `translateX(${x}%)`,
                    opacity: active ? 1 : 0,
                    transition: `transform ${SLIDE_MS}ms ${EASE}, opacity ${SLIDE_MS}ms ${EASE}`,
                    pointerEvents: active ? "auto" : "none",
                  }}
                >
                  <div
                    className="absolute bottom-0 flex h-full items-end"
                    style={{ width: pct(len), left: `${(100 - (len / RULER_MAX_CM) * 100) / 2}%` }}
                  >
                    <div className="absolute -bottom-1 left-[10%] h-6 w-[80%] rounded-full bg-black/25 blur-2xl" />
                    <img
                      src={useFallback ? p.image : `/shoes/${p.slug}.png`}
                      alt={p.name}
                      draggable={false}
                      onError={() => setMissing((m) => ({ ...m, [p.slug]: true }))}
                      className={`relative max-h-full w-full select-none object-contain object-bottom ${
                        useFallback ? "mix-blend-multiply" : ""
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Penggaris: panjangnya sama dengan sepatu, garis tiap 1 cm */}
          <div
            className="absolute bottom-7 h-10"
            style={{
              width: pct(sample.shoeCm),
              left: `${(100 - (sample.shoeCm / RULER_MAX_CM) * 100) / 2}%`,
              transition: `width ${SLIDE_MS}ms ${EASE}, left ${SLIDE_MS}ms ${EASE}`,
            }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-black/45" />
            {Array.from({ length: Math.floor(sample.shoeCm) + 1 }, (_, cm) => (
              <span
                key={cm}
                className={`absolute top-0 w-px bg-black/45 ${cm % 5 === 0 ? "h-3" : "h-1.5"}`}
                style={{
                  left: `${(cm / sample.shoeCm) * 100}%`,
                  transition: `left ${SLIDE_MS}ms ${EASE}`,
                }}
              />
            ))}
            <span className="absolute right-0 top-0 h-3 w-px bg-black/45" />
            {Array.from({ length: Math.floor(sample.shoeCm / 5) + 1 }, (_, i) => i * 5).map((cm) => (
              <span
                key={cm}
                className="absolute top-[18px] -translate-x-1/2 text-[11px] tabular-nums text-black/50"
                style={{
                  left: `${(cm / sample.shoeCm) * 100}%`,
                  transition: `left ${SLIDE_MS}ms ${EASE}`,
                }}
              >
                {cm}
              </span>
            ))}
            <span className="absolute right-0 top-[34px] whitespace-nowrap text-xs tabular-nums text-black/60 sm:left-full sm:right-auto sm:top-[-7px] sm:ml-5">
              EU {sample.eu} · {fmtNum(sample.shoeCm)} cm
            </span>
          </div>
        </div>
      </div>

      {/* Bar bawah */}
      <div className="border-t border-black/10">
        <div
          key={current.id}
          className="fade-up mx-auto grid max-w-[1440px] items-center gap-4 px-5 py-5 md:grid-cols-[1fr_auto_auto] md:gap-10 md:px-10"
        >
          <p className="line-clamp-2 max-w-xl text-sm leading-6 text-black/70 md:text-base">
            <span className="text-black underline underline-offset-4">{current.name}.</span>{" "}
            {current.description}
          </p>

          <div className="flex items-center gap-3 text-sm text-black/70">
            <span
              className="h-9 w-9 shrink-0 rounded-full border border-black/10"
              style={{ backgroundColor: current.color }}
            />
            <span>
              {current.colorName}
              <Link
                href="/fit"
                className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-black underline underline-offset-4"
              >
                <Ruler size={12} /> Find your size
              </Link>
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/shop/${current.slug}`}
              className="rounded-full border border-black/25 px-7 py-4 text-sm font-medium transition-colors hover:bg-black hover:text-white"
            >
              View details
            </Link>
            <Link
              href={`/shop/${current.slug}`}
              className="rounded-full bg-[#111] px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-black/80"
            >
              Buy now <span className="ml-2 text-white/60">{rupiah(current.price)}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
