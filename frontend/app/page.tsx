import ExecutiveDashboard from "../components/ExecutiveDashboard";

export default function Home() {
  return (
    <div className="space-y-8">
      <header className="border-b border-[#26385C] pb-6">
        <h1 className="text-3xl font-bold text-[#00E5FF]">KargoSetu Command Center</h1>
        <p className="text-gray-400 mt-2">Intelligent Freight Forecasting & Port Constraint Solver</p>
      </header>

      <section>
        <ExecutiveDashboard />
      </section>
    </div>
  );
}