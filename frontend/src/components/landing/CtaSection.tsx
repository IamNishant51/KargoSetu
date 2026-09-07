"use client";
import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-[#0A2342] text-white px-6 py-10 sm:p-12 lg:p-14">
          <div aria-hidden className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.25) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
          <div className="relative grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#F5B98A]">Final entry — SIH26006 · 5-minute demo</p>
              <h2 className="mt-3 font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.0]">Bring one indent.<br />Leave with a verdict.</h2>
              <p className="mt-4 max-w-xl text-[15px] sm:text-base leading-relaxed text-white/75">150,000 MT to Haldia is pre-loaded in the simulator. Press split, read the slip, show the jury the money.</p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E76F1A] px-6 py-4 text-[15px] font-bold text-white hover:bg-[#c85f13] transition-colors">
                Open command board <ArrowUpRight size={17} />
              </Link>
              <Link href="#sandbox" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 px-6 py-4 text-[15px] font-bold text-white hover:bg-white/10 transition-colors">
                Replay the split
              </Link>
            </div>
          </div>
          <div className="relative mt-8 pt-6 border-t border-white/15 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/60">
            <span>Zero-grounding rule</span><span>Live tide</span><span>₹-ledger attached</span>
          </div>
        </div>
      </div>
    </section>
  );
}
