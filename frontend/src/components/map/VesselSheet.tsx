"use client";

import React from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/LanguageContext";
import { loadJSON, saveJSON } from "@/lib/storage";
import { getApiBase, haversineNm } from "./api";
import type { CorridorPort, Vessel, VesselMode } from "./api";

interface VesselSheetProps {
  vessel: Vessel | null;
  mode: VesselMode;
  corridor: CorridorPort[];
  onClose: () => void;
}

export default function VesselSheet({ vessel, mode, corridor, onClose }: VesselSheetProps) {
  const { t } = useLanguage();
  const [result, setResult] = React.useState<string | null>(null);

  const evaluate = useMutation({
    mutationFn: async () => {      const saved = loadJSON<{ volume?: string; port?: string; commodity?: string }>(
        "kargosetu_eval_v1",
        {},
      );
      const volumeRaw = String(saved.volume ?? "145,000").replace(/,/g, "");
      const volume_mt = Number(volumeRaw) || 145000;
      const dest_port_name = saved.port || "Haldia";
      const commodity = saved.commodity || "Iron Ore";
      const res = await fetch(`${getApiBase()}/api/v1/requisitions/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volume_mt, dest_port_name, commodity }),
      });
      if (!res.ok) throw new Error("evaluate failed");
      const data = await res.json();
      try {
        saveJSON("kargosetu_eval_v1", { ...saved, lastResult: data });
      } catch {
        // persistence best-effort
      }
      return data as { strategy?: string; feasible?: boolean };
    },
    onSuccess: (data) => {
      setResult(data.strategy || (data.feasible ? "Feasible" : "Not feasible"));
    },
    onError: () => {
      setResult("Evaluation failed. Retry from the solver desk.");
    },
  });

  if (!vessel) return null;

  const nearest = nearestPort(vessel.lat, vessel.lon, corridor);
  const badge =
    mode === "live"
      ? { text: t("globe.status.live"), cls: "bg-[#E9F5EE] text-[#0E7A3D] border-[#BFE3CD]" }
      : mode === "demo"
        ? { text: t("globe.status.demo"), cls: "bg-[#FDF1E7] text-[#B45309] border-[#F0D3B8]" }
        : mode === "stale"
          ? { text: t("globe.status.stale"), cls: "bg-[#F3F5F7] text-[#3D4F68] border-[#E2E6EB]" }
          : { text: t("globe.status.unavailable"), cls: "bg-[#FDECEC] text-[#B42318] border-[#F5C6C6]" };

  return (
    <div className="absolute left-3 right-3 bottom-3 sm:left-auto sm:right-4 sm:bottom-4 sm:w-[360px] rounded-2xl bg-white border border-[#E2E6EB] shadow-lg p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="mono-label text-[#6B7D99]">Vessel</p>
          <h3 className="font-display font-black text-lg text-[#0A2342] leading-tight">
            {vessel.name || vessel.mmsi}
          </h3>
          <p className="font-mono text-[11px] text-[#6B7D99] mt-0.5">
            MMSI {vessel.mmsi} · {vessel.shipType || "Unknown type"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`font-mono text-[10px] uppercase tracking-[0.12em] px-2 py-1 rounded border ${badge.cls}`}>
            {badge.text}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-[12px] font-semibold text-[#6B7D99] hover:text-[#0A2342]"
            aria-label="Close vessel sheet"
          >
            Close
          </button>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 font-mono text-[12px]">
        <div className="rounded-lg bg-[#FAF7F1] border border-[#E2E6EB] px-2.5 py-2">
          <dt className="text-[10px] uppercase tracking-[0.12em] text-[#6B7D99]">SOG</dt>
          <dd className="font-bold text-[#0A2342]">{vessel.sog ?? "—"} kn</dd>
        </div>
        <div className="rounded-lg bg-[#FAF7F1] border border-[#E2E6EB] px-2.5 py-2">
          <dt className="text-[10px] uppercase tracking-[0.12em] text-[#6B7D99]">COG</dt>
          <dd className="font-bold text-[#0A2342]">{vessel.cog ?? "—"}°</dd>
        </div>
        <div className="rounded-lg bg-[#FAF7F1] border border-[#E2E6EB] px-2.5 py-2">
          <dt className="text-[10px] uppercase tracking-[0.12em] text-[#6B7D99]">Draught</dt>
          <dd className="font-bold text-[#0A2342]">{vessel.draught ?? "—"} m</dd>
        </div>
      </dl>

      <p className="mt-2.5 text-[12.5px] text-[#3D4F68]">
        {t("globe.sheet.distance").replace("{n}", nearest ? `${nearest.nm.toFixed(1)} NM to ${nearest.name}` : "—")}
      </p>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => evaluate.mutate()}
          disabled={evaluate.isPending}
          className="flex-1 rounded-lg bg-[#D95D0F] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#B45309] disabled:opacity-60"
        >
          {evaluate.isPending ? "Evaluating…" : t("globe.sheet.evaluate")}
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg bg-white border border-[#E2E6EB] px-4 py-2.5 text-sm font-bold text-[#0A2342] hover:bg-[#FAF7F1]"
        >
          {t("globe.sheet.openSolver")}
        </Link>
      </div>
      {result && <p className="mt-2 text-[12.5px] font-semibold text-[#0E7A3D]">{result}</p>}
    </div>
  );
}

function nearestPort(lat: number, lon: number, corridor: CorridorPort[]) {
  let best: { name: string; nm: number } | null = null;
  for (const p of corridor) {
    if (typeof p.lat !== "number" || typeof p.lon !== "number") continue;
    const nm = haversineNm(lat, lon, p.lat, p.lon);
    if (!best || nm < best.nm) best = { name: p.name, nm };
  }
  return best;
}
