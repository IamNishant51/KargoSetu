"use client";

import dynamic from "next/dynamic";
import React from "react";

const GlobeClient = dynamic(() => import("./GlobeClient"), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-4rem)] bg-[#FAF7F1] p-4">
      <div className="h-16 rounded-2xl bg-white border border-[#E2E6EB] animate-pulse" />
      <div className="mt-3 h-[60vh] rounded-2xl bg-white border border-[#E2E6EB] animate-pulse" />
    </div>
  ),
});

export default function DynamicGlobeClient() {
  return <GlobeClient />;
}
