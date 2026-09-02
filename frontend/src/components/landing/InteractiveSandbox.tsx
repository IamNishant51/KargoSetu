"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Sparkles, 
  Layers, 
  Info, 
  IndianRupee,
  Ship,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function InteractiveSandbox() {
  const [activeTab, setActiveTab] = useState<'constraint' | 'forecast' | 'roi'>('constraint');

  // Tab 1 State: Constraint Solver
  const [volume, setVolume] = useState<number>(150000);
  const [port, setPort] = useState<string>('Haldia');
  const [commodity, setCommodity] = useState<string>('Coking Coal');

  // React Query Mutation for Constraint Solver
  const evaluateMutation = useMutation({
    mutationFn: async (data: { volume_mt: number; dest_port_name: string; commodity: string }) => {
      const res = await fetch('http://localhost:3001/api/v1/requisitions/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    },
  });

  useEffect(() => {
    evaluateMutation.mutate({ volume_mt: volume, dest_port_name: port, commodity });
  }, [volume, port, commodity]);


  // Tab 2 State: ML Forecast
  const [shockMultiplier, setShockMultiplier] = useState<number>(1.2);

  // React Query for ML Forecast
  const { data: forecastData, isLoading: forecastLoading } = useQuery({
    queryKey: ['forecastRates', shockMultiplier],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3001/api/v1/forecast/rates?shockMultiplier=${shockMultiplier}`);
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    },
  });


  // Tab 3 State: ROI Calculator
  const [annualTonnage, setAnnualTonnage] = useState<number>(3.5); // Million MT
  const [spotRate, setSpotRate] = useState<number>(22); // USD per MT

  // Port definitions
  const PORT_DATA: Record<string, { draft: number; type: string; tide: number; maxVessel: string }> = {
    'Haldia': { draft: 7.5, type: 'Riverine Port (Hooghly)', tide: 3.2, maxVessel: 'Supramax (50k DWT)' },
    'Paradip': { draft: 14.5, type: 'Deepwater Coastal', tide: 1.8, maxVessel: 'Panamax / Baby Cape' },
    'Dhamra': { draft: 16.0, type: 'Deep Sea Bulk Terminal', tide: 2.1, maxVessel: 'Capesize (180k DWT)' },
    'Visakhapatnam': { draft: 14.5, type: 'Natural Harbour', tide: 1.5, maxVessel: 'Panamax' },
  };

  const currentPortInfo = PORT_DATA[port] || PORT_DATA['Haldia'];

  // Deterministic thousands separator to prevent SSR/CSR locale hydration mismatches
  const formatNum = (val: number) => Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Constraint calculation logic from API
  const isDirectFeasible = evaluateMutation.data ? evaluateMutation.data.feasible : (volume <= 55000 || (port === 'Dhamra' && volume <= 180000) || (port === 'Paradip' && volume <= 85000));
  const splitRequired = !isDirectFeasible;
  const numVessels = evaluateMutation.data?.total_vessels || (splitRequired ? Math.ceil(volume / 50000) : 1);
  const vesselClass = evaluateMutation.data?.vessel_class || (splitRequired ? 'Supramax' : (volume > 100000 ? 'Capesize' : volume > 55000 ? 'Panamax' : 'Supramax'));
  const arrivalDraft = evaluateMutation.data?.calculatedDraft || (splitRequired ? 6.9 : (volume > 100000 ? 18.2 : volume > 55000 ? 12.8 : 7.1));
  const clearanceMargin = evaluateMutation.data?.clearance_margin || (currentPortInfo.draft + currentPortInfo.tide - Number(arrivalDraft)).toFixed(2);


  // ML Forecast calculation from API
  let baseRate = 18650;
  let p10 = Math.round(baseRate * (0.84 * shockMultiplier));
  let p50 = Math.round(baseRate * (1.02 * shockMultiplier));
  let p90 = Math.round(baseRate * (1.28 * shockMultiplier));

  if (forecastData && Array.isArray(forecastData) && forecastData.length > 0) {
    baseRate = forecastData[0].p50;
    
    interface ForecastDay {
      p10: number;
      p50: number;
      p90: number;
    }
    
    // Calculate average over the forecast period
    p10 = Math.round(forecastData.reduce((acc: number, val: ForecastDay) => acc + val.p10, 0) / forecastData.length);
    p50 = Math.round(forecastData.reduce((acc: number, val: ForecastDay) => acc + val.p50, 0) / forecastData.length);
    p90 = Math.round(forecastData.reduce((acc: number, val: ForecastDay) => acc + val.p90, 0) / forecastData.length);
  }
  
  const dipSavings = Math.round(((p90 - p10) / p90) * 100);


  // ROI calculation
  const annualSpendUSD = annualTonnage * 1000000 * spotRate;
  const estimatedSavingsUSD = annualSpendUSD * 0.115; // 11.5% average savings
  const annualSavingsINR_Cr = ((estimatedSavingsUSD * 86.5) / 10000000).toFixed(1);
  const demurrageSavedDays = Math.round(annualTonnage * 4.2);
  const demurrageSavingsUSD = demurrageSavedDays * 25000;
  const demurrageSavingsINR_Cr = ((demurrageSavingsUSD * 86.5) / 10000000).toFixed(1);
  const co2AvoidedMT = Math.round(annualTonnage * 3200);

  return (
    <section id="sandbox" className="py-20 sm:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles size={13} />
            Interactive Intelligence Sandbox
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">
            Test KargoSetu Algorithms Live
          </h2>
          <p className="text-slate-500 text-base sm:text-lg">
            Experience our hydrodynamic constraint solver, auto-regressive LSTM forecaster, and PSU financial ROI models in real-time.
          </p>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 max-w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab('constraint')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'constraint'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Ship size={16} className={activeTab === 'constraint' ? 'text-[#EA580C]' : 'text-slate-400'} />
              <span>1. Port Constraint & Cargo Splitter</span>
            </button>

            <button
              onClick={() => setActiveTab('forecast')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'forecast'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp size={16} className={activeTab === 'forecast' ? 'text-blue-600' : 'text-slate-400'} />
              <span>2. ML 90-Day Rate Forecaster</span>
            </button>

            <button
              onClick={() => setActiveTab('roi')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'roi'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <IndianRupee size={16} className={activeTab === 'roi' ? 'text-emerald-600' : 'text-slate-400'} />
              <span>3. SAIL / PSU Savings Calculator</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Port Constraint & Cargo Splitter */}
        {activeTab === 'constraint' && (
          <div className="bg-[#F8FAFC] rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Controls Form */}
              <div className="lg:col-span-5 space-y-5 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-base">Requisition Parameters</h3>
                  <span className="text-xs text-slate-400 font-medium">SIH 26006 Problem Engine</span>
                </div>

                {/* Cargo Volume Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cargo Volume</label>
                    <span suppressHydrationWarning className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md text-sm">
                      {formatNum(volume)} MT
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30000"
                    max="200000"
                    step="5000"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#EA580C]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>30k MT (Supramax)</span>
                    <span>75k MT (Panamax)</span>
                    <span>200k MT (Capesize)</span>
                  </div>
                </div>

                {/* Destination Port Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Destination Port (East Coast India)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(PORT_DATA).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPort(p)}
                        className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer ${
                          port === p
                            ? 'bg-orange-50 text-orange-950 border-orange-300 ring-1 ring-orange-300 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold">{p}</div>
                        <div className={`text-[10px] ${port === p ? 'text-orange-700' : 'text-slate-400'}`}>
                          Draft: {PORT_DATA[p].draft}m
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Commodity Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Commodity
                  </label>
                  <select
                    value={commodity}
                    onChange={(e) => setCommodity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                  >
                    <option value="Coking Coal">Coking Coal (Bulk Dry)</option>
                    <option value="Iron Ore">Iron Ore (Heavy Bulk)</option>
                    <option value="Thermal Coal">Thermal Coal (Power Grade)</option>
                    <option value="Limestone">Limestone (Flux Stone)</option>
                  </select>
                </div>
              </div>

              {/* Right Output Engine Card - Clean Light Theme */}
              <div className="lg:col-span-7 bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200/90 space-y-6">
                
                {/* Feasibility Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                      Hydrodynamic Feasibility Status
                    </span>
                    <div className="flex items-center gap-2">
                      {evaluateMutation.isPending ? (
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-lg animate-pulse">
                          <span>Evaluating Constraints...</span>
                        </div>
                      ) : isDirectFeasible ? (
                        <div className="flex items-center gap-2 text-emerald-700 font-bold text-lg">
                          <CheckCircle2 size={22} className="text-emerald-600" />
                          <span>Direct Berthing Feasible</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-700 font-bold text-lg">
                          <AlertTriangle size={22} className="text-amber-600" />
                          <span>Direct Berthing Exceeds Draft &middot; Split Required</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Recommended Strategy</span>
                    <span className="text-sm font-bold text-[#EA580C] font-mono">
                      {evaluateMutation.isPending ? 'Calculating...' : evaluateMutation.data?.strategy || (splitRequired ? `Split into ${numVessels}x ${vesselClass}` : `Direct 1x ${vesselClass}`)}
                    </span>
                  </div>
                </div>

                {/* Physics Diagnostics Metric Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Port Draft</span>
                    <span className="text-lg font-bold text-slate-900 font-mono">{currentPortInfo.draft}m</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{currentPortInfo.type}</span>
                  </div>

                  <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 uppercase font-semibold block mb-1">Dynamic Tide</span>
                    <span className="text-lg font-bold text-emerald-700 font-mono">+{currentPortInfo.tide}m</span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">Open-Meteo High</span>
                  </div>

                  <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
                    <span className="text-[10px] text-amber-800 uppercase font-semibold block mb-1">Vessel Draft</span>
                    <span className="text-lg font-bold text-amber-900 font-mono">{arrivalDraft}m</span>
                    <span className="text-[10px] text-amber-700 block mt-0.5">{vesselClass} Laden</span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">UKC Clearance</span>
                    <span className={`text-lg font-bold font-mono ${Number(clearanceMargin) >= 1.0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {clearanceMargin}m
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Under Keel</span>
                  </div>
                </div>

                {/* Smart Split Recommendation Box */}
                <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 text-sm space-y-2">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                    <Layers size={14} className="text-[#EA580C]" />
                    <span>Algorithmic Optimization Details</span>
                  </div>
                  
                  {splitRequired ? (
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed" suppressHydrationWarning>
                      A single {volume > 100000 ? 'Capesize' : 'Panamax'} vessel carrying {formatNum(volume)} MT requires an arrival draft of {arrivalDraft}m, dangerously exceeding {port}&apos;s permissible draft ({currentPortInfo.draft}m). KargoSetu automatically splits this fixture into <strong className="text-slate-900">{numVessels}x Supramax</strong> vessels (approx. {formatNum(volume / numVessels)} MT each) routed via the Sandheads offshore lighterage zone, preserving Under Keel Clearance and preventing <strong className="text-emerald-700 font-bold">$35,000/day in grounding demurrage</strong>.
                    </p>
                  ) : (
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      Direct berthing approved. The vessel arrival draft of {arrivalDraft}m safely complies with {port}&apos;s permissible channel depth of {currentPortInfo.draft}m (+{currentPortInfo.tide}m tidal window). Under Keel Clearance (UKC) margin of {clearanceMargin}m satisfies Director General of Shipping (DGS) safety mandates.
                    </p>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Tab 2: ML Freight Forecaster */}
        {activeTab === 'forecast' && (
          <div className="bg-[#F8FAFC] rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Shock Multiplier Control */}
              <div className="lg:col-span-5 space-y-6 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-base">What-If Market Shock Engine</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Stress-test Baltic Dry volatility and geopolitical risk</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Shock Multiplier</label>
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md text-sm border border-blue-200">
                      {shockMultiplier.toFixed(1)}x Volatility
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={shockMultiplier}
                    onChange={(e) => setShockMultiplier(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>0.5x (Calm Trade)</span>
                    <span>1.0x (Historical)</span>
                    <span>2.5x (Severe Shock)</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Info size={14} className="text-blue-600" />
                    <span>Multi-Horizon Quantile Model (LSTM)</span>
                  </div>
                  <p className="leading-relaxed">
                    Trained on historical BDRY and Baltic Capesize fixtures. Computes 30, 60, and 90-day probabilistic quantile bounds (P10, P50, P90) to detect optimal Contracts of Affreightment (CoA) booking windows.
                  </p>
                </div>
              </div>

              {/* Right Output Chart Simulation - Clean Light Theme */}
              <div className="lg:col-span-7 bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200/90 space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                      90-Day Forward Rate Projection
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 font-mono" suppressHydrationWarning>
                      {forecastLoading ? 'Loading forecast...' : `Spot Rate: $${formatNum(baseRate)} / Day`}
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                    Dip Window Detected
                  </span>
                </div>

                {/* Probabilistic Quantile Boxes */}
                <div className="grid grid-cols-3 gap-3">
                  <div className={`bg-slate-50 p-4 rounded-xl border border-slate-200 border-t-4 border-t-emerald-500 text-center ${forecastLoading ? 'animate-pulse' : ''}`}>
                    <div className="text-[11px] text-slate-500 font-semibold uppercase mb-1">P10 (Optimistic)</div>
                    <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900" suppressHydrationWarning>${forecastLoading ? '---' : formatNum(p10)}</div>
                    <div className="text-[10px] text-emerald-700 font-medium mt-1">Best Entry Window</div>
                  </div>

                  <div className={`bg-slate-50 p-4 rounded-xl border border-slate-200 border-t-4 border-t-blue-500 text-center ${forecastLoading ? 'animate-pulse' : ''}`}>
                    <div className="text-[11px] text-slate-500 font-semibold uppercase mb-1">P50 (Median Base)</div>
                    <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900" suppressHydrationWarning>${forecastLoading ? '---' : formatNum(p50)}</div>
                    <div className="text-[10px] text-blue-700 font-medium mt-1">Projected Median</div>
                  </div>

                  <div className={`bg-slate-50 p-4 rounded-xl border border-slate-200 border-t-4 border-t-rose-500 text-center ${forecastLoading ? 'animate-pulse' : ''}`}>
                    <div className="text-[11px] text-slate-500 font-semibold uppercase mb-1">P90 (Pessimistic)</div>
                    <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900" suppressHydrationWarning>${forecastLoading ? '---' : formatNum(p90)}</div>
                    <div className="text-[10px] text-rose-700 font-medium mt-1">Spot Ceiling Risk</div>
                  </div>
                </div>

                {/* Recommendation Notice */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs sm:text-sm text-blue-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-blue-800">
                    <TrendingUp size={15} />
                    <span>Executive Fixture Recommendation</span>
                  </div>
                  <p className="leading-relaxed">
                    Historical quantile dip projected in Week 3–4. Securing a <strong className="text-blue-950 font-bold">6-Month Contract of Affreightment (CoA)</strong> now mitigates a potential {dipSavings}% rate spike, locking in price stability for upcoming coking coal shipments.
                  </p>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Tab 3: SAIL / PSU ROI Calculator */}
        {activeTab === 'roi' && (
          <div className="bg-[#F8FAFC] rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Parameters Form */}
              <div className="lg:col-span-5 space-y-5 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-base">PSU Procurement Baseline</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Tailored for SAIL, RINL, NMDC, and NTPC Dry Bulk Logistics</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Annual Seaborne Volume</label>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md text-sm border border-emerald-200">
                      {annualTonnage.toFixed(1)} Million MT
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.5"
                    value={annualTonnage}
                    onChange={(e) => setAnnualTonnage(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>1.0M MT</span>
                    <span>5.0M MT</span>
                    <span>10.0M MT</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Average Spot Ocean Freight</label>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md text-sm">
                      ${spotRate} / MT
                    </span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="35"
                    step="1"
                    value={spotRate}
                    onChange={(e) => setSpotRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>$12/MT</span>
                    <span>$22/MT</span>
                    <span>$35/MT</span>
                  </div>
                </div>
              </div>

              {/* Right Monetary Impact Output - Clean Light Theme */}
              <div className="lg:col-span-7 bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200/90 space-y-6">
                
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    Total Estimated Annual Cost Avoidance
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700 font-mono">
                    ₹{annualSavingsINR_Cr} Crores / Year
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Direct freight optimization via CoA timing & split logistics</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Demurrage Saved</span>
                    <span className="text-lg font-bold text-amber-800 font-mono">₹{demurrageSavingsINR_Cr} Cr</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{demurrageSavedDays} vessel days saved</span>
                  </div>

                  <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 uppercase font-semibold block mb-1">Grounding Incidents</span>
                    <span className="text-lg font-bold text-emerald-700 font-mono">0 Incidents</span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">100% UKC compliance</span>
                  </div>

                  <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200">
                    <span className="text-[10px] text-blue-800 uppercase font-semibold block mb-1">CO2 Reduction</span>
                    <span className="text-lg font-bold text-blue-700 font-mono" suppressHydrationWarning>{formatNum(co2AvoidedMT)} MT</span>
                    <span className="text-[10px] text-blue-600 block mt-0.5">IMO EEXI green fleet</span>
                  </div>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs sm:text-sm text-emerald-900">
                  <span className="font-bold block mb-1 text-emerald-800">SIH 26006 Value Proposition</span>
                  KargoSetu transforms dry bulk shipping from a volatile spot expenditure into a highly predictable, mathematically shielded procurement pipeline for the Ministry of Steel.
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
