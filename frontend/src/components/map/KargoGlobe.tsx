"use client";
"use no memo";

import React from "react";
import { CAMERA_PRESETS } from "./globeStore";
import type { CameraPresetId } from "./globeStore";
import { ATTRIBUTION_ITEMS } from "./attribution";

// Viewer type is intentionally loose: Cesium is loaded lazily so the
// landing bundle never pays for it. Callers treat it opaquely.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CesiumViewer = any;

interface KargoGlobeProps {
  preset: CameraPresetId;
  onViewer: (viewer: CesiumViewer | null) => void;
  onNotice?: (msg: string | null) => void;
}

export default function KargoGlobe({ preset, onViewer, onNotice }: KargoGlobeProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const viewerRef = React.useRef<CesiumViewer | null>(null);
  const presetRef = React.useRef(preset);
  const onViewerRef = React.useRef(onViewer);
  const onNoticeRef = React.useRef(onNotice);

  React.useEffect(() => {
    presetRef.current = preset;
  }, [preset]);
  React.useEffect(() => {
    onViewerRef.current = onViewer;
  }, [onViewer]);
  React.useEffect(() => {
    onNoticeRef.current = onNotice;
  }, [onNotice]);

  React.useEffect(() => {
    let cancelled = false;
    let viewer: CesiumViewer | null = null;

    async function init() {
      if (!containerRef.current) return;
      try {
        (window as unknown as { CESIUM_BASE_URL?: string }).CESIUM_BASE_URL = "/cesium";
        const Cesium = await import("cesium");

        if (cancelled || !containerRef.current) return;

        const esri = new Cesium.UrlTemplateImageryProvider({
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          credit: "Powered by Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
        });

        let terrainProvider: unknown;
        try {
          terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(
            "https://tiles.reearth.io/cesium-mesh/ellipsoid",
          );
        } catch {
          terrainProvider = new Cesium.EllipsoidTerrainProvider();
        }

        viewer = new Cesium.Viewer(containerRef.current, {
          baseLayerPicker: false,
          timeline: false,
          animation: false,
          geocoder: false,
          homeButton: true,
          sceneModePicker: true,
          baseLayer: false,
          terrainProvider: terrainProvider as never,
        });
        viewer.imageryLayers.addImageryProvider(esri);

        // OSM fallback if Esri tiles error.
        try {
          esri.errorEvent.addEventListener(() => {
            if (cancelled || !viewer) return;
            try {
              const osm = new Cesium.UrlTemplateImageryProvider({
                url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                credit: "© OpenStreetMap contributors",
                maximumLevel: 19,
              });
              const layers = viewer.imageryLayers;
              layers.removeAll();
              layers.addImageryProvider(osm);
              onNoticeRef.current?.("Esri unreachable — using OSM fallback.");
            } catch {
              // keep current imagery; log only
            }
          });
        } catch {
          // imagery fallback is best-effort
        }

        // Static credits stay visible in normal and clean-view modes.
        try {
          for (const item of ATTRIBUTION_ITEMS) {
            viewer.creditDisplay.addStaticCredit(new Cesium.Credit(item.text, false));
          }
        } catch {
          // credits are best-effort; canvas still renders
        }

        // Home button restores the corridor overview.
        try {
          const home = viewer.homeButton?.viewModel?.command;
          if (home && home.beforeExecute) {
            home.beforeExecute.addEventListener((e: { cancel?: boolean }) => {
              e.cancel = true;
              const p = CAMERA_PRESETS.corridor;
              viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(p.lon, p.lat, p.height),
                duration: 2.2,
              });
            });
          }
        } catch {
          // default home behavior remains
        }

        viewerRef.current = viewer;
        onViewerRef.current?.(viewer);

        const p0 = CAMERA_PRESETS[presetRef.current];
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(p0.lon, p0.lat, p0.height),
          duration: 2.2,
        });
      } catch {
        onNoticeRef.current?.("3D globe failed to load. Check connection and retry.");
      }
    }

    void init();

    return () => {
      cancelled = true;
      try {
        viewer?.destroy();
      } catch {
        // destroy is best-effort
      }
      viewerRef.current = null;
      onViewerRef.current?.(null);
    };
  }, []);

  // Fly to new presets without recreating the Viewer.
  React.useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    let cancelled = false;
    (async () => {
      try {
        const Cesium = await import("cesium");
        if (cancelled) return;
        const p = CAMERA_PRESETS[preset];
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(p.lon, p.lat, p.height),
          duration: 2.2,
        });
      } catch {
        // flyTo is best-effort
      }
    })();
    return () => {
      cancelled = true;
      try {
        viewer.camera.cancelFlight();
      } catch {
        // no flight in progress
      }
    };
  }, [preset]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0A2342]">
      <div ref={containerRef} className="absolute inset-0" aria-label="3D vessel globe" />
    </div>
  );
}
