import React from "react";
import type { Metadata } from "next";
import DynamicGlobeClient from "./DynamicGlobeClient";

export const metadata: Metadata = {
  title: "Live Corridor Globe",
  description: "Live AIS vessel picture for the Newcastle-Haldia corridor. Sandheads lighterage, Dhamra Capesize approach, USGS earthquakes, NASA fires, Open-Meteo marine weather.",
  openGraph: {
    title: "Live Vessel Globe | KargoSetu",
    description: "Real-time Bay of Bengal vessel positions: Capesize lighterage at Sandheads, Haldia Supramax splits, Dhamra coal berths.",
    images: [{ url: "/hero.png", width: 1200, height: 630, alt: "Live vessel globe — Bay of Bengal" }],
  },
  robots: { index: false, follow: false },
};

export default function GlobePage() {
  return <DynamicGlobeClient />;
}
