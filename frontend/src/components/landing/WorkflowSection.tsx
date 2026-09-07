"use client";
import React from "react";
import Image from "next/image";

const STEPS = [
  { n: "01", t: "Drop the indent", d: "Tonnage, coal grade, laycan, destination. Thirty seconds, no manual." },
  { n: "02", t: "River does the maths", d: "Live tide + channel soundings vs squat and UKC. Pass or split — stated plainly." },
  { n: "03", t: "Market picks the week", d: "P10–P90 bands mark the cheap window. Sign the CoA there." },
  { n: "04", t: "Sail with a receipt", d: "Berth or split slip with drafts, barges and rupees saved. File it." },
];

export default function WorkflowSection() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5">
          <p className="mono-label text-[#B45309]">Passage plan — 4 fixes</p>
          <h2 className="mt-2 text-4xl sm:text-5xl font-bold text-[#0A2342]">Indent to berth, no fog.</h2>
          <ol className="mt-8 space-y-0 border-t border-[#E2E6EB]">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-4 py-5 border-b border-[#E2E6EB]">
                <span className="text-[13px] font-semibold text-[#D95D0F] pt-1 shrink-0 w-7">{s.n}</span>
                <div>
                  <h3 className="text-[19px] font-bold text-[#0A2342]">{s.t}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-[#3D4F68]">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="lg:col-span-7 lg:sticky lg:top-24">
          <figure className="card-hard rounded-2xl overflow-hidden bg-white">
            <div className="flex items-center justify-between gap-2 border-b border-[#E2E6EB] px-5 py-3">
              <span className="truncate text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#6B7D99]">
                Fig. B — split at Sandheads
              </span>
              <span className="shrink-0 rounded bg-[#0A2342] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white">
                150k MT · Split
              </span>
            </div>
            <div className="relative aspect-[16/9] w-full bg-[#FAF7F1]">
              <Image
                src="/workflow-ship-v2.png"
                alt="Supramax bulk carrier splitting discharge to barges at Sandheads anchorage"
                fill
                sizes="(max-width: 1024px) 100vw, 640px"
                className="object-contain p-4 sm:p-5"
              />
            </div>
            <figcaption className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white border-t border-[#E2E6EB] px-5 py-3.5">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#6B7D99]">Lighterage plan</span>
              <span className="text-[12px] font-semibold text-[#0E7A3D]">3× Supramax · UKC safe · ₹2.1 Cr saved</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
