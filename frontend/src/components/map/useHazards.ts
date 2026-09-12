"use client";

import { useQuery } from "@tanstack/react-query";
import { bboxToQuery, getApiBase } from "./api";
import type { BBox, HazardsResponse } from "./api";

export function useHazards(bbox: BBox) {
  return useQuery<HazardsResponse>({
    queryKey: ["hazards", bbox],
    queryFn: async () => {
      const res = await fetch(
        `${getApiBase()}/api/v1/hazards/summary?${bboxToQuery(bbox)}`,
      );
      if (!res.ok) throw new Error("hazards fetch failed");
      return res.json() as Promise<HazardsResponse>;
    },
    staleTime: 60000,
    refetchInterval: 60000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
