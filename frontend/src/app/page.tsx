import React from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import SocialProofLogos from '@/components/landing/SocialProofLogos';
import SolutionsSection from '@/components/landing/SolutionsSection';
import MarketTicker from '@/components/landing/MarketTicker';
import InteractiveSandbox from '@/components/landing/InteractiveSandbox';
import BentoFeatures from '@/components/landing/BentoFeatures';
import PortCorridor from '@/components/landing/PortCorridor';
import WorkflowSection from '@/components/landing/WorkflowSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FaqSection from '@/components/landing/FaqSection';
import CtaSection from '@/components/landing/CtaSection';
import Footer from '@/components/landing/Footer';
import DemoModal from '@/components/landing/DemoModal';

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
