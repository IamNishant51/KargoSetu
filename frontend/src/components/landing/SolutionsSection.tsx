"use client";
import React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const ITEMS = [
  {
    n: "01",
    title: "Will my ship touch bottom?",
    body: "Draft, squat, tide and UKC checked against the actual channel — Haldia's 7.5 m, not a brochure number. Answer in under 150 ms.",
    meta: "Squat · FWA · UKC",
    href: "#sandbox",
  },
  {
    n: "02",
    title: "When do I fix the freight?",
    body: "90-day P10 / P50 / P90 outlook on Baltic-linked rates. Books the CoA in the dip week, not the spike week.",
    meta: "LSTM · P10–P90",
    href: "#sandbox",
  },
  {
    n: "03",
    title: "What if she can't berth?",
    body: "Auto-split into Supramax shuttles via Sandheads with barge math attached — tonnage, drafts and demurrage saved on one slip.",
    meta: "Split · Lighterage",
    href: "#ports",
  },
];

export default function SolutionsSection() {
  return (
    <section id="solutions" className="bg-white py-14 sm:py-20 scroll-mt-20 sm:scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:items-center">
          <div className="lg:col-span-4">
            <p className="mono-label text-[#B45309]">The ledger — what it settles</p>
            <h2 className="mt-3 font-display font-black text-4xl sm:text-5xl text-[#0A2342] leading-[1.02]">
              Three questions the desk asks daily.
            </h2>
            <p className="mt-4 text-[15px] sm:text-base leading-relaxed text-[#3D4F68] max-w-sm">
              Not “platform capabilities”. Real calls a chartering manager makes before lunch —
              each with a number attached.
            </p>
            <a href="#sandbox" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0A2342] px-5 py-3 text-sm font-bold text-white hover:bg-[#14315C] transition-colors">
              Run one yourself <ArrowUpRight size={15} />
            </a>
          </div>
          <div className="lg:col-span-8">
            <ol className="divide-y divide-[#E2E6EB] border-y border-[#E2E6EB]">
              {ITEMS.map((it) => (
                <li key={it.n}>
                  <a href={it.href} className="group grid sm:grid-cols-12 gap-2 sm:gap-4 py-6 sm:py-7 items-start hover:bg-[#FAF7F1] transition-colors px-1 sm:px-3 -mx-1 sm:-mx-3 rounded-lg">
                    <span className="sm:col-span-1 font-mono font-semibold text-[13px] text-[#6B7D99] pt-1">{it.n}</span>
                    <span className="sm:col-span-7">
                      <span className="block font-display font-bold text-[22px] sm:text-2xl text-[#0A2342] group-hover:text-[#B45309] transition-colors leading-tight">{it.title}</span>
                      <span className="mt-2 block text-[14px] sm:text-[15px] leading-relaxed text-[#3D4F68] max-w-xl">{it.body}</span>
                    </span>
                    <span className="sm:col-span-4 flex sm:justify-end items-center gap-3 pt-1">
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#6B7D99] border border-[#E2E6EB] rounded px-2 py-1 bg-white">{it.meta}</span>
                      <ArrowUpRight size={18} className="text-[#D95D0F] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Fig. D — evidence row: diagram at reading size + its reading key */}
        <figure className="mt-10 sm:mt-12 card-hard rounded-2xl overflow-hidden bg-white">
          <div className="flex items-center justify-between gap-2 border-b border-[#E2E6EB] px-5 py-3">
            <span className="truncate text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#6B7D99]">
              Fig. D — draft stack · Haldia channel
            </span>
            <span className="shrink-0 rounded bg-[#0E7A3D] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white">
              UKC 1.8 m · Safe
            </span>
          </div>
          <div className="grid lg:grid-cols-12">
            <div className="relative aspect-[1254/808] w-full bg-[#FAF7F1] lg:col-span-7 lg:border-r lg:border-[#E2E6EB]">
              <Image
                src="/ukc-explainer-v2.png"
                alt="Cross-section of hull over Haldia channel showing draft squat tide and safe UKC"
                fill
                sizes="(max-width: 1024px) 100vw, 640px"
                className="object-contain p-4 sm:p-6"
              />
            </div>
            <div className="lg:col-span-5 bg-white px-5 py-5 sm:px-6 sm:py-6 flex flex-col justify-center">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#6B7D99]">How to read it — top to bottom</p>
              <ul className="mt-4 space-y-0 border-t border-[#E2E6EB]">
                {[
                  ["#0A2342", "Draft 12.5 m", "Static keel depth below the waterline"],
                  ["#D95D0F", "Squat +0.8 m", "Extra sinkage the river steals at speed"],
                  ["#1B7FBF", "Tide +3.2 m", "Live Hooghly lift at high water"],
                  ["#0E7A3D", "UKC 1.8 m · Safe", "Clears the DG-Shipping 1.0 m rule"],
                ].map(([dot, t, d]) => (
                  <li key={t} className="flex items-start gap-3 border-b border-[#E2E6EB] py-3">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: dot }} />
                    <span>
                      <span className="block text-[13.5px] font-bold text-[#0A2342]">{t}</span>
                      <span className="mt-0.5 block text-[12.5px] leading-relaxed text-[#3D4F68]">{d}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="stamp mt-5 inline-flex items-center gap-2 self-start rounded-lg bg-[#FAF7F1] px-3.5 py-2.5 text-[12.5px] font-bold text-[#0A2342]">
                Verdict — berth on the tide, tide carries her home
              </p>
            </div>
          </div>
          <figcaption className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#E2E6EB] bg-white px-5 py-3.5">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#6B7D99]">The physics behind question 01 — in one glance</span>
            <span className="text-[12px] font-semibold text-[#0E7A3D]">Answered in under 150 ms, every indent</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
