"use client";

import React, { useState } from "react";
import { Globe, MapPin, Navigation, Anchor, Leaf } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ROUTES = [
  {
    id: "route-1",
    name: "Newcastle → Paradip",
    longName: "Australia (Newcastle) → Paradip (Odisha)",
    origin: "Newcastle, AU",
    originCoords: "151.78°W",
    destination: "Paradip, IN",
    destinationCoords: "86.70°E",
    distanceNm: 5850,
    sailingDays: 19.5,
    commodity: "Coking Coal · SAIL Steel Plants",
    suitableVessels: "Capesize (150k DWT) / Panamax",
    carbonEmissionsMt: 2550.4,
  },
  {
    id: "route-2",
    name: "Hampton Roads → Vizag",
    longName: "USA (Hampton Roads) → Vizag (Andhra Pradesh)",
    origin: "Hampton Roads, US",
    originCoords: "76.29°W",
    destination: "Visakhapatnam, IN",
    destinationCoords: "83.30°E",
    distanceNm: 9450,
    sailingDays: 31.5,
    commodity: "High-Grade Coking Coal",
    suitableVessels: "Capesize / Panamax",
    carbonEmissionsMt: 4120.0,
  },
  {
    id: "route-3",
    name: "Maputo → Haldia",
    longName: "Mozambique (Maputo) → Haldia (West Bengal)",
    origin: "Maputo, MZ",
    originCoords: "32.57°E",
    destination: "Haldia (via Sandheads), IN",
    destinationCoords: "88.06°E",
    distanceNm: 4150,
    sailingDays: 13.8,
    commodity: "Coking Coal",
    suitableVessels: "Transshipment + Supramax Shuttle",
    carbonEmissionsMt: 1810.2,
  },
  {
    id: "route-4",
    name: "Taboneo → Dhamra",
    longName: "Indonesia (Taboneo) → Dhamra (Odisha)",
    origin: "Taboneo, ID",
    originCoords: "114.50°E",
    destination: "Dhamra, IN",
    destinationCoords: "86.86°E",
    distanceNm: 2100,
    sailingDays: 7.0,
    commodity: "Thermal Coal · NTPC Power",
    suitableVessels: "Panamax / Supramax",
    carbonEmissionsMt: 915.0,
  },
];

export default function TradeRouteMap() {
  const [selectedRoute, setSelectedRoute] = useState(ROUTES[0]);

  return (
    <Card>
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sea/10 text-sea-700 ring-1 ring-inset ring-sea/20">
            <Globe className="h-5 w-5" />
       </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>Overseas Trade Lanes</CardTitle>
              <Badge variant="saffron" className="text-[10px]">
                SIH 26006
         </Badge>
       </div>
            <CardDescription className="mt-1">
              Bulk cargo corridors connecting Australia, USA, Mozambique,
              Russia & Indonesia to East Coast India ports.
        </CardDescription>
     </div>
     </div>
   </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Route visualization */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
          <div className="absolute inset-0 bg-grid-slate opacity-50" />
          <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            {/* Origin */}
            <div className="flex flex-col items-start gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sea/10 text-sea-700 ring-1 ring-inset ring-sea/20">
                  <MapPin className="h-3.5 w-3.5" />
         </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Origin
          </span>
       </div>
              <p className="font-display text-lg font-bold text-navy-900">
                {selectedRoute.origin}
       </p>
              <p className="font-mono text-xs text-slate-500">
                {selectedRoute.originCoords}
       </p>
           </div>

            {/* Transit arrow */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-4 py-2">
                <Navigation className="h-3.5 w-3.5 text-saffron-700" />
                <span className="font-mono text-xs font-semibold text-saffron-700">
                  {selectedRoute.distanceNm.toLocaleString()} NM
         </span>
             </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {selectedRoute.sailingDays} days
       </div>
              <div className="hidden h-px w-32 bg-slate-200 lg:block</div>
           " />

            {/* Destination */}
            <div className="flex flex-col items-start gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:items-end lg:text-right">
              <div className="flex items-center gap-2 lg:flex-row-reverse">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-leaf/10 text-leaf-700 ring-1 ring-inset ring-leaf/20">
                  <Anchor className="h-3.5 w-3.5" />
           </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Destination
            </span>
         </div>
              <p className="font-display text-lg font-bold text-navy-900">
                {selectedRoute.destination}
       </p>
              <p className="font-mono text-xs text-slate-500">
                {selectedRoute.destinationCoords}
       </p>
           </div>
     </div>

          {/* Route metrics */}
          <div className="relative mt-6 grid grid-cols-2 gap-3 border-t border-slate-200 pt-6 md:grid-cols-4">
            <RouteMetric label="Distance" value={`${selectedRoute.distanceNm.toLocaleString()} NM`} accent="sea" />
            <RouteMetric label="Transit Time" value={`${selectedRoute.sailingDays} days`} accent="saffron" />
            <RouteMetric label="Suitable Fleet" value={selectedRoute.suitableVessels} accent="leaf" />
            <RouteMetric
              label="CO₂ Footprint"
              value={`${selectedRoute.carbonEmissionsMt.toLocaleString()} MT`}
              accent="warning"
              icon={<Leaf className="h-3 w-3" />}
            />
         </div>
       </div>

        {/* Route selector */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ROUTES.map((r) => {
            const active = selectedRoute.id === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRoute(r)}
                className={`group rounded-xl border p-4 text-left transition-all ${
                  active
                    ? "border-navy-900 bg-navy-900 text-white shadow-md ring-2 ring-navy-900/10"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <p
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    active ? "text-saffron-300" : "text-slate-500"
                  }`}
                >
                  Trade Lane
               </p>
                <p
                  className={`mt-1.5 font-display text-sm font-semibold ${
                    active ? "text-white" : "text-navy-900"
                  }`}
                >
                  {r.name}
               </p>
                <p
                  className={`mt-1 font-mono text-[11px] ${
                    active ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {r.distanceNm.toLocaleString()} NM · {r.sailingDays}d
               </p>
                <p
                  className={`mt-2 text-[11px] ${
                    active ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {r.commodity}
               </p>
             </button>
            );
          })}
       </div>
     </CardContent>
   </Card>
  );
}

function RouteMetric({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent: "sea" | "saffron" | "leaf" | "warning";
  icon?: React.ReactNode;
}) {
  const accentMap = {
    sea: "text-sea-700",
    saffron: "text-saffron-700",
    leaf: "text-leaf-700",
    warning: "text-amber-700",
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
        {icon}
        {label}
     </p>
      <p className={`mt-1 font-display text-sm font-bold ${accentMap[accent]}`}>
        {value}
     </p>
   </div>
  );
}
