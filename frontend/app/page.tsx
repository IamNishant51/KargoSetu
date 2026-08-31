import Link from "next/link";
import { ArrowRight, Anchor, BarChart3, ShieldCheck, Ship, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-navy-950 px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-sea-500/20 blur-[128px]"></div>
        <div className="absolute bottom-0 -left-24 h-96 w-96 rounded-full bg-saffron-500/10 blur-[128px]"></div>
        
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-sea-500/30 bg-sea-500/10 px-4 py-1.5 text-sm font-medium text-sea-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sea-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sea-500"></span>
              </span>
              SIH 26006 · Ministry of Steel
            </span>
          </div>
          <h1 className="font-space-grotesk text-5xl font-bold tracking-tight text-white sm:text-7xl">
            Deterministic Routing meets <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sea-400 to-leaf-400">Predictive Intelligence</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-slate-300 sm:text-xl leading-relaxed">
            Revolutionizing overseas dry bulk cargo procurement for Indian PSUs. 
            Eliminate demurrage risks and optimize freight timing with state-of-the-art ML forecasting.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/dashboard">
              <Button size="lg" className="bg-sea-500 hover:bg-sea-600 text-white h-14 px-8 text-base font-semibold shadow-lg shadow-sea-500/20 transition-all hover:scale-105">
                Enter Command Center
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#architecture">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-800 hover:text-white backdrop-blur-sm">
                Explore Architecture
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 -mt-12 sm:-mt-16 w-full">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-4 rounded-full bg-leaf-100 p-3 text-leaf-700 ring-8 ring-leaf-50">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="font-display text-3xl font-bold text-navy-900">8% - 15%</h3>
              <p className="mt-2 text-sm font-medium text-slate-500 uppercase tracking-wider">Freight Expenditure Savings</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-4 rounded-full bg-saffron-100 p-3 text-saffron-700 ring-8 ring-saffron-50">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-display text-3xl font-bold text-navy-900">100%</h3>
              <p className="mt-2 text-sm font-medium text-slate-500 uppercase tracking-wider">Demurrage Mitigation</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-4 rounded-full bg-sea-100 p-3 text-sea-700 ring-8 ring-sea-50">
                <Anchor className="h-6 w-6" />
              </div>
              <h3 className="font-display text-3xl font-bold text-navy-900">90-Day</h3>
              <p className="mt-2 text-sm font-medium text-slate-500 uppercase tracking-wider">Forward P90 Forecasting</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Two-Pronged Architecture Section */}
      <section id="architecture" className="mx-auto w-full max-w-7xl px-6 py-24 sm:py-32">
        <div className="mb-16 max-w-3xl">
          <h2 className="font-space-grotesk text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            The Two-Pronged Engine
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            KargoSetu replaces reactive spot-market dependencies with a unified architecture balancing stochastic market variables and deterministic physics.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Engine 1 */}
          <div className="group relative overflow-hidden rounded-3xl bg-slate-50 border border-slate-200 p-8 sm:p-12 transition-all hover:shadow-2xl hover:shadow-sea-500/10">
            <div className="absolute right-0 top-0 -mt-8 -mr-8 text-slate-200 transition-transform group-hover:scale-110 group-hover:text-sea-100">
              <BarChart3 className="h-64 w-64 opacity-50" />
            </div>
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sea-500 text-white shadow-lg">
                <span className="font-space-grotesk text-xl font-bold">1</span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold text-navy-900">
                Stochastic Multivariate Forecasting
              </h3>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Ingests maritime benchmarks (Baltic Dry Index, Capesize/Panamax indices), macroeconomic indicators, and VLSFO bunker fuel prices. Uses ensemble XGBoost and Prophet models to project 30-, 60-, and 90-day freight curves with P10/P50/P90 confidence bounds.
              </p>
              <ul className="mt-6 space-y-3">
                {['Rolling volatility features', 'Quantile regression bounds', 'Optimal laycan window triggers'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <ShieldCheck className="h-4 w-4 text-sea-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Engine 2 */}
          <div className="group relative overflow-hidden rounded-3xl bg-slate-50 border border-slate-200 p-8 sm:p-12 transition-all hover:shadow-2xl hover:shadow-leaf-500/10">
            <div className="absolute right-0 top-0 -mt-8 -mr-8 text-slate-200 transition-transform group-hover:scale-110 group-hover:text-leaf-100">
              <Ship className="h-64 w-64 opacity-50" />
            </div>
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-leaf-500 text-white shadow-lg">
                <span className="font-space-grotesk text-xl font-bold">2</span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold text-navy-900">
                Deterministic Constraint Solver
              </h3>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Cross-references physical port bathymetry (Permissible Draft, LOA, Beam) with dynamic tidal curves and vessel bunker consumption. Automatically calculates multi-vessel cargo splitting or offshore lighterage at Sandheads when direct fixture is physically impossible.
              </p>
              <ul className="mt-6 space-y-3">
                {['Tidal window dynamic draft simulation', 'Cargo split & transshipment routing', 'Physical limit hard-rejections'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <Waves className="h-4 w-4 text-leaf-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-navy-950 py-24 sm:py-32 px-6 w-full">
        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="font-space-grotesk text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Ready to optimize your freight procurement?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Experience the KargoSetu platform live. Test dynamic draft simulations, analyze 90-day freight forecasts, and evaluate Contracts of Affreightment (CoA) scenarios in real-time.
          </p>
          <div className="mt-10 flex justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-navy-950 hover:bg-slate-100 h-14 px-8 text-base font-bold shadow-xl transition-transform hover:scale-105">
                Launch Executive Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
