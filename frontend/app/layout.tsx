import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "KargoSetu | SIH 26006 - Intelligent Freight Forecasting",
  description: "Predictive freight rate forecasting & vessel chartering intelligence for SAIL.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-slate-900 bg-slate-50">
        <div className="bg-navy-950 text-slate-300 text-[11px] font-medium border-b border-navy-900">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-white font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-60"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf"></span>
               </span>
                Ministry of Steel - SAIL
             </span>
              <span className="hidden sm:inline text-navy-700">|</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-saffron/15 px-2 py-0.5 font-mono font-semibold text-saffron-300 ring-1 ring-inset ring-saffron/30">
                SIH 26006
             </span>
           </div>
            <div className="hidden md:flex items-center gap-5 font-mono text-[11px]">
              <span className="flex items-center gap-2">
                <span className="text-slate-400">BDRY</span>
                <span className="font-bold text-leaf">$18.42</span>
                <span className="text-leaf/80">+2.4%</span>
             </span>
              <span className="text-navy-700">|</span>
              <span className="text-slate-400">CY 2026 Q3</span>
           </div>
         </div>
       </div>

        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-lg">
          <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-6">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-saffron via-sea to-leaf opacity-20 blur-md"></div>
                <Link href="/" className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200 shadow-sm hover:scale-105 transition-transform">
                  <Image src="/logo.png" alt="KargoSetu" width={52} height={52} priority className="object-contain drop-shadow-sm" quality={100} />
               </Link>
             </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-baseline gap-2">
                  <Link href="/"><span className="text-[19px] font-bold tracking-tight text-navy-900 hover:text-sea-700 transition-colors">KargoSetu</span></Link>
                  <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-wider text-slate-500">INTELLIGENT FREIGHT</span>
               </div>
                <span className="text-[11px] font-medium text-slate-500">Predictive Freight Forecasting & Vessel Chartering</span>
             </div>
           </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-leaf"></span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">CoA Savings</span>
               </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-sm font-bold text-leaf-700">₹ 35.28 Cr</span>
                  <span className="font-mono text-[10px] text-slate-500">/ $4.2M</span>
               </div>
             </div>

              <div className="hidden sm:block h-8 w-px bg-slate-200"></div>

              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[13px] font-semibold text-navy-900 leading-tight">A. K. Sharma</span>
                  <span className="text-[10px] font-medium text-saffron-700 uppercase tracking-wide">GM Bulk Cargo</span>
               </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-navy-800 to-sea-700 text-xs font-bold text-white shadow-sm ring-2 ring-white">
                  AS
               </div>
             </div>
           </div>
         </div>
       </header>
        <main className="w-full">{children}</main>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
            <p className="text-xs text-slate-500">
              KargoSetu - Built for <span className="font-semibold text-slate-700">Smart India Hackathon 2026</span> - Problem Statement 26006
           </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-leaf"></span>
                All systems operational
             </span>
              <span>·</span>
              <span className="font-mono">v2.0</span>
           </div>
         </div>
       </footer>
     </body>
   </html>
  );
}
