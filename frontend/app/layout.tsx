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
      <body className="font-sans antialiased selection:bg-[#00E5FF] selection:text-[#030d1a]">
        
        {/* Floating Glass Header */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
          <div className="max-w-7xl mx-auto bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-2xl px-6 py-3 shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="KargoSetu Logo" width={42} height={42} className="rounded-xl shadow-lg" priority />
              <span className="font-bold text-xl tracking-tight text-white/90">KargoSetu</span>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-white/50">
              <span className="hover:text-white transition-colors cursor-pointer">Command Center</span>
              <span className="hover:text-white transition-colors cursor-pointer">Live Simulator</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-accent to-brand ml-4 border border-white/20"></div>
            </div>
          </div>
        </nav>

        <main className="min-h-screen pt-32 pb-16 px-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}