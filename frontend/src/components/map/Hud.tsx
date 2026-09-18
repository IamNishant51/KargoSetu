"use client";

import React from "react";
import type { CesiumViewer } from "./KargoGlobe";
import type { Vessel, VesselMode } from "./api";

interface HudProps {
  viewer: CesiumViewer | null;
  vesselCount: number;
  hazardCount: number;
  selected: Vessel | null;
  mode: VesselMode;
}

export default function Hud({
  viewer,
  vesselCount,
  hazardCount,
  selected,
  mode,
}: HudProps) {
  const [cam, setCam] = React.useState({ lon: 0, lat: 0, alt: 0 });
  const lastRef = React.useRef({ lon: 0, lat: 0, alt: 0 });

  React.useEffect(() => {
    if (!viewer) return;
    let alive = true;
    const id = window.setInterval(() => {
      if (!alive) return;
      try {
        const carto = viewer.scene?.camera?.positionCartographic;
        if (!carto) return;
        const next = {
          lon: (carto.longitude * 180) / Math.PI,
          lat: (carto.latitude * 180) / Math.PI,
          alt: carto.height,
        };
        const last = lastRef.current;
        // Skip re-render when the camera has not moved (static globe = zero HUD churn).
        if (
          Math.abs(next.lon - last.lon) < 1e-9 &&
          Math.abs(next.lat - last.lat) < 1e-9 &&
          Math.abs(next.alt - last.alt) < 1e-6
        ) {
          return;
        }
        lastRef.current = next;
        setCam(next);
      } catch {
        // HUD read best-effort, max 4Hz
      }
    }, 250);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [viewer]);

  return (
    <div className="pointer-events-none absolute left-3 top-[150px] z-10 flex flex-col gap-2 font-mono text-[11px] sm:top-[84px]">
      <div className="pointer-events-auto rounded-xl bg-white/95 border border-[#E2E6EB] px-3 py-2 shadow-sm">
        <span className="uppercase tracking-[0.14em] text-[#6B7D99]">Cam </span>
        <span className="font-bold text-[#0A2342]">
          {cam.lat.toFixed(2)}°, {cam.lon.toFixed(2)}° ·{" "}
          {(cam.alt / 1000).toFixed(0)}k m
        </span>
      </div>
      <div className="pointer-events-auto rounded-xl bg-white/95 border border-[#E2E6EB] px-3 py-2 shadow-sm">
        <span className="uppercase tracking-[0.14em] text-[#6B7D99]">
          Contacts{" "}
        </span>
        <span className="font-bold text-[#0A2342]">
          {vesselCount} vessels · {hazardCount} hazards · {mode}
        </span>
      </div>
      {selected && (
        <div className="pointer-events-auto rounded-xl bg-white/95 border border-[#E2E6EB] px-3 py-2 shadow-sm">
          <span className="uppercase tracking-[0.14em] text-[#6B7D99]">
            Tracked{" "}
          </span>
          <span className="font-bold text-[#0A2342]">
            {selected.name || selected.mmsi} · {selected.sog ?? "—"} kn
          </span>
        </div>
      )}
    </div>
  );
}
