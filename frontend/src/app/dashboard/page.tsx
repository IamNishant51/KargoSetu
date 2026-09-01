import React from 'react';
import ConstraintSolverCard from '@/components/ConstraintSolverCard';
import ForecastPriceChart from '@/components/ForecastPriceChart';

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Executive Command Center</h1>
          <p className="text-slate-400 mt-2">KargoSetu Maritime Analytics & ML Forecasting</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ConstraintSolverCard />
          <ForecastPriceChart />
        </div>
      </div>
    </main>
  );
}
