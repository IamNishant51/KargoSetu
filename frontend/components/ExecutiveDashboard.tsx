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
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div className="p-1.5 bg-slate-100 rounded text-brand">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-green-700 text-xs font-mono font-semibold px-2 py-0.5 bg-green-50 rounded border border-green-200">+2.4%</span>
          </div>
          <div>
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Current BDRY Index</h3>
            <p className="text-2xl font-mono font-bold text-slate-900">$18.42</p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div className="p-1.5 bg-slate-100 rounded text-brand">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-slate-600 text-xs font-mono font-semibold px-2 py-0.5 bg-slate-100 rounded border border-slate-200">100% Mitigated</span>
          </div>
          <div>
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Demurrage Avoided</h3>
            <p className="text-2xl font-mono font-bold text-brand">$4.25M</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div className="p-1.5 bg-slate-100 rounded text-brand">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-green-700 text-xs font-mono font-semibold px-2 py-0.5 bg-green-50 rounded border border-green-200">88% Confidence</span>
          </div>
          <div>
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Optimal Booking</h3>
            <p className="text-2xl font-mono font-bold text-green-700">Sep 10-18</p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div className="p-1.5 bg-amber-50 rounded text-amber-600 border border-amber-100">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="text-amber-700 text-xs font-mono font-semibold px-2 py-0.5 bg-amber-50 rounded border border-amber-200">P90 Expansion</span>
          </div>
          <div>
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Risk Multiplier</h3>
            <p className="text-2xl font-mono font-bold text-slate-900">{shockFactor.toFixed(2)}x</p>
          </div>
        </div>
      </div>

      {/* Main Charts & Controls Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* ECharts 90-Day Forecast */}
        <div className="xl:col-span-2 bg-white p-6 rounded-md border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">90-Day Freight Projection</h2>
              <p className="text-xs text-slate-500 mt-1">Multi-horizon forecast bounds based on macro indicators.</p>
            </div>
            <span className="text-xs font-mono text-brand bg-slate-50 px-3 py-1.5 rounded border border-slate-200 font-semibold">
              Model: Quantile XGBoost
            </span>
          </div>
          <div className="flex-grow">
            <ForecastPriceChart shockFactor={shockFactor} />
          </div>
        </div>
        
        {/* Simulator Control */}
        <div className="xl:col-span-1 bg-white p-6 rounded-md border border-slate-200 shadow-sm flex flex-col justify-start">
          <h2 className="text-lg font-bold mb-1 text-slate-900 flex items-center gap-2">
            Scenario Stress Testing
          </h2>
          <p className="text-xs text-slate-500 mb-6 pb-4 border-b border-slate-100">Adjust the geopolitical disruption slider to visualize P90 risk.</p>
          <MarketShockSlider />
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