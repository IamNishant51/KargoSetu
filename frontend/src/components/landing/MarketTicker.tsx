"use client";

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TICKER_ITEMS = [
  { symbol: "BDI", name: "Baltic Dry Index", value: "1,948", delta: "+3.2%", isPositive: true },
  { symbol: "BCI", name: "Capesize Index (180k DWT)", value: "3,120", delta: "+4.8%", isPositive: true },
  { symbol: "BPI", name: "Panamax Index (75k DWT)", value: "1,640", delta: "-0.5%", isPositive: false },
  { symbol: "BSI", name: "Supramax Index (58k DWT)", value: "1,320", delta: "+1.1%", isPositive: true },
  { symbol: "VLSFO", name: "Bunker Fuel (Singapore)", value: "$612.50/MT", delta: "-1.2%", isPositive: false },
  { symbol: "HALDIA", name: "Dynamic Riverine Tide", value: "+3.45m", delta: "High Tide", isSpecial: true },
  { symbol: "PARADIP", name: "Permissible Draft", value: "14.50m", delta: "Normal Berthing", isSpecial: true },
  { symbol: "DHAMRA", name: "Deepwater Draft", value: "16.00m", delta: "Capesize Safe", isSpecial: true },
  { symbol: "COA SPREAD", name: "Spot vs 6-Mo Forward", value: "-12.4%", delta: "Optimal CoA Window", isSpecial: true }
];

export default function MarketTicker() {
  return (
    <div className="w-full bg-white text-slate-800 py-3 overflow-hidden border-y border-slate-200/80 shadow-2xs select-none">
      <div className="flex items-center max-w-7xl mx-auto px-4">
        {/* Left Badge */}
        <div className="flex-shrink-0 pr-4 z-10 flex items-center gap-2 border-r border-slate-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap">
            Live Telemetry
          </span>
        </div>

        {/* Marquee Ticker Container */}
        <div className="overflow-hidden flex-1 relative [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          <div className="animate-marquee flex items-center gap-8 pl-4">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs whitespace-nowrap">
                <span className="font-bold text-slate-900 tracking-wide">{item.symbol}</span>
                <span className="text-slate-500 text-[11px] hidden sm:inline">{item.name}:</span>
                <span className="font-mono font-bold text-slate-900">{item.value}</span>
                
                {item.isSpecial ? (
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {item.delta}
                  </span>
                ) : item.isPositive ? (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center border border-emerald-200">
                    <TrendingUp size={11} className="mr-0.5" />
                    {item.delta}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded flex items-center border border-rose-200">
                    <TrendingDown size={11} className="mr-0.5" />
                    {item.delta}
                  </span>
                )}
                
                <span className="text-slate-300 mx-2">&middot;</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
