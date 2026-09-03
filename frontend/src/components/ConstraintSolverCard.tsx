"use client";
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

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
  
  const { mutate: evaluateRequisition, data: result, isPending: loading } = useMutation({
    mutationFn: async () => {
      const res = await fetch('http://localhost:3001/api/v1/requisitions/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volume_mt: volume,
          dest_port_name: port,
          commodity
        })
      });
      if (!res.ok) throw new Error('Evaluation failed');
      return res.json() as Promise<EvaluationResult>;
    }
  });

  return (
    <div className="p-6 bg-navy-950 border border-slate-800 rounded-xl shadow-xl">
      <h2 className="text-xl font-bold text-white mb-6">Constraint Solver</h2>
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-slate-400 text-sm font-medium mb-1.5">Volume (MT)</label>
          <input 
            type="number" 
            value={volume} 
            onChange={e => setVolume(Number(e.target.value))} 
            className="w-full bg-navy-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-slate-500" 
          />
        </div>
        <div>
          <label className="block text-slate-400 text-sm font-medium mb-1.5">Destination Port</label>
          <select 
            value={port} 
            onChange={e => setPort(e.target.value)} 
            className="w-full bg-navy-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none"
          >
            <option>Haldia</option>
            <option>Paradip</option>
            <option>Dhamra</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-400 text-sm font-medium mb-1.5">Commodity</label>
          <select 
            value={commodity} 
            onChange={e => setCommodity(e.target.value)} 
            className="w-full bg-navy-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none"
          >
            <option>Iron Ore</option>
            <option>Coal</option>
            <option>Limestone</option>
          </select>
        </div>
        
        <button 
          onClick={() => evaluateRequisition()} 
          disabled={loading} 
          className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 flex justify-center items-center gap-2 shadow-md hover:shadow-lg"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
              Evaluating Constraints...
            </>
          ) : (
            'Evaluate Requisition'
          )}
        </button>

        {result && (
          <div className="mt-4 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className={`p-5 rounded-xl border ${result.feasible ? 'bg-navy-900 border-slate-700' : 'bg-red-950/20 border-red-900/50'}`}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-white leading-tight">Strategy: {result.strategy}</h3>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${result.feasible ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {result.feasible ? 'FEASIBLE' : 'INFEASIBLE'}
                </span>
              </div>
              
              {result.feasible && (
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-4 text-sm">
                  <div>
                    <span className="block text-slate-500 text-xs uppercase font-semibold">Vessels Required</span>
                    <span className="text-white font-medium">{result.total_vessels}x {result.vessel_class}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs uppercase font-semibold">Arrival Draft</span>
                    <span className="text-white font-medium">{result.calculatedDraft}m</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs uppercase font-semibold">Port Limit</span>
                    <span className="text-white font-medium">{result.portMaxDraft}m</span>
                  </div>
                  {result.clearance_margin !== undefined && (
                    <div>
                      <span className="block text-slate-500 text-xs uppercase font-semibold">UKC Margin</span>
                      <span className="text-emerald-400 font-medium">{result.clearance_margin}m</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {result.ai_insight && (
              <div className="p-4 bg-blue-950/40 rounded-xl border border-blue-800/60 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="text-sm font-bold text-blue-300">AI Analysis</h3>
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
