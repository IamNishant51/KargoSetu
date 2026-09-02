import Link from 'next/link';
import Image from 'next/image';
import { Menu, Play, User, Activity, Anchor, Ship, ArrowRight, BarChart3, PackageOpen } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 text-slate-900">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="relative w-12 h-12">
                <Image src="/logo.png" alt="KargoSetu Logo" fill className="object-contain" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-[#0f172a]">KargoSetu</span>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex space-x-8 items-center font-medium text-slate-600">
              <Link href="#" className="text-slate-900 pb-1 border-b-2 border-slate-900 relative top-[1px]">Home</Link>
              <Link href="#" className="hover:text-slate-900 transition-colors flex items-center gap-1">
                Solutions
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">Features</Link>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/dashboard" className="bg-[#0f172a] hover:bg-[#1e293b] text-white px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 shadow-sm">
                <User size={18} />
                Get Started Free
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button type="button" className="text-slate-600 hover:text-slate-900">
                <Menu size={28} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
              
              {/* Hero Content */}
              <div className="lg:col-span-5 text-center lg:text-left z-10">
                <p className="text-[#16a34a] font-semibold tracking-wide text-sm mb-4 uppercase">
                  AI-Powered Maritime Intelligence
                </p>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                  <span className="text-[#0f172a] block mb-2">Smarter Decisions.</span>
                  <span className="text-[#ea580c]">Stronger </span>
                  <span className="text-[#0f172a]">Voyages.</span>
                </h1>
                <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto lg:mx-0">
                  KargoSetu empowers maritime professionals with real-time insights, accurate forecasts, and AI-driven intelligence to navigate global trade with confidence.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                  <Link href="/dashboard" className="bg-[#0f172a] hover:bg-[#1e293b] text-white px-8 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg">
                    <User size={20} />
                    Get Started Free
                  </Link>
                  <Link href="#" className="bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm">
                    <Play size={20} className="text-slate-600" />
                    Watch Demo
                  </Link>
                </div>
              </div>

              {/* Hero Image & Cards */}
              <div className="mt-16 lg:mt-0 lg:col-span-7 relative flex justify-center lg:justify-end">
                {/* Arc graphic behind image */}
                <div className="absolute inset-0 z-0 hidden lg:block" style={{ top: '-10%', right: '-5%', width: '110%', height: '110%' }}>
                  <svg viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path d="M50 500 A 350 350 0 0 1 750 500" stroke="url(#paint0_linear)" strokeWidth="12" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="paint0_linear" x1="50" y1="500" x2="750" y2="500" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#f97316" />
                        <stop offset="0.5" stopColor="#16a34a" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Main Ship Image */}
                <div className="relative z-10 w-full max-w-2xl">
                  <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden mask-image-bottom">
                    <Image 
                      src="/hero.png" 
                      alt="Cargo Ship" 
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>

                  {/* Floating Market Snapshot Card */}
                  <div className="absolute -bottom-8 lg:bottom-12 left-0 right-0 lg:-left-16 lg:right-auto bg-white rounded-2xl p-5 shadow-2xl border border-slate-100 w-full lg:w-[480px] z-20">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-slate-800">Market Snapshot</h3>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Live
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 divide-x divide-slate-100">
                      {/* Metric 1 */}
                      <div className="pr-2">
                        <p className="text-xs text-slate-500 font-medium mb-1">Global Freight Index</p>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-2xl font-bold text-slate-900">1,842</span>
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+2.45%</span>
                        </div>
                        <div className="h-8 w-full">
                           <svg viewBox="0 0 100 30" className="w-full h-full stroke-emerald-500" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                             <path d="M0,25 L10,22 L20,24 L30,15 L40,18 L50,12 L60,14 L70,8 L80,10 L90,2 L100,5" />
                           </svg>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">vs last 7 days</p>
                      </div>
                      
                      {/* Metric 2 */}
                      <div className="pl-4">
                        <p className="text-xs text-slate-500 font-medium mb-1">Avg. Charter Rate (USD/Day)</p>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-2xl font-bold text-slate-900">18,650</span>
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+1.82%</span>
                        </div>
                         <div className="h-8 w-full">
                           <svg viewBox="0 0 100 30" className="w-full h-full stroke-emerald-500" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                             <path d="M0,20 L10,18 L20,20 L30,14 L40,15 L50,10 L60,12 L70,5 L80,8 L90,3 L100,2" />
                           </svg>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">vs last 7 days</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="pt-24 pb-16 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm font-semibold text-slate-800 mb-8">Trusted by maritime leaders worldwide</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
              <div className="flex items-center gap-2 font-bold text-xl text-slate-700">
                <Anchor size={24} /> MAERSK
              </div>
              <div className="flex items-center gap-2 font-bold text-xl text-slate-700">
                <Ship size={24} /> MSC
              </div>
              <div className="flex items-center gap-2 font-bold text-xl text-slate-700">
                <Activity size={24} /> COSCO
              </div>
              <div className="flex items-center gap-2 font-bold text-xl text-slate-700">
                <Anchor size={24} /> CMA CGM
              </div>
              <div className="flex items-center gap-2 font-bold text-xl text-slate-700">
                <Ship size={24} /> Hapag-Lloyd
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section className="py-20 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-4 lg:gap-12">
              
              {/* Left text column */}
              <div className="lg:col-span-1 mb-12 lg:mb-0">
                <h2 className="text-3xl font-bold text-[#0f172a] mb-4">
                  Solutions for <br className="hidden lg:block"/>
                  Every Maritime Need
                </h2>
                <p className="text-slate-500 mb-6 text-sm">
                  From market intelligence to operations optimization, KargoSetu is your all-in-one maritime command center.
                </p>
                <Link href="#" className="text-[#ea580c] font-medium flex items-center gap-2 text-sm hover:underline">
                  Explore Solutions <ArrowRight size={16} />
                </Link>
              </div>

              {/* Cards Grid */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Card 1 */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                    <BarChart3 size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Market Intelligence</h3>
                  <p className="text-slate-500 text-sm mb-6 min-h-[60px]">
                    Real-time market data, trends, and forecasts to stay ahead.
                  </p>
                  <Link href="#" className="text-slate-900 font-medium flex items-center gap-2 text-sm hover:underline">
                    Learn More <ArrowRight size={16} />
                  </Link>
                </div>

                {/* Card 2 */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-6">
                    <Ship size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Charter & Freight</h3>
                  <p className="text-slate-500 text-sm mb-6 min-h-[60px]">
                    Find the right vessels, compare rates, and fix deals faster.
                  </p>
                  <Link href="#" className="text-slate-900 font-medium flex items-center gap-2 text-sm hover:underline">
                    Learn More <ArrowRight size={16} />
                  </Link>
                </div>

                {/* Card 3 */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6">
                    <PackageOpen size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Operations Hub</h3>
                  <p className="text-slate-500 text-sm mb-6 min-h-[60px]">
                    Streamline voyages, track shipments, and reduce delays.
                  </p>
                  <Link href="#" className="text-slate-900 font-medium flex items-center gap-2 text-sm hover:underline">
                    Learn More <ArrowRight size={16} />
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
