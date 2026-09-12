"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { bboxToQuery, getApiBase } from "./api";
import type { BBox, HazardsResponse } from "./api";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export function useHazards(bbox: BBox) {
  const debounced = useDebouncedValue(bbox, 500);
  return useQuery<HazardsResponse>({
    queryKey: ["hazards", debounced],
    queryFn: async ({ signal }) => {
      const res = await fetch(
        `${getApiBase()}/api/v1/hazards/summary?${bboxToQuery(debounced)}`,
        { signal },
      );
      if (!res.ok) throw new Error("hazards fetch failed");
      return res.json() as Promise<HazardsResponse>;
    },
    staleTime: 60000,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    refetchOnWindowFocus: false,
  });
}
