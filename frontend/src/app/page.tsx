import React, { Suspense } from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import SocialProofLogos from "@/components/landing/SocialProofLogos";
import dynamic from "next/dynamic";

// Server-rendered (above the fold, no dynamic)
// HeroSection and SocialProofLogos are synchronous imports

// Dynamically loaded (below the fold)
const MarketTicker = dynamic(() => import("@/components/landing/MarketTicker"));
const SolutionsSection = dynamic(() => import("@/components/landing/SolutionsSection"));
const InteractiveSandbox = dynamic(() => import("@/components/landing/InteractiveSandbox"));
const BentoFeatures = dynamic(() => import("@/components/landing/BentoFeatures"));
const PortCorridor = dynamic(() => import("@/components/landing/PortCorridor"));
const WorkflowSection = dynamic(() => import("@/components/landing/WorkflowSection"));
const TestimonialsSection = dynamic(() => import("@/components/landing/TestimonialsSection"));
const FaqSection = dynamic(() => import("@/components/landing/FaqSection"));
const CtaSection = dynamic(() => import("@/components/landing/CtaSection"));
const Footer = dynamic(() => import("@/components/landing/Footer"));
const DemoModal = dynamic(() => import("@/components/landing/DemoModal"));

const APP_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "KargoSetu Corridor Solver",
  url: "https://kargosetu.com/dashboard",
  applicationCategory: "BusinessApplication",
  featureList: [
    "Draft constraint solver for Haldia, Paradip, Dhamra",
    "90-day ML freight rate forecast P10/P50/P90",
    "Live AIS vessel globe Bay of Bengal",
    "USGS earthquake overlay",
    "NASA FIRMS fire overlay",
    "Open-Meteo marine weather overlay",
  ],
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#0A2342] flex flex-col">
      <Navbar />
      <main aria-label="KargoSetu main content" className="flex-1">
        <HeroSection />
        <Suspense fallback={null}><MarketTicker /></Suspense>
        <SocialProofLogos />
        <Suspense fallback={null}><SolutionsSection /></Suspense>
        <Suspense fallback={null}><InteractiveSandbox /></Suspense>
        <Suspense fallback={null}><BentoFeatures /></Suspense>
        <Suspense fallback={null}><PortCorridor /></Suspense>
        <Suspense fallback={null}><WorkflowSection /></Suspense>
        <Suspense fallback={null}><TestimonialsSection /></Suspense>
        <Suspense fallback={null}><FaqSection /></Suspense>
        <Suspense fallback={null}><CtaSection /></Suspense>
      </main>
      <Footer />
      <Suspense fallback={null}><DemoModal /></Suspense>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(APP_JSONLD) }}
      />
    </div>
  );
}
