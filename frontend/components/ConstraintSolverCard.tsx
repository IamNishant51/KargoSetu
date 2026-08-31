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
    <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Anchor className="text-brand w-5 h-5" />
            Port Constraint Evaluator
          </h2>
          <p className="text-xs text-slate-500 mt-1">Deterministic physics engine for draft and clearance checks.</p>
        </div>
        <span className={`mt-4 sm:mt-0 px-3 py-1 rounded text-xs font-mono font-bold border ${isFeasible ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {isFeasible ? 'STATUS: BERTHING CLEARED' : 'STATUS: DRAFT REJECTED'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-slate-50 p-4 rounded border border-slate-100">
        <div className="space-y-1.5">
          <label className="text-slate-600 text-xs font-semibold uppercase tracking-wider block">Target Port</label>
          <select value={port} onChange={(e) => setPort(e.target.value)} className="w-full bg-white text-slate-900 border border-slate-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand text-sm">
            <option value="Haldia">Haldia (Riverine)</option>
            <option value="Paradip">Paradip (Deep Water)</option>
            <option value="Vizag">Vizag (Outer Harbor)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-slate-600 text-xs font-semibold uppercase tracking-wider block">Volume (MT)</label>
          <input type="number" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full bg-white text-slate-900 border border-slate-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand text-sm" />
        </div>

        <div className="space-y-1.5">
          <label className="text-slate-600 text-xs font-semibold uppercase tracking-wider block">Chart Depth (m)</label>
          <input type="number" step="0.1" value={depth} onChange={(e) => setDepth(Number(e.target.value))} className="w-full bg-white text-slate-900 border border-slate-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand text-sm" />
        </div>

        <div className="space-y-1.5">
          <label className="text-slate-600 text-xs font-semibold uppercase tracking-wider block">Tidal Height (m)</label>
          <input type="number" step="0.1" value={tide} onChange={(e) => setTide(Number(e.target.value))} className="w-full bg-white text-slate-900 border border-slate-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand text-sm" />
        </div>
      </div>

      {/* Physics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm font-mono pt-2">
        <div className="space-y-1">
          <span className="text-slate-500 block font-semibold text-xs tracking-wider uppercase">Vessel Arrival Draft</span>
          <span className="text-slate-900 text-xl font-bold tracking-tight block">{totalArrivalDraft.toFixed(2)}m</span>
          <span className="text-slate-500 text-[11px] block pt-1">Laden: 18.0m + Sink: {deltaDraft.toFixed(2)}m + Squat: {squat.toFixed(2)}m</span>
        </div>

        <div className="space-y-1 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
          <span className="text-slate-500 block font-semibold text-xs tracking-wider uppercase">Max Permissible</span>
          <span className="text-brand text-xl font-bold tracking-tight block">{maxPermissible.toFixed(2)}m</span>
          <span className="text-slate-500 text-[11px] block pt-1">Depth: {depth}m + Tide: {tide}m - UKC: 1.0m</span>
        </div>

        <div className="space-y-1 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
          <span className="text-slate-500 block font-semibold text-xs tracking-wider uppercase">Recommendation</span>
          {isFeasible ? (
            <span className="text-green-700 text-base font-bold flex items-center gap-1.5 mt-1">
              <ShieldCheck className="w-4 h-4" /> Direct Berthing
            </span>
          ) : (
            <span className="text-red-700 text-base font-bold flex items-center gap-1.5 mt-1">
              <Layers className="w-4 h-4" /> Split to {splitCount}x Supramax
            </span>
          )}
          <span className="text-slate-500 text-[11px] block pt-1">Prevents $25,000/day Demurrage</span>
        </div>
      </div>
    </div>
  );
}
