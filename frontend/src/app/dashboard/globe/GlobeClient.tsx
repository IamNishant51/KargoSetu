"use client";

import React from "react";
import { useMutation } from "@tanstack/react-query";
import KargoGlobe, { flyCameraTo } from "@/components/map/KargoGlobe";
import type { CesiumViewer } from "@/components/map/KargoGlobe";
import VesselLayer from "@/components/map/VesselLayer";
import HazardLayer from "@/components/map/HazardLayer";
import CorridorLayer from "@/components/map/CorridorLayer";
import VesselSheet from "@/components/map/VesselSheet";
import LayerToggles from "@/components/map/LayerToggles";
import Hud from "@/components/map/Hud";
import TourDirector from "@/components/map/TourDirector";
import SensorStyles, { sensorFilter } from "@/components/map/SensorStyles";
import CommandBar from "@/components/map/CommandBar";
import PortBrief from "@/components/map/PortBrief";
import SourcesPanel from "@/components/map/SourcesPanel";
import { useFeeds } from "@/components/map/useFeeds";
import { usePortNews, useRouteWx } from "@/components/map/useContext";
import {
  ATTRIBUTION_ITEMS,
  ATTRIBUTION_LINE,
} from "@/components/map/attribution";
import { DEFAULT_BBOX, getApiBase, haversineNm } from "@/components/map/api";
import { useVessels } from "@/components/map/useVessels";
import { useHazards } from "@/components/map/useHazards";
import { useCorridor } from "@/components/map/useCorridor";
import { loadGlobeState, saveGlobeState } from "@/components/map/globeStore";
import type {
  CameraPresetId,
  GlobePersistedState,
  LayerVisibility,
  SensorStyle,
} from "@/components/map/globeStore";
import { useLanguage } from "@/i18n/LanguageContext";
import { saveJSON } from "@/lib/storage";

const PRESETS: CameraPresetId[] = [
  "corridor",
  "haldia",
  "paradip",
  "dhamra",
  "sandheads",
  "newcastle",
];

const PORT_PRESET_NAMES: Partial<Record<CameraPresetId, string>> = {
  haldia: "Haldia",
  paradip: "Paradip",
  dhamra: "Dhamra",
  sandheads: "Sandheads",
};

function parseDraftMeters(draft: string | undefined): number | null {
  if (!draft) return null;
  const n = parseFloat(draft);
  return Number.isFinite(n) ? n : null;
}

function readInitialGlobeState(): GlobePersistedState {
  const stored = loadGlobeState();
  if (typeof window === "undefined") return stored;
  try {
    const params = new URLSearchParams(window.location.search);
    const preset = params.get("preset") as CameraPresetId | null;
    const mmsi = params.get("mmsi");
    if (preset && (PRESETS as string[]).includes(preset)) {
      return {
        ...stored,
        camera: preset,
        selectedMmsi: mmsi ?? stored.selectedMmsi,
      };
    }
    if (mmsi) return { ...stored, selectedMmsi: mmsi };
  } catch {
    // deep-link is best-effort; stored state still applies
  }
  return stored;
}

