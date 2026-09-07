"use client";
import React from "react";

const ROWS = [
  ["SAIL · Bokaro / Rourkela", "3.5M MT coking coal / yr", "₹35 Cr leak"],
  ["Haldia Dock Complex", "7.5 m riverine draft", "Tide-bound"],
  ["Paradip · Dhamra", "14.5–16.0 m deep water", "Capesize-ready"],
  ["Sandheads roads", "22 m+ lighterage zone", "Split hub"],
];

function Card({ a, b, c }: { a: string; b: string; c: string }) {
  return (
    <div className="w-[260px] sm:w-[300px] shrink-0 rounded-xl border border-[#E2E6EB] bg-[#FAF7F1] p-4 sm:p-5">
      <p className="text-[14px] sm:text-[15px] font-bold text-[#0A2342] leading-snug">{a}</p>
      <p className="mt-1.5 text-[11.5px] sm:text-[12px] text-[#3D4F68]">{b}</p>
      <p className="mt-0.5 text-[11.5px] sm:text-[12px] font-semibold text-[#B45309]">{c}</p>
    </div>
  );
}

export default function SocialProofLogos() {
  return (
    <section className="bg-white border-y border-[#E2E6EB] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-2">
        <p className="mono-label text-[#6B7D99]">Filed for — who this dossier serves</p>
      </div>
      {/* Infinite marquee — two identical halves, -50% loop, pauses on hover */}
      <div className="relative pb-6 sm:pb-8 pt-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="animate-marquee flex w-max will-change-transform">
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-stretch gap-4 pr-4">
              {ROWS.map(([a, b, c]) => (
                <Card key={`${copy}-${a}`} a={a} b={b} c={c} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
