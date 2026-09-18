import React from "react";
import { SidebarProvider } from "./components/SidebarContext";
import { DashboardLayoutWrapper } from "./components/DashboardLayoutWrapper";
import GlobalCopilot from "@/components/GlobalCopilot";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>
      <GlobalCopilot />
    </SidebarProvider>
  );
}
