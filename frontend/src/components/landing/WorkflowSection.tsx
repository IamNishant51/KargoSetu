"use client";

 import React from 'react';
 import Image from 'next/image';
 import { ClipboardCheck, Cpu, Anchor, CheckCircle, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: "01",
    title: "Ingest Bulk Requisition",
    desc: "Procurement teams enter cargo tonnage, commodity grade, laycan dates, and target East Coast destination port into KargoSetu.",
    icon: ClipboardCheck,
    badge: "Step 1"
  },
  {
    step: "02",
    title: "Hydrodynamic Physics Check",
    desc: "The system fetches live Open-Meteo tide levels and port bathymetry to calculate dynamic vessel squat, draft, and UKC safety clearance.",
    icon: Anchor,
    badge: "Step 2"
  },
  {
    step: "03",
    title: "Neural Rate Dip Detection",
    desc: "Auto-regressive LSTM neural networks predict 90-day freight rate curves, identifying seasonal market dips to time Contract of Affreightment fixtures.",
    icon: Cpu,
    badge: "Step 3"
  },
  {
    step: "04",
    title: "Automated Allocation & Execution",
    desc: "Generates optimal vessel pairing (Direct vs. 3x Split) with guaranteed fairway clearance and complete zero-demurrage assurance.",
    icon: CheckCircle,
    badge: "Step 4"
  }
];

export default function WorkflowSection() {
  return (
    <section className="py-20 sm:py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[#EA580C] font-bold tracking-wider text-xs sm:text-sm mb-3 uppercase">
            END-TO-END AUTOMATION
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">
            How KargoSetu Secures Every Voyage
          </h2>
          <p className="text-slate-500 text-base sm:text-lg">
            From raw procurement requisition to safe dockside berthing in four deterministic steps.
          </p>
        </div>

        {/* Main Content: Split Layout */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
          
          {/* Left Column: Image */}
          <div className="lg:col-span-7 mb-12 lg:mb-0 relative">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-200/80 bg-white">
              <Image 
                src="/workflow-ship.png" 
                alt="Vessel Physics & Draft Constraints" 
                fill 
                className="object-cover hover:scale-105 transition-transform duration-700" 
              />
            </div>
            {/* Floating decorative badge */}
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-200/60 hidden sm:block animate-float z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Physics Engine</p>
                  <p className="text-sm font-extrabold text-slate-900 tracking-tight">Clearance Verified</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Vertical Steps */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {STEPS.map((item, idx) => {
              const Icon = item.icon;
              const isActive = idx === 1; // Highlight the physics step to match image
              return (
                <div
                  key={idx}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 flex gap-4 ${
                    isActive 
                      ? 'bg-white shadow-xl shadow-slate-200/40 border-[#EA580C]/30 relative overflow-hidden' 
                      : 'bg-white/60 shadow-sm border-slate-200/60 hover:bg-white hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#EA580C]" />}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                    isActive ? 'bg-orange-50 text-[#EA580C] border-orange-200 shadow-sm' : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className={`text-base sm:text-lg font-bold mb-1.5 tracking-tight ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
