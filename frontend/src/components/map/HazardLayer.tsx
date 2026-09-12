"use client";
"use no memo";

import React from "react";
import type { CesiumViewer } from "./KargoGlobe";
import type { HazardsResponse } from "./api";

interface HazardLayerProps {
  viewer: CesiumViewer | null;
  hazards: HazardsResponse | undefined;
  showHazards: boolean;
  showWeather: boolean;
}

export default function HazardLayer({ viewer, hazards, showHazards, showWeather }: HazardLayerProps) {
  const dsRef = React.useRef<{ removeAll: () => void } | null>(null);

  React.useEffect(() => {
    if (!viewer) return;
    let cancelled = false;
    (async () => {
      const Cesium = await import("cesium");
      if (cancelled) return;
      try {
        dsRef.current?.removeAll();
      } catch {
        // clear best-effort
      }
      if (!hazards) return;
      const ds = new Cesium.CustomDataSource("hazards");
      viewer.dataSources.add(ds);
      dsRef.current = ds as unknown as { removeAll: () => void };

      if (showHazards) {
        for (const q of hazards.earthquakes.slice(0, 200)) {
          try {
            const mag = typeof q.mag === "number" ? q.mag : 4.5;
            ds.entities.add({
              position: Cesium.Cartesian3.fromDegrees(q.lon, q.lat),
              ellipse: {
                semiMajorAxis: mag * 15000,
                semiMinorAxis: mag * 15000,
                material: Cesium.Color.RED.withAlpha(0.35),
                outline: true,
                outlineColor: Cesium.Color.RED,
              },
              label: {
                text: `M${mag.toFixed(1)}`,
                show: mag >= 5.5,
                font: "11px monospace",
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              },
            });
          } catch {
            // one bad quake never breaks the layer
          }
        }
        for (const f of hazards.fires.slice(0, 300)) {
          try {
            ds.entities.add({
              position: Cesium.Cartesian3.fromDegrees(f.lon, f.lat),
              billboard: {
                image: fireDot(),
                width: 10,
                height: 10,
              },
            });
          } catch {
            // one bad fire never breaks the layer
          }
        }
      }

      if (showWeather && hazards.weather) {
        try {
          const w = hazards.weather;
          const label =
            `Waves ${w.waveHeightM ?? "?"}m · Wind ${w.windSpeedKmh ?? "?"}km/h (${w.source})`;
          ds.entities.add({
            position: Cesium.Cartesian3.fromDegrees(87.5, 19.0),
            label: {
              text: label,
              font: "12px monospace",
              fillColor: Cesium.Color.LIGHTSKYBLUE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            },
          });
        } catch {
          // weather label best-effort
        }
      }

      try {
        ds.show = showHazards || showWeather;
      } catch {
        // show flag best-effort
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [viewer, hazards, showHazards, showWeather]);

  React.useEffect(() => {
    return () => {
      try {
        if (viewer && dsRef.current) {
          viewer.dataSources.remove(dsRef.current as never, true);
        }
      } catch {
        // cleanup best-effort
      }
      dsRef.current = null;
    };
  }, [viewer]);

  return null;
}

function fireDot(): string {
  if (typeof document === "undefined") return "";
  const c = document.createElement("canvas");
  c.width = 16;
  c.height = 16;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  ctx.beginPath();
  ctx.arc(8, 8, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#FF6D00";
  ctx.fill();
  return c.toDataURL();
}
