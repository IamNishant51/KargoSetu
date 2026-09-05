"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "How does KargoSetu prevent vessel groundings at draft-constrained ports like Haldia?",
    a: "KargoSetu implements a dual-ended hydrodynamic physics engine (Squat, Forward Water Allowance, Under Keel Clearance). It pulls live tidal curves directly from Open-Meteo API. If a laden Capesize vessel arrival draft exceeds the safe permissible depth (7.5m at Haldia), the system immediately halts direct berthing and computes an optimal cargo split into 3x Supramax vessels with Sandheads offshore transshipment.",
  },
  {
    q: "What machine learning architecture powers the 90-day freight price forecasting?",
    a: "We utilize an auto-regressive Long Short-Term Memory (LSTM) recurrent neural network built in TensorFlow.js. The model ingests multi-year historical Baltic Dry Index (BDI), BDRY ETF volatility, and bunker fuel indices. It outputs 30, 60, and 90-day probabilistic quantile bounds (P10 optimistic, P50 median, P90 pessimistic), enabling executives to time market entries during 12%+ rate dip windows.",
  },
  {
    q: "How does KargoSetu save money for Public Sector Undertakings like SAIL?",
    a: "By shifting procurement from purely reactive single spot market contracts to strategically timed Contracts of Affreightment (CoA) and mitigating vessel idle loss ($25,000/day for Capesize) via triangular repositioning. Our live financial simulations demonstrate estimated savings of ₹35.28 Crores annually for typical 3.5M MT coking coal import operations.",
  },
  {
    q: "Can KargoSetu integrate with existing enterprise ERPs (SAP / Oracle)?",
    a: "Yes. KargoSetu exposes standard, enterprise-grade REST APIs secured with Zod schema validation, Helmet.js headers, and strict CORS boundaries. Requisitions can be pushed via automated webhooks, and evaluated fixture recommendations can be ingested directly back into SAP Material Management (MM) modules.",
  },
  {
    q: "How does KargoSetu manage idle fleet repositioning and ESG decarbonization?",
    a: "Rather than allowing chartered vessels to return in ballast (empty voyages), KargoSetu calculates triangular backhaul routes across East Coast and Indian Ocean corridors. This cuts empty sailing days by up to 40% and automatically generates IMO EEXI-compliant carbon reduction metrics.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 sm:py-24 bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle size={13} />
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">
            Everything You Need to Know
          </h2>
          <p className="text-slate-500 text-base sm:text-lg">
            Answers to common questions about KargoSetu&apos;s algorithms,
            datasets, and SIH 26006 problem specifications.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  aria-controls={`faq-answer-${idx}`}
                  id={`faq-question-${idx}`}
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-slate-900 text-base sm:text-lg">
                    {faq.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-600 transition-transform duration-200 ${isOpen ? "rotate-180 bg-slate-200 text-slate-900" : ""}`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${idx}`}
                    role="region"
                    aria-labelledby={`faq-question-${idx}`}
                    className="px-6 pb-6 pt-1 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 animate-in fade-in duration-150"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
