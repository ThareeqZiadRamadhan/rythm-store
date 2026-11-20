"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Unit = "cm" | "in";
type FootShape = "regular" | "wide";

// Tabel ukuran RYTHM/: panjang kaki (cm) per ukuran EU.
// EU 38 = 24 cm dan EU 42 = 26,5 cm, sama dengan acuan slider beranda.
const SIZE_TABLE = [
  { eu: 38, footCm: 24.0, usMen: 5.5, usWomen: 7, uk: 5 },
  { eu: 39, footCm: 24.6, usMen: 6.5, usWomen: 8, uk: 6 },
  { eu: 40, footCm: 25.3, usMen: 7, usWomen: 8.5, uk: 6.5 },
  { eu: 41, footCm: 25.9, usMen: 8, usWomen: 9.5, uk: 7 },
  { eu: 42, footCm: 26.5, usMen: 8.5, usWomen: 10, uk: 8 },
  { eu: 43, footCm: 27.2, usMen: 9.5, usWomen: 11, uk: 9 },
  { eu: 44, footCm: 27.8, usMen: 10, usWomen: 11.5, uk: 9.5 },
  { eu: 45, footCm: 28.5, usMen: 11, usWomen: 12.5, uk: 10.5 },
];

const MIN_CM = 22;
const MAX_CM = 30;

// Koordinat papan ukur (satuan SVG)
const X0 = 24; // posisi angka 0 di penggaris
const PX_PER_CM = 10;
const CY = 74; // garis tengah telapak
const BASE_Y = 138; // garis dasar penggaris

// Bentuk telapak kaki untuk panjang 100 satuan (tumit di x=0, jari di x=100)
const SOLE_PATH =
  "M0 2 C0 -10 6 -14 14 -14 C22 -14 32 -12 42 -12 C54 -12 62 -19 78 -19 C92 -19 100 -12 100 -2 C100 8 94 15 80 15 C66 15 58 10 46 10 C34 10 26 14 16 14 C6 14 0 10 0 2 Z";

const SOLE_ARCS = [
  { x: 12, top: -9, bottom: 9 },
  { x: 24, top: -9, bottom: 9 },
  { x: 58, top: -12, bottom: 9 },
  { x: 70, top: -15, bottom: 12 },
  { x: 84, top: -15, bottom: 12 },
];

const WIDTH_LETTERS = ["A", "B", "C", "D", "E"];

function fmt(n: number) {
  return Number.isInteger(n) ? String(n) : String(n);
}

function toDisplay(cm: number, unit: Unit) {
  return unit === "cm" ? cm.toFixed(1) : (cm / 2.54).toFixed(1);
}

function pickSize(cm: number, shape: FootShape) {
  const last = SIZE_TABLE.length - 1;
  // Bulatkan ke atas: ambil ukuran pertama yang muat panjang kaki
  let i = SIZE_TABLE.findIndex((s) => s.footCm >= cm - 0.05);
  if (i === -1) i = last;
  const bumped = shape === "wide" && i < last;
  if (bumped) i += 1;
  return {
    size: SIZE_TABLE[i],
    bumped,
    tooSmall: cm < SIZE_TABLE[0].footCm - 1,
    tooBig: cm > SIZE_TABLE[last].footCm,
  };
}

