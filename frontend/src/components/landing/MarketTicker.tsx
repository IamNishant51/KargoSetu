"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";

const FALLBACK = [
  { symbol: "BDI", value: "1,842", delta: "+2.1%" },
  { symbol: "BCI CAPESIZE", value: "$18,650/d", delta: "+1.4%" },
  { symbol: "HALDIA TIDE", value: "+3.2 m", delta: "HW 14:20" },
  { symbol: "SANDHEADS", value: "22 m+", delta: "Open" },
  { symbol: "VLSFO", value: "$612/t", delta: "-0.8%" },
];

export default function MarketTicker() {
  const { data } = useQuery({
    queryKey: ["marketTicker"],
    queryFn: async () => {
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${base}/api/v1/market/ticker`);
      if (!res.ok) throw new Error("ticker");
      return res.json();
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const items = Array.isArray(data) && data.length ? data.slice(0, 8) : FALLBACK;

  return (
    <div className="bg-[#0A2342] text-white overflow-hidden select-none" aria-label="Harbour telemetry">
      <div className="flex items-stretch">
        <div className="shrink-0 flex items-center gap-2 px-4 sm:px-6 py-2.5 border-r border-white/15 bg-[#D95D0F]">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.16em] uppercase">Desk wire</span>
        </div>
        <div className="overflow-hidden flex-1 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
          <div className="animate-marquee flex w-max will-change-transform py-2.5 font-mono text-[11.5px] sm:text-[12.5px]">
            {[0, 1, 2, 3].map((copy) => (
              <div key={copy} aria-hidden={copy > 0} className="flex shrink-0 items-center">
                {items.map((it: { symbol: string; value: string; delta: string }, i: number) => (
                  <span key={i} className="flex items-center gap-2 whitespace-nowrap pl-6">
                    <span className="font-semibold tracking-[0.1em] text-white/60">{it.symbol}</span>
                    <span className="font-semibold text-white">{it.value}</span>
                    <span className="text-[#F5B98A]">{it.delta}</span>
                    <span className="ml-6 text-white/25">/</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
