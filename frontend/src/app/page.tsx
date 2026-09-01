import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-navy-950 bg-slate-950 flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-6 tracking-tight">
        KargoSetu
      </h1>
      <p className="text-xl text-slate-300 max-w-2xl text-center mb-8">
        Smart India Hackathon 2026. Maritime Logistics Systems & Predictive Analytics using real-time Baltic Dry Index data and Open-Meteo live tides.
      </p>
      <Link href="/dashboard" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 transition-colors rounded-lg font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]">
        Launch Executive Dashboard
      </Link>
    </main>
  );
}
