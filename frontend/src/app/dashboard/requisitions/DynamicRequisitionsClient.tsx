"use client";

import dynamic from "next/dynamic";
import React from "react";

const RequisitionsClient = dynamic(() => import("./RequisitionsClient"), {
  ssr: false,
});

export default function DynamicRequisitionsClient() {
  return <RequisitionsClient />;
}