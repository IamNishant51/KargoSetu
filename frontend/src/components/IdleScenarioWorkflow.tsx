"use client";

import React, { useState } from "react";

interface ResultData {
  idle_risk: string;
  estimated_idle_days_min: number;
  estimated_idle_days_max: number;
  estimated_economic_impact: number;
  contributing_factors: { factor: string; impact: string }[];
  alternate_employment_suggestions: {
    destination: string;
    estimated_distance_nm: number;
    expected_demand: string;
  }[];
  model_output: boolean;
  unknown_data: string[];
}

export function IdleScenarioWorkflow() {
  const [expectedDischarge, setExpectedDischarge] = useState("");
  const [nextCargoLaycan, setNextCargoLaycan] = useState("");
  const [vesselType, setVesselType] = useState("Panamax");
  const [destination, setDestination] = useState("Dhamra");
  const [marketProxy, setMarketProxy] = useState<string>("0.5");
  const [positioning, setPositioning] = useState("None");
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const baseUrl =
        "";
      const res = await fetch(`${baseUrl}/api/v1/idle-scenarios/estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expected_discharge_completion: expectedDischarge
            ? new Date(expectedDischarge).toISOString()
            : new Date().toISOString(),
          next_cargo_laycan: nextCargoLaycan
            ? new Date(nextCargoLaycan).toISOString()
            : null,
          vessel_type: vesselType,
          destination: destination,
          market_demand_proxy: parseFloat(marketProxy),
          positioning_assumptions: positioning,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">
        What happens after this vessel arrives?
      </h1>
      <p className="text-gray-600">
        Estimate idle exposure after a voyage completion.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expected Discharge
            </label>
            <input
              type="date"
              required
              value={expectedDischarge}
              onChange={(e) => setExpectedDischarge(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Next Cargo Laycan
            </label>
            <input
              type="date"
              value={nextCargoLaycan}
              onChange={(e) => setNextCargoLaycan(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vessel Type
            </label>
            <input
              type="text"
              required
              value={vesselType}
              onChange={(e) => setVesselType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Destination
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Market Demand Proxy (0-1)
            </label>
            <input
              type="number"
              step="0.1"
              value={marketProxy}
              onChange={(e) => setMarketProxy(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Positioning
            </label>
            <input
              type="text"
              value={positioning}
              onChange={(e) => setPositioning(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Estimating..." : "Estimate Idle Risk"}
        </button>
      </form>

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Idle Risk</h3>
              <p
                className={`text-2xl font-bold ${result.idle_risk === "HIGH" ? "text-red-600" : result.idle_risk === "MODERATE" ? "text-orange-500" : "text-green-600"}`}
              >
                {result.idle_risk}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">
                Expected Idle Days
              </h3>
              <p className="text-2xl font-bold">
                {result.estimated_idle_days_min} -{" "}
                {result.estimated_idle_days_max} days
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">
                Economic Impact
              </h3>
              <p className="text-2xl font-bold text-red-600">
                -${result.estimated_economic_impact.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Contributing Factors</h3>
            <ul className="list-disc pl-5 space-y-2">
              {result.contributing_factors.map((f, i: number) => (
                <li key={i}>
                  <span className="font-medium">{f.factor}</span> (Impact:{" "}
                  {f.impact})
                </li>
              ))}
            </ul>
          </div>

          {result.alternate_employment_suggestions.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">
                Alternate Employment
              </h3>
              <div className="space-y-4">
                {result.alternate_employment_suggestions.map(
                  (alt, i: number) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium">{alt.destination}</p>
                        <p className="text-sm text-gray-500">
                          {alt.estimated_distance_nm} nm
                        </p>
                      </div>
                      <div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          Demand: {alt.expected_demand}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          <div className="flex space-x-4 text-xs text-gray-500">
            <span className="px-2 py-1 bg-gray-100 rounded">
              {result.model_output ? "MODEL OUTPUT" : "HEURISTIC"}
            </span>
            {result.unknown_data.length > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                UNKNOWN: {result.unknown_data.join(", ")}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
