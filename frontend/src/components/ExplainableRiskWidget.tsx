"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

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
  } = useQuery<DecisionRisk>({
    queryKey: ["risk-evaluation", params],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const renderFactor = (name: string, factor: RiskFactor | undefined) => {
    if (!factor) return null;
    return (
      <div className={`p-4 rounded-lg border ${getLevelColor(factor.level)}`}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold">{name}</h3>
          <span className="text-sm font-bold">
            {factor.level} ({(factor.score * 100).toFixed(0)}%)
          </span>
        </div>
        <p className="text-sm opacity-90 mb-2">{factor.explanation}</p>
        {factor.contributors.length > 0 && (
          <ul className="text-sm list-disc pl-4 space-y-1">
            {factor.contributors.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Risk Evaluation Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contract Horizon (Days)
            </label>
            <input
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              value={params.contract_horizon_days}
              onChange={(e) =>
                setParams({
                  ...params,
                  contract_horizon_days: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Market Volatility (0-1)
            </label>
            <input
              type="number"
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              value={params.market_volatility}
              onChange={(e) =>
                setParams({
                  ...params,
                  market_volatility: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Origin Congestion (Days)
            </label>
            <input
              type="number"
              step="0.5"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              value={params.port_congestion_origin}
              onChange={(e) =>
                setParams({
                  ...params,
                  port_congestion_origin: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dest Congestion (Days)
            </label>
            <input
              type="number"
              step="0.5"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              value={params.port_congestion_destination}
              onChange={(e) =>
                setParams({
                  ...params,
                  port_congestion_destination: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Forecast Confidence (0-1)
            </label>
            <input
              type="number"
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              value={params.forecast_confidence}
              onChange={(e) =>
                setParams({
                  ...params,
                  forecast_confidence: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data Freshness (Hours)
            </label>
            <input
              type="number"
              step="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              value={params.data_freshness_hours}
              onChange={(e) =>
                setParams({
                  ...params,
                  data_freshness_hours: Number(e.target.value),
                })
              }
            />
          </div>
        </div>
        <div className="mt-4 flex gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              checked={params.provider_failure}
              onChange={(e) =>
                setParams({ ...params, provider_failure: e.target.checked })
              }
            />
            <span className="ml-2 text-sm text-gray-700">
              Simulate Provider Failure
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              checked={params.missing_data}
              onChange={(e) =>
                setParams({ ...params, missing_data: e.target.checked })
              }
            />
            <span className="ml-2 text-sm text-gray-700">
              Simulate Missing Data
            </span>
          </label>
        </div>
        <div className="mt-4">
          <button
            onClick={() => refetch()}
            className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 text-sm font-medium"
          >
            Evaluate Risk
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Evaluating risks...</div>
      ) : riskData ? (
        <div className="space-y-6">
          <div
            className={`p-6 rounded-lg border-2 ${
              riskData.overall_level === "CRITICAL"
                ? "border-red-500 bg-red-50"
                : riskData.overall_level === "HIGH"
                  ? "border-orange-500 bg-orange-50"
                  : riskData.overall_level === "MEDIUM"
                    ? "border-yellow-500 bg-yellow-50"
                    : "border-green-500 bg-green-50"
            }`}
          >
            <h2 className="text-2xl font-bold mb-2">
              Decision Risk: {riskData.overall_level}
              <span className="text-lg font-normal ml-2 text-gray-600">
                Score: {(riskData.overall_score * 100).toFixed(1)}/100
              </span>
            </h2>
            <div className="text-sm text-gray-500">
              Evaluated at: {new Date(riskData.timestamp).toLocaleString()} |
              Version: {riskData.provenance?.version}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderFactor("Market Risk", riskData.market_risk)}
            {renderFactor("Port Risk", riskData.port_risk)}
            {renderFactor("Weather Risk", riskData.weather_risk)}
            {renderFactor("Operational Risk", riskData.operational_risk)}
            {renderFactor("Data Quality Risk", riskData.data_quality_risk)}
            {renderFactor("Model Uncertainty", riskData.model_uncertainty_risk)}
          </div>
        </div>
      ) : null}
    </div>
  );
}
