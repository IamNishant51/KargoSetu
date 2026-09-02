"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, ArrowRightLeft, Calendar } from 'lucide-react';

type ForecastResponse = {
  current_rate: number;
  shock_multiplier_applied: number;
  forecast: {
    p10_optimistic: number;
    p50_median: number;
    p90_pessimistic: number;
  };
  model_status: string;
  timeSeries?: Array<{ date: string; p10: number; p50: number; p90: number }>;
};

type ChartDataPoint = {
  date: string;
  rawDate: Date;
  p10: number;
  p50: number;
  p90: number;
};

// Mock data generation for the chart (in a real app, this would come from the API payload)
const generateMockChartData = (baseShock: number): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const today = new Date('2026-05-11'); // Using dates from the mockup
  
  let p10 = 12000 * baseShock;
  let p50 = 20000 * baseShock;
  let p90 = 30000 * baseShock;

  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    
    // Add some random noise and a slight upward trend
    const noise = Math.random() * 500;
    const trend = i * 200;
    
    p10 += trend * 0.5 + noise - 250;
    p50 += trend + noise - 250;
    p90 += trend * 1.5 + noise - 250;

    data.push({
      date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rawDate: currentDate,
      p10: Math.round(p10),
      p50: Math.round(p50),
      p90: Math.round(p90),
    });
  }
  return data;
};

export default function ForecastsPage() {
  const [shock, setShock] = useState(2.0);
  const [apiChartData, setApiChartData] = useState<ChartDataPoint[] | null>(null);

  // Fallback to mock data if backend is not yet queried
  const mockChartData = useMemo(() => generateMockChartData(shock), [shock]);
  const chartData = apiChartData && apiChartData.length > 0 ? apiChartData : mockChartData;

  useEffect(() => {
    let isMounted = true;

    const fetchForecast = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/v1/forecast/rates?shockMultiplier=${shock}`);
        if (res.ok) {
          const json = await res.json() as ForecastResponse;
          if (isMounted && json.timeSeries && Array.isArray(json.timeSeries)) {
            const mapped: ChartDataPoint[] = json.timeSeries.slice(0, 30).map((pt) => {
              const d = new Date(pt.date);
              return {
                date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                rawDate: d,
                p10: pt.p10,
                p50: pt.p50,
                p90: pt.p90,
              };
            });
            setApiChartData(mapped);
          }
        } else {
            console.error("Failed to fetch forecast");
        }
      } catch (e) {
        console.error("API error, using mock data", e);
      }
    };

    void fetchForecast();
    return () => { isMounted = false; };
  }, [shock]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Predictive Freight Rates</h1>
            <p className="text-slate-500 mt-1">AI-powered forecasting of freight rates with adjustable market shock scenarios.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm">
              <ArrowRightLeft className="w-4 h-4 text-slate-400 mr-2" />
              <select className="bg-transparent text-sm font-medium focus:outline-none text-slate-700">
                <option>Route: Singapore → Rotterdam</option>
                <option>Route: Shanghai → Los Angeles</option>
              </select>
            </div>
            
            <div className="flex items-center bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm">
              <Calendar className="w-4 h-4 text-slate-400 mr-2" />
              <select className="bg-transparent text-sm font-medium focus:outline-none text-slate-700">
                <option>30 Days</option>
                <option>90 Days</option>
                <option>180 Days</option>
              </select>
            </div>

            <button className="flex items-center bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Shock Slider Card */}
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-900">Market Shock Multiplier (1.0x to 3.0x)</h2>
              <span className="text-slate-400 text-sm cursor-help" title="Adjust volatility variance">ⓘ</span>
            </div>
            <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
              {shock.toFixed(1)}x
            </div>
          </div>
          
          <div className="relative px-2">
            <input 
              type="range" 
              min="1.0" 
              max="3.0" 
              step="0.1" 
              value={shock} 
              onChange={(e) => setShock(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200" 
            />
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>1.0x</span>
              <span>1.5x</span>
              <span>2.0x</span>
              <span>2.5x</span>
              <span>3.0x</span>
            </div>
          </div>
        </div>

        {/* Chart Card */}
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-6">Freight Rate Forecast (USD per Day)</h2>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  dy={10}
                  interval={3}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  tickFormatter={(value) => `${value / 1000}K`}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: unknown) => [`$${Number(value || 0).toLocaleString()}`, '']}
                  labelStyle={{ color: '#0F172A', fontWeight: 'bold', marginBottom: '8px' }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '14px', color: '#475569' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="p90" 
                  name="P90 (Bullish)" 
                  stroke="#F97316" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#F97316', strokeWidth: 2 }}
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="p50" 
                  name="P50 (Base Case)" 
                  stroke="#0F172A" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#0F172A', strokeWidth: 2 }}
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="p10" 
                  name="P10 (Bearish)" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#10B981', strokeWidth: 2 }}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Forecast Data (USD per Day)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">P10 (Bearish)</th>
                  <th className="px-6 py-4 font-medium">P50 (Base Case)</th>
                  <th className="px-6 py-4 font-medium">P90 (Bullish)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {chartData.slice(10, 16).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">
                      {row.rawDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-emerald-600 font-semibold">
                      ${row.p10.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-medium">
                      ${row.p50.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-orange-600 font-semibold">
                      ${row.p90.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>Showing 11 to 15 of 30 entries</span>
            <div className="flex gap-1">
              <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>&lt;</button>
              <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50">1</button>
              <button className="px-3 py-1 bg-slate-900 text-white rounded">2</button>
              <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50">3</button>
              <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50">4</button>
              <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50">&gt;</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
