"use client";
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';


type EvaluationResult = {
  feasible: boolean;
  strategy: string;
  total_vessels?: number;
  vessel_class?: string;
  calculatedDraft?: number;
  clearance_margin?: number;
};

export default function ConstraintSolverCard() {
  const [volume, setVolume] = useState(100000);
  const [port, setPort] = useState('Haldia');
  const [commodity] = useState('Iron Ore');
  const { mutate: evaluateRequisition, data: result, isPending: loading, error } = useMutation({
    mutationFn: async () => {
      const res = await fetch('http://localhost:3001/api/v1/requisitions/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volume_mt: volume, dest_port_name: port, commodity })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to evaluate');
      return data as EvaluationResult;
    }
  });


  return (
    <div className="p-6 bg-slate-900 border border-slate-700 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Constraint Solver</h2>
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-slate-400 text-sm">Volume (MT)</label>
          <input type="number" value={volume} onChange={e => setVolume(Number(e.target.value))} className="w-full bg-slate-800 text-white p-2 rounded mt-1 border border-slate-600 focus:border-blue-500" />
        </div>
        <div>
          <label className="text-slate-400 text-sm">Destination Port</label>
          <select value={port} onChange={e => setPort(e.target.value)} className="w-full bg-slate-800 text-white p-2 rounded mt-1 border border-slate-600 focus:border-blue-500">
            <option>Haldia</option>
            <option>Paradip</option>
            <option>Dhamra</option>
          </select>
        </div>
        <button onClick={() => evaluateRequisition()} disabled={loading} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50">
          {loading ? 'Evaluating...' : 'Evaluate'}
        </button>

        {error && <div className="text-red-400 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</div>}
        
        {result && (
          <div className="mt-4 p-4 bg-slate-800 rounded border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">Strategy: {result.strategy}</h3>
            <p className="text-slate-300 text-sm">Feasible: <span className={result.feasible ? 'text-green-400' : 'text-red-400'}>{result.feasible ? 'Yes' : 'No'}</span></p>
            {result.feasible && (
              <>
                <p className="text-slate-300 text-sm">Vessels Required: {result.total_vessels}x {result.vessel_class}</p>
                <p className="text-slate-300 text-sm">Calculated Arrival Draft: {result.calculatedDraft}m</p>
                <p className="text-slate-300 text-sm">Clearance Margin (Live Tide): {result.clearance_margin}m</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
