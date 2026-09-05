"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, ArrowRight, Compass } from "lucide-react";

const DEMO_STEPS = [
  {
    id: 1,
    title: "1. Port Constraint & Bathymetric Evaluation",
    tag: "Physics Engine",
    subtitle:
      "Analyzing vessel Under Keel Clearance (UKC) & dynamic tidal draft at Haldia Dock Complex",
    description:
      "When a 150,000 MT Capesize requisition is entered, KargoSetu's hydrodynamic solver fetches live bathymetry (7.5m permissible draft) and Open-Meteo tide telemetry (+3.2m). Detecting immediate physical grounding risk, it halts direct berthing and calculates feasible offshore operations.",
    telemetry: [
      { label: "Target Port", val: "Haldia Dock Complex (HDC)" },
      { label: "Vessel Arrival Draft", val: "18.2m (Capesize Laden)" },
      { label: "Permissible Draft", val: "7.5m (Exceeded by 10.7m)" },
      { label: "Dynamic Tide Allowance", val: "+3.2m (High Tide Window)" },
      {
        label: "Physics Verdict",
        val: "INFEASIBLE FOR DIRECT BERTHING",
        highlight: true,
      },
    ],
  },
  {
    id: 2,
    title: "2. Intelligent Cargo Splitting & Lighterage",
    tag: "Algorithmic Solver",
    subtitle:
      "Automating 3x Supramax split and Sandheads offshore transshipment protocol",
    description:
      "Instead of losing the cargo fixture or incurring $35,000/day in demurrage penalties, the constraint engine splits the 150,000 MT cargo into 3x 50,000 MT Supramax vessels. Each lighter vessel maintains a safe 6.8m arrival draft with 1.4m clearance margin.",
    telemetry: [
      { label: "Original Requisition", val: "150,000 MT Coking Coal" },
      { label: "Optimal Fleet Mix", val: "3x Supramax (50,000 MT each)" },
      { label: "Lighterage Anchorage", val: "Sandheads Deep Anchorage" },
      { label: "Clearance Margin", val: "1.4m (100% Safe Berthing)" },
      {
        label: "Demurrage Avoided",
        val: "$175,000 (5 Days Standstill)",
        highlight: true,
      },
    ],
  },
  {
    id: 3,
    title: "3. ML Multi-Horizon Freight Forecasting",
    tag: "TensorFlow.js LSTM",
    subtitle:
      "Predicting 90-day forward freight curves and detecting optimal CoA booking windows",
    description:
      "KargoSetu ingests Baltic Dry Index (BDI) and BDRY historical volatility. The neural network generates P10 (Optimistic), P50 (Median), and P90 (Pessimistic) confidence intervals, alerting procurement officers to a 12.8% rate dip in Week 3.",
    telemetry: [
      {
        label: "Model Architecture",
        val: "TensorFlow.js Auto-Regressive LSTM",
      },
      { label: "Current Spot Rate", val: "$18,650 / Day" },
      { label: "Predicted 30-Day Dip", val: "$16,280 / Day (-12.8%)" },
      { label: "Recommendation", val: "Lock in 6-Month CoA Contract" },
      {
        label: "Projected PSU Savings",
        val: "₹4.82 Crores (SAIL Allocation)",
        highlight: true,
      },
    ],
  },
  {
    id: 4,
    title: "4. Triangular Ballast Repositioning & ESG",
    tag: "Voyage Optimization",
    subtitle:
      "Minimizing empty sailing legs and calculating IMO-compliant VLSFO emissions",
    description:
      "To eradicate idle losses ($25,000/day), KargoSetu models a triangular backhaul route (Haldia -> Paradip -> Maputo) rather than returning in ballast. It computes fuel savings and IMO carbon compliance certificates in real-time.",
    telemetry: [
      {
        label: "Repositioning Strategy",
        val: "Triangular East Coast Backhaul",
      },
      { label: "Ballast Days Saved", val: "8.5 Days / Voyage" },
      { label: "VLSFO Fuel Conserved", val: "142 Metric Tonnes" },
      { label: "CO2 Footprint Reduced", val: "447 MT (IMO EEXI Compliant)" },
      {
        label: "Fleet Utilization",
        val: "94.2% (+18% vs Spot Average)",
        highlight: true,
      },
    ],
  },
];

export default function DemoModal() {
  const isOpen = false;
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = DEMO_STEPS[activeStepIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-900/40 backdrop-blur-sm transition-all">
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Compass size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                KargoSetu Interactive Walkthrough
              </h3>
              <p className="text-xs text-slate-500">
                Autonomous Freight Intelligence & Constraint Engine Demo
              </p>
            </div>
          </div>

          <button
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Step Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {DEMO_STEPS.map((step, idx) => (
              <button
                key={step.id}
                type="button"
                aria-label={`Go to step ${idx + 1}: ${step.title}`}
                aria-current={activeStepIndex === idx ? "step" : undefined}
                onClick={() => setActiveStepIndex(idx)}
                className={`text-xs font-semibold py-2 px-3 rounded-lg text-left transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeStepIndex === idx
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    activeStepIndex === idx
                      ? "bg-[#EA580C] text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {step.id}
                </span>
                <span className="truncate">{step.tag}</span>
              </button>
            ))}
          </div>

          {/* Active Demo Visual Stage - Clean Light Theme */}
          <div className="bg-slate-50 rounded-2xl p-6 text-slate-900 border border-slate-200 shadow-2xs relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200">
                  {currentStep.tag}
                </span>
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Live Simulation Engine
                </div>
              </div>

              <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
                {currentStep.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 mb-4">
                {currentStep.subtitle}
              </p>

              <div className="bg-white rounded-xl p-4 border border-slate-200 mb-4 shadow-2xs">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {currentStep.description}
                </p>
              </div>

              {/* Telemetry Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {currentStep.telemetry.map((item, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border text-xs ${
                      item.highlight
                        ? "bg-emerald-50 border-emerald-300 text-emerald-900 col-span-1 sm:col-span-2 lg:col-span-3 font-semibold"
                        : "bg-white border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
                      {item.label}
                    </div>
                    <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                      {item.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              aria-label="Previous step"
              onClick={() =>
                setActiveStepIndex((prev) =>
                  prev > 0 ? prev - 1 : DEMO_STEPS.length - 1,
                )
              }
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Previous
            </button>
            <button
              type="button"
              aria-label="Next step"
              onClick={() =>
                setActiveStepIndex((prev) =>
                  prev < DEMO_STEPS.length - 1 ? prev + 1 : 0,
                )
              }
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Next Step
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Link
              href="/dashboard"

              className="w-full sm:w-auto bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              Launch Live Dashboard
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
