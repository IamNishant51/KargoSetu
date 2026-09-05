"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  User,
  ChevronDown,
  BarChart3,
  Ship,
  PackageOpen,
  ArrowRight,
  Play,
} from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/90"
          : "bg-white/90 backdrop-blur-sm border-b border-slate-200/60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand Logo & Name */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center gap-3 sm:gap-4 overflow-visible"
            onClick={(e) => {
// If we are already on the landing page, smoothly scroll to top
              if (window.location.pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            {/*
              Creative frontend trick: We increase the container size to exactly fit the 80px height (h-16 is 64px, leaving 8px top/bottom),
              and we use a subtle scale transform on the image to make it pop past any baked-in transparent padding
              without pushing the navbar's physical boundaries.
            */}
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
              <Image
                src="/logo-ks.png"
                alt="KargoSetu Logo"
                fill
                className="object-contain scale-[1.15] drop-shadow-sm"
                priority
              />
            </div>
            <span className="font-extrabold text-2xl sm:text-[28px] tracking-tighter text-[#0F172A] font-sans">
              KargoSetu<span className="text-[#EA580C]">.</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-8 items-center font-medium text-slate-600">
            {/* Home Link with active bottom indicator */}
            <div className="relative py-2">
              <Link
                href="#"
                className="text-slate-900 font-semibold transition-colors"
              >
                Home
              </Link>
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0F172A] rounded-full" />
            </div>

            {/* Solutions Dropdown Menu */}
            <div
              className="relative py-2"
              onMouseEnter={() => setSolutionsOpen(true)}
              onMouseLeave={() => setSolutionsOpen(false)}
            >
              <button
                type="button"
                aria-haspopup="true"
                onClick={() => setSolutionsOpen(!solutionsOpen)}
                className="hover:text-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer text-slate-600 font-medium py-1"
                aria-expanded={solutionsOpen}
              >
                Solutions
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${solutionsOpen ? "rotate-180 text-slate-900" : "text-slate-400"}`}
                />
              </button>

              {/* Dropdown Panel */}
              {solutionsOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-3 pt-3 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="space-y-1">
                    <Link
                      href="#solutions"
                      onClick={() => setSolutionsOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <BarChart3 size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          Market Intelligence
                        </div>
                        <p className="text-xs text-slate-500">
                          Real-time Baltic index & 90-day LSTM forecasts
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="#solutions"
                      onClick={() => setSolutionsOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                        <Ship size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
                          Charter & Freight
                        </div>
                        <p className="text-xs text-slate-500">
                          Dual-ended port bathymetry & cargo splitting
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="#solutions"
                      onClick={() => setSolutionsOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <PackageOpen size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                          Operations Hub
                        </div>
                        <p className="text-xs text-slate-500">
                          Dynamic Open-Meteo tide & Sandheads transshipment
                        </p>
                      </div>
                    </Link>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between px-2 text-xs">
                    <span className="text-slate-400 font-medium">
                      SIH 2026 Problem SIH26006
                    </span>
                    <Link
                      href="#sandbox"
                      onClick={() => setSolutionsOpen(false)}
                      className="text-[#EA580C] font-semibold hover:underline flex items-center gap-1"
                    >
                      Try Live Sandbox <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="#features"
              className="hover:text-slate-900 transition-colors py-2"
            >
              Features
            </Link>

            <Link
              href="#sandbox"
              className="hover:text-slate-900 transition-colors py-2 flex items-center gap-1.5"
            >
              <span>Simulator</span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-md">
                Live
              </span>
            </Link>

            <Link
              href="#ports"
              className="hover:text-slate-900 transition-colors py-2"
            >
              Ports
            </Link>
          </nav>

          {/* Desktop Right Action CTA */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              type="button"
              aria-label="Contact Sales"
              className="text-slate-600 hover:text-slate-900 font-medium text-sm px-3.5 py-2 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Play size={16} className="text-slate-500" />
              Watch Demo
            </button>

            <Link
              href="/dashboard"
              className="bg-[#0F172A] hover:bg-[#1E293B] text-white px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-sm text-sm"
            >
              <User size={17} />
              <span>Get Started Free</span>
            </Link>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            <Link
              href="#"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-900 bg-slate-50"
            >
              Home
            </Link>

            <Link
              href="#solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              Solutions
            </Link>

            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              Features
            </Link>

            <Link
              href="#sandbox"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              <span>Interactive Simulator</span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-md">
                Live
              </span>
            </Link>

            <Link
              href="#ports"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              East Coast Ports Corridor
            </Link>

            <Link
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              FAQ & SIH Specs
            </Link>
          </div>

          {/* Mobile CTAs */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
            >
              <User size={18} />
              <span>Get Started Free</span>
            </Link>

            <button
              type="button"
              aria-label="Contact Sales mobile"
              onClick={() => {
                setMobileMenuOpen(false);
              }}
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-2xs text-sm cursor-pointer"
            >
              <Play size={18} className="text-slate-600" />
              <span>Watch Interactive Demo</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>SIH 2026 Problem SIH26006 · Ministry of Steel (SAIL)</span>
          </div>
        </div>
      )}
    </header>
  );
}
