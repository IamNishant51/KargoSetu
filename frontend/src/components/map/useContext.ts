"use client";

import { useQuery } from "@tanstack/react-query";
import { getApiBase } from "./api";
import type { GeoReverse, PortNews, RouteWx } from "./api";

export function usePortNews(port: string) {
  return useQuery<PortNews>({
    queryKey: ["port-news", port],
    queryFn: async ({ signal }) => {
      const res = await fetch(`${getApiBase()}/api/v1/context/news/port?q=${encodeURIComponent(port)}`, {
        signal,
      });
      if (!res.ok) throw new Error("port news fetch failed");
      return res.json() as Promise<PortNews>;
    },
    staleTime: 900000,
    refetchInterval: 900000,
    refetchIntervalInBackground: false,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useLocality(lat: number | null, lon: number | null) {
  const enabled = typeof lat === "number" && typeof lon === "number" && Number.isFinite(lat) && Number.isFinite(lon);
  return useQuery<GeoReverse>({
    queryKey: ["locality", lat, lon],
    queryFn: async ({ signal }) => {
      const res = await fetch(`${getApiBase()}/api/v1/context/geo/reverse?lat=${lat}&lon=${lon}`, {
        signal,
      });
      if (!res.ok) throw new Error("reverse geocode fetch failed");
      return res.json() as Promise<GeoReverse>;
    },
    enabled,
    staleTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useRouteWx() {
  return useQuery<RouteWx>({
    queryKey: ["route-wx"],
    queryFn: async ({ signal }) => {
      const res = await fetch(`${getApiBase()}/api/v1/context/route/weather`, { signal });
      if (!res.ok) throw new Error("route weather fetch failed");
      return res.json() as Promise<RouteWx>;
    },
    staleTime: 300000,
    refetchInterval: 300000,
    refetchIntervalInBackground: false,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
