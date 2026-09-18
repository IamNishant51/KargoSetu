import React from "react";
import type { Metadata } from "next";
import DynamicDashboardClient from "./DynamicDashboardClient";

export const metadata: Metadata = {
  title: "Command Board",
  description:
    "Draft constraint solver and freight strategy board for Haldia, Paradip, Dhamra. 90-day ML freight outlook. Real-time UKC and cargo split recommendation.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <DynamicDashboardClient />;
}
