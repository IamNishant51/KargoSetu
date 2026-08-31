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
      <div className="bg-brand-dark text-white text-[11px] font-medium py-1.5 px-6 flex justify-between items-center tracking-wide">
        <div className="max-w-7xl mx-auto w-full flex justify-between">
          <span>Ministry of Steel, Government of India | Official Portal</span>
          <span className="opacity-80">Secure Enterprise Network</span>
        </div>
      </div>

      {/* Main Solid Brand Navigation */}
      <nav className="bg-brand border-b border-brand-dark shadow-sm px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-1 rounded-sm shadow-sm">
              <Image src="/logo.png" alt="KargoSetu Logo" width={40} height={40} priority />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-white leading-tight">KargoSetu</span>
              <span className="text-white/70 text-xs font-medium">Predictive Logistics & Chartering</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-white/90">
            <span className="hover:text-white transition-colors cursor-pointer border-b-2 border-white pb-1">Command Center</span>
            <span className="hover:text-white transition-colors cursor-pointer opacity-80 pb-1">Live Simulator</span>
            <span className="hover:text-white transition-colors cursor-pointer opacity-80 pb-1">Reports</span>
            <div className="w-8 h-8 rounded-full bg-white/20 ml-2 border border-white/30 flex items-center justify-center text-xs">GM</div>
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