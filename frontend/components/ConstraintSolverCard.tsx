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
    <div className="bg-[#101A30] p-6 rounded-lg border border-[#26385C] space-y-4">
      <div className="flex justify-between items-center border-b border-[#26385C] pb-3">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Anchor className="text-[#00E5FF] w-5 h-5" /> Interactive Port Constraint Evaluator
        </h2>
        <span className={`px-3 py-1 rounded text-xs font-mono font-bold ${isFeasible ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]'}`}>
          {isFeasible ? 'BERTHING CLEARED' : 'DRAFT REJECTED (SPLIT REQUIRED)'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <label className="text-gray-400 text-xs block mb-1">Target Port</label>
          <select value={port} onChange={(e) => setPort(e.target.value)} className="w-full bg-[#080E1E] text-white border border-[#26385C] p-2 rounded focus:outline-none focus:border-[#00E5FF]">
            <option value="Haldia">Haldia (Riverine)</option>
            <option value="Paradip">Paradip (Deep Water)</option>
            <option value="Vizag">Vizag (Outer Harbor)</option>
          </select>
        </div>

        <div>
          <label className="text-gray-400 text-xs block mb-1">Cargo Volume (MT)</label>
          <input type="number" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full bg-[#080E1E] text-white border border-[#26385C] p-2 rounded focus:outline-none focus:border-[#00E5FF]" />
        </div>

        <div>
          <label className="text-gray-400 text-xs block mb-1">Chart Depth (m)</label>
          <input type="number" step="0.1" value={depth} onChange={(e) => setDepth(Number(e.target.value))} className="w-full bg-[#080E1E] text-white border border-[#26385C] p-2 rounded focus:outline-none focus:border-[#00E5FF]" />
        </div>

        <div>
          <label className="text-gray-400 text-xs block mb-1">Tidal Height (m)</label>
          <input type="number" step="0.1" value={tide} onChange={(e) => setTide(Number(e.target.value))} className="w-full bg-[#080E1E] text-white border border-[#26385C] p-2 rounded focus:outline-none focus:border-[#00E5FF]" />
        </div>
      </div>

      {/* Physics Breakdown */}
      <div className="bg-[#080E1E] p-4 rounded border border-[#26385C] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div>
          <span className="text-gray-400 block">Capesize Arrival Draft</span>
          <span className="text-white text-base font-bold">{totalArrivalDraft.toFixed(2)}m</span>
          <span className="text-gray-500 block text-[10px]">(Laden: 18.0m + Sinkage: +{deltaDraft.toFixed(2)}m + Squat: +{squat.toFixed(2)}m)</span>
        </div>

        <div>
          <span className="text-gray-400 block">Max Permissible Draft</span>
          <span className="text-[#00E5FF] text-base font-bold">{maxPermissible.toFixed(2)}m</span>
          <span className="text-gray-500 block text-[10px]">(Depth: {depth}m + Tide: {tide}m - UKC: 1.0m)</span>
        </div>

        <div>
          <span className="text-gray-400 block">Recommended Action</span>
          {isFeasible ? (
            <span className="text-[#10B981] text-sm font-bold flex items-center gap-1 mt-1"><ShieldCheck className="w-4 h-4" /> Direct Capesize Berthing</span>
          ) : (
            <span className="text-[#F59E0B] text-sm font-bold flex items-center gap-1 mt-1"><Layers className="w-4 h-4" /> Split into {splitCount}x Supramax</span>
          )}
          <span className="text-gray-500 block text-[10px]">Eliminates $25,000/day Demurrage Risk</span>
        </div>
      </div>
    </div>
  );
}
