"use client";
import React from 'react';
import { useSimulationStore } from './ExecutiveDashboard';

export default function MarketShockSlider() {
  const { marketShockFactor, setShockFactor } = useSimulationStore();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">Normal (1.0x)</span>
        <span className="text-[#EF4444] font-bold">Severe Crisis (2.0x)</span>
      </div>
      
      <input 
        type="range" 
        min="1.0" 
        max="2.0" 
        step="0.05"
        value={marketShockFactor}
        onChange={(e) => setShockFactor(parseFloat(e.target.value))}
        className="w-full accent-[#00E5FF]"
      />
      
      <div className="mt-4 p-4 bg-[#080E1E] border border-[#26385C] rounded text-sm text-gray-300">
        <p><strong>Current Scenario:</strong> {marketShockFactor > 1.5 ? 'Geopolitical Disruption' : (marketShockFactor > 1.2 ? 'High Volatility' : 'Baseline Market')}</p>
        <p className="mt-2 text-xs text-gray-500">Drag to instantly recalculate the P90 confidence bounds in the forecasting engine.</p>
      </div>
    </div>
  );
}