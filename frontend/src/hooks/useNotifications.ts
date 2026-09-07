"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

export interface DeskNotification {
  id: string;
  kind?: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

const READ_KEY = "kargosetu_notif_read";
const POLL_MS = 30_000;
const MAX_STORED = 200;

function loadReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(READ_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

/** "5m ago" in the active language. t() has no interpolation so {n} is filled here. */
export function relativeTime(dateStr: string, t: (key: string) => string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const mins = Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000));
  if (mins < 1) return t("notif_just_now");
  if (mins < 60) return t("notif_min_ago").replace("{n}", String(mins));
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t("notif_hr_ago").replace("{n}", String(hrs));
  return t("notif_day_ago").replace("{n}", String(Math.floor(hrs / 24)));
}

export function useNotifications() {
  const [readIds, setReadIds] = useState<Set<string>>(loadReadIds);

  useEffect(() => {
    try {
      window.localStorage.setItem(READ_KEY, JSON.stringify([...readIds].slice(-MAX_STORED)));
    } catch {
      // storage full or blocked — feed still works, receipts just won't persist
    }
  }, [readIds]);

  const query = useQuery<DeskNotification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = Cookies.get("auth_token");
      const res = await fetch(`${baseUrl}/api/v1/notifications?limit=20`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("notifications_unavailable");
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const markAllAsRead = useCallback(() => {
    const ids = (query.data ?? []).map((n) => n.id);
    setReadIds((prev) => new Set([...prev, ...ids]));
  }, [query.data]);

  const notifications = (query.data ?? []).map((n) => ({
    ...n,
    unread: n.unread && !readIds.has(n.id),
  }));
  const unreadCount = notifications.filter((n) => n.unread).length;

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    markAllAsRead,
  };
}
