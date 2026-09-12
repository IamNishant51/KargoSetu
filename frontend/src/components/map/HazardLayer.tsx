"use client";

import React from "react";
import type { CesiumViewer } from "./KargoGlobe";
import { cachedSprite, getCesium } from "./api";
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
      const Cesium = await getCesium();
      if (cancelled) return;
      // Remove-then-add: the previous datasource is destroyed before the new
      // one is created, so repeated polls never leak datasources.
      try {
        if (dsRef.current) {
          viewer.dataSources.remove(dsRef.current as never, true);
          dsRef.current = null;
        }
      } catch {
        // replace best-effort
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
                text: ` M${mag.toFixed(1)} `,
                show: mag >= 5.2,
                font: "bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.fromCssColorString("#7F1D1D"),
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString("rgba(180, 35, 24, 0.92)"),
                backgroundPadding: new Cesium.Cartesian2(6, 3),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                eyeOffset: new Cesium.Cartesian3(0, 0, -20),
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
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                eyeOffset: new Cesium.Cartesian3(0, 0, -15),
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
            ` Waves ${w.waveHeightM ?? "?"} m · Wind ${w.windSpeedKmh ?? "?"} km/h (${w.source}) `;
          ds.entities.add({
            position: Cesium.Cartesian3.fromDegrees(87.5, 19.0),
            label: {
              text: label,
              font: "bold 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fillColor: Cesium.Color.fromCssColorString("#67E8F9"),
              outlineColor: Cesium.Color.fromCssColorString("#0A2342"),
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              showBackground: true,
              backgroundColor: Cesium.Color.fromCssColorString("rgba(10, 35, 66, 0.94)"),
              backgroundPadding: new Cesium.Cartesian2(12, 6),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              eyeOffset: new Cesium.Cartesian3(0, 0, -25),
              show: true,
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
  return cachedSprite("hazard-fire-dot", () => {
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
  });
}
