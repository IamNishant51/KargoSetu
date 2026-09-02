"use client";

 import React from 'react';
 import Image from 'next/image';
 import { Anchor, Waves, Navigation, ArrowUpRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

const PORTS = [
  {
    name: "Haldia Dock Complex (HDC)",
    location: "West Bengal · Hooghly River Channel",
    draft: "7.5m",
    tideRange: "+2.8m to +4.2m",
    status: "Riverine & Tide-Dependent",
    vesselsAllowed: "Supramax Only (Direct)",
    challenges: "Heavy siltation; requires tidal navigation window and Sandheads transshipment splitting.",
    isRestricted: true,
  },
  {
    name: "Paradip Port",
    location: "Odisha · Bay of Bengal",
    draft: "14.5m",
    tideRange: "+1.2m to +2.4m",
    status: "Deepwater All-Weather Port",
    vesselsAllowed: "Panamax / Baby Capesize",
    challenges: "Mechanized coal handling; requires precise laycan synchronization to avoid berth congestion.",
    isRestricted: false,
  },
  {
    name: "Dhamra Port",
    location: "Odisha · Deep Sea Fairway",
    draft: "16.0m",
    tideRange: "+1.5m to +2.8m",
    status: "Capesize Compliant Terminal",
    vesselsAllowed: "Fully Laden Capesize (180k DWT)",
    challenges: "High-throughput bulk handling; primary hub for heavy coking coal import fixtures.",
    isRestricted: false,
  },
  {
    name: "Sandheads Anchorage",
    location: "Bay of Bengal · Deepwater Roads",
    draft: "22.0m+",
    tideRange: "Open Ocean Tides",
    status: "Offshore Lighterage Zone",
    vesselsAllowed: "All Classes (Transshipment)",
    challenges: "Deep-sea lighterage operations; automated barge & Supramax shuttle scheduling.",
    isRestricted: false,
  }
];

export default function PortCorridor() {
  return (
    <section id="ports" className="py-20 sm:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Anchor size={13} />
            Strategic Indian Port Telemetry
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tighter mb-4 leading-[1.1]">
            East Coast Maritime Corridor
          </h2>
          <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            KargoSetu monitors dynamic bathymetry, fairway siltation, and tidal curves across key ports serving SAIL and Indian steel plants.
          </p>
        </div>

        {/* Massive Top Map Image */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-200/80 mb-16 bg-slate-900 group">
          <Image 
            src="/port-map.png" 
            alt="Strategic East Coast Ports Map" 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-in-out" 
            priority
          />
          {/* Overlay Gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Ports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PORTS.map((port, idx) => (
            <div
              key={idx}
              className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200/80 hover:border-slate-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold text-slate-400">PORT #{idx + 1}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    port.isRestricted ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {port.isRestricted ? 'Draft Restricted' : 'Deep Water'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-[#EA580C] transition-colors">
                  {port.name}
                </h3>
                <p className="text-xs text-slate-500 mb-4">{port.location}</p>

                {/* Draft Metrics */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 space-y-2 mb-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Permissible Draft:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{port.draft}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Tidal Window:</span>
                    <span className="font-mono font-semibold text-emerald-600">{port.tideRange}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Max Direct Vessel:</span>
                    <span className="font-semibold text-slate-800">{port.vesselsAllowed}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {port.challenges}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium">{port.status}</span>
                <span className="text-emerald-500 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
