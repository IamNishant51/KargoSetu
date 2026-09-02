"use client";

import React, { useState } from 'react';
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
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-orange-100 selection:text-orange-900 text-slate-900 flex flex-col">
      {/* Top Navigation */}
      <Navbar onOpenDemo={() => setDemoOpen(true)} />

      <main className="flex-1">
        {/* 1. Hero Section (Pixel-perfect to Desktop & Mobile References, ship fully visible) */}
        <HeroSection onOpenDemo={() => setDemoOpen(true)} />

        {/* 2. Trusted By Maritime Leaders Worldwide (Matches Reference Image Marquee) */}
        <SocialProofLogos />

        {/* 3. Solutions for Every Maritime Need (Exact Match to Reference Image) */}
        <SolutionsSection />

        {/* 4. Live Baltic & Port Telemetry Ticker Strip (Moved lower, clean light theme) */}
        <MarketTicker />

        {/* 5. Interactive Intelligence Sandbox (Constraint Solver, ML Forecast, ROI Calc) */}
        <InteractiveSandbox />

        {/* 6. Core SIH26006 Architectural Bento Grid */}
        <BentoFeatures />

        {/* 7. Strategic East Coast India Port Corridor */}
        <PortCorridor />

        {/* 8. 4-Step Intelligent Workflow */}
        <WorkflowSection />

        {/* 9. Executive Personas & Endorsements (SAIL, Haldia, NMDC) */}
        <TestimonialsSection />

        {/* 10. Interactive FAQ Accordion */}
        <FaqSection />

        {/* 11. High-Converting Call to Action Banner (Clean Light Enterprise Design) */}
        <CtaSection onOpenDemo={() => setDemoOpen(true)} />
      </main>

      {/* 12. Enterprise Footer */}
      <Footer />

      {/* Interactive Walkthrough Demo Modal */}
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
