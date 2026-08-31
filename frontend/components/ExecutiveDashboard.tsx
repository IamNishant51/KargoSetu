"use client";
import { create } from 'zustand';
import MarketShockSlider from './MarketShockSlider';

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* KPI Cards */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#101A30] p-6 rounded-lg border border-[#26385C]">
          <h3 className="text-gray-400 text-sm uppercase">Current BDRY Index</h3>
          <p className="text-3xl font-mono mt-2">$18.42 <span className="text-[#10B981] text-sm">+2.4%</span></p>
        </div>
        <div className="bg-[#101A30] p-6 rounded-lg border border-[#26385C]">
          <h3 className="text-gray-400 text-sm uppercase">Demurrage Avoided (YTD)</h3>
          <p className="text-3xl font-mono mt-2 text-[#00E5FF]">$4,250,000</p>
        </div>
        <div className="bg-[#101A30] p-6 rounded-lg border border-[#26385C]">
          <h3 className="text-gray-400 text-sm uppercase">Simulated Shock Multiplier</h3>
          <p className="text-3xl font-mono mt-2 text-[#F59E0B]">{shockFactor.toFixed(2)}x</p>
        </div>
      </div>

      {/* Simulator Control */}
      <div className="lg:col-span-1 bg-[#101A30] p-6 rounded-lg border border-[#26385C]">
        <h2 className="text-xl font-semibold mb-4 text-white">Scenario Simulator</h2>
        <MarketShockSlider />
      </div>

      {/* ECharts Placeholder (Would integrate actual echarts-for-react here) */}
      <div className="lg:col-span-2 bg-[#101A30] p-6 rounded-lg border border-[#26385C] flex flex-col justify-center items-center h-64">
         <h2 className="text-xl font-semibold mb-4 w-full text-left text-white">90-Day Freight Projection (P50/P90)</h2>
         <p className="text-gray-500 italic">Chart rendering dynamically with Shock Factor: {shockFactor.toFixed(2)}x</p>
         {/* ReactECharts component would be mounted here */}
      </div>
    </div>
  );
}