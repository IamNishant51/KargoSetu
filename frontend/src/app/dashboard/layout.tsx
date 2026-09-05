import React from "react";
import { SidebarProvider } from "./components/SidebarContext";
import { Sidebar } from "./components/Sidebar";
import { TopHeader } from "./components/TopHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-slate-50 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col md:ml-64 min-h-screen transition-all duration-300">
          <TopHeader />
          <main className="flex-1 p-4 sm:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
