"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Settings,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { useLanguage } from "@/i18n/LanguageContext";
import Cookies from "js-cookie";
import { useUser } from "@/hooks/useUser";
import { clearSessionAndRedirect } from "@/lib/auth";

const NAV = [
  { href: "/dashboard", match: (p: string) => p === "/dashboard", icon: LayoutDashboard, key: "dashboard" as const, label: "Dashboard" },
  { href: "/dashboard/requisitions", match: (p: string) => p.includes("/requisitions"), icon: FileText, key: "requisitions" as const, label: "Requisitions" },
  { href: "/dashboard/forecasts", match: (p: string) => p.includes("/forecasts"), icon: TrendingUp, key: "forecasts" as const, label: "Forecasts" },
  { href: "/dashboard/settings", match: (p: string) => p.includes("/settings"), icon: Settings, key: "settings" as const, label: "Settings" },
];

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, isCollapsed, setIsCollapsed } = useSidebar();
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useUser();

// Close sidebar on route change on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0A2342]/40 z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-white text-[#0A2342] border-r border-[#E2E6EB] flex flex-col fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} ${isCollapsed ? "w-20" : "w-64"}`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#E2E6EB] shrink-0 relative">
          <Link
            href="/"
            className={`flex items-center hover:opacity-80 transition-opacity cursor-pointer ${isCollapsed ? "mx-auto px-0" : ""}`}
          >
            <span className={`relative block h-12 w-12 shrink-0 ${isCollapsed ? "" : "mr-2.5"}`}>
              <Image
                src="/logo-ks.png"
                alt="KargoSetu"
                fill
                className="object-contain"
                sizes="48px"
              />
            </span>
            {!isCollapsed && (
              <span className="font-display text-[19px] font-black tracking-tight text-[#0A2342]">
                KargoSetu<span className="text-[#D95D0F]">.</span>
              </span>
            )}
          </Link>
          <button
            type="button"
            aria-label="Close sidebar"
            className="md:hidden text-[#6B7D99] hover:text-[#0A2342]"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex absolute -right-3 top-5 bg-white border border-[#E2E6EB] rounded-full w-6 h-6 items-center justify-center text-[#6B7D99] hover:text-[#0A2342] shadow-sm z-50"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {!isCollapsed && <p className="mono-label text-[#6B7D99] px-3 pb-2">{t("nav_desk")}</p>}
          {NAV.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={isCollapsed ? (t(item.key) === item.key ? item.label : t(item.key)) : undefined}
                className={`flex items-center ${isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5"} rounded-lg text-[14px] transition-colors ${
                  active
                    ? "bg-[#FDF1E7] text-[#B45309] font-bold border-l-4 border-[#D95D0F]"
                    : "text-[#3D4F68] font-medium hover:text-[#0A2342] hover:bg-[#FAF7F1]"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {!isCollapsed && <span>{t(item.key) === item.key ? item.label : t(item.key)}</span>}
              </Link>
            );
          })}
          {!isCollapsed && (
            <div className="pt-4 px-3">
              <div className="rounded-lg bg-[#FAF7F1] border border-[#E2E6EB] px-3.5 py-3">
                <p className="mono-label text-[#6B7D99]">{t("haldia_live")}</p>
                <p className="mt-1.5 font-mono text-[12.5px] font-semibold text-[#0A2342] whitespace-nowrap overflow-hidden text-ellipsis">
                  {t("haldia_live_vals")}
                </p>
              </div>
            </div>
          )}
        </nav>

        {/* Profile Area - Sidebar */}
        <div className="p-3 border-t border-[#E2E6EB]">
          <div className={`flex items-center bg-[#FAF7F1] border border-[#E2E6EB] p-3 rounded-xl ${isCollapsed ? "justify-center flex-col gap-3" : "justify-between"}`}>
            <div className={`flex items-center overflow-hidden ${isCollapsed ? "justify-center" : ""}`}>
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || "User avatar"}
                  className="w-9 h-9 rounded-full shrink-0 border border-[#E2E6EB]"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#D95D0F] text-white flex items-center justify-center font-bold text-[13px] shrink-0">
                  {user?.name?.substring(0, 2).toUpperCase() || "U"}
                </div>
              )}
              {!isCollapsed && (
                <div className="ml-2.5 overflow-hidden">
                  <p className="text-[13.5px] font-bold text-[#0A2342] truncate">
                    {user?.name || "KargoSetu User"}
                  </p>
                  <p className="text-[12px] text-[#6B7D99] truncate">{user?.email || t("admin")}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                Cookies.remove("auth_token", { path: '/' });
                clearSessionAndRedirect();
                router.push('/login');
              }}
              className={`text-[#6B7D99] hover:text-[#B42318] hover:bg-[#FDECEC] rounded-lg transition-colors ${isCollapsed ? "p-1.5" : "p-2"}`}
              title={t("logout")}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
