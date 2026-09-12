"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { bboxToQuery, getApiBase } from "./api";
import type { BBox, VesselsResponse } from "./api";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export function useVessels(bbox: BBox) {
  const debounced = useDebouncedValue(bbox, 500);
  return useQuery<VesselsResponse>({
    queryKey: ["vessels", debounced],
    queryFn: async ({ signal }) => {
      const res = await fetch(
        `${getApiBase()}/api/v1/vessels/live?${bboxToQuery(debounced)}`,
        { signal },
      );
      if (!res.ok) throw new Error("vessels fetch failed");
      return res.json() as Promise<VesselsResponse>;
    },
    staleTime: 30000,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    refetchOnWindowFocus: false,
  });
}
