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
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { useSidebar } from "./SidebarContext";

function getRelativeTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - d.getTime()) / 60000);

  if (diffInMinutes < 1) return `Just now`;
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export function TopHeader() {
  const { setSidebarOpen } = useSidebar();
  const { t, language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [allRead, setAllRead] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const { data: notificationsData, isLoading: isLoadingNotifications } =
    useQuery({
      queryKey: ["notifications"],
      queryFn: async () => {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${baseUrl}/api/v1/notifications`);
        if (!res.ok) return [];
        return res.json();
      },
    });

  const unreadCount = allRead
    ? 0
    : notificationsData?.filter((n: { unread: boolean }) => n.unread)?.length ||
      0;

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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 z-30 sticky top-0 shrink-0">
      <div className="flex items-center text-slate-600">
        <button
          type="button"
          aria-label="Open Sidebar"
          className="md:hidden p-2 mr-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>
        {pathname === "/dashboard" && (
          <>
            <LayoutDashboard className="hidden sm:block w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Dashboard</span>
          </>
        )}
        {pathname.includes("/requisitions") && (
          <>
            <FileText className="hidden sm:block w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Requisitions</span>
          </>
        )}
        {pathname.includes("/forecasts") && (
          <>
            <TrendingUp className="hidden sm:block w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Forecasts</span>
          </>
        )}
        {pathname.includes("/settings") && (
          <>
            <Settings className="hidden sm:block w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Settings</span>
          </>
        )}
      </div>

      <div className="flex items-center space-x-3 sm:space-x-6">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            aria-label="Toggle notifications"
            aria-expanded={notificationsOpen}
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={`relative p-2 rounded-full transition-colors focus:outline-none ${notificationsOpen ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-semibold text-slate-800">{t("notifications")}</h3>
                <span
                  onClick={() => setAllRead(true)}
                  className="text-xs font-medium text-blue-600 cursor-pointer hover:text-blue-700"
                >
                  {t("mark_read")}
                </span>
              </div>
              <div className="max-h-[300px] overflow-auto">
                {isLoadingNotifications ? (
                  <div className="p-4 text-center text-sm text-slate-500">
                    Loading notifications...
                  </div>
                ) : notificationsData?.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No new notifications
                  </div>
                ) : (
                  notificationsData?.map(
                    (
                      notif: {
                        id: string;
                        title: string;
                        desc: string;
                        time: string;
                        unread: boolean;
                      },
                      i: number,
                    ) => {
                      const isUnread = allRead ? false : notif.unread;
                      return (
                        <div
                          key={notif.id || i}
                          className={`p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 flex gap-3 ${isUnread ? "bg-blue-50/30" : ""}`}
                        >
                          <div className="mt-0.5">
                            <div
                              className={`w-2 h-2 rounded-full ${isUnread ? "bg-blue-500" : "bg-transparent"}`}
                            ></div>
                          </div>
                          <div>
                            <p
                              className={`text-sm ${isUnread ? "font-semibold text-slate-900" : "font-medium text-slate-900"}`}
                            >
                              {notif.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {notif.desc}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {getRelativeTime(notif.time)}
                            </p>
                          </div>
                        </div>
                      );
                    },
                  )
                )}
              </div>
              <div className="p-3 text-center border-t border-slate-100 bg-slate-50">
                <button
                  type="button"
                  aria-label="View all notifications"
                  className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        {/* Language Selector */}
        <div className="relative mr-2 sm:mr-4" ref={langRef}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors flex items-center"
            title="Change Language"
          >
            <Globe className="w-5 h-5" />
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-50">
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
                      className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${language === l.code ? "text-orange-600 font-semibold bg-orange-50/50" : "text-slate-700"}`}
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
          className="relative border-l border-slate-200 pl-3 sm:pl-6"
          ref={profileRef}
        >
          <div
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center cursor-pointer group"
          >
            <div className="text-right mr-3 hidden lg:block">
              <p className="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                Admin User
              </p>
              <p className="text-xs text-slate-500">Oceanix Corp.</p>
            </div>
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 border text-slate-600 flex items-center justify-center shrink-0 overflow-hidden transition-all ${profileOpen ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200 group-hover:border-blue-300"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 sm:w-6 sm:h-6 mt-1 sm:mt-2"
              >
                <path
                  fillRule="evenodd"
                  d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-56 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <p className="text-sm font-semibold text-slate-800">
                  Admin User
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  admin@oceanix.com
                </p>
              </div>
              <div className="p-2">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                >
                  <User className="w-4 h-4 mr-3 text-slate-400" />
                  My Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-3 text-slate-400" />
                  Account Settings
                </Link>
              </div>
              <div className="p-2 border-t border-slate-100">
                <button
                  type="button"
                  aria-label="Sign out"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3 text-red-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
