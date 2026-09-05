"use client";

import React from "react";
import Link from "next/link";
import { User, Play, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="py-20 sm:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-y border-slate-200/80 text-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold uppercase tracking-wider text-[#EA580C] mb-8 shadow-sm">
          <Zap size={14} />
          <span>Smart India Hackathon 2026 &middot; Problem SIH26006</span>
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tighter mb-6 max-w-4xl mx-auto leading-[1.1] font-sans">
          Ready to Modernize India&apos;s{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-[#EA580C]">
            Maritime
          </span>{" "}
          Bulk Supply Chain?
        </h2>

        <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Join leading maritime logistics teams and eliminate costly demurrage
          penalties with real-time constraint solving and deep learning freight
          forecasts.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-xl mx-auto">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto bg-[#EA580C] hover:bg-[#C2410C] text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-500/25  group text-sm whitespace-nowrap"
          >
            <User size={16} />
            <span>Launch Command Center</span>
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          <button
            type="button"
            aria-label="Contact Sales"
            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md text-sm  group whitespace-nowrap"
          >
            <Play
              size={16}
              className="text-slate-500 group-hover:text-emerald-600 transition-colors"
            />
            <span>Watch Live Demo</span>
          </button>
        </div>

        {/* Feature Checkpoints */}
        <div className="mt-14 pt-10 border-t border-slate-200/80 flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            <span>Zero-Grounding Safety</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            <span>Dynamic Tide Ingestion</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            <span>MeitY Enterprise Cloud</span>
          </div>
        </div>
      </div>
    </section>
  );
}
