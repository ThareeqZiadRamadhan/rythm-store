"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { products } from "@/lib/data";

const slides = products.slice(0, 5);
const INTERVAL_MS = 5000;
const SLIDE_MS = 900;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const TICKS = 126; // 0..25 langkah 0.2

const wordOf = (name: string) => name.split(" ")[0];
const rupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function HeroSlider() {
  const n = slides.length;
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [missing, setMissing] = useState<Record<string, boolean>>({});

  const go = (i: number) => setIndex(((i % n) + n) % n);
  const current = slides[index];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % n), INTERVAL_MS);
    return () => clearTimeout(t);
  }, [index, reduced, n]);

  return (
    <section className="border-b border-black/10 bg-[#eeeee9]">
      {/* Bar atas */}
      <div className="mx-auto grid max-w-[1440px] items-center gap-3 px-5 pt-6 md:grid-cols-[1fr_auto_1fr] md:px-10">
        <div className="hidden text-sm text-black/55 md:block">
          <p>Drop 01</p>
          <p>Koleksi RYTHM</p>
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
            aria-label="Sebelumnya"
            className="grid h-11 w-11 place-items-center rounded-xl border border-black/15 bg-white transition-colors hover:bg-black hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="w-14 text-center text-sm tabular-nums text-black/55">
            {index + 1} / {n}
          </span>
          <button
            onClick={() => go(index + 1)}
            aria-label="Berikutnya"
            className="grid h-11 w-11 place-items-center rounded-xl border border-black/15 bg-white transition-colors hover:bg-black hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Panggung */}
      <div className="relative mt-4 h-[clamp(440px,66vh,700px)] overflow-hidden">
        {/* Cincin skala berputar */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square h-[125%] -translate-x-1/2 -translate-y-1/2">
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full text-black/35"
            style={{
              transform: `rotate(${-index * 24}deg)`,
              transition: `transform ${SLIDE_MS}ms ${EASE}`,
            }}
          >
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              pathLength={100}
              strokeDasharray="0.12 1.48"
            />
          </svg>
        </div>

        {/* Kata raksasa di belakang sepatu */}
        <div className="pointer-events-none absolute inset-x-0 top-0 bottom-14 flex items-center justify-center">
          {slides.map((p, i) => {
            const word = wordOf(p.name);
            const active = i === index;
            return (
              <span
                key={p.id}
                aria-hidden
                className="absolute whitespace-nowrap font-display font-normal uppercase leading-none text-[#111]"
                style={{
                  fontSize: `min(${Math.min(24, 120 / word.length)}vw, 24rem)`,
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

        {/* Sepatu */}
        <div className="absolute inset-x-0 top-0 bottom-14">
          {slides.map((p, i) => {
            const d = (i - index + n) % n;
            const x = d === 0 ? 0 : d === n - 1 ? -35 : 35;
            const active = d === 0;
            const useFallback = missing[p.slug];
            return (
              <div
                key={p.id}
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `translateX(${x}%)`,
                  opacity: active ? 1 : 0,
                  transition: `transform ${SLIDE_MS}ms ${EASE}, opacity ${SLIDE_MS}ms ${EASE}`,
                  pointerEvents: active ? "auto" : "none",
                }}
              >
                <div className="absolute bottom-[7%] left-1/2 h-8 w-[38%] -translate-x-1/2 rounded-full bg-black/25 blur-2xl" />
                <img
                  src={useFallback ? p.image : `/shoes/${p.slug}.png`}
                  alt={p.name}
                  draggable={false}
                  onError={() => setMissing((m) => ({ ...m, [p.slug]: true }))}
                  className={`relative h-auto max-h-[86%] w-auto max-w-[72%] select-none object-contain ${
                    useFallback ? "mix-blend-multiply" : ""
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Penggaris */}
        <div className="absolute inset-x-0 bottom-3">
          <div className="relative mx-auto h-9 w-[min(92%,1300px)]">
            <div className="flex h-3 items-end justify-between">
              {Array.from({ length: TICKS }).map((_, i) => (
                <span
                  key={i}
                  className={`w-px bg-black/45 ${i % 5 === 0 ? "h-3" : "h-1.5"}`}
                />
              ))}
            </div>
            {[0, 5, 10, 15, 20, 25].map((v) => (
              <span
                key={v}
                className="absolute top-4 -translate-x-1/2 text-xs text-black/50"
                style={{ left: `${(v / 25) * 100}%` }}
              >
                {v}
              </span>
            ))}
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
              className="h-9 w-9 rounded-full border border-black/10"
              style={{ backgroundColor: current.color }}
            />
            {current.colorName}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/shop/${current.slug}`}
              className="rounded-full border border-black/25 px-7 py-4 text-sm font-medium transition-colors hover:bg-black hover:text-white"
            >
              Lihat detail
            </Link>
            <Link
              href={`/shop/${current.slug}`}
              className="rounded-full bg-[#111] px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-black/80"
            >
              Beli sekarang <span className="ml-2 text-white/60">{rupiah(current.price)}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}