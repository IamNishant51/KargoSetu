"use client";

import dynamic from "next/dynamic";
import React from "react";

const DashboardClient = dynamic(() => import("./DashboardClient"), {
  ssr: false,
});

export default function DynamicDashboardClient() {
  return <DashboardClient />;
}