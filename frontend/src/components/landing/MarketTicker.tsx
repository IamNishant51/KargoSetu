"use client";

import React from 'react';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type TickerItem = {
  symbol: string;
  name: string;
  value: string;
  delta: string;
  isPositive?: boolean;
  isSpecial?: boolean;
};

export default function MarketTicker() {
  const { data: tickerItems = [], isLoading, isError } = useQuery({
    queryKey: ['marketTicker'],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await axios.get(`${baseUrl}/api/v1/market/ticker`);
      return res.data as TickerItem[];
    }
  });

  return (
    <div className="w-full bg-white text-slate-800 py-3 overflow-hidden border-y border-slate-200/80 shadow-2xs select-none">
      <div className="flex items-center max-w-7xl mx-auto px-4">
        {/* Left Badge */}
        <div className="flex-shrink-0 pr-4 z-10 flex items-center gap-2 border-r border-slate-200">
          <span className="relative flex h-2 w-2">
            
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap">
            Live Telemetry
          </span>
        </div>

        {/* Marquee Ticker Container */}
        <div className="overflow-hidden flex-1 relative [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-slate-500 text-xs font-semibold gap-2">
              <Loader2 className="animate-spin w-4 h-4" /> Loading market data...
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center h-full text-rose-500 text-xs font-semibold">
              Failed to load market data
            </div>
          ) : (
            <div className="animate-marquee flex items-center gap-8 pl-4">
              {[...tickerItems, ...tickerItems].map((item, idx) => (
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
          )}
        </div>
      </div>
    </div>
  );
}
