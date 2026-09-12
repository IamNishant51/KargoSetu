"use client";
"use no memo";
/* eslint-disable react-hooks/immutability */

import React from "react";
import type { CesiumViewer } from "./KargoGlobe";
import type { Vessel } from "./api";

interface VesselLayerProps {
  viewer: CesiumViewer | null;
  vessels: Vessel[];
  visible: boolean;
  selectedMmsi: string | null;
  detection: boolean;
  onSelect: (mmsi: string | null) => void;
}

function dotImage(color: string): string {
  if (typeof document === "undefined") return "";
  const c = document.createElement("canvas");
  c.width = 36;
  c.height = 36;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  // Outer subtle glow / border
  ctx.beginPath();
  ctx.arc(18, 18, 14, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  // Core indicator
  ctx.beginPath();
  ctx.arc(18, 18, 11, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#0A2342";
  ctx.stroke();
  return c.toDataURL();
}

export default function VesselLayer({
  viewer,
  vessels,
  visible,
  selectedMmsi,
  detection,
  onSelect,
}: VesselLayerProps) {
  const entitiesRef = React.useRef<Map<string, unknown>>(new Map());
  const prevRef = React.useRef<Map<string, { lat: number; lon: number }>>(new Map());
  const currRef = React.useRef<Map<string, { lat: number; lon: number }>>(new Map());
  const lastUpdateRef = React.useRef<number>(0);
  const onSelectRef = React.useRef(onSelect);

  React.useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);
  React.useEffect(() => {
    if (lastUpdateRef.current === 0) lastUpdateRef.current = Date.now();
  }, []);

  const shown = React.useMemo(() => vessels.slice(0, 500), [vessels]);

  // Sync entity set with latest fixes; keep prev for interpolation.
  React.useEffect(() => {
    if (!viewer) return;
    let cancelled = false;
    (async () => {
      const Cesium = await import("cesium");
      if (cancelled) return;
      const nextCurr = new Map<string, { lat: number; lon: number }>();
      for (const v of shown) nextCurr.set(v.mmsi, { lat: v.lat, lon: v.lon });
      prevRef.current = currRef.current;
      currRef.current = nextCurr;
      lastUpdateRef.current = Date.now();

      const entities = entitiesRef.current;
      const seen = new Set<string>();
      const liveImg = dotImage("#D95D0F");
      const demoImg = dotImage("#B45309");
      const selectedImg = dotImage("#0E7A3D");

      for (const v of shown) {
        seen.add(v.mmsi);
        const isSel = v.mmsi === selectedMmsi;
        const img = isSel ? selectedImg : v.demo ? demoImg : liveImg;
        let ent = entities.get(v.mmsi) as {
          position?: unknown;
          billboard?: { image?: string };
          label?: { show?: boolean; text?: string };
        } | undefined;
        if (!ent) {
          const added = viewer.entities.add({
            id: `vessel-${v.mmsi}`,
            position: Cesium.Cartesian3.fromDegrees(v.lon, v.lat),
            billboard: {
              image: img,
              width: isSel ? 20 : 14,
              height: isSel ? 20 : 14,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              eyeOffset: new Cesium.Cartesian3(0, 0, -15),
            },
            label: {
              text: ` ${v.name || v.mmsi} `,
              show: isSel || detection,
              font: "bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.fromCssColorString("#0A2342"),
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              showBackground: true,
              backgroundColor: Cesium.Color.fromCssColorString("rgba(10, 35, 66, 0.92)"),
              backgroundPadding: new Cesium.Cartesian2(7, 4),
              pixelOffset: new Cesium.Cartesian2(0, -20),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              eyeOffset: new Cesium.Cartesian3(0, 0, -25),
            },
          }) as unknown;
          entities.set(v.mmsi, added);
          ent = added as never;
        } else {
          try {
            const e = ent as {
              billboard?: { image?: string; width?: number; height?: number };
              label?: { show?: boolean; text?: string };
            };
            if (e.billboard) {
              e.billboard.image = img;
              e.billboard.width = isSel ? 20 : 14;
              e.billboard.height = isSel ? 20 : 14;
            }
            if (e.label) {
              e.label.show = isSel || detection;
              e.label.text = ` ${v.name || v.mmsi} `;
            }
          } catch {
            // entity update best-effort
          }
        }
        // Heading rotation is applied via billboard rotation when cog present.
        try {
          const e = ent as { billboard?: { rotation?: number } };
          if (e?.billboard && typeof v.cog === "number") {
            e.billboard.rotation = ((360 - v.cog) * Math.PI) / 180;
          }
        } catch {
          // keep last heading
        }
      }
      for (const [mmsi, ent] of Array.from(entities.entries())) {
        if (!seen.has(mmsi)) {
          try {
            viewer.entities.remove(ent as never);
          } catch {
            // remove best-effort
          }
          entities.delete(mmsi);
        }
      }
      try {
        viewer.entities.show = visible;
      } catch {
        // show flag best-effort
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [viewer, shown, selectedMmsi, detection, visible]);

  // Interpolation loop: one interval behind, linear between fixes.
  React.useEffect(() => {
    if (!viewer) return;
    let raf = 0;
    let alive = true;
    const INTERVAL = 30000;
    const scratch = { lon: 0, lat: 0 };
    async function tick() {
      if (!alive) return;
      try {
        const Cesium = await import("cesium");
        if (!alive) return;
        const now = Date.now();
        const frac = Math.min(1, Math.max(0, (now - lastUpdateRef.current) / INTERVAL));
        for (const [mmsi, cur] of currRef.current.entries()) {
          const prev = prevRef.current.get(mmsi) ?? cur;
          scratch.lon = prev.lon + (cur.lon - prev.lon) * frac;
          scratch.lat = prev.lat + (cur.lat - prev.lat) * frac;
          const ent = entitiesRef.current.get(mmsi) as {
            position?: unknown;
          } | undefined;
          if (ent) {
            try {
              (ent as { position: unknown }).position =
                Cesium.Cartesian3.fromDegrees(scratch.lon, scratch.lat);
            } catch {
              // position update best-effort, no per-frame allocation beyond scratch
            }
          }
        }
      } catch {
        // interpolation best-effort
      }
      raf = requestAnimationFrame(() => void tick());
    }
    raf = requestAnimationFrame(() => void tick());
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [viewer]);

  // Click to select.
  React.useEffect(() => {
    if (!viewer) return;
    let handler: { destroy: () => void } | null = null;
    (async () => {
      const Cesium = await import("cesium");
      handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas) as unknown as {
        destroy: () => void;
      };
      (handler as unknown as {
        setInputAction: (fn: (e: { position: unknown }) => void, type: unknown) => void;
      }).setInputAction(
        (click: { position: unknown }) => {
          try {
            const picked = viewer.scene.pick(click.position as never) as {
              id?: { id?: string };
            } | undefined;
            const id = picked?.id?.id;
            if (typeof id === "string" && id.startsWith("vessel-")) {
              onSelectRef.current(id.replace("vessel-", ""));
            } else {
              onSelectRef.current(null);
            }
          } catch {
            onSelectRef.current(null);
          }
        },
        Cesium.ScreenSpaceEventType.LEFT_CLICK,
      );
    })();
    return () => {
      try {
        handler?.destroy();
      } catch {
        // handler cleanup best-effort
      }
    };
  }, [viewer]);

  return null;
}
