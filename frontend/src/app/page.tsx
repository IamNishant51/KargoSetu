import React from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import SocialProofLogos from "@/components/landing/SocialProofLogos";
import SolutionsSection from "@/components/landing/SolutionsSection";
import dynamic from "next/dynamic";

const MarketTicker = dynamic(() => import("@/components/landing/MarketTicker"));
const InteractiveSandbox = dynamic(
  () => import("@/components/landing/InteractiveSandbox"),
);
const BentoFeatures = dynamic(
  () => import("@/components/landing/BentoFeatures"),
);
const PortCorridor = dynamic(() => import("@/components/landing/PortCorridor"));
const WorkflowSection = dynamic(
  () => import("@/components/landing/WorkflowSection"),
);
const TestimonialsSection = dynamic(
  () => import("@/components/landing/TestimonialsSection"),
);
const FaqSection = dynamic(() => import("@/components/landing/FaqSection"));
const CtaSection = dynamic(() => import("@/components/landing/CtaSection"));
const Footer = dynamic(() => import("@/components/landing/Footer"));
const DemoModal = dynamic(() => import("@/components/landing/DemoModal"));

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-orange-100 selection:text-orange-900 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <SocialProofLogos />
        <SolutionsSection />
        <MarketTicker />
        <InteractiveSandbox />
        <BentoFeatures />
        <PortCorridor />
        <WorkflowSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection />
      </main>

      <Footer />
      <DemoModal />
    </div>
  );
}
