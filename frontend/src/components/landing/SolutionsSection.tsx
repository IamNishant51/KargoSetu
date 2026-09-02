"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, Ship, PackageOpen } from 'lucide-react';

interface SolutionsSectionProps {
  onSelectSolution?: (key: string) => void;
}

export default function SolutionsSection({ onSelectSolution }: SolutionsSectionProps) {
  return (
    <section id="solutions" className="py-20 sm:py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
          
          {/* Left Text Column */}
          <div className="lg:col-span-4 mb-12 lg:mb-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] tracking-widest uppercase border border-slate-200 mb-6">
              Platform Capabilities
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tighter mb-5 leading-[1.1]">
              Solutions for <br className="hidden lg:block" />
              Every Maritime Need
            </h2>
            <p className="text-slate-500 mb-8 text-base sm:text-lg leading-relaxed font-medium">
              From market intelligence to operations optimization, KargoSetu is your all-in-one maritime command center.
            </p>
            <Link 
              href="#sandbox" 
              className="group inline-flex items-center gap-2.5 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-slate-800 hover:shadow-lg transition-all duration-300 w-fit"
            >
              <span>Explore Solutions</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          {/* Right Cards Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Market Intelligence */}
            <div className="bg-white p-7 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/60 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-full pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <BarChart3 size={22} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                  Market Intelligence
                </h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                  Real-time market data, trends, and forecasts to stay ahead.
                </p>
              </div>
              <Link 
                href="#sandbox" 
                onClick={() => onSelectSolution && onSelectSolution('forecast')}
                className="text-slate-900 font-semibold inline-flex items-center gap-1.5 text-sm group-hover:text-blue-600 transition-colors relative z-10 w-fit"
              >
                <span>Learn More</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Card 2: Charter & Freight */}
            <div className="bg-white p-7 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/60 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/5 to-transparent rounded-bl-full pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-orange-50 border border-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#EA580C] group-hover:text-white transition-all duration-300 shadow-sm">
                  <Ship size={22} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                  Charter & Freight
                </h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                  Find the right vessels, compare rates, and fix deals faster.
                </p>
              </div>
              <Link 
                href="#sandbox" 
                onClick={() => onSelectSolution && onSelectSolution('constraint')}
                className="text-slate-900 font-semibold inline-flex items-center gap-1.5 text-sm group-hover:text-[#EA580C] transition-colors relative z-10 w-fit"
              >
                <span>Learn More</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Card 3: Operations Hub */}
            <div className="bg-white p-7 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/60 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <PackageOpen size={22} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                  Operations Hub
                </h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                  Streamline voyages, track shipments, and reduce delays.
                </p>
              </div>
              <Link 
                href="#ports" 
                onClick={() => onSelectSolution && onSelectSolution('operations')}
                className="text-slate-900 font-semibold inline-flex items-center gap-1.5 text-sm group-hover:text-[#EA580C] transition-colors"
              >
                <span>Learn More</span>
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
