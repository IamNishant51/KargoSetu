"use client";

import React from "react";
import { ShieldAlert, TrendingUp, TrendingDown } from "lucide-react";
import { useSimulationStore } from "./ExecutiveDashboard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function MarketShockSlider() {
  const { marketShockFactor, setShockFactor } = useSimulationStore();

  const getStatus = () => {
    if (marketShockFactor > 1.5) {
      return {
        label: "Geopolitical Crisis Spike",
        variant: "destructive" as const,
        icon: <TrendingUp className="h-3 w-3" />,
      };
    }
    if (marketShockFactor > 1.2) {
      return {
        label: "Moderate Disruption",
        variant: "warning" as const,
        icon: <ShieldAlert className="h-3 w-3" />,
      };
    }
    return {
      label: "Baseline Market",
      variant: "leaf" as const,
      icon: <TrendingDown className="h-3 w-3" />,
    };
  };

  const status = getStatus();
  const sliderValue = ((marketShockFactor - 1.0) / 1.0) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant={status.variant} className="px-3 py-1">
          {status.icon}
          {status.label}
</Badge>
        <span className="font-display text-2xl font-bold text-navy-900">
          {marketShockFactor.toFixed(2)}×
       </span>
     </div>

      <Progress value={sliderValue} className="h-2" />

      <div>
        <input
          type="range"
          min="1.0"
          max="2.0"
          step="0.05"
          value={marketShockFactor}
          onChange={(e) => setShockFactor(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-navy-900 focus:outline-none focus:ring-2 focus:ring-navy/30"
        />
        <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          <span>Baseline · 1.0×</span>
          <span>Severe Disruption · 2.0×</span>
       </div>
     </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Simulated Scenario
       </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">
          Inject synthetic macro volatility. Watch P90 risk bounds expand
          across all forecast horizons in real-time.
       </p>
     </div>
   </div>
  );
}
