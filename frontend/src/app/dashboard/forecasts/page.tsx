import React from "react";
import type { Metadata } from "next";
import DynamicForecastClient from "./DynamicForecastClient";

export const metadata: Metadata = {
  title: "Freight Forecast",
  description: "90-day ML freight rate outlook for Newcastle-Haldia bulk corridor. P10/P50/P90 confidence bands with volatility shock multiplier.",
  robots: { index: false, follow: false },
};

export default function ForecastsPage() {
  return <DynamicForecastClient />;
}
