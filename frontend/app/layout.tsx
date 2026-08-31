import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "KargoSetu | Executive Command Center",
  description: "Predictive Maritime Logistics for Indian PSUs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className="font-sans antialiased text-gov-text bg-gov-bg">

      {/* Government/Enterprise Utility Header */}
      <div className="bg-brand text-white text-[10px] font-medium py-1.5 px-6 flex justify-between items-center tracking-wider uppercase">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>🇮🇳 Ministry of Steel, Govt. of India | Official Logistics Portal</span>
          </div>
          <div className="flex items-center gap-4 opacity-80">
            <span className="cursor-pointer hover:opacity-100 transition-opacity">Skip to main content</span>
            <div className="w-px h-3 bg-white/30"></div>
            <span className="cursor-pointer hover:opacity-100 transition-opacity">A- | A | A+</span>
          </div>
        </div>
      </div>

      {/* Main Clean White Navigation */}
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="KargoSetu Logo" width={56} height={56} priority className="object-contain drop-shadow-sm" quality={100} />
            <div className="flex flex-col justify-center">
              <span className="font-bold text-xl tracking-tight text-brand leading-none">KargoSetu</span>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Predictive Chartering</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 text-sm font-semibold text-slate-600 hidden md:flex">
            <span className="px-4 py-2 rounded-md bg-slate-100 text-brand cursor-pointer">Command Center</span>
            <span className="px-4 py-2 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer">Fairway Simulator</span>
            <span className="px-4 py-2 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer">Fleet Tracker</span>
            <span className="px-4 py-2 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer">Audit Logs</span>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-5">
            <button className="bg-brand hover:bg-brand-light text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded shadow-sm transition-colors">
              + New Charter
            </button>
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-3 cursor-pointer hidden sm:flex">
              <div className="flex flex-col text-right">
                <span className="text-sm font-bold text-slate-900 leading-none">A. Sharma</span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">GM Procurement</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-brand font-bold text-sm shadow-inner">
                AS
              </div>
            </div>
          </div>

        </div>
      </nav>

      <main className="min-h-screen pt-8 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </body>
    </html>
  );
}