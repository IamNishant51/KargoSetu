import React from "react";
import ExplainableRiskWidget from "@/components/ExplainableRiskWidget";

export default function RiskEnginePage() {
  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-display font-black text-[#0A2342] tracking-tight">
            Explainable Risk Engine
          </h1>
          <p className="text-[16px] text-[#3D4F68] mt-2 max-w-2xl leading-relaxed">
            Simulate and evaluate multi-factor risks for maritime contracts. Run Monte Carlo scenarios against live market, weather, and port constraints.
          </p>
        </div>

        <ExplainableRiskWidget />
      </div>
    </div>
  );
}
