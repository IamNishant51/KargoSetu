"use client";
import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E2E6EB] text-[#3D4F68]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link href="/" className="inline-block">
              <span className="font-display font-black text-xl text-[#0A2342]">KargoSetu<span className="text-[#D95D0F]">.</span></span>
            </Link>
            <p className="mt-3 text-[13.5px] leading-relaxed max-w-xs">Harbour intelligence for SIH 2026 · SIH26006. Draft truth, freight timing, split slips — for SAIL and India&apos;s east coast.</p>
            <p className="mt-4 inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#0E7A3D] bg-[#E9F5EE] border border-[#BFE3CD] rounded px-2.5 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0E7A3D]" /> Systems nominal · v1.0
            </p>
          </div>
          <div>
            <h4 className="mono-label text-[#0A2342] mb-3">Dossier</h4>
            <ul className="space-y-2 text-[13.5px] font-medium">
              <li><a href="#solutions" className="hover:text-[#B45309]">The ledger</a></li>
              <li><a href="#sandbox" className="hover:text-[#B45309]">Simulator</a></li>
              <li><a href="#features" className="hover:text-[#B45309]">Engine room</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mono-label text-[#0A2342] mb-3">Corridor</h4>
            <ul className="space-y-2 text-[13.5px] font-medium">
              <li><a href="#ports" className="hover:text-[#B45309]">Haldia 7.5 m</a></li>
              <li><a href="#ports" className="hover:text-[#B45309]">Paradip 14.5 m</a></li>
              <li><a href="#ports" className="hover:text-[#B45309]">Dhamra 16.0 m</a></li>
              <li><a href="#ports" className="hover:text-[#B45309]">Sandheads 22 m+</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mono-label text-[#0A2342] mb-3">Jury</h4>
            <ul className="space-y-2 text-[13.5px] font-medium">
              <li className="text-[#0A2342] font-bold">SIH26006 · Steel (SAIL)</li>
              <li><Link href="/dashboard" className="text-[#B45309] font-bold hover:underline">Command board →</Link></li>
              <li><a href="#faq" className="hover:text-[#B45309]">Signal book</a></li>
            </ul>
          </div>
        </div>
        <p aria-hidden className="mt-10 select-none overflow-hidden whitespace-nowrap text-center font-display font-black leading-none text-[13.5vw] lg:text-[150px] text-[#0A2342]/[0.06]">KARGOSETU</p>
        <div className="mt-2 pt-5 border-t border-[#E2E6EB] flex flex-col sm:flex-row justify-between gap-2 text-[12px] text-[#6B7D99]">
          <p>© 2026 KargoSetu · Smart India Hackathon · All soundings verified.</p>
          <p className="font-mono uppercase tracking-[0.12em]">Haldia · Paradip · Dhamra · Sandheads</p>
        </div>
      </div>
    </footer>
  );
}
