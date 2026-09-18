"use client";

import React from "react";
import { Download, Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function ProcurementDecisionBrief() {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleExportJSON = () => {
    const data = {
      executive_recommendation: {
        action:
          "Secure a Short-Term CoA (4 voyages) using Panamax vessels for the Gladstone–Dhamra route.",
        savings: "8.4%",
        window: "next 7 days",
        constraints_cleared: [
          "Dhamra draft (17.5m)",
          "cargo handling capacity",
        ],
      },
      strategy: "Short-Term CoA",
      vessel: "Panamax",
      risk: "Moderate",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "decision-brief.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportMarkdown = () => {
    const md = `# Procurement Decision Brief
## 1. Executive Recommendation
**Recommended Action:** Secure a Short-Term CoA (4 voyages) using Panamax vessels for the Gladstone–Dhamra route.

## 2. Contract Strategy Comparison
- Spot: $2.45M (High risk)
- Short-Term CoA: $2.24M (Moderate risk) - SELECTED
- Medium-Term CoA: $2.18M (Low risk)

## 3. Port & Vessel Feasibility
- Panamax: FEASIBLE
- Capesize: INFEASIBLE (Draft limit)

## 4. Operational Risk Profile
- Market Volatility: Moderate (65%)
- Port Congestion: Low (25%)
`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "decision-brief.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-8 bg-white text-black min-h-screen">
      {/* Header Controls - Hidden in print */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center print:hidden mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Procurement Decision Brief
          </h1>
          <p className="text-slate-500 mt-1" suppressHydrationWarning>
            Generated: {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap space-x-2 space-y-2 md:space-y-0">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print / PDF
          </Button>
          <Button
            onClick={handleExportMarkdown}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> Export MD
          </Button>
          <Button
            onClick={handleExportJSON}
            variant="default"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export JSON
          </Button>
        </div>
      </div>

      <div className="print:block space-y-8">
        {/* Print Header */}
        <div className="hidden print:block border-b-2 border-slate-800 pb-4 mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 uppercase">
            KargoSetu Decision Brief
          </h1>
          <div className="flex justify-between mt-2 text-sm text-slate-600 font-medium">
            <span>Reference: REQ-2026-09-17-A</span>
            <span suppressHydrationWarning>
              Date: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* 1. Executive Recommendation */}
        <section className="border-l-4 border-blue-600 pl-4 py-2 bg-blue-50">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            1. Executive Recommendation
          </h2>
          <p className="text-slate-800 leading-relaxed mb-2 font-medium">
            <strong>Recommended Action:</strong> Secure a Short-Term CoA (4
            voyages) using Panamax vessels for the Gladstone–Dhamra route.
          </p>
          <ul className="list-disc pl-5 text-slate-700 space-y-1">
            <li>
              Expected total freight savings of 8.4% compared to independent
              spot fixtures.
            </li>
            <li>
              Market entry window: Optimal entry is within the next 7 days
              before projected Q4 seasonal volatility.
            </li>
            <li>
              Primary constraints cleared: Dhamra draft (17.5m) and cargo
              handling capacity confirm Panamax suitability.
            </li>
          </ul>
        </section>

        {/* 2. Scenario Comparison Table */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">
            2. Scenario Comparison Table (Base vs Selected Scenario)
          </h2>
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-900 border-b">
                  <tr>
                    <th className="px-4 py-3 font-bold">Strategy</th>
                    <th className="px-4 py-3 font-bold text-right">
                      Est. Total Cost
                    </th>
                    <th className="px-4 py-3 font-bold text-right">
                      Variance Range
                    </th>
                    <th className="px-4 py-3 font-bold">Idle Exposure</th>
                    <th className="px-4 py-3 font-bold">Risk Profile</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-3 font-medium">
                      Spot (4 individual)
                    </td>
                    <td className="px-4 py-3 text-right">$2.45M</td>
                    <td className="px-4 py-3 text-right">± 12.5%</td>
                    <td className="px-4 py-3">High (10-14 days)</td>
                    <td className="px-4 py-3">High Volatility</td>
                  </tr>
                  <tr className="bg-blue-50/50 border-b">
                    <td className="px-4 py-3 font-bold text-blue-700">
                      Short-Term CoA (Selected)
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-blue-700">
                      $2.24M
                    </td>
                    <td className="px-4 py-3 text-right text-blue-700">
                      ± 4.2%
                    </td>
                    <td className="px-4 py-3 text-blue-700">Low (2-4 days)</td>
                    <td className="px-4 py-3 text-blue-700">Moderate</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Medium-Term CoA</td>
                    <td className="px-4 py-3 text-right">$2.18M</td>
                    <td className="px-4 py-3 text-right">± 3.1%</td>
                    <td className="px-4 py-3">Minimal</td>
                    <td className="px-4 py-3">Low (Locked)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* 3. Feasibility Matrix */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">
            3. Feasibility Matrix
          </h2>
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-900 border-b">
                  <tr>
                    <th className="px-4 py-3 font-bold">Vessel Class</th>
                    <th className="px-4 py-3 font-bold">Gladstone (Origin)</th>
                    <th className="px-4 py-3 font-bold">Dhamra (Dest)</th>
                    <th className="px-4 py-3 font-bold">Cargo Match</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-3 font-medium">Capesize</td>
                    <td className="px-4 py-3 text-green-600">
                      PASS (Draft OK)
                    </td>
                    <td className="px-4 py-3 text-red-600">
                      FAIL (Draft 17.5m limit)
                    </td>
                    <td className="px-4 py-3 text-green-600">PASS</td>
                    <td className="px-4 py-3 font-bold text-red-600">
                      INFEASIBLE
                    </td>
                  </tr>
                  <tr className="bg-green-50/50 border-b">
                    <td className="px-4 py-3 font-bold text-green-700">
                      Panamax
                    </td>
                    <td className="px-4 py-3 text-green-600">PASS</td>
                    <td className="px-4 py-3 text-green-600">
                      PASS (Draft 14.2m)
                    </td>
                    <td className="px-4 py-3 text-green-600">
                      PASS (75,000 MT)
                    </td>
                    <td className="px-4 py-3 font-bold text-green-600">
                      FEASIBLE
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Supramax</td>
                    <td className="px-4 py-3 text-green-600">PASS</td>
                    <td className="px-4 py-3 text-green-600">PASS</td>
                    <td className="px-4 py-3 text-amber-600">
                      WARN (Needs 2 voyages)
                    </td>
                    <td className="px-4 py-3 font-bold text-amber-600">
                      SUB-OPTIMAL
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* 4. Risk Profile */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">
            4. Risk Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-slate-800">
                  Market Volatility
                </CardTitle>
                <CardDescription>BDI Trend Analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className="bg-amber-500 h-2.5 rounded-full"
                      style={{ width: "65%" }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-amber-700">
                    Moderate (65%)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Upward pressure expected in next 30 days due to seasonal coal
                  demand.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-slate-800">
                  Port Congestion (Dhamra)
                </CardTitle>
                <CardDescription>Current Wait Times</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{ width: "25%" }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-green-700">
                    Low (25%)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Turnaround times averaging 1.8 days. No severe berthing
                  delays.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 5. AI Justification & Provenance */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">
            5. AI Justification
          </h2>
          <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 text-sm text-slate-700 space-y-3">
            <p>
              <strong>Copilot Analysis:</strong> The recommendation to lock in a
              4-voyage Short-Term CoA with a Panamax vessel minimizes total
              logistics costs while avoiding the high variance of the spot
              market during upcoming Q4 volatility. Capesize vessels were
              automatically excluded by the constraint engine due to destination
              draft restrictions.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
              <div>
                <span className="block font-semibold text-slate-700 mb-1">
                  Models Used
                </span>
                <ul className="space-y-1">
                  <li>
                    Freight Forecast: <code>freight-v1.4</code>
                  </li>
                  <li>
                    Optimization: <code>milp-solver-v2</code>
                  </li>
                </ul>
              </div>
              <div>
                <span className="block font-semibold text-slate-700 mb-1">
                  Data Freshness
                </span>
                <ul className="space-y-1">
                  <li suppressHydrationWarning>
                    Market Data: {new Date().toISOString().split("T")[0]} 08:00
                    UTC
                  </li>
                  <li>Port Constraints: Registry v2026-09</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Sign-off Blocks */}
        <section className="pt-12 mt-12 border-t-2 border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="border-b border-slate-400 h-16 mb-2"></div>
              <p className="font-bold text-slate-800 text-sm">
                Prepared By (Analyst)
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Date: _________________
              </p>
            </div>
            <div className="text-center">
              <div className="border-b border-slate-400 h-16 mb-2"></div>
              <p className="font-bold text-slate-800 text-sm">
                Reviewed By (Procurement Mgr)
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Date: _________________
              </p>
            </div>
            <div className="text-center">
              <div className="border-b border-slate-400 h-16 mb-2"></div>
              <p className="font-bold text-slate-800 text-sm">
                Approved By (Director)
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Date: _________________
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