export default function GlobeClient() {
  const { t } = useLanguage();
  const [persisted, setPersisted] = React.useState(readInitialGlobeState);
  const [viewer, setViewer] = React.useState<CesiumViewer | null>(null);
  const [sensor, setSensor] = React.useState<SensorStyle>("normal");
  const [detection, setDetection] = React.useState(false);
  const [autoRotate, setAutoRotate] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [showCredits, setShowCredits] = React.useState(false);
  const [panelOpen, setPanelOpen] = React.useState(
    () => typeof window === "undefined" || window.innerWidth >= 1024,
  );
  const [briefPort, setBriefPort] = React.useState("Haldia");
  const [autoTour] = React.useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return new URLSearchParams(window.location.search).get("tour") === "1";
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    saveGlobeState(persisted);
  }, [persisted]);

  const bbox = DEFAULT_BBOX;
  const vesselsQuery = useVessels(bbox);
  const hazardsQuery = useHazards(bbox);
  const corridorQuery = useCorridor();
  const feedsQuery = useFeeds();
  const routeWxQuery = useRouteWx();
  const newsQuery = usePortNews(briefPort);

  const vessels = React.useMemo(
    () => vesselsQuery.data?.vessels ?? [],
    [vesselsQuery.data?.vessels],
  );
  const mode =
    vesselsQuery.data?.mode ??
    (vesselsQuery.isLoading ? "connecting" : "unavailable");
  const hazards = hazardsQuery.data;
  const corridor = corridorQuery.data ?? [];

  const selected =
    vessels.find((v) => v.mmsi === persisted.selectedMmsi) ?? null;
  const briefPortData = corridor.find((p) => p.name === briefPort);
  const draftLimit = React.useMemo(
    () => parseDraftMeters(briefPortData?.draft),
    [briefPortData?.draft],
  );

  const setPreset = React.useCallback(
    (preset: CameraPresetId) => {
      setPersisted((p) => ({ ...p, camera: preset }));
      const portName = PORT_PRESET_NAMES[preset];
      if (portName) setBriefPort(portName);
      if (viewer) {
        flyCameraTo(viewer, preset);
      }
    },
    [viewer],
  );

  const setLayers = React.useCallback((layers: LayerVisibility) => {
    setPersisted((p) => ({ ...p, layers }));
  }, []);

  const setSelected = React.useCallback((mmsi: string | null) => {
    setPersisted((p) => ({ ...p, selectedMmsi: mmsi }));
  }, []);

  const trackNearest = React.useCallback(() => {
    let best: string | null = null;
    let bestD = Infinity;
    for (const v of vessels) {
      const d = haversineNm(19.5, 86.5, v.lat, v.lon);
      if (d < bestD) {
        bestD = d;
        best = v.mmsi;
      }
    }
    if (best) setSelected(best);
  }, [vessels, setSelected]);

  const commandEvaluate = useMutation({
    mutationFn: async ({ volume, port }: { volume: number; port: string }) => {
      const res = await fetch(`${getApiBase()}/api/v1/requisitions/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volume_mt: volume,
          dest_port_name: port,
          commodity: "Coking Coal",
        }),
      });
      if (!res.ok) throw new Error("evaluate failed");
      const data = await res.json();
      saveJSON("kargosetu_eval_v1", {
        volume: String(volume),
        port,
        commodity: "Coking Coal",
        lastResult: data,
      });
      return data as { strategy?: string };
    },
    onSuccess: (data) => {
      setNotice(data.strategy ?? "Evaluation complete. Open the solver desk.");
    },
    onError: (err: unknown) => {
      const reason =
        err instanceof TypeError
          ? "API unreachable"
          : err instanceof Error && err.message
            ? err.message
            : "unknown error";
      setNotice(`Evaluation failed (${reason}). Try the solver desk directly.`);
    },
  });

  const copyLink = React.useCallback(async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("preset", persisted.camera);
      if (persisted.selectedMmsi)
        url.searchParams.set("mmsi", persisted.selectedMmsi);
      await navigator.clipboard.writeText(url.toString());
      setNotice("Scene link copied.");
    } catch {
      setNotice("Could not copy link in this browser.");
    }
  }, [persisted.camera, persisted.selectedMmsi]);

  const hazardCount =
    (hazards?.earthquakes.length ?? 0) + (hazards?.fires.length ?? 0);

  const noticeText = notice ?? vesselsQuery.data?.notice ?? null;

  return (
    <div className="relative -m-4 h-[calc(100vh-6rem)] overflow-hidden bg-[#0A2342] sm:-m-8 sm:h-[calc(100vh-8rem)]">
      {/* Full-bleed canvas layer */}
      <div className="absolute inset-0">
        <KargoGlobe
          preset={persisted.camera}
          onViewer={setViewer}
          onNotice={setNotice}
          autoRotate={autoRotate}
        />
        <VesselLayer
          viewer={viewer}
          vessels={persisted.layers.vessels ? vessels : []}
          visible={persisted.layers.vessels}
          selectedMmsi={persisted.selectedMmsi}
          detection={detection}
          onSelect={setSelected}
          draftLimit={draftLimit}
        />
        <HazardLayer
          viewer={viewer}
          hazards={hazards}
          showHazards={persisted.layers.hazards}
          showWeather={persisted.layers.weather}
        />
        <CorridorLayer
          viewer={viewer}
          corridor={corridor}
          visible={persisted.layers.corridor}
          showBoundaries={persisted.layers.boundaries}
          routeWx={routeWxQuery.data?.points}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            filter: sensorFilter(sensor),
            background:
              sensor === "normal" ? "transparent" : "rgba(0,0,0,0.08)",
          }}
        />
      </div>

      {/* Floating header */}
      <div className="pointer-events-none absolute left-3 right-3 top-3 z-20 flex flex-wrap items-start justify-between gap-2">
        <div className="pointer-events-auto min-w-0 rounded-2xl border border-[#E2E6EB] bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur">
          <p className="mono-label text-[#B45309]">Gods eye view</p>
          <h1 className="font-display text-xl font-black leading-tight text-[#0A2342]">
            {t("globe.title")}
          </h1>
          <p className="hidden text-[12.5px] text-[#3D4F68] sm:block">
            {t("globe.subtitle")}
          </p>
          {noticeText && (
            <p className="mt-1 text-[12px] font-bold text-[#B45309]">
              {noticeText}
            </p>
          )}
        </div>
        <div className="pointer-events-auto flex shrink-0 items-center gap-2">
          <span
            className={`hidden rounded-full border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] sm:inline-block ${
              mode === "live"
                ? "bg-[#E9F5EE] text-[#0E7A3D] border-[#BFE3CD]"
                : mode === "demo"
                  ? "bg-[#FDF1E7] text-[#B45309] border-[#F0D3B8]"
                  : mode === "connecting"
                    ? "bg-[#F3F5F7] text-[#3D4F68] border-[#E2E6EB] animate-pulse"
                    : "bg-[#F3F5F7] text-[#3D4F68] border-[#E2E6EB]"
            }`}
          >
            {t(`globe.status.${mode}`)}
          </span>
          <button
            type="button"
            onClick={copyLink}
            className="rounded-xl border border-[#E2E6EB] bg-white/95 px-3 py-2 text-[12.5px] font-bold text-[#0A2342] shadow-lg backdrop-blur hover:bg-[#FAF7F1]"
          >
            Share
          </button>
          <button
            type="button"
            onClick={() => setDetection((d) => !d)}
            aria-pressed={detection}
            className={`rounded-xl border px-3 py-2 text-[12.5px] font-bold shadow-lg backdrop-blur ${
              detection
                ? "bg-[#0A2342] text-white border-[#0A2342]"
                : "bg-white/95 text-[#0A2342] border-[#E2E6EB]"
            }`}
          >
            Detect
          </button>
          <button
            type="button"
            onClick={() => setAutoRotate((r) => !r)}
            aria-pressed={autoRotate}
            className={`rounded-xl border px-3 py-2 text-[12.5px] font-bold shadow-lg backdrop-blur ${
              autoRotate
                ? "bg-[#0A2342] text-white border-[#0A2342]"
                : "bg-white/95 text-[#0A2342] border-[#E2E6EB]"
            }`}
          >
            Auto Rotate
          </button>
          <button
            type="button"
            onClick={() => setPanelOpen((o) => !o)}
            aria-expanded={panelOpen}
            aria-label="Toggle control panel"
            className="rounded-xl border border-[#E2E6EB] bg-white/95 px-3 py-2 text-[12.5px] font-bold text-[#0A2342] shadow-lg backdrop-blur hover:bg-[#FAF7F1]"
          >
            {panelOpen ? "Hide panel" : "Show panel"}
          </button>
        </div>
      </div>

      <Hud
        viewer={viewer}
        vesselCount={vessels.length}
        hazardCount={hazardCount}
        selected={selected}
        mode={mode}
      />
      <VesselSheet
        key={selected?.mmsi ?? "none"}
        vessel={selected}
        mode={mode}
        corridor={corridor}
        onClose={() => setSelected(null)}
      />
      {vesselsQuery.isError && !vesselsQuery.isLoading && (
        <div className="absolute left-3 top-40 z-20 max-w-[300px] rounded-xl border border-[#E2E6EB] bg-white px-3 py-2 shadow-lg">
          <p className="text-[12.5px] font-semibold text-[#B42318]">
            Vessel feed unavailable.
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-[#6B7D99]">
            API {getApiBase()} unreachable. Start the backend, then retry.
          </p>
          <button
            type="button"
            onClick={() => vesselsQuery.refetch()}
            className="mt-1 rounded-lg bg-[#0A2342] px-3 py-1.5 text-[12px] font-bold text-white"
          >
            {t("globe.retry")}
          </button>
        </div>
      )}

      <aside
        className={`absolute bottom-14 right-3 top-[140px] z-20 w-[310px] max-w-[calc(100vw-24px)] space-y-3 overflow-y-auto rounded-2xl border border-[#E2E6EB] bg-[#FAF7F1]/95 p-3 shadow-xl backdrop-blur transition-transform duration-300 sm:top-[128px] ${
          panelOpen ? "translate-x-0" : "translate-x-[calc(100%+16px)]"
        }`}
      >
        <div className="flex lg:hidden items-center justify-between pb-1 px-1">
          <span className="mono-label text-[#0A2342]">Tactical Controls</span>
          <button
            type="button"
            onClick={() => setPanelOpen(false)}
            className="rounded-lg bg-white border border-[#E2E6EB] px-2.5 py-1 text-[11px] font-bold text-[#6B7D99] hover:text-[#0A2342] shadow-sm"
          >
            ✕ Close
          </button>
        </div>
        <div className="rounded-2xl bg-white border border-[#E2E6EB] p-3 shadow-sm">
          <p className="mono-label text-[#6B7D99] px-1 pb-2">Camera</p>
          <div className="grid grid-cols-3 gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPreset(p)}
                className={`rounded-lg px-2 py-2 text-[12px] font-bold border ${
                  persisted.camera === p
                    ? "bg-[#D95D0F] text-white border-[#D95D0F]"
                    : "bg-white text-[#0A2342] border-[#E2E6EB] hover:bg-[#FAF7F1]"
                }`}
              >
                {t(`globe.presets.${p}`)}
              </button>
            ))}
          </div>
        </div>

        <LayerToggles layers={persisted.layers} onChange={setLayers} />
        <PortBrief
          port={briefPortData}
          weather={hazards?.weather}
          news={newsQuery.data}
          onFlyTo={() => {
            const id = briefPort.toLowerCase() as CameraPresetId;
            if ((PRESETS as string[]).includes(id)) setPreset(id);
          }}
        />
        <TourDirector
          viewer={viewer}
          onPreset={(preset) => setPreset(preset)}
          autoStart={autoTour}
        />
        <SensorStyles value={sensor} onChange={setSensor} />
        <CommandBar
          onPreset={setPreset}
          onToggleLayer={(layer, show) => {
            if (layer in persisted.layers) {
              setLayers({
                ...persisted.layers,
                [layer]: show,
              } as LayerVisibility);
            }
          }}
          onTrackNearest={trackNearest}
          onReset={() => {
            setPreset("corridor");
            setSelected(null);
          }}
          onEvaluate={(volume, port) =>
            commandEvaluate.mutate({ volume, port })
          }
          vessels={vessels}
          corridor={corridor}
        />
        <SourcesPanel feeds={feedsQuery.data} mode={mode} />

        <div className="rounded-2xl bg-white border border-[#E2E6EB] p-3 shadow-sm">
          <button
            type="button"
            onClick={() => setShowCredits((s) => !s)}
            aria-expanded={showCredits}
            className="w-full text-left font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#6B7D99] hover:text-[#0A2342]"
          >
            Data credits {showCredits ? "–" : "+"}
          </button>
          {showCredits && (
            <ul className="mt-2 space-y-1.5 text-[12px] text-[#3D4F68]">
              {ATTRIBUTION_ITEMS.map((a) => (
                <li key={a.id}>
                  <span className="font-bold text-[#0A2342]">{a.label}: </span>
                  {a.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <footer className="absolute bottom-3 left-3 z-20 max-w-[52%] truncate rounded-full border border-[#E2E6EB] bg-white/90 px-3 py-1.5 shadow backdrop-blur">
        <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-[#6B7D99]">
          {ATTRIBUTION_LINE} ·{" "}
          {hazards
            ? `USGS:${hazards.sources.usgs} FIRMS:${hazards.sources.firms} Meteo:${hazards.sources.meteo}`
            : "feeds loading"}
        </p>
      </footer>
    </div>
  );
}
