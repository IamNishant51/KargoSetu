"use client";

import { useQuery } from "@tanstack/react-query";
import { getApiBase } from "./api";

export interface FeedSnapshot {
  status: string;
  database: string;
  ml_model: string;
  version: string;
  feeds?: {
    vessels?: { mode?: string; collectsToday?: number };
    hazards?: {
      usgs?: string;
      firms?: string;
      meteo?: string;
      firmsUsedToday?: number;
    };
  };
}

export function useFeeds() {
  return useQuery<FeedSnapshot>({
    queryKey: ["feeds"],
    queryFn: async ({ signal }) => {
      const res = await fetch(`${getApiBase()}/api/health`, { signal });
      if (!res.ok) throw new Error("feeds fetch failed");
      return res.json() as Promise<FeedSnapshot>;
    },
    staleTime: 60000,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
