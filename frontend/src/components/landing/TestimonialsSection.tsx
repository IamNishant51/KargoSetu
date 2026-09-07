"use client";
import React from "react";

const NOTES = [
  { q: "We stopped fixing spot peaks. The P50 dip flag moved two CoAs a fortnight early — the annexure wrote itself.", who: "Chartering desk", org: "Steel PSU · 3.5M MT/yr", figure: "₹35 Cr projected" },
  { q: "Haldia used to mean crossed fingers. Now the slip says split before the owner calls — Sandheads plan attached.", who: "Harbour master", org: "Haldia Dock Complex", figure: "0 groundings" },
  { q: "P10–P90 is the first forecast our finance team didn't laugh at. Bands, dates, rupees. That's it.", who: "Supply analyst", org: "Mineral PSU", figure: "12% dip caught" },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-white py-14 sm:py-20 border-t border-[#E2E6EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="mono-label text-[#B45309]">Margin notes — from the desk</p>
        <h2 className="mt-2 font-display font-black text-4xl sm:text-5xl text-[#0A2342] max-w-2xl">Pinned to the notice board, not generated.</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {NOTES.map((t) => (
            <blockquote key={t.figure} className="rounded-2xl border border-[#E2E6EB] bg-[#FAF7F1] p-6 sm:p-7 flex flex-col justify-between">
              <p className="font-display text-[19px] leading-snug text-[#0A2342]">“{t.q}”</p>
              <footer className="mt-6 pt-4 border-t border-[#E2E6EB]">
                <p className="text-[14px] font-bold text-[#0A2342]">{t.who} <span className="font-normal text-[#6B7D99]">· {t.org}</span></p>
                <p className="mt-2 inline-block font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0E7A3D] bg-[#E9F5EE] border border-[#BFE3CD] rounded px-2 py-1">{t.figure}</p>
              </footer>
            </blockquote>
          ))}
        </div>
        <p className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#6B7D99]">Illustrative personas for SIH jury · wire to real users post-pilot</p>
      </div>
    </section>
  );
}
