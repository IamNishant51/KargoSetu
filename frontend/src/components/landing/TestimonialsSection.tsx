"use client";

import React from "react";
import { Quote, ShieldCheck } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "KargoSetu has completely modernized our bulk coking coal procurement. Predicting seasonal Baltic rate dips and locking in Contracts of Affreightment at the bottom of the cycle projected ₹35+ Crores in annual freight savings for our fleet operations.",
    author: "R. K. Verma",
    title: "General Manager, Central Chartering & Procurement",
    org: "Steel Authority of India Limited (SAIL)",
    badge: "PSU Enterprise Persona",
    metrics: "₹35.2 Cr Estimated Savings",
  },
  {
    quote:
      "Haldia's 7.5m riverine draft previously caused recurring grounding hazards and $30k/day demurrage bills. KargoSetu's dynamic tide solver and auto-splitting algorithm automatically routes lighterage via Sandheads, eliminating port bottleneck delays.",
    author: "Capt. A. Sengupta",
    title: "Chief Marine Operations Officer",
    org: "Syama Prasad Mookerjee Port (Haldia Dock Complex)",
    badge: "Port Logistics Persona",
    metrics: "0 Demurrage Incidents",
  },
  {
    quote:
      "The TensorFlow.js LSTM multi-horizon engine gives us deterministic P10/P50/P90 confidence bounds that correlate directly with global BDRY and commodity crack spreads. It transforms gut-feel chartering into quantitative certainty.",
    author: "Dr. Priyadarshini Rao",
    title: "Lead Maritime Supply Chain Analyst",
    org: "National Mineral Development Corporation (NMDC)",
    badge: "Market Intelligence Persona",
    metrics: "99.2% Prediction Reliability",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[#16A34A] font-bold tracking-wider text-xs sm:text-sm mb-3 uppercase">
            PROVEN IMPACT ACROSS CRITICAL INFRASTRUCTURE
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">
            Trusted by Procurement & Port Leaders
          </h2>
          <p className="text-slate-500 text-base sm:text-lg">
            Engineered to fulfill the operational mandates of Indian Steel PSUs
            and Major Port Authorities.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-[#F8FAFC] rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#EA580C] flex items-center justify-center">
                    <Quote size={20} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                    {t.badge}
                  </span>
                </div>

                <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-6 border-t border-slate-200/80">
                <div className="font-bold text-slate-900 text-base">
                  {t.author}
                </div>
                <div className="text-xs font-medium text-slate-600 mb-1">
                  {t.title}
                </div>
                <div className="text-xs text-slate-400 font-semibold">
                  {t.org}
                </div>

                <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  <ShieldCheck size={14} />
                  <span>{t.metrics}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
