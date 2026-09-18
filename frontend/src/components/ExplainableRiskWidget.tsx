"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ShieldCheck, Activity, Info, BarChart3, Wind, Anchor, Database } from "lucide-react";

interface RiskFactor {
  score: number;
  level: string;
  explanation: string;
  contributors: string[];
}

interface DecisionRisk {
  overall_score: number;
  overall_level: string;
  market_risk: RiskFactor;
  port_risk: RiskFactor;
  weather_risk: RiskFactor;
  operational_risk: RiskFactor;
  data_quality_risk: RiskFactor;
  model_uncertainty_risk: RiskFactor;
  provenance: Record<string, string>;
  timestamp: string;
}

export default function ExplainableRiskWidget() {
  const [params, setParams] = useState({
    origin_port: "INHAL",
    destination_port: "INVTZ",
    vessel_class: "Panamax",
    contract_horizon_days: 30,
    forecast_confidence: 0.8,
    market_volatility: 0.2,
    port_congestion_origin: 1.0,
    port_congestion_destination: 1.0,
    weather_hazard_score: 0.1,
    data_freshness_hours: 1.0,
    provider_failure: false,
    missing_data: false,
  });

  const {
    data: riskData,
    isLoading,
    refetch,
    isError
  } = useQuery<DecisionRisk>({
    queryKey: ["risk-evaluation", params],
    queryFn: async () => {
      const apiUrl = "";

      const payload = {
        ...params,
        laycan_start: new Date(Date.now() + 10 * 86400000).toISOString(),
        laycan_end: new Date(Date.now() + 20 * 86400000).toISOString(),
      };

      const res = await fetch(`${apiUrl}/api/v1/risks/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to evaluate risk");
      return res.json();
    },
    retry: 0,
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "LOW":
        return "bg-[#E6F4EA] text-[#0E7A3D] border-[#CEEAD6]";
      case "MEDIUM":
        return "bg-[#FEF7E0] text-[#B45309] border-[#FDE293]";
      case "HIGH":
        return "bg-[#FCE8E6] text-[#C5221F] border-[#FAD2CF]";
      case "CRITICAL":
        return "bg-[#FCE8E6] text-[#A50E0E] border-[#FAD2CF] font-bold";
      default:
        return "bg-gray-100 text-[#3D4F68] border-gray-200";
    }
  };

  const getIcon = (name: string) => {
    if (name.includes("Market")) return <BarChart3 size={18} />;
    if (name.includes("Port") || name.includes("Operational")) return <Anchor size={18} />;
    if (name.includes("Weather")) return <Wind size={18} />;
    if (name.includes("Data") || name.includes("Model")) return <Database size={18} />;
    return <Activity size={18} />;
  }

  const renderFactor = (name: string, factor: RiskFactor | undefined) => {
    if (!factor) return null;
    return (
      <div className={`p-5 rounded-2xl border ${getLevelColor(factor.level)} transition-all duration-200 hover:shadow-md`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="opacity-80">{getIcon(name)}</span>
            <h3 className="font-semibold tracking-tight text-[15px]">{name}</h3>
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] font-bold px-2.5 py-1 rounded-full bg-white/50">
            {factor.level} ({(factor.score * 100).toFixed(0)}%)
          </span>
        </div>
        <p className="text-[14px] leading-relaxed opacity-90 mb-3">{factor.explanation}</p>
        {factor.contributors.length > 0 && (
          <div className="mt-3 pt-3 border-t border-black/5">
            <ul className="text-[13px] space-y-1.5 opacity-80">
              {factor.contributors.map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 w-1 h-1 rounded-full bg-current shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Parameters Form */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#E2E6EB]">
        <div className="flex items-center gap-3 mb-6 border-b border-[#E2E6EB] pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F1] flex items-center justify-center text-[#D95D0F]">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-[#0A2342]">Simulation Parameters</h2>
            <p className="text-sm text-[#6B7D99]">Adjust stress factors to re-evaluate voyage exposure</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { label: "Contract Horizon (Days)", key: "contract_horizon_days", type: "number", step: "1" },
            { label: "Market Volatility (0-1)", key: "market_volatility", type: "number", step: "0.1" },
            { label: "Origin Congestion (Days)", key: "port_congestion_origin", type: "number", step: "0.5" },
            { label: "Dest Congestion (Days)", key: "port_congestion_destination", type: "number", step: "0.5" },
            { label: "Forecast Confidence (0-1)", key: "forecast_confidence", type: "number", step: "0.1" },
            { label: "Data Freshness (Hours)", key: "data_freshness_hours", type: "number", step: "1" },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-[12px] font-mono uppercase tracking-[0.08em] text-[#3D4F68] mb-1.5">
                {field.label}
              </label>
              <input
                type={field.type}
                step={field.step}
                className="block w-full rounded-xl border-[#E2E6EB] shadow-sm focus:border-[#D95D0F] focus:ring focus:ring-[#D95D0F]/20 sm:text-[15px] p-2.5 border transition-all text-[#0A2342] font-medium bg-[#FAF7F1]/50"
                value={params[field.key as keyof typeof params] as number}
                onChange={(e) => setParams({ ...params, [field.key]: Number(e.target.value) })}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-4 sm:gap-6 bg-[#FAF7F1] p-4 rounded-xl border border-[#E2E6EB]">
          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-[#E2E6EB] text-[#D95D0F] shadow-sm focus:border-[#D95D0F] focus:ring focus:ring-[#D95D0F]/20 cursor-pointer"
              checked={params.provider_failure}
              onChange={(e) => setParams({ ...params, provider_failure: e.target.checked })}
            />
            <span className="ml-3 text-[14px] font-semibold text-[#0A2342] group-hover:text-[#D95D0F] transition-colors">
              Simulate Provider Failure
            </span>
          </label>
          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-[#E2E6EB] text-[#D95D0F] shadow-sm focus:border-[#D95D0F] focus:ring focus:ring-[#D95D0F]/20 cursor-pointer"
              checked={params.missing_data}
              onChange={(e) => setParams({ ...params, missing_data: e.target.checked })}
            />
            <span className="ml-3 text-[14px] font-semibold text-[#0A2342] group-hover:text-[#D95D0F] transition-colors">
              Simulate Missing Data
            </span>
          </label>
        </div>

        <div className="mt-6">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A2342] px-6 py-3.5 text-[15px] font-bold text-white hover:bg-[#14315C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_3px_0_#051528]"
          >
            {isLoading ? "Running Simulations..." : "Evaluate Risk"}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-[#6B7D99] bg-white rounded-2xl border border-[#E2E6EB] border-dashed">
          <div className="w-8 h-8 border-4 border-[#D95D0F] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-mono text-sm tracking-wide">Crunching 1,000+ Monte Carlo scenarios...</p>
        </div>
      ) : isError ? (
        <div className="p-6 rounded-2xl border-2 border-red-200 bg-red-50 text-red-700 flex items-start gap-3">
           <AlertTriangle className="shrink-0 mt-0.5" />
           <div>
             <h3 className="font-bold">Evaluation Failed</h3>
             <p className="text-sm mt-1">The backend could not process the risk evaluation. Ensure the Hugging Face space is fully synchronized with the latest codebase.</p>
           </div>
        </div>
      ) : riskData ? (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div
            className={`relative overflow-hidden p-6 sm:p-8 rounded-2xl border-2 ${
              riskData.overall_level === "CRITICAL"
                ? "border-red-500 bg-red-50 text-red-900"
                : riskData.overall_level === "HIGH"
                  ? "border-[#D95D0F] bg-[#FAF7F1] text-[#0A2342]"
                  : riskData.overall_level === "MEDIUM"
                    ? "border-[#FDE293] bg-[#FEF7E0] text-[#B45309]"
                    : "border-[#0E7A3D] bg-[#E6F4EA] text-[#0E7A3D]"
            }`}
          >
            <div className="relative z-10">
              <p className="font-mono text-[11px] sm:text-[13px] uppercase tracking-[0.14em] opacity-80 mb-2">
                Overall Decision Risk
              </p>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-4">
                <h2 className="text-4xl sm:text-5xl font-display font-black tracking-tight">
                  {riskData.overall_level}
                </h2>
                <span className="text-lg sm:text-xl font-medium opacity-80">
                  Score: {(riskData.overall_score * 100).toFixed(1)} / 100
                </span>
              </div>
              <div className="flex items-center gap-2 text-[12px] sm:text-[13px] opacity-75 font-mono">
                <Info size={14} />
                <span>Evaluated at {new Date(riskData.timestamp).toLocaleString()} • Model: {riskData.provenance?.version}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {renderFactor("Market Exposure", riskData.market_risk)}
            {renderFactor("Port Constraints", riskData.port_risk)}
            {renderFactor("Meteorological", riskData.weather_risk)}
            {renderFactor("Operational", riskData.operational_risk)}
            {renderFactor("Data Integrity", riskData.data_quality_risk)}
            {renderFactor("Model Uncertainty", riskData.model_uncertainty_risk)}
          </div>
        </div>
      ) : null}
    </div>
  );
}
