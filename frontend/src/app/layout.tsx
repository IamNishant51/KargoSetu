import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "../components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | KargoSetu",
    default:
      "KargoSetu | Maritime Operations Intelligence",
  },
  description:
    "Empowering maritime leaders and Indian PSUs with real-time port constraints, AI-driven freight rate forecasting, and zero-demurrage voyage optimization.",
  keywords: [
    "Maritime",
    "Freight Forecasting",
    "Indian PSUs",
    "Port Constraints",
    "Voyage Optimization",
    "Demurrage",
  ],
  authors: [{ name: "KargoSetu Team" }],
  openGraph: {
    title: "KargoSetu | Maritime Intelligence",
    description:
      "AI-driven freight rate forecasting and zero-demurrage voyage optimization.",
    url: "https://kargosetu.com",
    siteName: "KargoSetu",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KargoSetu | Maritime Intelligence",
    description:
      "AI-driven freight rate forecasting and zero-demurrage voyage optimization.",
  },
  icons: {
    icon: "/KargoSetu-LOGO.png",
  },
  alternates: {
    canonical: "https://kargosetu.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
