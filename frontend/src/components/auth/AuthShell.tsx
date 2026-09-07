"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/i18n/LanguageContext";

export default function AuthShell({
  eyebrow,
  title,
  sub,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub: string;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-white font-sans text-[#0A2342] relative overflow-hidden flex flex-col">
      {/* Same faint survey grid as the landing hero */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.45] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #EDF0F4 1px, transparent 1px), linear-gradient(to bottom, #EDF0F4 1px, transparent 1px)",
          backgroundSize: "54px 54px",
          maskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
        }}
      />

      {/* Top bar — same wordmark language as the navbar */}
      <header className="relative border-b border-[#E2E6EB] bg-white/85 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <span className="relative block w-9 h-9 shrink-0 -my-1">
              <Image src="/logo-ks.png" alt="KargoSetu" fill sizes="36px" className="object-contain" priority />
            </span>
            <span className="font-display font-black text-[19px] tracking-tight text-[#0A2342]">
              KargoSetu<span className="text-[#D95D0F]">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden sm:inline mono-label text-[#6B7D99]">SIH 2026 · SIH26006</span>
            <Link href="/" className="text-[13px] font-bold text-[#B45309] hover:text-[#0A2342] transition-colors">
              {t("back_dossier")}
            </Link>
          </div>
        </div>
      </header>

      {/* Clearance slip — quiet navy panel + white form desk */}
      <main className="relative flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-14">
        <div className="w-full max-w-5xl card-hard rounded-2xl overflow-hidden bg-white grid lg:grid-cols-2">
          {/* Left — just the voice */}
          <div className="relative bg-[#0A2342] text-white px-6 py-10 sm:p-12 flex flex-col overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.16] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "44px 44px",
                maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
              }}
            />
            <div className="relative my-auto">
              <p className="mono-label text-white/55">{eyebrow}</p>
              <h1 className="mt-3 font-display font-black tracking-[-0.025em] leading-[1.02] text-balance text-[34px] sm:text-[42px]">
                {title}
              </h1>
              <p className="mt-4 text-[14.5px] sm:text-[15.5px] leading-relaxed text-white/70 max-w-sm">{sub}</p>
            </div>
            <p className="relative mt-10 font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/40">
              SIH 2026 · SIH26006
            </p>
          </div>

          {/* Right — the form desk */}
          <div className="bg-white px-6 py-8 sm:p-10 flex flex-col justify-center">{children}</div>
        </div>
      </main>

      <footer className="relative border-t border-[#E2E6EB] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="mono-label text-[#6B7D99]">{t("auth_foot")}</p>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#6B7D99]">
            Haldia 7.5 m · Paradip 14.5 m · Dhamra 17.5 m
          </p>
        </div>
      </footer>
    </div>
  );
}
