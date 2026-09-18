"use client";

import React from "react";
import Link from "next/link";
import KargoGlobe, { flyCameraTo } from "@/components/map/KargoGlobe";
import type { CesiumViewer } from "@/components/map/KargoGlobe";
import VesselLayer from "@/components/map/VesselLayer";
import HazardLayer from "@/components/map/HazardLayer";
import CorridorLayer from "@/components/map/CorridorLayer";
import { DEFAULT_BBOX, haversineNm } from "@/components/map/api";
import { useVessels } from "@/components/map/useVessels";
import { useHazards } from "@/components/map/useHazards";
import { useCorridor } from "@/components/map/useCorridor";
import type { CameraPresetId } from "@/components/map/globeStore";
import { saveJSON } from "@/lib/storage";

const PRESET_BUTTONS: Array<{ id: CameraPresetId; label: string }> = [
  { id: "corridor", label: "Overview" },
  { id: "haldia", label: "Haldia" },
  { id: "sandheads", label: "Sandheads" },
  { id: "paradip", label: "Paradip" },
  { id: "dhamra", label: "Dhamra" },
  { id: "newcastle", label: "Newcastle" },
];

export default function CorridorMiniGlobe() {
  const [viewer, setViewer] = React.useState<CesiumViewer | null>(null);
  const [activePreset, setActivePreset] =
    React.useState<CameraPresetId>("corridor");
  const [selectedMmsi, setSelectedMmsi] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [globeKey, setGlobeKey] = React.useState(0);

  const bbox = DEFAULT_BBOX;
  const vesselsQuery = useVessels(bbox);
  const hazardsQuery = useHazards(bbox);
  const corridorQuery = useCorridor();

  const vessels = React.useMemo(
    () => vesselsQuery.data?.vessels ?? [],
    [vesselsQuery.data?.vessels],
  );
  const mode =
    vesselsQuery.data?.mode ??
    (vesselsQuery.isLoading ? "connecting" : "unavailable");
  const hazards = hazardsQuery.data;
  const corridor = React.useMemo(
    () => corridorQuery.data ?? [],
    [corridorQuery.data],
  );

  const retryFeed = React.useCallback(() => {
    setNotice(null);
    setGlobeKey((k) => k + 1);
    void vesselsQuery.refetch();
    void hazardsQuery.refetch();
    void corridorQuery.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedVessel = React.useMemo(
    () => vessels.find((v) => v.mmsi === selectedMmsi) ?? null,
    [vessels, selectedMmsi],
  );

  const handlePreset = React.useCallback(
    (preset: CameraPresetId) => {
      setActivePreset(preset);
      if (viewer) {
        flyCameraTo(viewer, preset, 2.0);
      }
    },
    [viewer],
  );

  const nearestPortToSelected = React.useMemo(() => {
    if (!selectedVessel || !corridor.length) return null;
    let best: { name: string; nm: number } | null = null;
    for (const p of corridor) {
      if (typeof p.lat !== "number" || typeof p.lon !== "number") continue;
      const nm = haversineNm(
        selectedVessel.lat,
        selectedVessel.lon,
        p.lat,
        p.lon,
      );
      if (!best || nm < best.nm) best = { name: p.name, nm };
    }
    return best;
  }, [selectedVessel, corridor]);

  const handleOpenInSolver = (vesselName?: string | null) => {
    saveJSON("kargosetu_eval_v1", {
      volume: "145,000",
      port: "Haldia",
      commodity: "Iron Ore",
      note: vesselName ? `Inspected from live globe: ${vesselName}` : undefined,
    });
  };

  return (
    <div className="relative h-[480px] sm:h-[540px] w-full rounded-2xl overflow-hidden bg-[#0A2342] border border-[#E2E6EB] shadow-lg">
      {/* 3D WebGL Canvas */}
      <div className="absolute inset-0">
        <KargoGlobe
          key={globeKey}
          preset={activePreset}
          onViewer={setViewer}
          onNotice={setNotice}
          interactive={true}
        />
        <VesselLayer
          viewer={viewer}
          vessels={vessels}
          visible={true}
          selectedMmsi={selectedMmsi}
          detection={false}
          onSelect={setSelectedMmsi}
        />
        <HazardLayer
          viewer={viewer}
          hazards={hazards}
          showHazards={true}
          showWeather={true}
        />
        <CorridorLayer
          viewer={viewer}
          corridor={corridor}
          visible={true}
          showBoundaries={false}
        />
      </div>

      {/* Top Tactical Header */}
      <div className="pointer-events-none absolute left-3 right-3 top-3 z-20 flex flex-wrap items-center justify-between gap-2">
        <div className="pointer-events-auto rounded-xl border border-[#E2E6EB] bg-white/95 px-3 py-2 shadow-md backdrop-blur">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                mode === "live"
                  ? "bg-[#0E7A3D] animate-pulse"
                  : mode === "connecting"
                    ? "bg-[#6B7D99] animate-pulse"
                    : mode === "unavailable"
                      ? "bg-[#B42318]"
                      : "bg-[#D95D0F]"
              }`}
            />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#0A2342]">
              {mode === "live"
                ? "Live AIS Radar"
                : mode === "connecting"
                  ? "Connecting"
                  : mode === "unavailable"
                    ? "Feed unavailable"
                    : "Demo Corridor Feed"}
            </span>
            <span className="text-[#6B7D99] text-xs">·</span>
            {vesselsQuery.isError && !vesselsQuery.isLoading ? (
              <button
                type="button"
                onClick={retryFeed}
                className="font-mono text-[11px] font-bold text-[#B42318] hover:text-[#0A2342] underline underline-offset-2"
              >
                Retry feed
              </button>
            ) : (
              <span className="font-mono text-[11px] font-semibold text-[#3D4F68]">
                {vesselsQuery.isLoading && vessels.length === 0
                  ? "loading vessels"
                  : `${vessels.length} vessels in Bay`}
              </span>
            )}
          </div>
        </div>

        {/* Quick Fly Pills & Link to Full Globe */}
        <div className="pointer-events-auto flex items-center gap-1.5 flex-wrap">
          <div className="hidden sm:flex items-center gap-1 rounded-xl border border-[#E2E6EB] bg-white/95 p-1 shadow-md backdrop-blur">
            {PRESET_BUTTONS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePreset(p.id)}
                className={`rounded-lg px-2.5 py-1 text-[11.5px] font-bold transition-all ${
                  activePreset === p.id
                    ? "bg-[#D95D0F] text-white"
                    : "text-[#0A2342] hover:bg-[#FAF7F1]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <Link
            href="/dashboard/globe"
            className="rounded-xl border border-[#D95D0F] bg-[#D95D0F] px-3 py-1.5 text-[12px] font-bold text-white shadow-md hover:bg-[#B45309] transition-colors flex items-center gap-1.5"
          >
            <span>Launch Gods Eye 3D</span>
            <span className="text-xs">↗</span>
          </Link>
        </div>
      </div>

      {/* Selected Vessel Inspector Card */}
      {selectedVessel && (
        <div className="pointer-events-auto absolute left-3 bottom-14 z-30 w-[310px] max-w-[calc(100vw-24px)] rounded-xl border border-[#E2E6EB] bg-white p-3.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="mono-label text-[#B45309]">Contact Tracked</p>
              <h3 className="font-display font-black text-base text-[#0A2342] leading-tight">
                {selectedVessel.name || selectedVessel.mmsi}
              </h3>
              <p className="font-mono text-[10.5px] text-[#6B7D99] mt-0.5">
                MMSI {selectedVessel.mmsi} ·{" "}
                {selectedVessel.shipType || "Vessel"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedMmsi(null)}
              className="text-xs font-bold text-[#6B7D99] hover:text-[#0A2342] p-1"
              aria-label="Close vessel card"
            >
              ✕
            </button>
          </div>

          <div className="mt-2.5 grid grid-cols-3 gap-1.5 font-mono text-[11px] text-center">
            <div className="rounded-lg bg-[#FAF7F1] border border-[#E2E6EB] p-1.5">
              <span className="block text-[9px] uppercase tracking-wider text-[#6B7D99]">
                Speed
              </span>
              <span className="font-bold text-[#0A2342]">
                {selectedVessel.sog ?? "—"} kn
              </span>
            </div>
            <div className="rounded-lg bg-[#FAF7F1] border border-[#E2E6EB] p-1.5">
              <span className="block text-[9px] uppercase tracking-wider text-[#6B7D99]">
                Heading
              </span>
              <span className="font-bold text-[#0A2342]">
                {selectedVessel.cog ?? "—"}°
              </span>
            </div>
            <div className="rounded-lg bg-[#FAF7F1] border border-[#E2E6EB] p-1.5">
              <span className="block text-[9px] uppercase tracking-wider text-[#6B7D99]">
                Draft
              </span>
              <span className="font-bold text-[#0A2342]">
                {selectedVessel.draught ?? "—"} m
              </span>
            </div>
          </div>

          {nearestPortToSelected && (
            <p className="mt-2 text-[11px] text-[#3D4F68]">
              <span className="font-semibold text-[#0A2342]">Proximity:</span>{" "}
              {nearestPortToSelected.nm.toFixed(1)} NM from{" "}
              {nearestPortToSelected.name}
            </p>
          )}

          <div className="mt-3 flex gap-2">
            <Link
              href="/dashboard"
              onClick={() => handleOpenInSolver(selectedVessel.name)}
              className="flex-1 rounded-lg bg-[#0A2342] px-3 py-1.5 text-center text-[12px] font-bold text-white hover:bg-[#14315C] transition-colors"
            >
              Open in Cargo Solver ➔
            </Link>
          </div>
        </div>
      )}

      {/* Canvas failure notice (terrain/tile/WebGL) with one-click rebuild */}
      {notice && (
        <div className="pointer-events-auto absolute left-3 top-[68px] z-30 max-w-[320px] rounded-xl border border-[#E2E6EB] bg-white px-3 py-2 shadow-xl">
          <p className="text-[12px] font-semibold text-[#B42318]">{notice}</p>
          <button
            type="button"
            onClick={retryFeed}
            className="mt-1.5 rounded-lg bg-[#0A2342] px-3 py-1.5 text-[12px] font-bold text-white hover:bg-[#14315C]"
          >
            Reload 3D view
          </button>
        </div>
      )}

      {/* Bottom Bar: Soundings Summary & Attribution */}
      <div className="pointer-events-none absolute left-3 right-3 bottom-3 z-20 flex flex-wrap items-center justify-between gap-2">
        <div className="pointer-events-auto rounded-full border border-[#E2E6EB] bg-white/95 px-3.5 py-1 shadow backdrop-blur">
          <p className="font-mono text-[10.5px] font-semibold text-[#0A2342]">
            Soundings: <span className="text-[#B45309]">Haldia 7.5m</span> ·{" "}
            <span className="text-[#0E7A3D]">Sandheads 22m+</span> · Paradip
            14.5m · Dhamra 16.0m
          </p>
        </div>

        <div className="pointer-events-auto rounded-full border border-[#E2E6EB] bg-white/90 px-3 py-1 shadow backdrop-blur">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-[#6B7D99]">
            Esri · AISStream · USGS · Open-Meteo
          </p>
        </div>
      </div>
    </div>
  );
}
