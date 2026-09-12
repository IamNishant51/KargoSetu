"use client";
"use no memo";

import React from "react";
import type { CesiumViewer } from "./KargoGlobe";
import type { CorridorPort } from "./api";

interface CorridorLayerProps {
  viewer: CesiumViewer | null;
  corridor: CorridorPort[];
  visible: boolean;
  showBoundaries: boolean;
}

const NEWCASTLE = { lat: -32.92, lon: 151.78 };

export default function CorridorLayer({ viewer, corridor, visible, showBoundaries }: CorridorLayerProps) {
  const dsRef = React.useRef<{ removeAll: () => void } | null>(null);

  React.useEffect(() => {
    if (!viewer) return;
    let cancelled = false;
    (async () => {
      const Cesium = await import("cesium");
      if (cancelled) return;
      try {
        if (dsRef.current) {
          viewer.dataSources.remove(dsRef.current as never, true);
          dsRef.current = null;
        }
      } catch {
        // replace best-effort
      }
      const ds = new Cesium.CustomDataSource("corridor");
      viewer.dataSources.add(ds);
      dsRef.current = ds as unknown as { removeAll: () => void };

      if (!visible) {
        try {
          ds.show = false;
        } catch {
          // show flag best-effort
        }
        return;
      }

      const coords: Record<string, { lat: number; lon: number }> = {
        Haldia: { lat: 22.03, lon: 88.06 },
        Paradip: { lat: 20.26, lon: 86.68 },
        Dhamra: { lat: 20.79, lon: 86.99 },
        Sandheads: { lat: 21.35, lon: 88.45 },
      };
      for (const p of corridor) {
        if (typeof p.lat === "number" && typeof p.lon === "number") {
          coords[p.name] = { lat: p.lat, lon: p.lon };
        }
      }

      const legs: Array<[string, string]> = [
        ["Newcastle", "Sandheads"],
        ["Sandheads", "Haldia"],
        ["Sandheads", "Paradip"],
        ["Sandheads", "Dhamra"],
      ];
      const allCoords: Record<string, { lat: number; lon: number }> = {
        Newcastle: NEWCASTLE,
        ...coords,
      };

      for (const [a, b] of legs) {
        const pa = allCoords[a];
        const pb = allCoords[b];
        if (!pa || !pb) continue;
        try {
          ds.entities.add({
            polyline: {
              positions: Cesium.Cartesian3.fromDegreesArray([pa.lon, pa.lat, pb.lon, pb.lat]),
              width: 2,
              material: Cesium.Color.ORANGE,
              clampToGround: true,
            },
          });
        } catch {
          // one bad leg never breaks the layer
        }
      }

      const PORT_LAYOUT: Record<string, { offset: [number, number]; hOrigin: "LEFT" | "RIGHT" | "CENTER" }> = {
        Haldia: { offset: [0, -22], hOrigin: "CENTER" },
        Sandheads: { offset: [78, 0], hOrigin: "LEFT" }, // offset eastward into open water away from 4 converging lines
        Dhamra: { offset: [-70, -2], hOrigin: "RIGHT" }, // offset westward onto land away from shipping lane
        Paradip: { offset: [-70, 0], hOrigin: "RIGHT" }, // offset westward onto land
        Newcastle: { offset: [0, -22], hOrigin: "CENTER" },
      };

      for (const p of corridor) {
        const c = allCoords[p.name];
        if (!c) continue;
        const layout = PORT_LAYOUT[p.name] ?? { offset: [0, -20], hOrigin: "CENTER" };
        const hOrigin =
          layout.hOrigin === "LEFT"
            ? Cesium.HorizontalOrigin.LEFT
            : layout.hOrigin === "RIGHT"
              ? Cesium.HorizontalOrigin.RIGHT
              : Cesium.HorizontalOrigin.CENTER;

        try {
          ds.entities.add({
            position: Cesium.Cartesian3.fromDegrees(c.lon, c.lat),
            billboard: {
              image: portDot(),
              width: 14,
              height: 14,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              eyeOffset: new Cesium.Cartesian3(0, 0, -15),
            },
            label: {
              text: ` ${p.name} · ${p.draft} `,
              font: "bold 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.fromCssColorString("#0A2342"),
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              showBackground: true,
              backgroundColor: Cesium.Color.fromCssColorString("rgba(10, 35, 66, 0.94)"),
              backgroundPadding: new Cesium.Cartesian2(8, 5),
              pixelOffset: new Cesium.Cartesian2(layout.offset[0], layout.offset[1]),
              horizontalOrigin: hOrigin,
              verticalOrigin: Cesium.VerticalOrigin.CENTER,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              eyeOffset: new Cesium.Cartesian3(0, 0, -25),
              show: true,
            },
          });
        } catch {
          // one bad port never breaks the layer
        }
      }

      if (showBoundaries) {
        try {
          ds.entities.add({
            rectangle: {
              coordinates: Cesium.Rectangle.fromDegrees(80.0, 15.0, 95.0, 23.5),
              material: Cesium.Color.WHITE.withAlpha(0.02),
              outline: true,
              outlineColor: Cesium.Color.WHITE.withAlpha(0.4),
            },
          });
        } catch {
          // boundary box best-effort
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [viewer, corridor, visible, showBoundaries]);

  React.useEffect(() => {
    return () => {
      try {
        if (viewer && dsRef.current) viewer.dataSources.remove(dsRef.current as never, true);
      } catch {
        // cleanup best-effort
      }
      dsRef.current = null;
    };
  }, [viewer]);

  return null;
}

function portDot(): string {
  if (typeof document === "undefined") return "";
  const c = document.createElement("canvas");
  c.width = 32;
  c.height = 32;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  ctx.beginPath();
  ctx.arc(16, 16, 12, 0, Math.PI * 2);
  ctx.fillStyle = "#FAF7F1";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#D95D0F";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(16, 16, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#0A2342";
  ctx.fill();
  return c.toDataURL();
}
