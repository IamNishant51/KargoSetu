"use client";
import React from 'react';
import { useSimulationStore } from './ExecutiveDashboard';

export default function MarketShockSlider() {
  const { marketShockFactor, setShockFactor } = useSimulationStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-xs font-bold tracking-wide uppercase">
        <span className="text-slate-500">Baseline (1.0x)</span>
        <span className="text-red-600">Severe Crisis (2.0x)</span>
      </div>
      
      <div className="relative pt-1 pb-2">
        <input 
          type="range" 
          min="1.0" 
          max="2.0" 
          step="0.05"
          value={marketShockFactor}
          onChange={(e) => setShockFactor(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>
      
      <div className="p-4 bg-slate-50 border border-slate-200 rounded text-sm">
        <p className="text-slate-800 flex items-center justify-between">
          <span className="text-slate-500 uppercase tracking-wider text-xs font-semibold">Current Scenario</span> 
          {marketShockFactor > 1.5 ? <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100 text-xs">Geopolitical Disruption</span> : (marketShockFactor > 1.2 ? <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100 text-xs">High Volatility</span> : <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-100 text-xs">Baseline Market</span>)}
        </p>
        <p className="mt-3 text-xs text-slate-500 leading-relaxed">
          Adjusting this slider injects synthetic volatility into the forecasting engine, instantly expanding the P90 confidence bounds in real-time.
        </p>
      </div>
    </div>
  );
}