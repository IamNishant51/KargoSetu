import React from "react";
import ExplainableRiskWidget from "@/components/ExplainableRiskWidget";

export default function RiskEnginePage() {
  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Explainable Risk Engine
          </h1>
          <p className="text-slate-600 mt-1">
            Simulate and evaluate multi-factor risks for maritime contracts.
          </p>
        </div>

        <ExplainableRiskWidget />
      </div>
    </div>
  );
}
