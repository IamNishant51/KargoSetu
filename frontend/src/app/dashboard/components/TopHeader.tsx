"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  FileText,
  TrendingUp,
  Settings,
  Bell,
  LogOut,
  User,
  Globe,
  RotateCcw,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useUser } from "@/hooks/useUser";
import { useNotifications, relativeTime } from "@/hooks/useNotifications";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { clearSessionAndRedirect } from "@/lib/auth";

const CRUMBS = [
  { match: (p: string) => p === "/dashboard", icon: LayoutDashboard, key: "dashboard" },
  { match: (p: string) => p.includes("/requisitions"), icon: FileText, key: "requisitions" },
  { match: (p: string) => p.includes("/forecasts"), icon: TrendingUp, key: "forecasts" },
  { match: (p: string) => p.includes("/settings"), icon: Settings, key: "settings" },
];

export function TopHeader() {
  const { setSidebarOpen } = useSidebar();
  const { t, language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useUser();
  const {
    notifications,
    unreadCount,
    isLoading: isLoadingNotifications,
    isError: notifError,
    refetch: refetchNotifs,
    markAllAsRead,
  } = useNotifications();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<"all" | "unread">("all");

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node))
        setNotificationsOpen(false);
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      )
        setProfileOpen(false);
      if (langRef.current && !langRef.current.contains(event.target as Node))
        setLangOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const crumb = CRUMBS.find((c) => c.match(pathname));
  const visibleNotifs = notifTab === "unread" ? notifications.filter((n) => n.unread) : notifications;

  return (
    <header className="h-16 bg-white border-b border-[#E2E6EB] flex items-center justify-between px-4 sm:px-8 z-30 sticky top-0 shrink-0">
      <div className="flex items-center text-[#3D4F68]">
        <button
          type="button"
          aria-label={t("open_sidebar")}
          className="md:hidden p-2 mr-2 -ml-2 text-[#6B7D99] hover:text-[#0A2342] hover:bg-[#FAF7F1] rounded-lg transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>
        {crumb && (
          <>
            <crumb.icon size={17} className="hidden sm:block mr-2 text-[#B45309]" />
            <span className="mono-label text-[#3D4F68]">{t(crumb.key)}</span>
          </>
        )}
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            aria-label={t("notifications")}
            aria-expanded={notificationsOpen}
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={`relative p-2 rounded-full transition-colors focus:outline-none ${notificationsOpen ? "bg-[#FAF7F1] text-[#0A2342]" : "text-[#6B7D99] hover:text-[#0A2342] hover:bg-[#FAF7F1]"}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#D95D0F] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[#E2E6EB] bg-white shadow-[4px_4px_0_rgba(10,35,66,0.08)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="px-4 pt-4 pb-3 border-b border-[#E2E6EB] bg-[#FAF7F1]">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#0A2342] text-[15px]">{t("notifications")}</h3>
                  <span
                    onClick={markAllAsRead}
                    className="text-xs font-bold text-[#B45309] cursor-pointer hover:text-[#0A2342]"
                  >
                    {t("mark_read")}
                  </span>
                </div>
                <div className="mt-3 inline-flex rounded-lg border border-[#E2E6EB] bg-white p-0.5">
                  {(["all", "unread"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setNotifTab(tab)}
                      className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition-colors ${
                        notifTab === tab ? "bg-[#0A2342] text-white" : "text-[#6B7D99] hover:text-[#0A2342]"
                      }`}
                    >
                      {t(tab === "all" ? "notif_all" : "notif_unread")}
                      {tab === "unread" && unreadCount > 0 && ` · ${unreadCount}`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="max-h-[300px] overflow-auto">
                {isLoadingNotifications ? (
                  <div className="p-4 text-center text-sm text-[#6B7D99]">
                    {t("notif_loading")}
                  </div>
                ) : notifError ? (
                  <div className="p-5 text-center">
                    <p className="text-sm font-medium text-[#3D4F68]">{t("notif_error")}</p>
                    <button
                      type="button"
                      onClick={() => refetchNotifs()}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#FDF1E7] border border-[#D95D0F]/30 px-3.5 py-2 text-[12.5px] font-bold text-[#B45309] hover:text-[#0A2342] transition-colors"
                    >
                      <RotateCcw size={13} />
                      {t("retry")}
                    </button>
                  </div>
                ) : visibleNotifs.length === 0 ? (
                  <div className="p-4 text-center text-sm text-[#6B7D99]">
                    {notifTab === "unread" ? t("notif_empty") : t("notif_empty_all")}
                  </div>
                ) : (
                  visibleNotifs.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 border-b border-[#E2E6EB] transition-colors hover:bg-[#FAF7F1] flex gap-3 ${notif.unread ? "bg-[#FDF1E7]/60" : ""}`}
                    >
                      <div className="mt-1.5">
                        <div
                          className={`w-2 h-2 rounded-full ${notif.unread ? "bg-[#D95D0F]" : "bg-transparent"}`}
                        ></div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0A2342]">
                          {notif.title}
                        </p>
                        <p className="text-xs text-[#6B7D99] mt-0.5">
                          {notif.desc}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-[#6B7D99] mt-1">
                          {relativeTime(notif.time, t)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Language Selector */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="p-2 text-[#6B7D99] hover:text-[#0A2342] hover:bg-[#FAF7F1] rounded-full transition-colors flex items-center"
            title={t("change_language")}
            aria-label={t("change_language")}
          >
            <Globe className="w-5 h-5" />
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-[4px_4px_0_rgba(10,35,66,0.08)] border border-[#E2E6EB] overflow-hidden z-50">
              <ul className="py-1">
                {[
                  { code: "en", label: "English" },
                  { code: "hi", label: "हिन्दी" },
                  { code: "bn", label: "বাংলা" },
                  { code: "mr", label: "मराठी" },
                  { code: "ta", label: "தமிழ்" },
                  { code: "te", label: "తెలుగు" },
                  { code: "gu", label: "ગુજરાતી" },
                ].map((l) => (
                  <li key={l.code}>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[#FAF7F1] ${language === l.code ? "text-[#B45309] font-bold bg-[#FDF1E7]" : "text-[#3D4F68]"}`}
                      onClick={() => {
                        setLanguage(l.code as "en" | "hi" | "bn" | "mr" | "ta" | "te" | "gu");
                        setLangOpen(false);
                      }}
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div
          className="relative border-l border-[#E2E6EB] pl-2 sm:pl-4"
          ref={profileRef}
        >
          <div
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center cursor-pointer group"
          >
            <div className="text-right mr-3 hidden lg:block">
              <p className="text-[13.5px] font-bold text-[#0A2342] group-hover:text-[#B45309] transition-colors">
                {user?.name || "KargoSetu User"}
              </p>
              <p className="text-xs text-[#6B7D99]">{user?.email || t("admin")}</p>
            </div>

            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || "Avatar"}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full shrink-0 border transition-all ${profileOpen ? "border-[#D95D0F] ring-2 ring-[#D95D0F]/20" : "border-[#E2E6EB] group-hover:border-[#D95D0F]"}`}
              />
            ) : (
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#D95D0F] text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden transition-all ${profileOpen ? "ring-2 ring-[#D95D0F]/20" : ""}`}
              >
                {user?.name?.substring(0, 2).toUpperCase() || "U"}
              </div>
            )}
          </div>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-56 rounded-xl border border-[#E2E6EB] bg-white shadow-[4px_4px_0_rgba(10,35,66,0.08)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="p-4 border-b border-[#E2E6EB] bg-[#FAF7F1]">
                <p className="text-sm font-bold text-[#0A2342]">
                  {user?.name || "KargoSetu User"}
                </p>
                <p className="text-xs text-[#6B7D99] mt-0.5">
                  {user?.email || t("admin")}
                </p>
              </div>
              <div className="p-2">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center px-3 py-2 text-sm font-medium text-[#3D4F68] rounded-lg hover:bg-[#FAF7F1] hover:text-[#0A2342] transition-colors"
                >
                  <User size={15} className="mr-3 text-[#6B7D99]" />
                  {t("profile_title")}
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center px-3 py-2 text-sm font-medium text-[#3D4F68] rounded-lg hover:bg-[#FAF7F1] hover:text-[#0A2342] transition-colors"
                >
                  <Settings size={15} className="mr-3 text-[#6B7D99]" />
                  {t("account_settings")}
                </Link>
              </div>
              <div className="p-2 border-t border-[#E2E6EB]">
                <button
                  type="button"
                  onClick={() => {
                    Cookies.remove("auth_token", { path: '/' });
                    clearSessionAndRedirect();
                    router.push('/login');
                  }}
                  aria-label={t("sign_out")}
                  className="w-full flex items-center px-3 py-2 text-sm font-bold text-[#B42318] rounded-lg hover:bg-[#FDECEC] transition-colors"
                >
                  <LogOut size={15} className="mr-3" />
                  {t("sign_out")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
