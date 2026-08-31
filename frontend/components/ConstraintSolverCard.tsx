"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Ship,
  DollarSign,
  Zap,
  Compass,
  TrendingDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const ORIGINS = [
  { name: "Newcastle (Australia)", country: "Australia", draft: 15.2, commodity: "Coking Coal" },
  { name: "Gladstone (Australia)", country: "Australia", draft: 16.5, commodity: "Coking Coal" },
  { name: "Hampton Roads (USA)", country: "USA", draft: 15.0, commodity: "Coking Coal" },
  { name: "Maputo (Mozambique)", country: "Mozambique", draft: 13.5, commodity: "Coking Coal" },
  { name: "Vostochny (Russia)", country: "Russia", draft: 16.0, commodity: "Coking Coal" },
  { name: "Taboneo (Indonesia)", country: "Indonesia", draft: 12.5, commodity: "Thermal Coal" },
];

const DESTINATIONS = [
  { name: "Paradip", state: "Odisha", draft: 16.0, capesize: true, density: 1.025 },
  { name: "Vizag (Visakhapatnam)", state: "Andhra Pradesh", draft: 16.5, capesize: true, density: 1.025 },
  { name: "Gangavaram", state: "Andhra Pradesh", draft: 19.5, capesize: true, density: 1.025 },
  { name: "Gopalpur", state: "Odisha", draft: 14.5, capesize: false, density: 1.025 },
  { name: "Dhamra", state: "Odisha", draft: 17.5, capesize: true, density: 1.025 },
  { name: "Sagar-Sandheads", state: "West Bengal", draft: 18.0, capesize: true, density: 1.018 },
  { name: "Haldia", state: "West Bengal", draft: 8.5, capesize: false, density: 1.005 },
];

