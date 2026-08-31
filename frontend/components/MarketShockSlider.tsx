"use client";
import React from 'react';
import { useSimulationStore } from './ExecutiveDashboard';

export default function MarketShockSlider() {
  const { marketShockFactor, setShockFactor } = useSimulationStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-sm font-semibold tracking-wide">
        <span className="text-white/40">Normal (1.0x)</span>
        <span className="text-[#EF4444] shadow-[#EF4444]/20 drop-shadow-md">Severe Crisis (2.0x)</span>
      </div>
      
      <div className="relative pt-2 pb-4">
        <input 
          type="range" 
          min="1.0" 
          max="2.0" 
          step="0.05"
          value={marketShockFactor}
          onChange={(e) => setShockFactor(parseFloat(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00E5FF] hover:accent-white transition-all shadow-[0_0_10px_rgba(0,229,255,0.3)]"
        />
      </div>
      
      <div className="p-5 bg-white/5 border border-white/10 rounded-2xl text-sm shadow-inner backdrop-blur-md">
        <p className="text-white/90">
          <strong className="text-white/40 uppercase tracking-wider text-xs mr-2">Current Scenario:</strong> 
          {marketShockFactor > 1.5 ? <span className="text-[#EF4444] font-bold drop-shadow-md">Geopolitical Disruption</span> : (marketShockFactor > 1.2 ? <span className="text-[#F59E0B] font-bold drop-shadow-md">High Volatility</span> : <span className="text-[#10B981] font-bold drop-shadow-md">Baseline Market</span>)}
        </p>
        <p className="mt-3 text-xs text-white/40 leading-relaxed">Drag the slider to inject chaos. The Quantile XGBoost Engine will instantly recalculate the P90 confidence bounds in real-time.</p>
      </div>
    </div>
  );
}