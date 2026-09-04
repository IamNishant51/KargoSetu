"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMarketStore } from '../store/marketStore';

type ForecastResult = Array<{
  date: string;
  p10: number;
  p50: number;
  p90: number;
}>;

export default function ForecastPriceChart() {
  const { shockMultiplier, setShockMultiplier } = useMarketStore();

  const { data, isLoading } = useQuery<ForecastResult>({
    queryKey: ['forecast', shockMultiplier],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/v1/forecast/rates?shockMultiplier=${shockMultiplier}`);
      if (!res.ok) throw new Error('Failed to fetch forecast');
      return res.json();
    },
  });

  return (
    <div className="p-6 bg-navy-950 border border-slate-800 rounded-xl shadow-xl">
      <h2 className="text-xl font-bold text-white mb-6">ML Freight Forecast (90-Day)</h2>
      
      <div className="mb-8">
        <label className="flex justify-between items-center text-slate-300 mb-3">
          <span className="font-medium text-sm">What-If Market Shock Multiplier</span>
          <span className="font-mono bg-navy-900 px-3 py-1 rounded border border-slate-700 text-blue-400 font-semibold">{shockMultiplier.toFixed(1)}x</span>
        </label>
        <input 
          type="range" 
          min="0.5" 
          max="3.0" 
          step="0.1" 
          value={shockMultiplier} 
          onChange={(e) => setShockMultiplier(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-navy-950 transition-all" 
        />
        <p className="text-xs text-slate-500 mt-2">Adjust historical volatility variance bounds in real-time.</p>
      </div>

      {isLoading && !data && (
        <div className="flex items-center space-x-2 text-slate-400 font-medium">
          <div className="w-4 h-4 rounded-full border-2 border-slate-500 border-t-transparent animate-spin"></div>
          <span>Running LSTM model...</span>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-navy-900 p-5 rounded-xl border-t-4 border-emerald-500 shadow-md transition-transform hover:-translate-y-1 duration-200 flex flex-col justify-center">
            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">P10 (Optimistic)</div>
            <div className="text-3xl font-bold text-white">${data[0].p10.toLocaleString()}</div>
          </div>
          <div className="bg-navy-900 p-5 rounded-xl border-t-4 border-blue-500 shadow-md transition-transform hover:-translate-y-1 duration-200 flex flex-col justify-center">
            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">P50 (Median)</div>
            <div className="text-3xl font-bold text-white">${data[0].p50.toLocaleString()}</div>
          </div>
          <div className="bg-navy-900 p-5 rounded-xl border-t-4 border-orange-500 shadow-md transition-transform hover:-translate-y-1 duration-200 flex flex-col justify-center">
            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">P90 (Pessimistic)</div>
            <div className="text-3xl font-bold text-white">${data[0].p90.toLocaleString()}</div>
          </div>
        </div>
      )}
      
      {data && (
        <div className="mt-6 flex items-center justify-end text-xs font-medium text-slate-400">
          <span className="relative flex h-2.5 w-2.5 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          LSTM Hybrid Model Active
        </div>
      )}
    </div>
  );
}
