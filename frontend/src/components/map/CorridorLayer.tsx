"use client";

import React from "react";
import type { CesiumViewer } from "./KargoGlobe";
import { getCesium } from "./api";
import type { CorridorPort, RouteWxPoint } from "./api";

interface CorridorLayerProps {
  viewer: CesiumViewer | null;
  corridor: CorridorPort[];
  visible: boolean;
  showBoundaries: boolean;
  routeWx?: RouteWxPoint[];
}

const NEWCASTLE = { lat: -32.92, lon: 151.78 };

// Metocean leg coloring: green < 1.5 m, orange < 2.5 m, red at/above,
// corridor orange when no observation. Thresholds match small-bulk comfort.
function legColor(
  Cesium: typeof import("cesium"),
  a: string,
  b: string,
  wxById: Map<string, RouteWxPoint>,
): { color: unknown; width: number } {
  const LEG_WX: Record<string, string[]> = {
    "Newcastle|Sandheads": ["sandheads", "midbay"],
    "Sandheads|Haldia": ["sandheads", "haldia-roads"],
    "Sandheads|Paradip": ["sandheads", "paradip-roads"],
    "Sandheads|Dhamra": ["sandheads", "dhamra-roads"],
  };
  const ids = LEG_WX[`${a}|${b}`] ?? [];
  let worst: number | null = null;
  for (const id of ids) {
    const w = wxById.get(id)?.waveHeightM;
    if (typeof w === "number") worst = worst === null ? w : Math.max(worst, w);
  }
  if (worst === null) return { color: Cesium.Color.ORANGE, width: 2 };
  if (worst < 1.5)
    return { color: Cesium.Color.fromCssColorString("#0E7A3D"), width: 2 };
  if (worst < 2.5) return { color: Cesium.Color.ORANGE, width: 2 };
  return { color: Cesium.Color.fromCssColorString("#B42318"), width: 3 };
}

export default function CorridorLayer({
  viewer,
  corridor,
  visible,
  showBoundaries,
  routeWx,
}: CorridorLayerProps) {
  const dsRef = React.useRef<{ removeAll: () => void } | null>(null);

  React.useEffect(() => {
    if (!viewer) return;
    let cancelled = false;
    (async () => {
      const Cesium = await getCesium();
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
        try {
          viewer.scene.requestRender();
        } catch {}
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
      const wxById = new Map((routeWx ?? []).map((w) => [w.id, w]));

      for (const [a, b] of legs) {
        const pa = allCoords[a];
        const pb = allCoords[b];
        if (!pa || !pb) continue;
        try {
          const style = legColor(Cesium, a, b, wxById);
          ds.entities.add({
            polyline: {
              positions: Cesium.Cartesian3.fromDegreesArray([
                pa.lon,
                pa.lat,
                pb.lon,
                pb.lat,
              ]),
              width: style.width,
              material: style.color as never,
              clampToGround: true,
            },
          });
        } catch {
          // one bad leg never breaks the layer
        }
      }

      const PORT_LAYOUT: Record<
        string,
        { offset: [number, number]; hOrigin: "LEFT" | "RIGHT" | "CENTER" }
      > = {
        Haldia: { offset: [0, -22], hOrigin: "CENTER" },
        Sandheads: { offset: [78, 0], hOrigin: "LEFT" }, // offset eastward into open water away from 4 converging lines
        Dhamra: { offset: [-70, -2], hOrigin: "RIGHT" }, // offset westward onto land away from shipping lane
        Paradip: { offset: [-70, 0], hOrigin: "RIGHT" }, // offset westward onto land
        Newcastle: { offset: [0, -22], hOrigin: "CENTER" },
      };

      for (const p of corridor) {
        const c = allCoords[p.name];
        if (!c) continue;
        const layout = PORT_LAYOUT[p.name] ?? {
          offset: [0, -20],
          hOrigin: "CENTER",
        };
        const hOrigin =
          layout.hOrigin === "LEFT"
            ? Cesium.HorizontalOrigin.LEFT
            : layout.hOrigin === "RIGHT"
              ? Cesium.HorizontalOrigin.RIGHT
              : Cesium.HorizontalOrigin.CENTER;

        // Port beacon: true 3D harbor geometry (dark pylon + orange light
        // sphere), unmistakably different from the vessel ship meshes.
        const TOWER_H = 12000;
        try {
          ds.entities.add({
            position: Cesium.Cartesian3.fromDegrees(c.lon, c.lat, TOWER_H / 2),
            cylinder: {
              length: TOWER_H,
              topRadius: 2200,
              bottomRadius: 3400,
              material: Cesium.Color.fromCssColorString("#0A2342"),
              outline: true,
              outlineColor: Cesium.Color.fromCssColorString("#D95D0F"),
            },
          });
        } catch {
          // tower best-effort
        }
        try {
          ds.entities.add({
            position: Cesium.Cartesian3.fromDegrees(c.lon, c.lat, TOWER_H),
            ellipsoid: {
              radii: new Cesium.Cartesian3(4200, 4200, 4200),
              material: Cesium.Color.fromCssColorString("#D95D0F"),
            },
          });
        } catch {
          // beacon light best-effort
        }

        try {
          ds.entities.add({
            position: Cesium.Cartesian3.fromDegrees(c.lon, c.lat),
            label: {
              text: ` ${p.name} · ${p.draft} `,
              font: "bold 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.fromCssColorString("#0A2342"),
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              showBackground: true,
              backgroundColor: Cesium.Color.fromCssColorString(
                "rgba(10, 35, 66, 0.94)",
              ),
              backgroundPadding: new Cesium.Cartesian2(8, 5),
              pixelOffset: new Cesium.Cartesian2(
                layout.offset[0],
                layout.offset[1],
              ),
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
      try {
        viewer.scene.requestRender();
      } catch {
        // requestRender best-effort
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [viewer, corridor, visible, showBoundaries, routeWx]);

  React.useEffect(() => {
    return () => {
      try {
        if (viewer && dsRef.current)
          viewer.dataSources.remove(dsRef.current as never, true);
      } catch {
        // cleanup best-effort
      }
      dsRef.current = null;
    };
  }, [viewer]);

  return null;
}
