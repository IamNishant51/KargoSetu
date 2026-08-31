"use client";

import React, { useState } from "react";
import {
  DollarSign,
  Award,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
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
import { Separator } from "@/components/ui/separator";

export default function ContractStrategyCard() {
  const [annualVolume, setAnnualVolume] = useState(1200000);
  const [currentSpotRate, setCurrentSpotRate] = useState(24.5);

  const spotTotalAnnualUsd = annualVolume * currentSpotRate;
  const shortTermRateUsd = currentSpotRate * 0.935;
  const shortTermTotalAnnualUsd = annualVolume * shortTermRateUsd;
  const shortTermSavingsUsd = spotTotalAnnualUsd - shortTermTotalAnnualUsd;
  const shortTermSavingsInrCr = (shortTermSavingsUsd * 84.0) / 10000000.0;

  const coaRateUsd = currentSpotRate * 0.858;
  const coaTotalAnnualUsd = annualVolume * coaRateUsd;
  const coaSavingsUsd = spotTotalAnnualUsd - coaTotalAnnualUsd;
  const coaSavingsInrCr = (coaSavingsUsd * 84.0) / 10000000.0;

  return (
    <Card>
      <CardHeader className="border-b border-slate-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-leaf/10 text-leaf-700 ring-1 ring-inset ring-leaf/20">
              <Award className="h-5 w-5" />
          </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>Contract Strategy & CoA Savings</CardTitle>
                <Badge variant="saffron" className="text-[10px]">
                  SIH 26006
            </Badge>
          </div>
              <CardDescription className="mt-1">
                Transition SAIL from daily spot fixtures to ML-timed 3-6
                month multi-voyage Contracts of Affreightment.
             </CardDescription>
      </div>
    </div>
          <div className="rounded-lg border border-leaf/20 bg-leaf/5 px-4 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              Annual Savings Potential
        </p>
            <p className="font-display text-xl font-bold text-leaf-700">
              ₹ {coaSavingsInrCr.toFixed(2)} Cr
        </p>
      </div>
  </div>
</CardHeader>

      <CardContent className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>SAIL Annual Procurement (MT</Label>
            <Input
              type="number"
              step={100000}
              value={annualVolume}
              onChange={(e) => setAnnualVolume(Number(e.target.value))}
              className="font-mono"
            />
      </div>
          <div className="space-y-1.5">
            <Label>Baseline Spot Rate ($/ton</Label>
            <Input
              type="number"
              step={0.5}
              value={currentSpotRate}
              onChange={(e) => setCurrentSpotRate(Number(e.target.value))}
              className="font-mono font-semibold text-leaf-700"
            />
    </div>
  </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Option A — Spot */}
          <StrategyCard
            tier="Option A"
            label="Daily Spot Market"
            tone="destructive"
            rate={currentSpotRate}
            rateLabel="Average Rate"
            total={spotTotalAnnualUsd}
            annualLabel="Total Annual Spend"
            badge="High Volatility"
            icon={<DollarSign className="h-4 w-4" />}
            risks={[
              "Subject to daily price spikes ($5,000/day variance)",
              "High demurrage exposure during port congestion",
            ]}
          />

          {/* Option B — Short-term */}
          <StrategyCard
            tier="Option B"
            label="Short-Term Charter (3–6 mo)"
            tone="sea"
            rate={shortTermRateUsd}
            rateLabel="Negotiated Rate"
            total={shortTermTotalAnnualUsd}
            annualLabel="Estimated Annual Savings"
            annualValue={`₹ ${shortTermSavingsInrCr.toFixed(2)} Cr`}
            badge="Balanced Risk"
            icon={<ArrowRight className="h-4 w-4" />}
            benefits={[
              "Smooths 60-day freight volatility",
              "Guarantees vessel availability during monsoon",
            ]}
          />

          {/* Option C — CoA (RECOMMENDED) */}
          <div className="relative">
            <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-saffron to-leaf text-white shadow-md">
                <Sparkles className="h-3 w-3" /> SIH Recommended
            </Badge>
      </div>
            <StrategyCard
              tier="Option C"
              label="Multi-Voyage CoA (1–2 yr)"
              tone="leaf"
              rate={coaRateUsd}
              rateLabel="Optimized Forward Rate"
              rateSize="xl"
              total={coaTotalAnnualUsd}
              annualLabel="Total Annual Savings"
              annualValue={`₹ ${coaSavingsInrCr.toFixed(2)} Cr`}
              annualSize="lg"
              badge="Maximum Savings"
              icon={<Award className="h-4 w-4" />}
              benefits={[
                "14.2% rate discount via AI dip timing",
                "Zero berth-waiting penalty guaranteed",
              ]}
              highlighted
            />
    </div>
  </div>
  </CardContent>
</Card>
  );
}

interface StrategyCardProps {
  tier: string;
  label: string;
  tone: "destructive" | "sea" | "leaf";
  rate: number;
  rateLabel: string;
  rateSize?: "sm" | "md" | "xl";
  total: number;
  annualLabel: string;
  annualValue?: string;
  annualSize?: "sm" | "md" | "lg";
  badge: string;
  icon: React.ReactNode;
  risks?: string[];
  benefits?: string[];
  highlighted?: boolean;
}

function StrategyCard({
  tier,
  label,
  tone,
  rate,
  rateLabel,
  rateSize = "md",
  total,
  annualLabel,
  annualValue,
  annualSize = "sm",
  badge,
  icon,
  risks,
  benefits,
  highlighted = false,
}: StrategyCardProps) {
  const toneMap = {
    destructive: {
      bg: "bg-red-50",
      text: "text-red-700",
      ring: "ring-red-200",
    },
    sea: {
      bg: "bg-sea/10",
      text: "text-sea-700",
      ring: "ring-sea/20",
    },
    leaf: {
      bg: "bg-leaf/10",
      text: "text-leaf-700",
      ring: "ring-leaf/20",
    },
  };

  const rateSizeClass = {
    sm: "text-xl",
    md: "text-2xl",
    xl: "text-3xl",
  }[rateSize];

  const annualSizeClass = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  }[annualSize];

  return (
    <div
      className={`relative flex h-full flex-col rounded-xl border bg-white p-5 transition-all ${
        highlighted
          ? "border-leaf/40 shadow-lg ring-1 ring-inset ring-leaf/20"
          : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-md ring-1 ring-inset ${toneMap[tone].bg} ${toneMap[tone].text} ${toneMap[tone].ring}`}
          >
            {icon}
  </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {tier}
  </span>
  </div>
        <Badge variant="outline" className="text-[10px]">
          {badge}
  </Badge>
  </div>

      <div className="mt-4">
        <h3 className="font-display text-base font-semibold text-navy-900">
          {label}
  </h3>

        <div className="mt-4 space-y-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {rateLabel}
        </p>
            <p
              className={`mt-0.5 font-display font-bold ${rateSizeClass} text-navy-900`}
            >
              ${rate.toFixed(2)}{" "}
              <span className="text-sm font-normal text-slate-500">/ ton</span>
        </p>
      </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {annualLabel}
        </p>
            {annualValue ? (
              <p
                className={`mt-0.5 font-display font-bold ${annualSizeClass} text-leaf-700`}
              >
                {annualValue}
        </p>
            ) : (
              <p className="mt-0.5 font-display text-lg font-bold text-slate-700">
                ${(total / 1000000).toFixed(2)}M
        </p>
            )}
      </div>
  </div>
  </div>

      {(risks || benefits) && (
        <>
          <Separator className="my-4" />
          <ul className="space-y-2">
            {(risks || benefits || []).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                {risks ? (
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-leaf-600" />
                )}
                <span className="text-slate-600">{item}</span>
             </li>
            ))}
         </ul>
        </>
      )}
   </div>
  );
}
