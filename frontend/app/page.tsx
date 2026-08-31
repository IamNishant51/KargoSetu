import ExecutiveDashboard from "../components/ExecutiveDashboard";

export default function Home() {
  return (
    <div className="space-y-8 animate-fade-in">
      <header className="mb-10 text-center sm:text-left flex flex-col gap-2">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
          Command Center
        </h1>
        <p className="text-white/40 text-lg font-medium">Intelligent Freight Forecasting & Port Constraint Solver</p>
      </header>

      <section>
        <ExecutiveDashboard />
      </section>
    </div>
  );
}