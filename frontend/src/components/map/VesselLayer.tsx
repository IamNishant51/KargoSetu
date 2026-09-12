"use client";
/* eslint-disable react-hooks/immutability */

import React from "react";
import type { CesiumViewer } from "./KargoGlobe";
import { getCesium } from "./api";
import type { Vessel } from "./api";

interface VesselLayerProps {
  viewer: CesiumViewer | null;
  vessels: Vessel[];
  visible: boolean;
  selectedMmsi: string | null;
  detection: boolean;
  onSelect: (mmsi: string | null) => void;
  // Port permissible draft in meters: vessels drawing more get a red ring,
  // making the draft constraint visible on the globe. Null disables.
  draftLimit?: number | null;
}

// Vessels render as true 3D models at every zoom level. There is no
// billboard fallback and no zoom toggle: Cesium scales each model by
// distance (minimumPixelSize keeps far ships visible, maximumScale caps
// near ones), so nothing ever pops between representations.

export default function VesselLayer({
  viewer,
  vessels,
  visible,
  selectedMmsi,
  detection,
  onSelect,
  draftLimit,
}: VesselLayerProps) {
  const entitiesRef = React.useRef<Map<string, unknown>>(new Map());
  // Per-entity position objects, mutated in place by the interpolation loop.
  // Allocated once per vessel (on create), never per frame.
  const posRef = React.useRef<Map<string, unknown>>(new Map());
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
      const Cesium = await getCesium();
      if (cancelled) return;
      const nextCurr = new Map<string, { lat: number; lon: number }>();
      for (const v of shown) nextCurr.set(v.mmsi, { lat: v.lat, lon: v.lon });
      prevRef.current = currRef.current;
      currRef.current = nextCurr;
      lastUpdateRef.current = Date.now();

      const entities = entitiesRef.current;
      const seen = new Set<string>();
      const selColor = Cesium.Color.fromCssColorString("#2FBF71");

      for (const v of shown) {
        seen.add(v.mmsi);
        const isSel = v.mmsi === selectedMmsi;
        const overDraft =
          typeof draftLimit === "number" &&
          typeof v.draught === "number" &&
          v.draught > draftLimit;
        let ent = entities.get(v.mmsi) as {
          position?: unknown;
          model?: { color?: unknown };
          ellipse?: { show?: boolean };
          label?: { show?: boolean; text?: string };
        } | undefined;
        if (!ent) {
          const pos = Cesium.Cartesian3.fromDegrees(v.lon, v.lat);
          const added = viewer.entities.add({
            id: `vessel-${v.mmsi}`,
            position: pos,
            model: {
              uri: "/models/ship.glb",
              scale: 1.0,
              // Distance-scaled visibility: far ships hold 48 px so the
              // corridor view still reads as 3D traffic; near ships cap out
              // instead of filling the screen.
              minimumPixelSize: 48,
              maximumScale: 20000,
              color: isSel ? selColor : Cesium.Color.WHITE,
              show: true,
            },
            ellipse: {
              semiMajorAxis: 6000,
              semiMinorAxis: 6000,
              material: Cesium.Color.RED.withAlpha(0.02),
              outline: true,
              outlineColor: Cesium.Color.fromCssColorString("#B42318"),
              show: overDraft,
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
          posRef.current.set(v.mmsi, pos);
          ent = added as never;
        } else {
          try {
            const e = ent as {
              model?: { color?: unknown };
              ellipse?: { show?: boolean };
              label?: { show?: boolean; text?: string };
            };
            if (e.model) {
              e.model.color = isSel ? selColor : Cesium.Color.WHITE;
            }
            if (e.ellipse) {
              e.ellipse.show = overDraft;
            }
            if (e.label) {
              e.label.show = isSel || detection;
              e.label.text = ` ${v.name || v.mmsi} `;
            }
          } catch {
            // entity update best-effort
          }
        }
        // Selected ships tint green; heading is a true quaternion on the 3D
        // model (nose −X mesh convention, hence +PI); refreshed per poll.
        try {
          const e = ent as { orientation?: unknown };
          if (typeof v.cog === "number") {
            const pos = posRef.current.get(v.mmsi);
            if (pos) {
              e.orientation = Cesium.Transforms.headingPitchRollQuaternion(
                pos as never,
                new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(v.cog) + Math.PI, 0, 0),
              );
            }
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
          posRef.current.delete(mmsi);
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
  }, [viewer, shown, selectedMmsi, detection, visible, draftLimit]);

  // Interpolation loop: one interval behind, linear between fixes.
  // Zero per-frame allocation: the Cesium module is loaded once and each
  // vessel owns a Cartesian3 that is mutated in place (entity holds the
  // same reference, so position updates without re-assignment).
  React.useEffect(() => {
    if (!viewer) return;
    let raf = 0;
    let alive = true;
    const INTERVAL = 30000;
    const scratch = { lon: 0, lat: 0 };
    let Cesium: typeof import("cesium") | null = null;
    async function tick() {
      if (!alive) return;
      try {
        if (!Cesium) Cesium = await getCesium();
        if (!alive || !Cesium) return;
        const C = Cesium;
        const now = Date.now();
        const frac = Math.min(1, Math.max(0, (now - lastUpdateRef.current) / INTERVAL));
        for (const [mmsi, cur] of currRef.current.entries()) {
          const prev = prevRef.current.get(mmsi) ?? cur;
          scratch.lon = prev.lon + (cur.lon - prev.lon) * frac;
          scratch.lat = prev.lat + (cur.lat - prev.lat) * frac;
          const pos = posRef.current.get(mmsi);
          if (pos) {
            try {
              C.Cartesian3.fromDegrees(scratch.lon, scratch.lat, 0, undefined, pos as never);
            } catch {
              // position update best-effort
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
      const Cesium = await getCesium();
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
