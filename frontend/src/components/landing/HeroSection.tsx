"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { User, Play } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-32 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-6 text-center lg:text-left z-10">
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[64px] font-extrabold tracking-tighter mb-8 leading-[1.05] font-sans">
              <span className="text-[#0F172A] block whitespace-nowrap mb-2">
                Smarter Decisions.
              </span>
              <span className="whitespace-nowrap">
                <span className="text-[#EA580C]">Stronger </span>
                <span className="text-[#0F172A]">Voyages.</span>
              </span>
            </h1>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 max-w-md mx-auto lg:mx-0 mt-14">
              <Link
                href="/dashboard"
                className="group relative inline-flex items-center justify-center gap-2.5 rounded-xl bg-slate-900 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-300 hover:bg-slate-800 hover:shadow-lg hover:border-slate-300  focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 w-full sm:w-auto"
              >
                <User size={18} className="transition-transform " />
                <span>Get Started Free</span>
              </Link>
              <button
                type="button"
                aria-label="Play Demo Video"
                className="group relative inline-flex items-center justify-center gap-2.5 rounded-xl bg-white border border-slate-200 px-8 py-4 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900  focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 w-full sm:w-auto"
              >
                <Play
                  size={18}
                  className="text-slate-500 group-hover:text-[#EA580C] transition-colors"
                />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>
          {/* Right Column: Hero Graphic */}
          <div className="mt-12 lg:mt-0 lg:col-span-6 relative flex flex-col items-center lg:items-end">
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

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
