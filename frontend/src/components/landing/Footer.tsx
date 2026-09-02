"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Anchor, Shield, Globe, Compass, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/90 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-block group">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-md shadow-slate-900/20 group-hover:scale-105 transition-transform duration-300">
                  <span className="text-white font-black text-lg font-mono">K</span>
                </div>
                <span className="font-extrabold text-2xl tracking-tighter text-slate-900">
                  KargoSetu<span className="text-[#EA580C]">.</span>
                </span>
              </div>
            </Link>

            <p className="text-slate-500 text-sm leading-relaxed max-w-sm font-medium">
              AI-Powered Maritime Intelligence and Dual-Ended Port Constraint Resolution Platform. Built for the Smart India Hackathon 2026 (SIH26006) for the Ministry of Steel & SAIL.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                All Systems Operational
              </span>
              <span className="text-slate-400">&middot;</span>
              <span className="font-mono text-slate-400">v1.0.0 Enterprise</span>
            </div>
          </div>

          {/* Solutions Col */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4">
              Solutions
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="#solutions" className="hover:text-slate-900 transition-colors">
                  Market Intelligence
                </Link>
              </li>
              <li>
                <Link href="#solutions" className="hover:text-slate-900 transition-colors">
                  Charter & Freight Optimization
                </Link>
              </li>
              <li>
                <Link href="#solutions" className="hover:text-slate-900 transition-colors">
                  Operations & Bathymetry Hub
                </Link>
              </li>
              <li>
                <Link href="#sandbox" className="hover:text-slate-900 transition-colors">
                  Cargo Splitting Engine
                </Link>
              </li>
              <li>
                <Link href="#sandbox" className="hover:text-slate-900 transition-colors">
                  Sandheads Transshipment
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Ports Col */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4">
              East Coast Ports
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="#ports" className="hover:text-slate-900 transition-colors">
                  Haldia Dock Complex (HDC)
                </Link>
              </li>
              <li>
                <Link href="#ports" className="hover:text-slate-900 transition-colors">
                  Paradip Port Authority
                </Link>
              </li>
              <li>
                <Link href="#ports" className="hover:text-slate-900 transition-colors">
                  Dhamra Port (Adani Ports)
                </Link>
              </li>
              <li>
                <Link href="#ports" className="hover:text-slate-900 transition-colors">
                  Visakhapatnam Port
                </Link>
              </li>
              <li>
                <Link href="#ports" className="hover:text-slate-900 transition-colors">
                  Sandheads Anchorage
                </Link>
              </li>
            </ul>
          </div>

          {/* SIH Hackathon & Technical Docs Col */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4">
              Hackathon & Docs
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-900 font-semibold block text-xs">Problem ID: SIH26006</span>
                <span className="text-slate-400 text-xs">Ministry of Steel (SAIL)</span>
              </li>
              <li className="pt-2">
                <Link href="/dashboard" className="text-[#EA580C] font-semibold hover:underline flex items-center gap-1">
                  Executive Dashboard <ExternalLink size={13} />
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-slate-900 transition-colors">
                  System Architecture
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-slate-900 transition-colors">
                  Technical Specifications
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
          <p suppressHydrationWarning>
            &copy; 2026 KargoSetu. Built for Smart India Hackathon 2026. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Terms of Maritime Service</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Security Compliance</Link>
          </div>
        </div>
      </div>

      {/* Massive Creative Typography Watermark */}
      <div className="w-full overflow-hidden flex justify-center pointer-events-none select-none px-4 pb-2">
        <h1 className="text-[14vw] font-black leading-none tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-slate-200/80 to-slate-50/10 whitespace-nowrap opacity-80 mix-blend-multiply">
          KARGOSETU
        </h1>
      </div>
    </footer>
  );
}
