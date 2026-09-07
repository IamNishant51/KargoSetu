"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useUser } from "@/hooks/useUser";

const LINKS = [
  { label: "Ledger", href: "#solutions" },
  { label: "Simulator", href: "#sandbox", live: true },
  { label: "Engine Room", href: "#features" },
  { label: "Corridor", href: "#ports" },
  { label: "Queries", href: "#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: user } = useUser();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className={`border-b border-[#E2E6EB] transition-shadow ${scrolled ? "shadow-[0_2px_16px_rgba(10,35,66,0.08)]" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-[72px] gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 min-w-0"
              onClick={(e) => {
                if (window.location.pathname === "/") {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              {/* Oversized mark that bleeds past the row without stretching it (-my-2 offsets layout) */}
              <span className="relative h-14 w-14 sm:h-[68px] sm:w-[68px] -my-2 shrink-0">
                <Image src="/logo-ks.png" alt="KargoSetu harbour mark" fill sizes="68px" className="object-contain" priority />
              </span>
              <span className="leading-none">
                <span className="block font-display font-black text-[22px] sm:text-2xl tracking-tight text-[#0A2342]">
                  KargoSetu<span className="text-[#D95D0F]">.</span>
                </span>
                <span className="block font-mono text-[9.5px] tracking-[0.18em] uppercase text-[#6B7D99] mt-0.5">
                  Harbour dossier · v1.0
                </span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-7" aria-label="Primary">
              {LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="group flex items-center gap-1.5 text-[14px] font-semibold text-[#3D4F68] hover:text-[#0A2342] transition-colors"
                >
                  {l.label}
                  {l.live && (
                    <span className="font-mono text-[9px] font-semibold tracking-[0.12em] uppercase bg-[#FDF1E7] text-[#B45309] border border-[#F0D3B8] px-1.5 py-0.5 rounded">
                      Live
                    </span>
                  )}
                  <span className="block h-px w-0 bg-[#D95D0F] transition-all group-hover:w-full" />
                </a>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <Link href="/dashboard" className="stamp rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-[#0A2342] hover:bg-[#FAF7F1] transition-colors">
                  Open dossier — {user.name?.split(" ")[0] || "Board"}
                </Link>
              ) : (
                <>
                  <a href="#sandbox" className="text-sm font-semibold text-[#3D4F68] hover:text-[#0A2342] px-2 py-2">
                    Try simulator
                  </a>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0A2342] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#14315C] transition-colors"
                  >
                    Open command board <ArrowUpRight size={15} />
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label="Toggle menu"
              className="lg:hidden p-2 -mr-2 rounded-lg hover:bg-[#F3F5F7] text-[#0A2342]"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="lg:hidden border-t border-[#E2E6EB] bg-white px-4 pt-2 pb-5 space-y-1" aria-label="Mobile">
            {LINKS.map((l, i) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-3 text-[15px] font-semibold text-[#0A2342] hover:bg-[#FAF7F1]"
              >
                <span className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-[#6B7D99]">0{i + 1}</span> {l.label}
                </span>
                {l.live && <span className="font-mono text-[9px] uppercase tracking-widest bg-[#FDF1E7] text-[#B45309] border border-[#F0D3B8] px-1.5 py-0.5 rounded">Live</span>}
              </a>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#0A2342] px-4 py-3.5 text-[15px] font-bold text-white"
            >
              Open command board <ArrowUpRight size={16} />
            </Link>
            <p className="pt-3 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-[#6B7D99]">
              SIH26006 · Haldia 7.5m · Sandheads 22m+
            </p>
          </nav>
        )}
      </div>
    </header>
  );
}