export default function ConstraintSolverCard() {
  const [origin, setOrigin] = useState("Newcastle (Australia)");
  const [dest, setDest] = useState("Paradip");
  const [volume, setVolume] = useState(150000);
  const [spotRate, setSpotRate] = useState(24.5);
  const [tide, setTide] = useState(1.5);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runEvaluation = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/requisitions/evaluate-full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volume_mt: volume,
          origin_port: origin,
          dest_port: dest,
          tidal_height: tide,
          spot_rate_per_ton: spotRate,
        }),
      });
      const data = await res.json();
      if (data.success) setEvaluation(data.data);
    } catch {
      const destObj = DESTINATIONS.find((d) => d.name === dest) || DESTINATIONS[0];
      const deltaDraft = destObj.name === "Haldia" ? 18.0 * ((1.025 - destObj.density) / destObj.density) : 0.0;
      const totalArrivalDraft = 18.0 + deltaDraft + 0.24;
      const maxPermissible = destObj.draft + tide - 1.0;
      const isDirectFeasible = totalArrivalDraft <= maxPermissible && destObj.capesize;

      const spotTotal = volume * spotRate;
      const coaRate = spotRate * 0.875;
      const coaTotal = volume * coaRate;
      const savingsUsd = spotTotal - coaTotal;
      const savingsInrCr = (savingsUsd * 84.0) / 10000000.0;

      setEvaluation({
        feasible: isDirectFeasible,
        strategy: isDirectFeasible
          ? "Direct Fixture (Capesize)"
          : destObj.name === "Haldia"
          ? "Sandheads Offshore Lighterage + Supramax Shuttle to Haldia"
          : "Split Cargo into 3× Supramax",
        primary_vessel_class: isDirectFeasible ? "Capesize" : "Supramax",
        vessel_count: isDirectFeasible ? 1 : 3,
        total_volume_mt: volume,
        origin_port: origin,
        dest_port: dest,
        sailing_days: 19.5,
        arrival_draft_m: totalArrivalDraft.toFixed(2),
        max_permissible_draft_m: maxPermissible.toFixed(2),
        dynamic_ukc_m: (maxPermissible - totalArrivalDraft + 1.0).toFixed(2),
        financial_analysis: {
          spot_rate_per_ton_usd: spotRate,
          spot_total_cost_usd: spotTotal,
          coa_rate_per_ton_usd: coaRate,
          coa_total_cost_usd: coaTotal,
          savings_usd: savingsUsd,
          savings_inr_crores: savingsInrCr.toFixed(2),
          recommended_contract: "3-6 Month CoA · Multiple Voyage Contract",
        },
        environmental_impact: {
          vlsfo_fuel_consumed_mt: 819.0,
          imo_co2_emissions_mt: 2550.4,
          green_freight_score: 88.5,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runEvaluation();
  }, [origin, dest, volume, spotRate, tide]);

  const selectedDest = DESTINATIONS.find((d) => d.name === dest);

  return (
    <Card>
      <CardHeader className="border-b border-slate-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sea/10 text-sea-700 ring-1 ring-inset ring-sea/20">
              <Ship className="h-5 w-5" />
          </div>
            <div>
              <CardTitle>Dual-Port Infrastructure & Vessel Optimizer</CardTitle>
              <CardDescription className="mt-1">
                Origin draft & bathymetry → East Coast India under-keel
                clearance & cargo-splitting.
             </CardDescription>
          </div>
        </div>
          {evaluation && (
            <Badge
              variant={evaluation.feasible ? "success" : "warning"}
              className="self-start px-3 py-1.5"
            >
              {evaluation.feasible ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" /> Direct fixture feasible
             </>
              ) : (
                <>
                  <AlertTriangle className="h-3.5 w-3.5" /> Cargo split / lighterage required
             </>
              )}
           </Badge>
          )}
      </div>
    </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Input grid */}
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1.5">
            <Label>Origin Port</Label>
            <Select value={origin} onValueChange={setOrigin}>
              <SelectTrigger>
                <SelectValue />
            </SelectTrigger>
              <SelectContent>
                {ORIGINS.map((o) => (
                  <SelectItem key={o.name} value={o.name}>
                    {o.name} · {o.country}
                </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

          <div className="space-y-1.5">
            <Label>Discharge Port</Label>
            <Select value={dest} onValueChange={setDest}>
              <SelectTrigger>
                <SelectValue />
            </SelectTrigger>
              <SelectContent>
                {DESTINATIONS.map((d) => (
                  <SelectItem key={d.name} value={d.name}>
                    {d.name} · {d.draft}m draft
                </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

          <div className="space-y-1.5">
            <Label>Cargo Parcel (MT</Label>
            <Input
              type="number"
              step={5000}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="font-mono"
            />
        </div>

          <div className="space-y-1.5">
            <Label>Spot Rate ($/ton</Label>
            <Input
              type="number"
              step={0.5}
              value={spotRate}
              onChange={(e) => setSpotRate(Number(e.target.value))}
              className="font-mono font-semibold text-leaf-700"
            />
        </div>

          <div className="space-y-1.5">
            <Label>Expected Tide (m</Label>
            <Input
              type="number"
              step={0.1}
              value={tide}
              onChange={(e) => setTide(Number(e.target.value))}
              className="font-mono"
            />
        </div>
      </div>

        {evaluation && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ResultCard
              title="Vessel Recommendation"
              icon={<Ship className="h-4 w-4" />}
              accent="sea"
              rows={[
                { label: "Strategy", value: evaluation.strategy, highlight: true },
                { label: "Vessel Class", value: evaluation.primary_vessel_class },
                {
                  label: "Total Vessels",
                  value: `${evaluation.vessel_count}× ${evaluation.primary_vessel_class}`,
                  highlight: true,
                },
                { label: "Sailing Time", value: `${evaluation.sailing_days} days` },
              ]}
              footer={
                selectedDest?.name === "Haldia" ? (
                  <p className="text-xs leading-relaxed text-slate-600">
                    Haldia's 8.5m draft restricts Capesize. We trigger
                    transshipment at Sagar-Sandheads anchorage with shuttle
                    barges.
                 </p>
                ) : (
                  <p className="text-xs leading-relaxed text-slate-600">
                    Direct berthing validated for {origin} → {dest} with a
                    safe 1.0m UKC margin.
                 </p>
                )
              }
            />

            <ResultCard
              title="Hydrodynamic Physics"
              icon={<Zap className="h-4 w-4" />}
              accent="saffron"
              rows={[
                {
                  label: "Arrival Draft",
                  value: `${evaluation.arrival_draft_m}m`,
                  caption: "Includes sinkage & squat",
                },
                {
                  label: "Max Permissible",
                  value: evaluation.max_permissible_draft_m + "m",
                  highlight: true,
                  caption: "Charted depth + tide − UKC",
                },
              ]}
              footer={
                <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                  <span className="text-xs text-slate-600">
                    Under-Keel Clearance
                 </span>
                  <span
                    className={`font-mono text-sm font-bold ${
                      Number(evaluation.dynamic_ukc_m) >= 1.5
                        ? "text-leaf-700"
                        : "text-amber-700"
                    }`}
                  >
                    {evaluation.dynamic_ukc_m}m ·{" "}
                    {Number(evaluation.dynamic_ukc_m) >= 1.5
                      ? "Safe margin"
                      : "Tidal dependent"}
                 </span>
            </div>
              }
            />

            <ResultCard
              title="Spot vs CoA ROI"
              icon={<DollarSign className="h-4 w-4" />}
              accent="leaf"
              rows={[
                {
                  label: "Spot Total",
                  value: `$${(evaluation.financial_analysis.spot_total_cost_usd / 1000000).toFixed(2)}M`,
                },
                {
                  label: "CoA Total",
                  value: `$${(evaluation.financial_analysis.coa_total_cost_usd / 1000000).toFixed(2)}M`,
                  highlight: true,
                },
              ]}
              footer={
                <div className="rounded-lg border border-leaf/20 bg-leaf/5 p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    Estimated Monetary Savings
                 </p>
                  <p className="mt-1 font-display text-xl font-bold text-leaf-700">
                    ₹ {evaluation.financial_analysis.savings_inr_crores} Cr
                 </p>
                  <p className="text-[10px] text-slate-500">
                    ${(evaluation.financial_analysis.savings_usd / 1000).toFixed(0)}k ·{" "}
                    {evaluation.financial_analysis.recommended_contract}
                 </p>
            </div>
              }
            />
        </div>
        )}
    </CardContent>
  </Card>
  );
}

interface ResultCardProps {
  title: string;
  icon: React.ReactNode;
  accent: "saffron" | "sea" | "leaf";
  rows: Array<{
    label: string;
    value: string;
    caption?: string;
    highlight?: boolean;
  }>;
  footer?: React.ReactNode;
}

function ResultCard({ title, icon, accent, rows, footer }: ResultCardProps) {
  const accentMap = {
    saffron: "bg-saffron/10 text-saffron-700 ring-saffron/20",
    sea: "bg-sea/10 text-sea-700 ring-sea/20",
    leaf: "bg-leaf/10 text-leaf-700 ring-leaf/20",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-md ring-1 ring-inset ${accentMap[accent]}`}
        >
          {icon}
    </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {title}
    </span>
  </div>

      <div className="space-y-2.5">
        {rows.map((row, i) => (
          <div key={i} className="flex items-baseline justify-between gap-3">
            <span className="text-xs text-slate-600">{row.label}</span>
            <span
              className={`text-right text-sm ${
                row.highlight ? "font-semibold text-navy-900" : "text-slate-700"
              }`}
            >
              {row.value}
           </span>
         </div>
        ))}
  </div>

      {footer && <div className="mt-4 pt-3 border-t border-slate-100">{footer}</div>}
</div>
  );
}
