"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMarketStore } from '../store/marketStore';

type ForecastResult = {
  current_rate: number;
  shock_multiplier_applied: number;
  forecast: {
    p10_optimistic: number;
    p50_median: number;
    p90_pessimistic: number;
  };
  model_status: string;
};

export default function ForecastPriceChart() {
  const { shockMultiplier, setShockMultiplier } = useMarketStore();

  const { data, isLoading } = useQuery<ForecastResult>({
    queryKey: ['forecast', shockMultiplier],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3001/api/v1/forecast/rates?shockMultiplier=${shockMultiplier}`);
      if (!res.ok) throw new Error('Failed to fetch forecast');
      return res.json();
    },
  });

  return (
    <div className="p-6 bg-slate-900 border border-slate-700 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">ML Freight Forecast (90-Day)</h2>
      
      <div className="mb-6">
        <label className="flex justify-between text-slate-300 mb-2">
          <span>What-If Market Shock Multiplier</span>
          <span className="font-mono bg-slate-800 px-2 rounded text-blue-400">{shockMultiplier.toFixed(1)}x</span>
        </label>
        <input 
          type="range" 
          min="0.5" 
          max="3.0" 
          step="0.1" 
          value={shockMultiplier} 
          onChange={(e) => setShockMultiplier(parseFloat(e.target.value))}
          className="w-full accent-blue-500" 
        />
        <p className="text-xs text-slate-500 mt-1">Adjust historical volatility variance bounds in real-time.</p>
      </div>

      {isLoading && !data && <div className="text-slate-400">Running LSTM model...</div>}

      {data && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800 p-4 rounded text-center border-t-4 border-green-500">
            <div className="text-xs text-slate-400 uppercase">P10 (Optimistic)</div>
            <div className="text-2xl font-bold text-white">${data.forecast.p10_optimistic}</div>
          </div>
          <div className="bg-slate-800 p-4 rounded text-center border-t-4 border-blue-500">
            <div className="text-xs text-slate-400 uppercase">P50 (Median)</div>
            <div className="text-2xl font-bold text-white">${data.forecast.p50_median}</div>
          </div>
          <div className="bg-slate-800 p-4 rounded text-center border-t-4 border-red-500">
            <div className="text-xs text-slate-400 uppercase">P90 (Pessimistic)</div>
            <div className="text-2xl font-bold text-white">${data.forecast.p90_pessimistic}</div>
          </div>
        </div>
      )}
      
      {data && (
        <div className="mt-4 text-xs text-slate-500 text-right">
          Status: {data.model_status}
        </div>
      )}
    </div>
  );
}
