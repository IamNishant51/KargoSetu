"use client";
import React, { useState } from "react";

export default function SimulatorPage() {
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const runSimulation = async () => {
    const res = await fetch("/api/v1/simulator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        freight_rate: 1.0,
        bunker_price: 1.0,
        port_draft: 1.0,
        congestion: 1.0,
        turnaround: 1.0,
        cargo_volume: 1.0,
        laycan: "7d",
        contract_horizon: "1y",
      }),
    });
    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">What-If Simulator</h1>
      <button
        onClick={runSimulation}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Run Simulation
      </button>
      {result && (
        <div className="mt-4 p-4 border rounded">
          <h2 className="text-xl">Result</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