function Toggle<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full bg-[#f1f1ee] p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`rounded-full px-5 py-2 text-[15px] transition ${
              active
                ? "bg-white text-[#111] shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
                : "text-[#8a8a85] hover:text-[#111]"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function FootBoard({ cm, unit, shape }: { cm: number; unit: Unit; shape: FootShape }) {
  const sx = (cm * PX_PER_CM) / 100;
  const sy = sx * (shape === "wide" ? 1.1 : 1);
  const markX = X0 + cm * PX_PER_CM;
  const pillW = 42;
  const pillX = Math.min(Math.max(markX - pillW / 2, 6), 342 - pillW);
  const letterX = X0 + 0.76 * cm * PX_PER_CM;
  const label = `${toDisplay(cm, unit)} ${unit}`;

  return (
    <svg
      viewBox="0 0 348 162"
      className="h-auto w-full select-none"
      role="img"
      aria-label={`Foot outline, ${label} long`}
      fontFamily="inherit"
    >
      {/* Papan ukur */}
      <rect x={4} y={4} width={340} height={154} rx={16} fill="#dcdcd8" stroke="#cdcdc8" strokeWidth={0.8} />
      {/* Penahan tumit */}
      <rect x={X0 - 13} y={30} width={13} height={92} rx={3} fill="#cdcdc8" />

      {/* Telapak kaki */}
      <g transform={`translate(${X0} ${CY}) scale(${sx} ${sy})`}>
        <path d={SOLE_PATH} fill="#2f2f2d" />
        {SOLE_ARCS.map((a) => (
          <path
            key={a.x}
            d={`M ${a.x + 1.5} ${a.top} Q ${a.x - 2.5} ${(a.top + a.bottom) / 2} ${a.x + 1.5} ${a.bottom}`}
            fill="none"
            stroke="#ffffff"
            strokeOpacity={0.85}
            strokeWidth={1.1}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>

      {/* Huruf lebar kaki A–E */}
      {WIDTH_LETTERS.map((l, i) => (
        <text
          key={l}
          x={letterX}
          y={CY + (-13 + i * 6) * sy + 2.2}
          fontSize={6.2}
          textAnchor="middle"
          fill="#5a5a57"
        >
          {l}
        </text>
      ))}

      {/* Penggaris */}
      {Array.from({ length: 31 }, (_, c) => {
        const x = X0 + c * PX_PER_CM;
        const major = c % 5 === 0;
        return (
          <g key={c}>
            <line x1={x} x2={x} y1={BASE_Y - (major ? 9 : 4.5)} y2={BASE_Y} stroke="#6f6f6b" strokeWidth={0.6} />
            {major && (
              <text x={x} y={151} fontSize={7} textAnchor="middle" fill="#6f6f6b">
                {c}
              </text>
            )}
          </g>
        );
      })}

      {/* Garis ukur merah */}
      <line x1={markX} x2={markX} y1={23} y2={BASE_Y} stroke="#e5483b" strokeWidth={0.9} />
      <rect x={pillX} y={10} width={pillW} height={13} rx={3.5} fill="#e5483b" />
      <text x={pillX + pillW / 2} y={19.2} fontSize={7.5} fontWeight={600} textAnchor="middle" fill="#fff">
        {label}
      </text>
    </svg>
  );
}

export default function SizeFinder(_props: { [key: string]: unknown } = {}) {
  const [cm, setCm] = useState(27.2);
  const [unit, setUnit] = useState<Unit>("cm");
  const [shape, setShape] = useState<FootShape>("regular");

  const { size, bumped, tooSmall, tooBig } = useMemo(() => pickSize(cm, shape), [cm, shape]);
  const percent = ((cm - MIN_CM) / (MAX_CM - MIN_CM)) * 100;

  let advice = `Take EU ${size.eu} in every RYTHM/ shoe. We round up so your toes always have room.`;
  if (bumped) advice = `Wide feet? We sized you up to EU ${size.eu} so the toe box does not pinch.`;
  if (tooSmall) advice = `Our smallest size is EU 38. For a foot this length, EU 38 may still feel a little loose.`;
  if (tooBig) advice = `Your foot is a little longer than our largest size. Try EU 45 in a model with a stretchy upper.`;

  return (
    <section className="rounded-[32px] bg-white p-3 ring-1 ring-black/5 sm:p-4">
      <style>{`
        .fit-range { -webkit-appearance: none; appearance: none; height: 2px; border-radius: 999px; outline: none; cursor: pointer; }
        .fit-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 30px; height: 30px; border-radius: 999px; background: #fff; border: 2px solid #111; box-shadow: 0 1px 3px rgba(0,0,0,.15); }
        .fit-range::-moz-range-thumb { width: 26px; height: 26px; border-radius: 999px; background: #fff; border: 2px solid #111; }
        .fit-range:focus-visible::-webkit-slider-thumb { outline: 3px solid rgba(17,17,17,.25); outline-offset: 2px; }
      `}</style>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* Kiri: kontrol */}
        <div className="flex flex-col p-5 sm:p-10">
          <p className="text-[17px] text-[#111]">Foot length</p>

          <div className="mt-3 flex items-end justify-between gap-4">
            <p className="flex items-baseline gap-2 text-[#111]">
              <span className="text-[clamp(64px,8vw,104px)] font-medium leading-none tracking-[-0.04em] tabular-nums">
                {toDisplay(cm, unit)}
              </span>
              <span className="text-xl text-[#8a8a85]">{unit}</span>
            </p>
            <Toggle
              label="Unit"
              value={unit}
              onChange={setUnit}
              options={[
                { value: "cm", label: "cm" },
                { value: "in", label: "in" },
              ]}
            />
          </div>

          <input
            type="range"
            min={MIN_CM}
            max={MAX_CM}
            step={0.1}
            value={cm}
            onChange={(e) => setCm(Number(e.target.value))}
            aria-label="Foot length"
            aria-valuetext={`${toDisplay(cm, unit)} ${unit}`}
            className="fit-range mt-10 w-full"
            style={{
              background: `linear-gradient(to right, #111 0%, #111 ${percent}%, #e2e2de ${percent}%, #e2e2de 100%)`,
            }}
          />

          <div className="mt-10 flex items-center justify-between gap-4">
            <p className="text-[17px] text-[#111]">Feet that are</p>
            <Toggle
              label="Foot width"
              value={shape}
              onChange={setShape}
              options={[
                { value: "regular", label: "Regular" },
                { value: "wide", label: "Wide" },
              ]}
            />
          </div>

          <dl className="mt-8 grid grid-cols-4 gap-4 border-y border-black/10 py-6">
            {[
              { k: "US men", v: fmt(size.usMen) },
              { k: "US women", v: fmt(size.usWomen) },
              { k: "EU", v: fmt(size.eu) },
              { k: "UK", v: fmt(size.uk) },
            ].map((item) => (
              <div key={item.k}>
                <dt className="text-sm text-[#6f6f6b]">{item.k}</dt>
                <dd className="mt-1 text-3xl font-medium tracking-tight text-[#111] tabular-nums">{item.v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 max-w-md text-[16px] leading-relaxed text-[#6f6f6b]">{advice}</p>

          <Link
            href={`/shop?size=${size.eu}`}
            className="mt-8 inline-flex w-fit items-center rounded-full bg-[#111] px-8 py-4 text-[16px] font-medium text-white transition hover:bg-black/80"
          >
            Shop shoes in EU {size.eu}
          </Link>
        </div>

        {/* Kanan: papan ukur */}
        <div className="flex min-h-[320px] items-center justify-center rounded-[24px] bg-[#ebebe8] p-4 sm:p-10">
          <FootBoard cm={cm} unit={unit} shape={shape} />
        </div>
      </div>
    </section>
  );
}

export { SizeFinder };