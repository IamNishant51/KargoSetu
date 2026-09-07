import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "../components/Providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | KargoSetu",
    default: "KargoSetu | Maritime Operations Intelligence",
  },
  description:
    "Draft-constrained voyage intelligence for India's east coast. SIH 2026 SIH26006 — built for Ministry of Steel and SAIL.",
  keywords: [
    "Maritime",
    "Freight Forecasting",
    "Haldia draft",
    "Port Constraints",
    "SAIL",
    "SIH26006",
  ],
  authors: [{ name: "KargoSetu Team" }],
  openGraph: {
    title: "KargoSetu | Harbour Intelligence, Not Hype",
    description:
      "Live draft solver + 90-day freight outlook for Haldia, Paradip, Dhamra.",
    url: "https://kargosetu.com",
    siteName: "KargoSetu",
    locale: "en_IN",
    type: "website",
  },
  icons: { icon: "/KargoSetu-LOGO.png" },
  alternates: { canonical: "https://kargosetu.com" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-white text-[#0A2342] overflow-x-hidden" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
