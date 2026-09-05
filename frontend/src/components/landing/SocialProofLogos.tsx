"use client";

import React from "react";

const LOGOS = [
  {
    name: "MAERSK",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="w-7 h-7 fill-current"
        aria-hidden="true"
      >
        <polygon points="12,2 14.5,8.5 21.5,8 16.5,13 18.5,19.5 12,15.5 5.5,19.5 7.5,13 2.5,8 9.5,8.5" />
      </svg>
    ),
    textClass: "font-extrabold text-xl sm:text-2xl tracking-wider font-sans",
    hoverColor: "hover:text-[#002444]",
  },
  {
    name: "MSC",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="w-7 h-7 stroke-current fill-none stroke-2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v10M8 12h8M9 9c0 3 6 3 6 6" />
      </svg>
    ),
    textClass: "font-serif font-black text-xl sm:text-2xl tracking-tight",
    hoverColor: "hover:text-[#FFBF00]",
  },
  {
    name: "COSCO SHIPPING",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="w-7 h-7 stroke-current fill-none stroke-2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <ellipse cx="12" cy="12" rx="9" ry="5" />
        <ellipse cx="12" cy="12" rx="9" ry="5" transform="rotate(45 12 12)" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
    customLayout: (
      <div className="flex flex-col text-left leading-none">
        <span className="font-extrabold text-base sm:text-lg tracking-wide font-sans">
          COSCO
        </span>
        <span className="font-bold text-[9px] tracking-widest text-slate-500">
          SHIPPING
        </span>
      </div>
    ),
    hoverColor: "hover:text-[#D9251D]",
  },
  {
    name: "CMA CGM",
    icon: (
      <svg
        viewBox="0 0 28 20"
        className="w-8 h-6 fill-current"
        aria-hidden="true"
      >
        <path d="M2 14 C6 6, 14 4, 26 5 C20 9, 14 11, 2 14 Z" opacity="0.8" />
        <path
          d="M4 17 C10 11, 18 10, 26 12 C18 15, 12 16, 4 17 Z"
          opacity="0.5"
        />
      </svg>
    ),
    textClass: "font-black text-lg sm:text-xl tracking-tight italic font-sans",
    hoverColor: "hover:text-[#003B71]",
  },
  {
    name: "Hapag-Lloyd",
    icon: (
      <div className="w-6 h-6 border-2 border-current rounded-xs flex items-center justify-center p-0.5">
        <svg
          viewBox="0 0 20 20"
          className="w-full h-full fill-current"
          aria-hidden="true"
        >
          <path d="M3 5 L10 12 L17 5 L15 3 L10 8 L5 3 Z" />
          <path d="M3 15 L10 8 L17 15 L15 17 L10 12 L5 17 Z" />
        </svg>
      </div>
    ),
    textClass: "font-bold text-lg sm:text-xl tracking-tight font-sans",
    hoverColor: "hover:text-[#EA580C]",
  },
  {
    name: "EVERGREEN",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="w-7 h-7 stroke-current fill-none stroke-2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18M3 12h18M6 6l12 12M6 18l12-12" />
      </svg>
    ),
    textClass:
      "font-black text-lg sm:text-xl tracking-wide font-sans text-slate-900",
    hoverColor: "hover:text-[#008752]",
  },
];

export default function SocialProofLogos() {
  return (
    <section className="py-12 sm:py-16 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm font-semibold text-slate-700 mb-8 tracking-wide">
          Trusted by maritime leaders worldwide
        </p>

        {/* Desktop Static / Flex Grid (Exact match to reference image) */}
        <div className="hidden md:flex flex-wrap justify-center items-center gap-10 lg:gap-16 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
          {LOGOS.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 text-slate-700 transition-opacity hover:opacity-100 cursor-default"
            >
              {item.icon}
              {item.customLayout ? (
                item.customLayout
              ) : (
                <span className={item.textClass}>{item.name}</span>
              )}
            </div>
          ))}
        </div>

        {/* Mobile / Small Screen Smooth Infinite Marquee */}
        <div className="md:hidden overflow-hidden relative w-full [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="animate-marquee flex items-center gap-10 opacity-80">
            {[...LOGOS, ...LOGOS].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-slate-700 whitespace-nowrap"
              >
                {item.icon}
                {item.customLayout ? (
                  item.customLayout
                ) : (
                  <span className={item.textClass}>{item.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
