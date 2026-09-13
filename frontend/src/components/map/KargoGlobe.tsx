"use client";

import React from "react";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { getCesium } from "./api";
import { CAMERA_PRESETS } from "./globeStore";
import type { CameraPresetId } from "./globeStore";
import { ATTRIBUTION_ITEMS } from "./attribution";

// Viewer type is intentionally loose: Cesium is loaded lazily so the
// landing bundle never pays for it. Callers treat it opaquely.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CesiumViewer = any;

export async function flyCameraTo(
  viewer: CesiumViewer,
  preset: CameraPresetId,
  duration = 2.2,
) {
  if (!viewer || !viewer.camera) return;
  const p = CAMERA_PRESETS[preset];
  if (!p) return;
  try {
    const Cesium = await getCesium();
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(p.lon, p.lat, p.height),
      duration,
    });
  } catch {
    // flyTo best-effort
  }
}

interface KargoGlobeProps {
  preset: CameraPresetId;
  onViewer: (viewer: CesiumViewer | null) => void;
  onNotice?: (msg: string | null) => void;
  interactive?: boolean;
}

export default function KargoGlobe({ preset, onViewer, onNotice, interactive = true }: KargoGlobeProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const viewerRef = React.useRef<CesiumViewer | null>(null);
  const presetRef = React.useRef(preset);
  const onViewerRef = React.useRef(onViewer);
  const onNoticeRef = React.useRef(onNotice);
  const interactiveRef = React.useRef(interactive);
  const [ready, setReady] = React.useState(false);

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
    interactiveRef.current = interactive;
  }, [interactive]);

  React.useEffect(() => {
    let cancelled = false;
    let viewer: CesiumViewer | null = null;

    async function init() {
      if (!containerRef.current) return;
      try {
        (window as unknown as { CESIUM_BASE_URL?: string }).CESIUM_BASE_URL = "/cesium/";
        const Cesium = await getCesium();

        if (cancelled || !containerRef.current) return;

        const esri = new Cesium.UrlTemplateImageryProvider({
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          credit: "Powered by Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
        });

        // Terrain: flat ellipsoid by default. Verified 2026-09: the public
        // quantized-mesh endpoint (tiles.reearth.io layer.json) 404s and has
        // no CORS headers, and this build has no ArcGIS terrain provider, so
        // any mesh attempt only produces console errors. The corridor is
        // ocean plus coastal plain, where relief adds nothing visually.
        const terrainProvider = new Cesium.EllipsoidTerrainProvider();

        viewer = new Cesium.Viewer(containerRef.current, {
          baseLayerPicker: false,
          timeline: false,
          animation: false,
          geocoder: false,
          homeButton: interactiveRef.current,
          sceneModePicker: interactiveRef.current,
          navigationHelpButton: false,
          navigationInstructionsInitiallyVisible: false,
          infoBox: false,
          selectionIndicator: false,
          baseLayer: new Cesium.ImageryLayer(esri),
          terrainProvider: terrainProvider as never,
        });

        // Performance-first rendering
        const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1.0 : 1.0;
        viewer.resolutionScale = Math.min(dpr, 1.0);
        viewer.scene.msaaSamples = 2;
        viewer.scene.globe.depthTestAgainstTerrain = false;

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
              layers.add(new Cesium.ImageryLayer(osm));
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

        // Frame the corridor instantly so the first paint is already correct.
        const p0 = CAMERA_PRESETS[presetRef.current];
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(p0.lon, p0.lat, p0.height),
        });
        // Let the canvas settle to its real box, then fade the globe in.
        requestAnimationFrame(() => {
          if (cancelled) return;
          try {
            viewer.resize();
          } catch {
            // resize best-effort
          }
          setReady(true);
        });
      } catch {
        onNoticeRef.current?.("3D globe failed to load. Check connection and retry.");
      }
    }

    void init();

    // Keep the canvas glued to its box while panels open or the window moves.
    const onResize = () => {
      try {
        viewerRef.current?.resize();
      } catch {
        // resize best-effort
      }
    };
    window.addEventListener("resize", onResize);
    const observer =
      typeof ResizeObserver !== "undefined" && containerRef.current
        ? new ResizeObserver(onResize)
        : null;
    if (observer && containerRef.current) observer.observe(containerRef.current);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      try {
        observer?.disconnect();
      } catch {
        // observer cleanup best-effort
      }
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
        const Cesium = await getCesium();
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
    <div
      className="relative h-full w-full overflow-hidden bg-[#0A2342] transition-opacity duration-700"
      style={{ opacity: ready ? 1 : 0 }}
    >
      <div ref={containerRef} className="absolute inset-0" aria-label="3D vessel globe" />
    </div>
  );
}
