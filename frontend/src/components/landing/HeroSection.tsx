"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Play } from 'lucide-react';

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
            <p className="text-[#16A34A] font-bold tracking-wider text-xs sm:text-sm mb-3 uppercase">
              AI-POWERED MARITIME INTELLIGENCE
            </p>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold tracking-tight mb-5 leading-[1.08] font-sans">
              <span className="text-[#0F172A] block mb-1">Smarter Decisions.</span>
              <span className="text-[#EA580C]">Stronger </span>
              <span className="text-[#0F172A]">Voyages.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-500 mb-8 max-w-md lg:max-w-[420px] mx-auto lg:mx-0 leading-relaxed">
              KargoSetu empowers maritime professionals with real-time insights, accurate forecasts, and AI-driven intelligence to navigate global trade with confidence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3.5 max-w-md mx-auto lg:mx-0">
              <Link
                href="/dashboard"
                className="bg-[#0F172A] hover:bg-[#1E293B] text-white px-7 py-3.5 sm:py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg text-sm sm:text-base group"
              >
                <User size={19} className="transition-transform group-hover:scale-110" />
                <span>Get Started Free</span>
              </Link>

              <button
                onClick={onOpenDemo}
                className="bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 px-7 py-3.5 sm:py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2.5 shadow-2xs hover:shadow-xs text-sm sm:text-base cursor-pointer"
              >
                <Play size={18} className="text-slate-700 fill-slate-700" />
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

              {/* Market Snapshot Card - Stacked below the image to ensure image is perfectly visible */}
              <div className="mt-8 bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-100 w-full max-w-md lg:max-w-[480px] z-20 mx-auto transition-transform hover:-translate-y-0.5">
                
                {/* Snapshot Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">Market Snapshot</h3>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live
                  </div>
                </div>

                {/* 2-Column Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 divide-x divide-slate-100">
                  
                  {/* Metric 1: Global Freight Index */}
                  <div className="pr-2">
                    <p className="text-xs text-slate-500 font-medium mb-1 truncate">Global Freight Index</p>
                    <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                      <span className="text-2xl sm:text-[26px] font-bold text-slate-900 font-mono tracking-tight">1,842</span>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">+2.45%</span>
                    </div>
                    {/* Sparkline Graphic */}
                    <div className="h-7 w-full my-1">
                      <svg viewBox="0 0 120 30" className="w-full h-full stroke-emerald-500" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2,24 L14,21 L26,23 L38,15 L50,17 L62,11 L74,13 L86,7 L98,9 L110,3 L118,4" />
                      </svg>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">vs last 7 days</p>
                  </div>

                  {/* Metric 2: Avg. Charter Rate */}
                  <div className="pl-4">
                    <p className="text-xs text-slate-500 font-medium mb-1 truncate">Avg. Charter Rate (USD/Day)</p>
                    <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                      <span className="text-2xl sm:text-[26px] font-bold text-slate-900 font-mono tracking-tight">18,650</span>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">+1.82%</span>
                    </div>
                    {/* Sparkline Graphic */}
                    <div className="h-7 w-full my-1">
                      <svg viewBox="0 0 120 30" className="w-full h-full stroke-emerald-500" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2,22 L14,19 L26,20 L38,14 L50,15 L62,10 L74,11 L86,6 L98,8 L110,3 L118,2" />
                      </svg>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">vs last 7 days</p>
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
