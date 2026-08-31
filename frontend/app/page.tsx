import ExecutiveDashboard from "../components/ExecutiveDashboard";

export default function Home() {
  return (
    <div className="space-y-6">
      <header className="mb-8 border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-brand">
          Executive Command Center
        </h1>
        <p className="text-slate-600 text-sm mt-1 font-medium">Real-time freight forecasting and physical port constraint evaluations.</p>
      </header>

      <section>
        <ExecutiveDashboard />
      </section>
    </div>
  );
}