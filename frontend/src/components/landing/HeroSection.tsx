"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Play } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <section className="relative bg-white overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.45] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #EDF0F4 1px, transparent 1px), linear-gradient(to bottom, #EDF0F4 1px, transparent 1px)",
          backgroundSize: "54px 54px",
          maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
        }}
      />
      {/* Tall editorial hero — fills first viewport without crowding CTAs */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 lg:pb-20 min-h-[82vh] lg:min-h-[88vh] flex items-center">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center w-full">
          {/* Left */}
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#E2E6EB] bg-white px-3.5 py-2 font-mono text-[10.5px] sm:text-[11.5px] tracking-[0.14em] uppercase text-[#3D4F68]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0E7A3D]" />
              Live solver · Haldia 7.5 m
            </p>

            <h1 className="mt-5 font-display font-black text-[#0A2342] tracking-[-0.03em] leading-[1.0] text-balance text-[40px] sm:text-[56px] lg:text-[68px] xl:text-[76px]">
              Haldia can&apos;t take a Capesize.{" "}
              <span className="text-[#D95D0F]">We know first.</span>
            </h1>

            <p className="mt-5 max-w-lg text-[15.5px] sm:text-[18px] leading-relaxed text-[#3D4F68]">
              Live tide + draft check for SAIL desks —{" "}
              <strong className="text-[#0A2342]">berth direct or split 3× Supramax</strong>,
              with rupees saved on the slip.
            </p>

            <dl className="mt-7 grid grid-cols-3 max-w-lg divide-x divide-[#E2E6EB] border-y border-[#E2E6EB] bg-white/80">
              {[
                ["Haldia draft", "7.5 m"],
                ["Tide now", "+3.2 m"],
                ["Capesize", "18.2 m"],
              ].map(([k, v]) => (
                <div key={k} className="px-4 py-3.5">
                  <dt className="font-mono text-[9.5px] sm:text-[10.5px] uppercase tracking-[0.14em] text-[#6B7D99]">{k}</dt>
                  <dd className="font-mono font-semibold text-[17px] sm:text-[22px] text-[#0A2342] mt-0.5">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-7 flex flex-col sm:flex-row gap-3 max-w-lg">
              <Link
                href="/dashboard"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#D95D0F] px-6 py-4 text-[15px] font-bold text-white hover:bg-[#B45309] transition-colors shadow-[0_3px_0_#0A2342] ring-1 ring-[#0A2342]/10"
              >
                Check my requisition <ArrowUpRight size={17} strokeWidth={2.5} />
              </Link>
              <button
                type="button"
                onClick={() => router.push(`${pathname}?demo=true`, { scroll: false })}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0A2342] px-6 py-4 text-[15px] font-bold text-white hover:bg-[#14315C] transition-colors"
              >
                <Play size={16} className="text-[#F5B98A]" fill="currentColor" /> 2-min demo
              </button>
            </div>
          </div>

          {/* Right — larger dossier card to fill vertical rhythm */}
          <div className="w-full min-w-0">
            <figure className="card-hard rounded-2xl bg-[#FAF7F1] overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-[#E2E6EB] px-5 py-3">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#6B7D99] truncate">
                  Fig. A — Sandheads run
                </span>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-white bg-[#0A2342] rounded px-2.5 py-1 shrink-0">
                  150k MT · Split
                </span>
              </div>
              <div className="relative aspect-[3/2] w-full">
                <Image
                  src="/landing-page-hero.png"
                  alt="Supramax shuttle loading at Sandheads anchorage off Haldia"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-contain p-3 sm:p-5"
                />
              </div>
              <figcaption className="grid grid-cols-3 divide-x divide-[#E2E6EB] border-t border-[#E2E6EB] bg-white">
                {[
                  ["Verdict", "3× Supramax", "text-[#B45309] font-bold"],
                  ["UKC", "+1.8 m safe", "text-[#0E7A3D]"],
                  ["Saved", "₹2.1 Cr", "text-[#0A2342]"],
                ].map(([k, v, c]) => (
                  <div key={k} className="px-4 py-3.5">
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#6B7D99]">{k}</p>
                    <p className={`mt-1 font-mono text-[13px] sm:text-[15px] font-semibold ${c}`}>{v}</p>
                  </div>
                ))}
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
