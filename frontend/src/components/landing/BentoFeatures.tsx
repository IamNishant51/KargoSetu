"use client";
import React from "react";
import { CheckCircle2 } from "lucide-react";

const FEATURES = [
  {
    n: "A",
    tag: "Physics · <150 ms",
    title: "It knows the riverbed.",
    body: "Draft, squat and UKC against live Haldia bathymetry plus Open-Meteo tide. If the math says touch, it says split — no optimism.",
    metrics: ["Dual-ended solver", "Tide-compensated", "DG-Shipping UKC rule"],
  },
  {
    n: "B",
    tag: "Forecast · 90 days",
    title: "It knows the market dip.",
    body: "LSTM on Baltic-linked history with P10 / P50 / P90 bands, so the CoA gets signed in the cheap week.",
    metrics: ["P10–P90 bands", "Shock slider", "CoA window flag"],
  },
  {
    n: "C",
    tag: "Split · Sandheads",
    title: "It knows the workaround.",
    body: "When direct berthing is impossible it writes the lighterage plan itself — 3× Supramax, tonnage split, barges, savings.",
    metrics: ["Auto cargo split", "Offshore lighterage", "Demurrage math"],
  },
  {
    n: "D",
    tag: "Fleet · Backhaul",
    title: "It hates empty ships.",
    body: "Triangular repositioning kills $25k/day ballast legs and logs the CO₂ saved for the ESG annex.",
    metrics: ["Backhaul pairing", "VLSFO estimate", "IMO-ready log"],
  },
];

export default function BentoFeatures() {
  return (
    <section id="features" className="bg-white py-14 sm:py-20 scroll-mt-20 sm:scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <p className="mono-label text-[#B45309]">Engine room — four habits</p>
            <h2 className="mt-2 font-display font-black text-4xl sm:text-5xl text-[#0A2342]">Built like a chief engineer thinks.</h2>
          </div>
          <p className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-[#6B7D99]">SIH26006 · Ministry of Steel</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {FEATURES.map((f) => (
            <article key={f.n} className="card-hard rounded-2xl bg-[#FAF7F1] p-6 sm:p-8 hover:bg-white transition-colors">
              <div className="flex items-center justify-between gap-3 mb-5">
                <span className="w-9 h-9 rounded-lg bg-[#0A2342] text-white font-display font-black flex items-center justify-center text-lg">{f.n}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6B7D99] border border-[#E2E6EB] bg-white rounded px-2 py-1">{f.tag}</span>
              </div>
              <h3 className="font-display font-bold text-[26px] sm:text-[28px] text-[#0A2342] leading-tight">{f.title}</h3>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#3D4F68]">{f.body}</p>
              <ul className="mt-5 pt-4 border-t border-[#E2E6EB] space-y-2">
                {f.metrics.map((m) => (
                  <li key={m} className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[#3D4F68]">
                    <CheckCircle2 size={14} className="text-[#0E7A3D] shrink-0" /> {m}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
