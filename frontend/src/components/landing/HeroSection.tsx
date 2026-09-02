"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
 import { User, Play, Activity } from 'lucide-react';

interface HeroSectionProps {
  onOpenDemo: () => void;
}

export default function HeroSection({ onOpenDemo }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-32 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-5 text-center lg:text-left z-10">
            {/* Tagline / Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs tracking-widest uppercase border border-emerald-100 mb-6 sm:mb-8 shadow-[0_2px_10px_rgba(16,185,129,0.1)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              AI-Powered Maritime Intelligence
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-[76px] font-extrabold tracking-tighter mb-6 leading-[1.05] font-sans">
              <span className="text-[#0F172A] block mb-2">Smarter Decisions.</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EA580C] to-[#f97316]">Stronger </span>
              <span className="text-[#0F172A]">Voyages.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              KargoSetu empowers maritime professionals with real-time insights, accurate forecasts, and AI-driven intelligence to navigate global trade with confidence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 max-w-md mx-auto lg:mx-0 mt-8">
              <Link
                href="/dashboard"
                className="group relative inline-flex items-center justify-center gap-2.5 rounded-xl bg-slate-900 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-300 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/30 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 w-full sm:w-auto"
              >
                <User size={18} className="transition-transform group-hover:scale-110" />
                <span>Get Started Free</span>
              </Link>
              <button
                onClick={onOpenDemo}
                className="group relative inline-flex items-center justify-center gap-2.5 rounded-xl bg-white border border-slate-200 px-8 py-4 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 w-full sm:w-auto"
              >
                <Play size={18} className="text-slate-500 group-hover:text-[#EA580C] transition-colors" />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>
          {/* Right Column: Hero Graphic & Floating Card */}
          <div className="mt-12 lg:mt-0 lg:col-span-7 relative flex flex-col items-center lg:items-end">
            
            {/* Main Hero Ship Image Container */}
            <div className="relative z-10 w-full max-w-2xl">
              <div className="relative aspect-[3/2] w-full flex items-center justify-center">
                <Image
                  src="/landing-page-hero.png"
                  alt="KargoSetu Container Vessel with Bridge and Indian Tricolor Arch"
                  fill
                  className="object-contain drop-shadow-xl"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 58vw, 700px"
                />
              </div>

              {/* Market Snapshot Card - Shadcn Style */}
              <div className="mt-8 bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl shadow-slate-200/40 border border-slate-200/60 w-full max-w-md lg:max-w-[480px] z-20 mx-auto transition-transform duration-300 hover:-translate-y-1">
                
                {/* Snapshot Header */}
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-[#EA580C]" />
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">Market Snapshot</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-widest shadow-sm">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    Live Data
                  </div>
                </div>

                {/* 2-Column Metrics Grid */}
                <div className="grid grid-cols-2 gap-5 divide-x divide-slate-100">
                  
                  {/* Metric 1: Global Freight Index */}
                  <div className="pr-1">
                    <p className="text-[11px] sm:text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wider truncate">Baltic Dry Index</p>
                    <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tighter">1,842</span>
                      <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">+2.4%</span>
                    </div>
                    {/* Premium Sparkline Graphic */}
                    <div className="h-8 w-full my-2 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-50/50 to-transparent rounded-sm" />
                      <svg viewBox="0 0 120 30" className="w-full h-full stroke-emerald-500 relative z-10 drop-shadow-sm" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2,24 L14,21 L26,23 L38,15 L50,17 L62,11 L74,13 L86,7 L98,9 L110,3 L118,4" />
                      </svg>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">vs trailing 7 days</p>
                  </div>

                  {/* Metric 2: Avg. Charter Rate */}
                  <div className="pl-5">
                    <p className="text-[11px] sm:text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wider truncate">Avg. Charter Rate</p>
                    <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tighter"><span className="text-slate-400 font-medium text-lg mr-0.5">$</span>18.6k</span>
                      <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">+1.8%</span>
                    </div>
                    {/* Premium Sparkline Graphic */}
                    <div className="h-8 w-full my-2 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-50/50 to-transparent rounded-sm" />
                      <svg viewBox="0 0 120 30" className="w-full h-full stroke-emerald-500 relative z-10 drop-shadow-sm" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2,22 L14,19 L26,20 L38,14 L50,15 L62,10 L74,11 L86,6 L98,8 L110,3 L118,2" />
                      </svg>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">vs trailing 7 days</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
