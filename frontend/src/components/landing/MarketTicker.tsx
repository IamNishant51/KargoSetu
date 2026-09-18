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

interface TickerItem {
  symbol?: string;
  value?: string;
  delta?: string;
  price?: number;
  change_pct?: number;
}

export default function MarketTicker() {
  const { data } = useQuery({
    queryKey: ["marketTicker"],
    queryFn: async () => {
      const base =
        "";
      const res = await fetch(`${base}/api/v1/market/ticker`);
      if (!res.ok) throw new Error("ticker");
      return res.json();
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: vessels } = useQuery<{
    vessels?: Array<unknown>;
    mode?: string;
  }>({
    queryKey: ["tickerVessels"],
    queryFn: async () => {
      const base =
        "";
      const res = await fetch(
        `${base}/api/v1/vessels/live?minLon=80&minLat=15&maxLon=95&maxLat=23.5`,
      );
      if (!res.ok) throw new Error("vessels");
      return res.json();
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const { data: corridor } = useQuery<Array<{ name?: string; draft?: string }>>(
    {
      queryKey: ["tickerCorridor"],
      queryFn: async () => {
        const base =
          "";
        const res = await fetch(`${base}/api/v1/ports/corridor`);
        if (!res.ok) throw new Error("corridor");
        return res.json();
      },
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 300000,
    },
  );

  const items: TickerItem[] =
    Array.isArray(data) && data.length ? data.slice(0, 8) : [...FALLBACK];

  // Live items only when feeds answer; otherwise they hide (never fake numbers).
  if (
    vessels &&
    Array.isArray(vessels.vessels) &&
    vessels.mode !== "unavailable"
  ) {
    items.unshift({
      symbol: "BAY TRAFFIC",
      value: `${vessels.vessels.length} vessels`,
      delta: vessels.mode === "demo" ? "demo" : "live",
    });
  }
  if (Array.isArray(corridor) && corridor.length > 0) {
    const haldia = corridor.find((p) => p.name === "Haldia");
    if (haldia?.draft) {
      items.push({
        symbol: "HALDIA MAX",
        value: haldia.draft,
        delta: "corridor",
      });
    }
  }

  return (
    <div
      className="bg-[#0A2342] text-white overflow-hidden select-none"
      aria-label="Harbour telemetry"
    >
      <div className="flex items-stretch">
        <div className="shrink-0 flex items-center gap-2 px-4 sm:px-6 py-2.5 border-r border-white/15 bg-[#D95D0F]">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.16em] uppercase">
            Desk wire
          </span>
        </div>
        <div className="overflow-hidden flex-1 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
          <div className="animate-marquee flex w-max will-change-transform py-2.5 font-mono text-[11.5px] sm:text-[12.5px]">
            {[0, 1, 2, 3].map((copy) => (
              <div
                key={copy}
                aria-hidden={copy > 0 ? "true" : undefined}
                className="flex shrink-0 items-center"
              >
                {items.map((it: TickerItem, i: number) => {
                  const displayValue =
                    it.value ||
                    (it.price !== undefined
                      ? `${it.price.toLocaleString()}`
                      : "N/A");
                  const displayDelta =
                    it.delta ||
                    (it.change_pct !== undefined
                      ? `${it.change_pct > 0 ? "+" : ""}${it.change_pct}%`
                      : "");
                  return (
                    <span
                      key={i}
                      className="flex items-center gap-2 whitespace-nowrap pl-6"
                    >
                      <span className="font-semibold tracking-[0.1em] text-white/60">
                        {it.symbol}
                      </span>
                      <span className="font-semibold text-white">
                        {displayValue}
                      </span>
                      <span className="text-[#F5B98A]">{displayDelta}</span>
                      <span className="ml-6 text-white/25">/</span>
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
