"use client";
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

type EvaluationResult = {
  feasible: boolean;
  strategy: string;
  total_vessels?: number;
  vessel_class?: string;
  calculatedDraft?: number;
  portMaxDraft?: number;
  clearance_margin?: number;
  ai_insight?: string;
};

export default function ConstraintSolverCard() {
  const [volume, setVolume] = useState(100000);
  const [port, setPort] = useState('Haldia');
  const [commodity, setCommodity] = useState('Iron Ore');
  const { mutate: evaluateRequisition, data: result, isPending: loading, error } = useMutation({
    mutationFn: async () => {
      const res = await axios.post('http://localhost:3001/api/v1/requisitions/evaluate', {
        volume_mt: volume,
        dest_port_name: port,
        commodity
      });
      return res.data as EvaluationResult;
    }
  });


  return (
    <div className="p-6 bg-navy-950 border border-slate-700 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Constraint Solver</h2>
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-slate-400 text-sm">Volume (MT)</label>
          <input type="number" value={volume} onChange={e => setVolume(Number(e.target.value))} className="w-full bg-navy-900 text-white p-2 rounded mt-1 border border-slate-600 focus:border-blue-500" />
        </div>
        <div>
          <label className="text-slate-400 text-sm">Destination Port</label>
          <select value={port} onChange={e => setPort(e.target.value)} className="w-full bg-navy-900 text-white p-2 rounded mt-1 border border-slate-600 focus:border-blue-500">
            <option>Haldia</option>
            <option>Paradip</option>
            <option>Dhamra</option>
          </select>
        </div>
        <div>
          <label className="text-slate-400 text-sm">Commodity</label>
          <select value={commodity} onChange={e => setCommodity(e.target.value)} className="w-full bg-navy-900 text-white p-2 rounded mt-1 border border-slate-600 focus:border-blue-500">
            <option>Iron Ore</option>
            <option>Coal</option>
            <option>Limestone</option>
          </select>
        </div>
        <button onClick={() => evaluateRequisition()} disabled={loading} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50">
          {loading ? 'Evaluating...' : 'Evaluate'}
        </button>

        
        {result && (
          <div className="mt-4 flex flex-col gap-4">
            <div className="p-4 bg-navy-900 rounded border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-2">Strategy: {result.strategy}</h3>
              <p className="text-slate-300 text-sm">Feasible: <span className={result.feasible ? 'text-green-400' : 'text-red-400'}>{result.feasible ? 'Yes' : 'No'}</span></p>
              {result.feasible && (
                <>
                  <p className="text-slate-300 text-sm">Vessels Required: {result.total_vessels}x {result.vessel_class}</p>
                  <p className="text-slate-300 text-sm">Calculated Arrival Draft: {result.calculatedDraft}m</p>
                  <p className="text-slate-300 text-sm">Port Max Draft: {result.portMaxDraft}m</p>
                  {result.clearance_margin !== undefined && (
                    <p className="text-slate-300 text-sm">Clearance Margin: {result.clearance_margin}m</p>
                  )}
                </>
              )}
            </div>

            {result.ai_insight && (
              <div className="p-4 bg-blue-950/40 rounded border border-blue-800/60 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="text-md font-bold text-blue-300">AI Analysis</h3>
                </div>
                <p className="text-blue-100/80 text-sm leading-relaxed whitespace-pre-wrap">{result.ai_insight}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
