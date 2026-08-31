"use client";

import React, { useState } from "react";
import {
  Navigation,
  Compass,
  AlertCircle,
  RotateCw,
  TrendingDown,
  Ship,
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

export default function IdleFleetManager() {
  const [vesselClass, setVesselClass] = useState("Capesize");
  const [location, setLocation] = useState("Paradip Outer Anchorage");
  const [idleDays, setIdleDays] = useState(14);

  const dailyCostUsd =
    vesselClass === "Capesize"
      ? 25000
      : vesselClass === "Panamax"
      ? 15000
      : 12000;
  const totalPotentialLossUsd = dailyCostUsd * idleDays;
  const totalPotentialLossInrCr = (totalPotentialLossUsd * 84.0) / 10000000.0;

  const optionACostRecoveredUsd = totalPotentialLossUsd * 0.82;
  const optionACostRecoveredInrCr = (optionACostRecoveredUsd * 84.0) / 10000000.0;

  const optionBCostRecoveredUsd = totalPotentialLossUsd * 0.94;
  const optionBCostRecoveredInrCr = (optionBCostRecoveredUsd * 84.0) / 10000000.0;

  return (
    <Card>
      <CardHeader className="border-b border-slate-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-saffron/10 text-saffron-700 ring-1 ring-inset ring-saffron/20">
              <Compass className="h-5 w-5" />
          </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>Idle Scenario & Positioning Manager</CardTitle>
                <Badge variant="saffron" className="text-[10px]">
                  SIH 26006
            </Badge>
          </div>
              <CardDescription className="mt-1">
                Triangular repositioning & coastal sub-charters to cut
                deadheading and recover vessel idle loss.
             </CardDescription>
      </div>
    </div>
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              Idle Risk Burn
        </p>
            <p className="font-mono text-base font-bold text-red-700">
              ${dailyCostUsd.toLocaleString()}/day
        </p>
      </div>
  </div>
</CardHeader>

      <CardContent className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Vessel Class</Label>
            <Select value={vesselClass} onValueChange={setVesselClass}>
              <SelectTrigger>
                <SelectValue />
            </SelectTrigger>
              <SelectContent>
                <SelectItem value="Capesize">Capesize · 150,000 DWT</SelectItem>
                <SelectItem value="Panamax">Panamax · 75,000 DWT</SelectItem>
                <SelectItem value="Supramax">Supramax · 50,000 DWT</SelectItem>
            </SelectContent>
          </Select>
        </div>

          <div className="space-y-1.5">
            <Label>Current Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Paradip Outer Anchorage"
            />
      </div>

          <div className="space-y-1.5">
            <Label>Projected Idle Days</Label>
            <Input
              type="number"
              value={idleDays}
              onChange={(e) => setIdleDays(Number(e.target.value))}
              className="font-mono font-semibold text-amber-700"
            />
    </div>
  </div>

        {/* Loss banner */}
        <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white ring-1 ring-inset ring-red-200">
              <AlertCircle className="h-5 w-5 text-red-600" />
      </div>
            <div>
              <p className="text-sm font-semibold text-navy-900">
                Projected unmitigated idle loss
        </p>
              <p className="text-xs text-slate-600">
                {idleDays} days idle at berth/anchorage without cargo
                employment.
        </p>
      </div>
    </div>
          <div className="text-left sm:text-right">
            <p className="font-display text-2xl font-bold text-red-700">
              ₹ {totalPotentialLossInrCr.toFixed(2)} Cr
      </p>
            <p className="text-[10px] text-slate-500">
              ${totalPotentialLossUsd.toLocaleString()} USD
      </p>
    </div>
  </div>

        {/* Two strategies */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Strategy 1 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-sea/40 hover:shadow-sm">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sea/10 text-sea-700 ring-1 ring-inset ring-sea/20">
                  <Navigation className="h-4 w-4" />
        </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Strategy 1
        </p>
                  <h3 className="font-display text-base font-semibold text-navy-900">
                    Triangular Voyage
        </h3>
        </div>
        </div>
                <Badge variant="success">82% recovered</Badge>
      </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Reposition the empty bulk carrier to Maputo (Mozambique) or
              Gladstone (Australia) for coking coal loading instead of
              waiting idle in the Bay of Bengal.
      </p>

            <div className="mt-4 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Cost Recovered</span>
                <span className="font-mono font-bold text-leaf-700">
                  ₹ {optionACostRecoveredInrCr.toFixed(2)} Cr
                  <span className="ml-1 text-[10px] font-normal text-slate-500">
                    (${(optionACostRecoveredUsd / 1000).toFixed(0)}k)
                 </span>
        </span>
      </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Deadhead Reduction</span>
                <span className="font-mono font-semibold text-navy-900">
                  −2,400 NM
        </span>
      </div>
        </div>
      </div>

          {/* Strategy 2 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-saffron/40 hover:shadow-sm">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-saffron/10 text-saffron-700 ring-1 ring-inset ring-saffron/20">
                  <RotateCw className="h-4 w-4" />
        </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Strategy 2
        </p>
                  <h3 className="font-display text-base font-semibold text-navy-900">
                    Coastal Shuttle
        </h3>
        </div>
        </div>
                <Badge variant="success">94% recovered</Badge>
      </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Deploy Panamax/Supramax on Paradip–Vizag coastal thermal coal
              movement for NTPC during the international import lull.
      </p>

            <div className="mt-4 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Cost Recovered</span>
                <span className="font-mono font-bold text-leaf-700">
                  ₹ {optionBCostRecoveredInrCr.toFixed(2)} Cr
                  <span className="ml-1 text-[10px] font-normal text-slate-500">
                    (${(optionBCostRecoveredUsd / 1000).toFixed(0)}k)
                 </span>
        </span>
      </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Fleet Utilization</span>
                <span className="font-mono font-semibold text-navy-900">
                  100% Active
        </span>
      </div>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
  );
}
