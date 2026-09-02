"use client";

 import React from 'react';
 import Link from 'next/link';
 import Image from 'next/image';
import { User, Play, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface CtaSectionProps {
  onOpenDemo: () => void;
}

export default function CtaSection({ onOpenDemo }: CtaSectionProps) {
  return (
    <section className="py-20 sm:py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-900/20 border border-slate-800">
          
          {/* Background Decorative Soft Glows */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="lg:grid lg:grid-cols-12 items-stretch relative z-10">
            
            {/* Left Column: Text & CTA */}
            <div className="lg:col-span-7 p-10 sm:p-14 lg:p-16 text-center lg:text-left flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-300 mb-8 shadow-sm w-fit mx-auto lg:mx-0">
                <Zap size={14} className="text-[#EA580C]" />
                <span>Smart India Hackathon 2026 &middot; Problem SIH26006</span>
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tighter mb-6 leading-[1.05] font-sans">
                Ready to Modernize India&apos;s <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#EA580C]">Maritime</span> Bulk Supply Chain?
              </h2>

              <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed font-medium">
                Join leading maritime logistics teams and eliminate costly demurrage penalties with real-time constraint solving and deep learning freight forecasts.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto bg-[#EA580C] hover:bg-[#C2410C] text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 group text-sm sm:text-base"
                >
                  <User size={18} />
                  <span>Launch Executive Command Center</span>
                  <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                </Link>

                <button
                  onClick={onOpenDemo}
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 px-7 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2.5 shadow-sm text-sm sm:text-base hover:-translate-y-0.5 group"
                >
                  <Play size={18} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  <span>Watch Live Demo</span>
                </button>
              </div>

              {/* Feature Checkpoints */}
              <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-wrap justify-center lg:justify-start items-center gap-6 sm:gap-8 text-[11px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>Zero-Grounding Safety Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>Dynamic Tide Ingestion</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>MeitY Enterprise Cloud</span>
                </div>
              </div>
            </div>

            {/* Right Column: Image */}
            <div className="lg:col-span-5 relative h-80 sm:h-96 lg:h-full min-h-[400px] w-full border-t lg:border-t-0 lg:border-l border-slate-800">
              <Image 
                src="/cta-anchor.png" 
                alt="KargoSetu AI Maritime Anchor" 
                fill 
                className="object-cover object-center lg:object-left"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent lg:hidden" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent hidden lg:block" />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
