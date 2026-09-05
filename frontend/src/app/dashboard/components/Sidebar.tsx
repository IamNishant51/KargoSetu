"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Settings,
  X,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { useLanguage } from "@/i18n/LanguageContext";

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const { t } = useLanguage();
  const pathname = usePathname();

// Close sidebar on route change on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 bg-white text-slate-800 border-r border-slate-200 flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 shrink-0">
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="relative h-8 w-8 mr-3">
              <Image
                src="/KargoSetu-LOGO.png"
                alt="Logo"
                fill
                className="object-contain"
                sizes="32px"
              />
            </div>
            <span className="text-xl font-bold tracking-wide text-slate-900">
              KargoSetu<span className="text-orange-500">.</span>
            </span>
          </Link>
          <button
            type="button"
            aria-label="Close sidebar"
            className="md:hidden text-slate-500 hover:text-slate-900"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link
            href="/dashboard"
            className={`flex items-center px-3 py-3 rounded-md font-medium transition-colors ${pathname === "/dashboard" ? "bg-orange-50 text-orange-700 border-l-4 border-orange-500 font-semibold" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-slate-100"}`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            {t("dashboard")}
          </Link>
          <Link
            href="/dashboard/requisitions"
            className={`flex items-center px-3 py-3 rounded-md font-medium transition-colors ${pathname.includes("/requisitions") ? "bg-orange-50 text-orange-700 border-l-4 border-orange-500 font-semibold" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-slate-100"}`}
          >
            <FileText className="w-5 h-5 mr-3" />
            {t("requisitions")}
          </Link>
          <Link
            href="/dashboard/forecasts"
            className={`flex items-center px-3 py-3 rounded-md font-medium transition-colors ${pathname.includes("/forecasts") ? "bg-orange-50 text-orange-700 border-l-4 border-orange-500 font-semibold" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-slate-100"}`}
          >
            <TrendingUp className="w-5 h-5 mr-3" />
            {t("forecasts")}
          </Link>
          <Link
            href="/dashboard/settings"
            className={`flex items-center px-3 py-3 rounded-md font-medium transition-colors ${pathname.includes("/settings") ? "bg-orange-50 text-orange-700 border-l-4 border-orange-500 font-semibold" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-slate-100"}`}
          >
            <Settings className="w-5 h-5 mr-3" />
            {t("settings")}
          </Link>
        </nav>

        {/* Profile Area - Sidebar */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center bg-slate-50 border border-slate-100 p-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold text-sm shrink-0">
              AC
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">
                Oceanix Corp.
              </p>
              <p className="text-xs text-slate-500 truncate">Admin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
