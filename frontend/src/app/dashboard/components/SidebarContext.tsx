"use client";

import React, { createContext, useContext, useState } from "react";

type SidebarContextType = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsedState] = useState(false);

  // Load persisted state on mount
  React.useEffect(() => {
    const stored = localStorage.getItem("ks_sidebar_collapsed");
    if (stored !== null) {
      setIsCollapsedState(stored === "true");
    }
  }, []);

  // Wrapped setter to sync with localStorage
  const setIsCollapsed = (collapsed: boolean) => {
    setIsCollapsedState(collapsed);
    localStorage.setItem("ks_sidebar_collapsed", String(collapsed));
  };

  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen, isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context)
    throw new Error("useSidebar must be used within SidebarProvider");
  return context;
}
