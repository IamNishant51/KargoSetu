"use client";
import React, { useState } from "react";
import { Plus } from "lucide-react";

const FAQS = [
  { q: "Haldia is 7.5 m. My Capesize needs 18 m. What exactly happens?", a: "The solver refuses direct berthing, splits the parcel into Supramax lots (~50k MT each), routes them via Sandheads lighterage, and shows arrival draft vs tide vs UKC so the refusal is auditable." },
  { q: "Where does the tide number come from?", a: "Open-Meteo marine feed, pulled at evaluation time. No static tide table — the +3.2 m window in the demo is live data, and the UKC margin recomputes with it." },
  { q: "What is P10 / P50 / P90 in plain words?", a: "Cheap case, middle case, expensive case for the daily hire over the next 90 days. Fix the CoA near P10, budget at P50, keep P90 as the risk line for finance." },
  { q: "Does this plug into SAP?", a: "Yes — requisition in, fixture slip out, over REST with schema validation. The jury build uses the same /requisitions/evaluate contract the dashboard calls." },
  { q: "What do we show the SIH jury in 5 minutes?", a: "Set 150,000 MT → Haldia, watch it split. Flip to Dhamra, watch it go direct. Drag the shock slider to 2.0× and watch P90 scream. Three moves, thesis proven." },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-[#FAF7F1] border-y border-[#E2E6EB] py-14 sm:py-20 scroll-mt-20 sm:scroll-mt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="mono-label text-[#B45309]">Signal book — straight answers</p>
        <h2 className="mt-2 font-display font-black text-4xl sm:text-5xl text-[#0A2342]">Asked on every demo.</h2>
        <div className="mt-8 divide-y divide-[#E2E6EB] border-y border-[#E2E6EB] bg-white rounded-2xl overflow-hidden">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-4 text-left px-5 sm:px-6 py-4 sm:py-5 hover:bg-[#FAF7F1] transition-colors"
                >
                  <span className="font-mono text-[12px] text-[#6B7D99] shrink-0 w-7">Q{i + 1}</span>
                  <span className="flex-1 font-bold text-[15px] sm:text-base text-[#0A2342]">{f.q}</span>
                  <span className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-transform ${isOpen ? "bg-[#0A2342] text-white border-[#0A2342] rotate-45" : "border-[#E2E6EB] text-[#0A2342]"}`}>
                    <Plus size={16} />
                  </span>
                </button>
                {isOpen && <p className="px-5 sm:px-6 pb-5 pl-[52px] sm:pl-[60px] text-[14px] sm:text-[15px] leading-relaxed text-[#3D4F68]">{f.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
