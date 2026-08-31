"use client";

import React, { useState } from "react";
import { create } from "zustand";
import MarketShockSlider from "./MarketShockSlider";
import ForecastPriceChart from "./ForecastPriceChart";
import ConstraintSolverCard from "./ConstraintSolverCard";
import ContractStrategyCard from "./ContractStrategyCard";
import IdleFleetManager from "./IdleFleetManager";
import RiskAlertsBanner from "./RiskAlertsBanner";
import TradeRouteMap from "./TradeRouteMap";

import {
  TrendingUp,
  ShieldAlert,
  DollarSign,
  Activity,
  Ship,
  Award,
  Compass,
  Globe,
  BarChart3,
  Cpu,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-6 animate-fade-in">
      {/* Hero intro */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="absolute inset-0 bg-grid-slate opacity-60" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-gradient-to-br from-saffron/10 via-sea/10 to-leaf/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="saffron" className="text-[10px]">
                Executive Command Center
            </Badge>
              <Badge variant="outline" className="font-mono text-[10px]">
                Q3 CY 2026
            </Badge>
          </div>
            <h1 className="text-2xl font-bold tracking-tight text-navy-900 lg:text-3xl">
              Freight intelligence for{" "}
              <span className="relative inline-block">
                <span className="relative z-10">predictive</span>
                <span className="absolute inset-x-0 bottom-1 h-2 bg-saffron/30" />
              </span>{" "}
              chartering.
          </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Move from daily spot fixtures to ML-timed multi-voyage CoA
              contracts. Reduce demurrage, lock rate dips, and match every
              cargo to the right vessel at the right port.
          </p>
        </div>
          <div className="flex items-center gap-2 self-start lg:self-center">
            <Badge variant="success" className="px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-leaf animate-pulse-dot" />
              Models Live
          </Badge>
            <Badge variant="sea" className="px-3 py-1.5 font-mono">
              <Cpu className="h-3 w-3" /> XGBoost P10/P50/P90
          </Badge>
        </div>
      </div>
    </div>

      <RiskAlertsBanner />

      <Tabs defaultValue="forecast" className="w-full">
        <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <TabsList className="h-auto flex-wrap justify-start bg-white p-1 ring-1 ring-slate-200 shadow-sm">
            <TabsTrigger value="forecast" className="text-sm">
              <BarChart3 className="h-4 w-4" /> Forecast
          </TabsTrigger>
            <TabsTrigger value="optimizer" className="text-sm">
              <Ship className="h-4 w-4" /> Optimizer
          </TabsTrigger>
            <TabsTrigger value="strategy" className="text-sm">
              <Award className="h-4 w-4" /> CoA Savings
          </TabsTrigger>
            <TabsTrigger value="idle" className="text-sm">
              <Compass className="h-4 w-4" /> Idle Fleet
          </TabsTrigger>
            <TabsTrigger value="routes" className="text-sm">
              <Globe className="h-4 w-4" /> Trade Routes
          </TabsTrigger>
        </TabsList>
          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
            <span className="flex h-1.5 w-1.5 rounded-full bg-saffron animate-pulse-dot" />
            Live decisioning · refreshed every 15 minutes
        </div>
      </div>

        <TabsContent value="forecast" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="BDRY Freight Index"
              value="$18.42"
              delta="+2.4%"
              deltaTone="success"
              icon={<Activity className="h-4 w-4" />}
              accent="sea"
              caption="Source · yfinance BDRY ETF"
            />
            <KpiCard
              label="SAIL Annual CoA Savings"
              value="₹ 35.28 Cr"
              delta="14.2% discount"
              deltaTone="success"
              icon={<DollarSign className="h-4 w-4" />}
              accent="leaf"
              caption="$4.2M saved vs. spot"
            />
            <KpiCard
              label="Optimal Entry Window"
              value="Sep 12 — 19"
              delta="88% confidence"
              deltaTone="sea"
              icon={<TrendingUp className="h-4 w-4" />}
              accent="saffron"
              caption="Lock 6-month CoA"
            />
            <KpiCard
              label="Risk Multiplier"
              value={`${shockFactor.toFixed(2)}×`}
              delta="P90 spread"
              deltaTone={shockFactor > 1.2 ? "warning" : "success"}
              icon={<ShieldAlert className="h-4 w-4" />}
              accent={shockFactor > 1.2 ? "warning" : "sea"}
              caption="Geopolitical stress factor"
            />
        </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2 overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-navy-900">
                      90-Day Freight Rate Forecast
                  </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Quantile XGBoost multi-horizon bounds — P10 optimistic,
                      P50 median, P90 pessimistic.
                  </p>
                </div>
                  <Badge variant="sea" className="font-mono">
                    Australia → Paradip
                </Badge>
              </div>
                <ForecastPriceChart shockFactor={shockFactor} />
            </CardContent>
          </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-5 border-b border-slate-100 pb-4">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-navy-900">
                    <ShieldAlert className="h-5 w-5 text-saffron" />{" "}
                    Scenario Stress Test
                </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Inject a geopolitical shock to see P90 risk expand in
                    real-time.
                </p>
              </div>
                <MarketShockSlider />
            </CardContent>
          </Card>
        </div>

          <ConstraintSolverCard />
      </TabsContent>

        <TabsContent value="optimizer" className="mt-6">
          <ConstraintSolverCard />
      </TabsContent>

        <TabsContent value="strategy" className="mt-6">
          <ContractStrategyCard />
      </TabsContent>

        <TabsContent value="idle" className="mt-6">
          <IdleFleetManager />
      </TabsContent>

        <TabsContent value="routes" className="mt-6">
          <TradeRouteMap />
      </TabsContent>
    </Tabs>
  </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  delta: string;
  deltaTone: "success" | "sea" | "warning" | "destructive";
  icon: React.ReactNode;
  accent: "saffron" | "sea" | "leaf" | "warning";
  caption: string;
}

function KpiCard({
  label,
  value,
  delta,
  deltaTone,
  icon,
  accent,
  caption,
}: KpiCardProps) {
  const accentMap: Record<string, string> = {
    saffron: "bg-saffron/10 text-saffron-700 ring-saffron/20",
    sea: "bg-sea/10 text-sea-700 ring-sea/20",
    leaf: "bg-leaf/10 text-leaf-700 ring-leaf/20",
    warning: "bg-amber-50 text-amber-700 ring-amber-200",
  };

  const deltaMap: Record<string, string> = {
    leaf: "bg-leaf/10 text-leaf-700 ring-leaf/20",
    sea: "bg-sea/10 text-sea-700 ring-sea/20",
    warning: "bg-amber-50 text-amber-700 ring-amber-200",
    destructive: "bg-red-50 text-red-700 ring-red-200",
  };

  return (
    <Card className="group transition-all hover:shadow-md hover:border-slate-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-inset ${accentMap[accent]}`}
          >
            {icon}
        </div>
          <Badge variant={deltaTone} className="font-mono text-[10px]">
            {delta}
        </Badge>
      </div>
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {label}
        </p>
          <p className="mt-1.5 font-display text-2xl font-bold tracking-tight text-navy-900">
            {value}
        </p>
          <p className="mt-1 text-[11px] text-slate-500">{caption}</p>
      </div>
    </CardContent>
  </Card>
  );
}
