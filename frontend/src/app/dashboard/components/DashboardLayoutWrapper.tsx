"use client";
import React from "react";
import { useSidebar } from "./SidebarContext";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

export function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  return (
    <div className="min-h-screen bg-[#FAF7F1] flex overflow-hidden">
      <Sidebar />
      <div className={`flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <TopHeader />
        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
