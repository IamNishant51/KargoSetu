"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, BellRing, CloudLightning, TrendingDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RiskAlertsBanner() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/risk/alerts")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAlerts(data.data);
      })
      .catch(() => {
        setAlerts([
          {
            id: "ALT-01",
            type: "Port Congestion",
            severity: "HIGH",
            title: "Hampton Roads (US) Congestion Spike",
            message:
              "Vessel wait time increased to 3.2 days due to rail unloading bottlenecks. Add +$80,000 demurrage buffer to US coking coal fixtures.",
            timestamp: "12 mins ago",
            icon: "AlertTriangle",
          },
          {
            id: "ALT-02",
            type: "Monsoon Swell",
            severity: "MEDIUM",
            title: "Bay of Bengal Swell Warning (Sandheads)",
            message:
              "Wave heights predicted >2.8m from Sept 14-18. Offshore lighterage barges suspended. Reroute directly to Paradip deep-water berth.",
            timestamp: "45 mins ago",
            icon: "CloudLightning",
          },
          {
            id: "ALT-03",
            type: "Market Opportunity",
            severity: "LOW",
            title: "Capesize Rate Dip Window Triggered",
            message:
              "BDRY forward paper index dropped 4.2%. Recommend SAIL procurement lock 3-6 month CoA for Australia–Paradip within 8 days.",
            timestamp: "2 hours ago",
            icon: "TrendingDown",
          },
        ]);
      });
  }, []);

  const severityMap: Record<string, { badge: any; tint: string; iconColor: string }> = {
    HIGH: {
      badge: "destructive",
      tint: "border-red-200 bg-red-50/50",
      iconColor: "text-red-600",
    },
    MEDIUM: {
      badge: "warning",
      tint: "border-amber-200 bg-amber-50/50",
      iconColor: "text-amber-600",
    },
    LOW: {
      badge: "leaf",
      tint: "border-leaf/20 bg-leaf/5",
      iconColor: "text-leaf-700",
    },
  };

  return (
    <Card>
      <CardHeader className="border-b border-slate-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-saffron/10 text-saffron-700 ring-1 ring-inset ring-saffron/20">
              <BellRing className="h-5 w-5" />
         </div>
            <div>
              <CardTitle>Early Warning & Risk Mitigation</CardTitle>
              <CardDescription className="mt-1">
                Proactive alerts for port congestion, monsoon sea state, and
                market rate dip opportunities.
            </CardDescription>
         </div>
       </div>
          <Badge variant="leaf" className="px-3 py-1.5 self-start">
            <span className="h-1.5 w-1.5 rounded-full bg-leaf animate-pulse-dot" />
            {alerts.length} active alerts
       </Badge>
     </div>
   </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {alerts.map((a) => {
            const s = severityMap[a.severity] || severityMap.LOW;
            return (
              <div
                key={a.id}
                className={`rounded-xl border p-4 transition-all hover:shadow-sm ${s.tint}`}
              >
                <div className="flex items-center justify-between">
                  <Badge variant={s.badge} className="text-[10px] font-mono">
                    {a.severity} RISK
             </Badge>
                  <span className="text-[10px] text-slate-500">
                    {a.timestamp}
             </span>
           </div>

                <div className="mt-3 flex items-start gap-2">
                  <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${s.iconColor}`} />
                  <h4 className="font-display text-sm font-semibold text-navy-900">
                    {a.title}
                 </h4>
               </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {a.message}
               </p>
             </div>
            );
          })}
       </div>
     </CardContent>
   </Card>
  );
}
