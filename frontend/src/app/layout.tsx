import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "../components/Providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export function generateViewport(): Viewport {
  return {
    width: "device-width",
    initialScale: 1,
    themeColor: "#FAF7F1",
  };
}

export const metadata: Metadata = {
  metadataBase: new URL("https://kargosetu.com"),
  title: {
    template: "%s | KargoSetu",
    default: "KargoSetu | Maritime Operations Intelligence",
  },
  description:
    "Draft-constrained voyage intelligence for India's east coast. Live vessel globe, Haldia/Paradip/Dhamra corridor solver, and 90-day freight outlook. SIH 2026 SIH26006 — built for Ministry of Steel and SAIL.",
  keywords: [
    "Maritime",
    "Freight Forecasting",
    "Haldia draft",
    "Port Constraints",
    "SAIL",
    "SIH26006",
    "AIS vessel tracking",
    "Bay of Bengal shipping",
    "Paradip",
    "Dhamra",
    "Sandheads",
  ],
  authors: [{ name: "KargoSetu Team" }],
  creator: "KargoSetu Team",
  robots: { index: true, follow: true },
  openGraph: {
    title: "KargoSetu | Harbour Intelligence, Not Hype",
    description:
      "Live draft solver + 90-day freight outlook + live vessel globe for Haldia, Paradip, Dhamra.",
    url: "https://kargosetu.com",
    siteName: "KargoSetu",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/hero.png", width: 1200, height: 630, alt: "KargoSetu live corridor globe" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KargoSetu | Harbour Intelligence, Not Hype",
    description:
      "Live draft solver + 90-day freight outlook + live vessel globe for India's east coast.",
    images: ["/hero.png"],
  },
  icons: { icon: "/KargoSetu-LOGO.png" },
  alternates: { canonical: "https://kargosetu.com" },
};

const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "KargoSetu",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://kargosetu.com",
  description:
    "Draft-constrained voyage intelligence for India's east coast: live vessel globe, corridor solver, 90-day freight outlook.",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
