"use client";

import dynamic from "next/dynamic";
import React from "react";

const ForecastClient = dynamic(() => import("./ForecastClient"), {
  ssr: false,
});

export default function DynamicForecastClient() {
  return <ForecastClient />;
}