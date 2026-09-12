"use client";

import { useQuery } from "@tanstack/react-query";
import { getApiBase } from "./api";
import type { CorridorPort } from "./api";

const FALLBACK_CORRIDOR: CorridorPort[] = [
  { n: "01", name: "Haldia", sub: "Hooghly river · tide-bound", draft: "7.5 m", tide: "+2.8 – 4.2 m", ship: "Supramax direct", note: "Heavy siltation. The reason splits exist.", flag: "Watch", lat: 22.03, lon: 88.06, liveVesselCount: null, nearestVesselNm: null },
  { n: "02", name: "Paradip", sub: "Bay of Bengal · all-weather", draft: "14.5 m", tide: "+1.2 – 2.4 m", ship: "Panamax / baby Cape", note: "Mechanised coal berths. Laycan discipline matters.", flag: "Open", lat: 20.26, lon: 86.68, liveVesselCount: null, nearestVesselNm: null },
  { n: "03", name: "Dhamra", sub: "Deep-sea fairway", draft: "16.0 m", tide: "+1.5 – 2.8 m", ship: "Full Capesize 180k", note: "Coking-coal front door when Haldia chokes.", flag: "Open", lat: 20.79, lon: 86.99, liveVesselCount: null, nearestVesselNm: null },
  { n: "04", name: "Sandheads", sub: "Offshore roads · lighterage", draft: "22 m+", tide: "Open ocean", ship: "All classes", note: "Where big ships break bulk into shuttles.", flag: "Hub", lat: 21.35, lon: 88.45, liveVesselCount: null, nearestVesselNm: null },
];

const PORT_COORDS: Record<string, { lat: number; lon: number }> = {
  Haldia: { lat: 22.03, lon: 88.06 },
  Paradip: { lat: 20.26, lon: 86.68 },
  Dhamra: { lat: 20.79, lon: 86.99 },
  Sandheads: { lat: 21.35, lon: 88.45 },
};

export function useCorridor() {
  return useQuery<CorridorPort[]>({
    queryKey: ["corridor"],
    queryFn: async ({ signal }) => {
      try {
        const res = await fetch(`${getApiBase()}/api/v1/ports/corridor`, { signal });
        if (!res.ok) throw new Error("corridor fetch failed");
        const data = (await res.json()) as CorridorPort[];
        if (!Array.isArray(data) || data.length === 0) return FALLBACK_CORRIDOR;
        return data.map((p) => ({
          ...p,
          lat: p.lat ?? PORT_COORDS[p.name]?.lat,
          lon: p.lon ?? PORT_COORDS[p.name]?.lon,
        }));
      } catch {
        return FALLBACK_CORRIDOR;
      }
    },
    staleTime: 300000,
    refetchInterval: 300000,
    refetchIntervalInBackground: false,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    refetchOnWindowFocus: false,
    initialData: FALLBACK_CORRIDOR,
  });
}
