"use client";
import React from "react";
import Image from "next/image";

const PORTS = [
  { n: "01", name: "Haldia", sub: "Hooghly river · tide-bound", draft: "7.5 m", tide: "+2.8 – 4.2 m", ship: "Supramax direct", note: "Heavy siltation. The reason splits exist.", flag: "Watch" },
  { n: "02", name: "Paradip", sub: "Bay of Bengal · all-weather", draft: "14.5 m", tide: "+1.2 – 2.4 m", ship: "Panamax / baby Cape", note: "Mechanised coal berths. Laycan discipline matters.", flag: "Open" },
  { n: "03", name: "Dhamra", sub: "Deep-sea fairway", draft: "16.0 m", tide: "+1.5 – 2.8 m", ship: "Full Capesize 180k", note: "Coking-coal front door when Haldia chokes.", flag: "Open" },
  { n: "04", name: "Sandheads", sub: "Offshore roads · lighterage", draft: "22 m+", tide: "Open ocean", ship: "All classes", note: "Where big ships break bulk into shuttles.", flag: "Hub" },
];

export default function PortCorridor() {
  return (
    <section id="ports" className="bg-[#FAF7F1] border-y border-[#E2E6EB] py-14 sm:py-20 scroll-mt-20 sm:scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="mono-label text-[#B45309]">Chart 02 — the corridor</p>
        <div className="mt-2 flex flex-col lg:flex-row lg:items-end justify-between gap-3">
          <h2 className="font-display font-black text-4xl sm:text-5xl text-[#0A2342] max-w-xl">Four stops. One honest draft table.</h2>
          <p className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-[#6B7D99]">Soundings in metres · tide added</p>
        </div>

        <figure className="mt-8 card-hard rounded-2xl overflow-hidden bg-white">
          <div className="flex items-center justify-between gap-2 border-b border-[#E2E6EB] px-5 py-3">
            <span className="truncate text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#6B7D99]">
              Fig. C — corridor chart
            </span>
            <span className="shrink-0 rounded bg-[#0A2342] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white">
              4 stops
            </span>
          </div>
          <div className="relative aspect-[16/9] w-full bg-[#FAF7F1]">
            <Image
              src="/corridor-map.png"
              alt="Schematic chart of the Haldia Sandheads Paradip Dhamra corridor with drafts"
              fill
              sizes="(max-width: 1280px) 100vw, 1152px"
              className="object-contain p-4 sm:p-5"
            />
          </div>
          <figcaption className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white border-t border-[#E2E6EB] px-5 py-3.5">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#6B7D99]">Soundings in metres</span>
            <span className="text-[12px] font-semibold text-[#0E7A3D]">Haldia 7.5 m · Sandheads 22 m+ · Paradip 14.5 m · Dhamra 16.0 m</span>
          </figcaption>
        </figure>

        <div className="mt-8 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[760px] border-collapse bg-white rounded-2xl overflow-hidden border border-[#E2E6EB]">
            <thead>
              <tr className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#6B7D99] border-b border-[#E2E6EB] bg-white">
                <th className="text-left font-semibold px-5 py-3">Port</th>
                <th className="text-left font-semibold px-5 py-3">Draft</th>
                <th className="text-left font-semibold px-5 py-3">Tide</th>
                <th className="text-left font-semibold px-5 py-3">Takes</th>
                <th className="text-left font-semibold px-5 py-3">Pilot&apos;s note</th>
                <th className="text-right font-semibold px-5 py-3">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6EB]">
              {PORTS.map((p) => (
                <tr key={p.n} className="hover:bg-[#FAF7F1] transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono text-[11px] text-[#6B7D99] mr-2">{p.n}</span>
                    <span className="font-bold text-[15px] text-[#0A2342]">{p.name}</span>
                    <span className="block text-[12.5px] text-[#6B7D99] mt-0.5">{p.sub}</span>
                  </td>
                  <td className="px-5 py-4 font-mono font-semibold text-[15px] text-[#0A2342]">{p.draft}</td>
                  <td className="px-5 py-4 font-mono text-[13px] text-[#0E7A3D]">{p.tide}</td>
                  <td className="px-5 py-4 text-[13.5px] font-semibold text-[#3D4F68]">{p.ship}</td>
                  <td className="px-5 py-4 text-[13px] text-[#3D4F68] max-w-[260px]">{p.note}</td>
                  <td className="px-5 py-4 text-right">
                    <span className={`inline-block font-mono text-[10px] uppercase tracking-[0.12em] px-2 py-1 rounded border ${p.flag === "Watch" ? "bg-[#FDF1E7] text-[#B45309] border-[#F0D3B8]" : "bg-[#E9F5EE] text-[#0E7A3D] border-[#BFE3CD]"}`}>{p.flag}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#6B7D99]">Swipe sideways on mobile · figures from port circulars + live tide</p>
      </div>
    </section>
  );
}
