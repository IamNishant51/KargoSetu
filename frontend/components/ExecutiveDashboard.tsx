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
      
      {/* KPI Header Cards - Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 backdrop-blur-3xl shadow-2xl flex flex-col justify-between hover:bg-white/[0.04] transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5 text-[#00E5FF]" />
            </div>
            <span className="text-[#10B981] text-xs font-mono font-semibold px-2 py-1 bg-[#10B981]/10 rounded-full">+2.4% today</span>
          </div>
          <div>
            <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Current BDRY Index</h3>
            <p className="text-3xl font-mono font-bold text-white">$18.42</p>
          </div>
        </div>

        <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 backdrop-blur-3xl shadow-2xl flex flex-col justify-between hover:bg-white/[0.04] transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5 text-[#00E5FF]" />
            </div>
            <span className="text-white/40 text-xs font-mono px-2 py-1 bg-white/5 rounded-full">100% Elimination</span>
          </div>
          <div>
            <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Demurrage Avoided</h3>
            <p className="text-3xl font-mono font-bold text-[#00E5FF]">$4.25M</p>
          </div>
        </div>

        <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 backdrop-blur-3xl shadow-2xl flex flex-col justify-between hover:bg-white/[0.04] transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 text-[#10B981]" />
            </div>
            <span className="text-white/40 text-xs font-mono px-2 py-1 bg-white/5 rounded-full">88% Confidence</span>
          </div>
          <div>
            <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Optimal Booking</h3>
            <p className="text-3xl font-mono font-bold text-[#10B981]">Sep 10-18</p>
          </div>
        </div>

        <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 backdrop-blur-3xl shadow-2xl flex flex-col justify-between hover:bg-white/[0.04] transition-colors group relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#F59E0B]/20 blur-3xl rounded-full pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-2 bg-[#F59E0B]/10 rounded-xl border border-[#F59E0B]/20 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <span className="text-[#F59E0B] text-xs font-mono font-semibold px-2 py-1 bg-[#F59E0B]/10 rounded-full border border-[#F59E0B]/20">P90 Expansion</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Shock Multiplier</h3>
            <p className="text-3xl font-mono font-bold text-white">{shockFactor.toFixed(2)}x</p>
          </div>
        </div>
      </div>

      {/* Main Charts & Controls Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* ECharts 90-Day Forecast (Spans 2 columns on extra large screens) */}
        <div className="xl:col-span-2 bg-white/[0.02] p-6 rounded-3xl border border-white/5 backdrop-blur-3xl shadow-2xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00E5FF]/5 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h2 className="text-xl font-bold text-white tracking-tight">90-Day Freight Projection</h2>
            <span className="text-xs font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-3 py-1.5 rounded-full border border-[#00E5FF]/20 backdrop-blur-md shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              Quantile XGBoost
            </span>
          </div>
          <div className="relative z-10 flex-grow">
            <ForecastPriceChart shockFactor={shockFactor} />
          </div>
        </div>
        
        {/* Simulator Control */}
        <div className="xl:col-span-1 bg-white/[0.02] p-6 rounded-3xl border border-white/5 backdrop-blur-3xl shadow-2xl flex flex-col justify-center">
          <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
            <ShieldAlert className="text-[#F59E0B] w-5 h-5" /> Scenario Shock
          </h2>
          <MarketShockSlider />
        </div>

      </div>

      {/* Port Constraint Evaluator */}
      <div className="mt-8">
        <ConstraintSolverCard />
      </div>
    </div>
  );
}