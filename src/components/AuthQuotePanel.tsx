"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const quotes = [
  {
    text: "No human is limited.",
    author: "Eliud Kipchoge",
    role: "Olympic Marathon Champion",
  },
  {
    text: "I failed over and over again in my life. And that is why I succeed.",
    author: "Michael Jordan",
    role: "Legendary basketball player",
  },
  {
    text: "Giving less than your best means wasting your gift.",
    author: "Steve Prefontaine",
    role: "Legendary long-distance runner",
  },
  {
    text: "I don’t think limits.",
    author: "Usain Bolt",
    role: "100m world record holder",
  },
];

const INTERVAL = 6000;

export default function AuthQuotePanel() {
  const [index, setIndex] = useState(0);

  // Reset timer setiap kali index berubah (termasuk saat dot diklik).
  useEffect(() => {
    const t = setTimeout(
      () => setIndex((i) => (i + 1) % quotes.length),
      INTERVAL
    );
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden rounded-[2rem] bg-[#11120f] p-10 text-white lg:flex xl:p-12">
      {/* Cahaya latar */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-[#c7ea4c]/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-24 size-96 rounded-full bg-[#8daa13]/20 blur-3xl"
      />

      {/* Logo */}
      <div className="relative">
        <Link
          href="/"
          className="text-6xl font-black tracking-[-0.08em] xl:text-7xl"
        >
          RYTHM<span className="text-[#c7ea4c]">/</span>
        </Link>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
          Independent sneaker label
        </p>
      </div>

      {/* Kutipan */}
      <div className="relative">
        <span
          aria-hidden
          className="block font-serif text-8xl leading-none text-[#c7ea4c]"
        >
          &ldquo;
        </span>

        <div className="mt-2 grid">
          {quotes.map((q, i) => (
            <figure
              key={q.author}
              aria-hidden={i !== index}
              className={`col-start-1 row-start-1 transition-all duration-700 ease-out ${
                i === index
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-3 opacity-0"
              }`}
            >
              <blockquote className="text-3xl font-semibold leading-snug tracking-tight xl:text-4xl">
                {q.text}
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                <span className="h-px w-10 bg-[#c7ea4c]" />
                <span>
                  <span className="block font-bold">{q.author}</span>
                  <span className="block text-sm text-white/50">{q.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* Indikator + penggaris */}
      <div className="relative">
        <div className="flex items-center gap-2">
          {quotes.map((q, i) => (
            <button
              key={q.author}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Quote ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? "w-8 bg-[#c7ea4c]" : "w-1.5 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        <div aria-hidden className="mt-6 flex items-end justify-between">
          {Array.from({ length: 41 }).map((_, i) => (
            <span
              key={i}
              className={`w-px bg-white/25 ${
                i % 10 === 0 ? "h-4" : i % 5 === 0 ? "h-3" : "h-1.5"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}