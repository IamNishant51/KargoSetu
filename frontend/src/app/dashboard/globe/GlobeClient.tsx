"use client";

import React from "react";
import { useMutation } from "@tanstack/react-query";
import KargoGlobe from "@/components/map/KargoGlobe";
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
import { ATTRIBUTION_ITEMS, ATTRIBUTION_LINE } from "@/components/map/attribution";
import { DEFAULT_BBOX, getApiBase, haversineNm } from "@/components/map/api";
import { useVessels } from "@/components/map/useVessels";
import { useHazards } from "@/components/map/useHazards";
import { useCorridor } from "@/components/map/useCorridor";
import {
  loadGlobeState,
  saveGlobeState,
} from "@/components/map/globeStore";
import type { CameraPresetId, GlobePersistedState, LayerVisibility, SensorStyle } from "@/components/map/globeStore";
import { useLanguage } from "@/i18n/LanguageContext";
import { saveJSON } from "@/lib/storage";

const PRESETS: CameraPresetId[] = ["corridor", "haldia", "paradip", "dhamra", "sandheads", "newcastle"];

function readInitialGlobeState(): GlobePersistedState {
  const stored = loadGlobeState();
  if (typeof window === "undefined") return stored;
  try {
    const params = new URLSearchParams(window.location.search);
    const preset = params.get("preset") as CameraPresetId | null;
    const mmsi = params.get("mmsi");
    if (preset && (PRESETS as string[]).includes(preset)) {
      return { ...stored, camera: preset, selectedMmsi: mmsi ?? stored.selectedMmsi };
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
  const [notice, setNotice] = React.useState<string | null>(null);
  const [showCredits, setShowCredits] = React.useState(false);

  React.useEffect(() => {
    saveGlobeState(persisted);
  }, [persisted]);

  const bbox = DEFAULT_BBOX;
  const vesselsQuery = useVessels(bbox);
  const hazardsQuery = useHazards(bbox);
  const corridorQuery = useCorridor();

  const vessels = React.useMemo(() => vesselsQuery.data?.vessels ?? [], [vesselsQuery.data?.vessels]);
  const mode = vesselsQuery.data?.mode ?? "unavailable";
  const hazards = hazardsQuery.data;
  const corridor = corridorQuery.data ?? [];

  const selected = vessels.find((v) => v.mmsi === persisted.selectedMmsi) ?? null;

  const setPreset = React.useCallback((preset: CameraPresetId) => {
    setPersisted((p) => ({ ...p, camera: preset }));
  }, []);

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
        body: JSON.stringify({ volume_mt: volume, dest_port_name: port, commodity: "Coking Coal" }),
      });
      if (!res.ok) throw new Error("evaluate failed");
      const data = await res.json();
      saveJSON("kargosetu_eval_v1", { volume: String(volume), port, commodity: "Coking Coal", lastResult: data });
      return data as { strategy?: string };
    },
    onSuccess: (data) => {
      setNotice(data.strategy ?? "Evaluation complete. Open the solver desk.");
    },
    onError: () => {
      setNotice("Evaluation failed. Try the solver desk directly.");
    },
  });

  const copyLink = React.useCallback(async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("preset", persisted.camera);
      if (persisted.selectedMmsi) url.searchParams.set("mmsi", persisted.selectedMmsi);
      await navigator.clipboard.writeText(url.toString());
      setNotice("Scene link copied.");
    } catch {
      setNotice("Could not copy link in this browser.");
    }
  }, [persisted.camera, persisted.selectedMmsi]);

  const hazardCount = (hazards?.earthquakes.length ?? 0) + (hazards?.fires.length ?? 0);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-[#FAF7F1]">
      <div className="flex items-center justify-between gap-3 border-b border-[#E2E6EB] bg-white px-4 py-3">
        <div>
          <p className="mono-label text-[#B45309]">Gods eye view</p>
          <h1 className="font-display font-black text-xl text-[#0A2342] leading-tight">
            {t("globe.title")}
          </h1>
          <p className="text-[12.5px] text-[#3D4F68]">{t("globe.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.12em] px-2 py-1 rounded border ${
              mode === "live"
                ? "bg-[#E9F5EE] text-[#0E7A3D] border-[#BFE3CD]"
                : mode === "demo"
                  ? "bg-[#FDF1E7] text-[#B45309] border-[#F0D3B8]"
                  : "bg-[#F3F5F7] text-[#3D4F68] border-[#E2E6EB]"
            }`}
          >
            {t(`globe.status.${mode}`)}
          </span>
          <button
            type="button"
            onClick={copyLink}
            className="rounded-lg bg-white border border-[#E2E6EB] px-3 py-2 text-[12.5px] font-bold text-[#0A2342] hover:bg-[#FAF7F1]"
          >
            Share
          </button>
          <button
            type="button"
            onClick={() => setDetection((d) => !d)}
            aria-pressed={detection}
            className={`rounded-lg px-3 py-2 text-[12.5px] font-bold border ${
              detection ? "bg-[#0A2342] text-white border-[#0A2342]" : "bg-white text-[#0A2342] border-[#E2E6EB]"
            }`}
          >
            Detect
          </button>
        </div>
      </div>

      {(notice || vesselsQuery.data?.notice) && (
        <p className="border-b border-[#E2E6EB] bg-[#FDF1E7] px-4 py-2 text-[12.5px] font-semibold text-[#B45309]">
          {notice ?? vesselsQuery.data?.notice}
        </p>
      )}

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        <div className="relative min-h-[50vh] flex-1 lg:min-h-0">
          <KargoGlobe preset={persisted.camera} onViewer={setViewer} onNotice={setNotice} />
          <VesselLayer
            viewer={viewer}
            vessels={persisted.layers.vessels ? vessels : []}
            visible={persisted.layers.vessels}
            selectedMmsi={persisted.selectedMmsi}
            detection={detection}
            onSelect={setSelected}
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
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ filter: sensorFilter(sensor), background: sensor === "normal" ? "transparent" : "rgba(0,0,0,0.08)" }}
          />
          <Hud viewer={viewer} vesselCount={vessels.length} hazardCount={hazardCount} selected={selected} mode={mode} />
          <VesselSheet
            key={selected?.mmsi ?? "none"}
            vessel={selected}
            mode={mode}
            corridor={corridor}
            onClose={() => setSelected(null)}
          />
          {vesselsQuery.isError && (
            <div className="absolute left-3 top-24 rounded-xl bg-white border border-[#E2E6EB] px-3 py-2 shadow-sm">
              <p className="text-[12.5px] font-semibold text-[#B42318]">Vessel feed unavailable.</p>
              <button
                type="button"
                onClick={() => vesselsQuery.refetch()}
                className="mt-1 rounded-lg bg-[#0A2342] px-3 py-1.5 text-[12px] font-bold text-white"
              >
                {t("globe.retry")}
              </button>
            </div>
          )}
        </div>

        <aside className="w-full lg:w-[320px] shrink-0 space-y-3 overflow-y-auto border-t lg:border-t-0 lg:border-l border-[#E2E6EB] bg-[#FAF7F1] p-3">
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
          <TourDirector viewer={viewer} onPreset={(preset) => setPreset(preset)} />
          <SensorStyles value={sensor} onChange={setSensor} />
          <CommandBar
            onPreset={setPreset}
            onToggleLayer={(layer, show) => {
              if (layer in persisted.layers) {
                setLayers({ ...persisted.layers, [layer]: show } as LayerVisibility);
              }
            }}
            onTrackNearest={trackNearest}
            onReset={() => {
              setPreset("corridor");
              setSelected(null);
            }}
            onEvaluate={(volume, port) => commandEvaluate.mutate({ volume, port })}
            vessels={vessels}
            corridor={corridor}
          />

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
      </div>

      <footer className="border-t border-[#E2E6EB] bg-white px-4 py-2">
        <p className="truncate font-mono text-[10.5px] uppercase tracking-[0.12em] text-[#6B7D99]">
          {ATTRIBUTION_LINE} ·{" "}
          {hazards ? `USGS:${hazards.sources.usgs} FIRMS:${hazards.sources.firms} Meteo:${hazards.sources.meteo}` : "feeds loading"}
        </p>
      </footer>
    </div>
  );
}
