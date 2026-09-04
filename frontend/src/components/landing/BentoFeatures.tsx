"use client";

 import React from 'react';
 import Image from 'next/image';
 import { Cpu, Anchor, Navigation, ShieldCheck, CheckCircle2 } from 'lucide-react';

type FeatureItem = {
  icon: React.ElementType;
  tag: string;
  title: string;
  description: string;
  metrics: string[];
  color: string;
  accent: string;
  image?: string;
};

const FEATURES: FeatureItem[] = [
  {
    icon: Anchor,
    tag: "Maritime Physics Engine",
    title: "Dual-Ended Bathymetric Constraint Solver",
    description: "Evaluates vessel Draft, Beam, LOA, and Under Keel Clearance (UKC) against destination bathymetry. Dynamically pulls Open-Meteo tidal curves to ensure ships never run aground in riverine ports like Haldia.",
    metrics: ["< 150ms Solver Latency", "Dynamic Tidal Compensation", "100% Zero-Grounding Guarantee"],
    color: "from-blue-500/10 to-transparent",
    accent: "text-blue-600 bg-blue-50 border-blue-200"
  },
  {
    icon: Cpu,
    tag: "Deep Learning Engine",
    title: "TensorFlow.js 90-Day Quantile Forecaster",
     description: "Auto-regressive LSTM neural network ingesting Baltic Dry Index (BDI) and historical volatility to output P10, P50, and P90 confidence intervals. Memory-sandboxed via tf.tidy() for zero leak server execution.",
     metrics: ["Multi-Horizon (30/60/90 Days)", "What-If Volatility Slider", "Optimal CoA Window Detection"],
     color: "from-orange-500/10 to-transparent",
     accent: "text-orange-600 bg-orange-50 border-orange-200"
  },
  {
    icon: Navigation,
    tag: "Transshipment Logistics",
    title: "Sandheads Offshore Lighterage Optimizer",
    description: "When single-vessel routing is physically infeasible due to channel siltation or draft limits, KargoSetu automatically models multi-vessel splitting (e.g. 150k MT to 3x Supramax) with Sandheads deepwater lighterage.",
    metrics: ["Auto Cargo Splitting", "Offshore Lighterage Protocol", "Demurrage Penalty Elimination"],
    color: "from-emerald-500/10 to-transparent",
    accent: "text-emerald-600 bg-emerald-50 border-emerald-200"
  },
  {
    icon: ShieldCheck,
    tag: "Voyage Strategy & ESG",
    title: "Triangular Repositioning & Carbon Reduction",
    description: "Eradicates $25,000/day idle ballast losses through intelligent triangular repositioning fixtures. Automatically computes VLSFO bunker burn and IMO-compliant CO2 footprint savings.",
    metrics: ["Triangular Backhaul Optimization", "VLSFO Fuel Burn Minimization", "IMO Decarbonization Footprint"],
    color: "from-purple-500/10 to-transparent",
    accent: "text-purple-600 bg-purple-50 border-purple-200"
  }
];

export default function BentoFeatures() {
  return (
    <section id="features" className="py-20 sm:py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[#16A34A] font-bold tracking-wider text-[11px] mb-3 uppercase border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full inline-block">
            ENGINEERED FOR SIH 26006 & MINISTRY OF STEEL
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tighter mb-4 leading-[1.1]">
            Next-Generation Maritime Architecture
          </h2>
          <p className="text-slate-500 text-base sm:text-lg font-medium leading-relaxed">
            Merging naval architecture hydrodynamics with auto-regressive deep learning to solve India&apos;s bulk logistics challenges.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((item, idx) => {
            const Icon = item.icon;
            const isLarge = !!item.image;
            
            return (
              <div
                key={idx}
                className={`bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40 hover:shadow-lg hover:shadow-slate-200/40  transition-all duration-300 relative overflow-hidden group ${
                  isLarge ? 'md:col-span-2 flex flex-col md:flex-row' : 'flex flex-col p-8 sm:p-10'
                }`}
              >
                

                {/* Content Side */}
                <div className={`relative z-10 flex flex-col justify-between h-full ${isLarge ? 'p-8 sm:p-10 md:w-1/2' : ''}`}>
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${item.accent}  transition-transform shadow-sm`}>
                        <Icon size={22} strokeWidth={2.5} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full shadow-sm">
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                      {item.title}
                    </h3>

                    <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-8 font-medium">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className={`grid gap-3 ${isLarge ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1'}`}>
                      {item.metrics.map((metric, mIdx) => (
                         <div key={mIdx} className="flex items-center gap-2 text-[10px] font-bold text-slate-700 tracking-wider uppercase">
                           <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                           <span className="truncate">{metric}</span>
                         </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Image Side (Only for large cards) */}
                {isLarge && (
                  <div className="relative md:w-1/2 min-h-[250px] md:min-h-full bg-slate-900 border-t md:border-t-0 md:border-l border-slate-200/80 overflow-hidden">
                    <Image 
                      src={item.image!} 
                      alt={item.title}
                      fill
                      className="object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-[1.5s]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent hidden md:block" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent block md:hidden" />
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
