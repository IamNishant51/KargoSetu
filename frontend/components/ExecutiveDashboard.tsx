"use client";
import React from 'react';
import { create } from 'zustand';
import MarketShockSlider from './MarketShockSlider';
import ForecastPriceChart from './ForecastPriceChart';
import ConstraintSolverCard from './ConstraintSolverCard';
import { TrendingUp, ShieldAlert, DollarSign, Activity } from 'lucide-react';

interface SimulationState {
    marketShockFactor: number;
    setShockFactor: (val: number) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
    marketShockFactor: 1.0,
    setShockFactor: (val) => set({ marketShockFactor: val }),
}));

export default function ExecutiveDashboard() {
  const shockFactor = useSimulationStore((state) => state.marketShockFactor);

  return (
    <div className="space-y-6">
      
      {/* KPI Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#101A30] p-5 rounded-lg border border-[#26385C] flex justify-between items-center">
          <div>
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Current BDRY Index</h3>
            <p className="text-2xl font-mono font-bold mt-1 text-white">$18.42</p>
            <span className="text-[#10B981] text-xs font-mono font-semibold">+2.4% today</span>
          </div>
          <Activity className="w-8 h-8 text-[#00E5FF] opacity-80" />
        </div>

        <div className="bg-[#101A30] p-5 rounded-lg border border-[#26385C] flex justify-between items-center">
          <div>
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Demurrage Avoided (YTD)</h3>
            <p className="text-2xl font-mono font-bold mt-1 text-[#00E5FF]">$4,250,000</p>
            <span className="text-gray-400 text-xs font-mono">100% Grounding Elimination</span>
          </div>
          <DollarSign className="w-8 h-8 text-[#00E5FF] opacity-80" />
        </div>

        <div className="bg-[#101A30] p-5 rounded-lg border border-[#26385C] flex justify-between items-center">
          <div>
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Optimal Booking Window</h3>
            <p className="text-2xl font-mono font-bold mt-1 text-[#10B981]">Sept 10 - 18</p>
            <span className="text-gray-400 text-xs font-mono">88% Model Confidence</span>
          </div>
          <TrendingUp className="w-8 h-8 text-[#10B981] opacity-80" />
        </div>

        <div className="bg-[#101A30] p-5 rounded-lg border border-[#26385C] flex justify-between items-center">
          <div>
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Simulated Shock Multiplier</h3>
            <p className="text-2xl font-mono font-bold mt-1 text-[#F59E0B]">{shockFactor.toFixed(2)}x</p>
            <span className="text-gray-400 text-xs font-mono">Dynamic P90 Expansion</span>
          </div>
          <ShieldAlert className="w-8 h-8 text-[#F59E0B] opacity-80" />
        </div>
      </div>

      {/* Main Charts & Controls Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulator Control */}
        <div className="lg:col-span-1 bg-[#101A30] p-6 rounded-lg border border-[#26385C]">
          <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
            <ShieldAlert className="text-[#F59E0B] w-5 h-5" /> Scenario Shock Simulator
          </h2>
          <MarketShockSlider />
        </div>

        {/* ECharts 90-Day Forecast */}
        <div className="lg:col-span-2 bg-[#101A30] p-6 rounded-lg border border-[#26385C]">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-white">90-Day Predictive Freight Index (P10 / P50 / P90)</h2>
            <span className="text-xs font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-1 rounded border border-[#00E5FF]/30">
              Quantile XGBoost Engine
            </span>
          </div>
          <ForecastPriceChart shockFactor={shockFactor} />
        </div>
      </div>

      {/* Port Constraint Evaluator */}
      <ConstraintSolverCard />
    </div>
  );
}