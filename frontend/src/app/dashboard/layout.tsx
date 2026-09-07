import React from "react";
import { SidebarProvider } from "./components/SidebarContext";
import { DashboardLayoutWrapper } from "./components/DashboardLayoutWrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <SidebarProvider>
        <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>
      </SidebarProvider>
  );
}
