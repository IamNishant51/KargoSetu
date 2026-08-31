"use client";
import React, { useState } from "react";
import { Anchor, ShieldCheck, AlertTriangle, Layers } from "lucide-react";

export default function ConstraintSolverCard() {
  const [port, setPort] = useState("Haldia");
  const [volume, setVolume] = useState(150000);
  const [depth, setDepth] = useState(8.5);
  const [tide, setTide] = useState(2.1);
  const [density, setDensity] = useState(1.008); // Brackish riverine density

  // Calculate hydrodynamic parameters
  const deltaDraft = 18.0 * ((1.025 - density) / density); // Capesize draft 18m
  const squat = (2 * 0.85 * (12.0 ** 2)) / 100; // 0.244m squat
  const totalArrivalDraft = 18.0 + deltaDraft + squat;
  const maxPermissible = depth + tide - 1.0; // 1.0m UKC safety
  const isFeasible = totalArrivalDraft <= maxPermissible;

  // Splitting recommendation
  const supramaxCapacity = 50000;
  const splitCount = Math.ceil(volume / supramaxCapacity);

  return (
    <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/5 backdrop-blur-3xl shadow-2xl space-y-6 relative overflow-hidden">
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-[#00E5FF]/5 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 relative z-10">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
          <div className="p-2 bg-white/5 rounded-xl border border-white/10 shadow-lg">
            <Anchor className="text-[#00E5FF] w-5 h-5" />
          </div>
          Port Constraint Evaluator
        </h2>
        <span className={`mt-4 sm:mt-0 px-4 py-1.5 rounded-full text-xs font-mono font-bold shadow-lg ${isFeasible ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 shadow-[#10B981]/10' : 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 shadow-[#EF4444]/10'}`}>
          {isFeasible ? 'BERTHING CLEARED' : 'DRAFT REJECTED (SPLIT REQUIRED)'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm relative z-10">
        <div className="space-y-1.5">
          <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block">Target Port</label>
          <select value={port} onChange={(e) => setPort(e.target.value)} className="w-full bg-white/5 text-white border border-white/10 p-3 rounded-xl focus:outline-none focus:border-[#00E5FF]/50 transition-colors shadow-inner backdrop-blur-md">
            <option value="Haldia" className="bg-[#030d1a]">Haldia (Riverine)</option>
            <option value="Paradip" className="bg-[#030d1a]">Paradip (Deep Water)</option>
            <option value="Vizag" className="bg-[#030d1a]">Vizag (Outer Harbor)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block">Volume (MT)</label>
          <input type="number" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full bg-white/5 text-white border border-white/10 p-3 rounded-xl focus:outline-none focus:border-[#00E5FF]/50 transition-colors shadow-inner backdrop-blur-md" />
        </div>

        <div className="space-y-1.5">
          <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block">Chart Depth (m)</label>
          <input type="number" step="0.1" value={depth} onChange={(e) => setDepth(Number(e.target.value))} className="w-full bg-white/5 text-white border border-white/10 p-3 rounded-xl focus:outline-none focus:border-[#00E5FF]/50 transition-colors shadow-inner backdrop-blur-md" />
        </div>

        <div className="space-y-1.5">
          <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block">Tidal Height (m)</label>
          <input type="number" step="0.1" value={tide} onChange={(e) => setTide(Number(e.target.value))} className="w-full bg-white/5 text-white border border-white/10 p-3 rounded-xl focus:outline-none focus:border-[#00E5FF]/50 transition-colors shadow-inner backdrop-blur-md" />
        </div>
      </div>

      {/* Physics Breakdown */}
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono relative z-10 shadow-inner">
        <div className="space-y-1">
          <span className="text-white/40 block font-semibold tracking-wider">Capesize Arrival Draft</span>
          <span className="text-white text-2xl font-bold tracking-tight">{totalArrivalDraft.toFixed(2)}m</span>
          <span className="text-white/30 block pt-1">(Laden: 18.0m + Sinkage: +{deltaDraft.toFixed(2)}m + Squat: +{squat.toFixed(2)}m)</span>
        </div>

        <div className="space-y-1 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
          <span className="text-white/40 block font-semibold tracking-wider">Max Permissible Draft</span>
          <span className="text-[#00E5FF] text-2xl font-bold tracking-tight shadow-[#00E5FF]/20 drop-shadow-md">{maxPermissible.toFixed(2)}m</span>
          <span className="text-white/30 block pt-1">(Depth: {depth}m + Tide: {tide}m - UKC: 1.0m)</span>
        </div>

        <div className="space-y-1 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
          <span className="text-white/40 block font-semibold tracking-wider">Recommended Action</span>
          {isFeasible ? (
            <span className="text-[#10B981] text-lg font-bold flex items-center gap-2 mt-1 drop-shadow-md">
              <ShieldCheck className="w-5 h-5" /> Direct Berthing
            </span>
          ) : (
            <span className="text-[#F59E0B] text-lg font-bold flex items-center gap-2 mt-1 drop-shadow-md">
              <Layers className="w-5 h-5" /> Split into {splitCount}x Supramax
            </span>
          )}
          <span className="text-white/30 block pt-1">Eliminates $25,000/day Demurrage Risk</span>
        </div>
      </div>
    </div>
  );
}
