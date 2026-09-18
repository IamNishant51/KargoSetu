"use client";

import React from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/LanguageContext";
import { loadJSON, saveJSON } from "@/lib/storage";
import { getApiBase, haversineNm } from "./api";
import type { CorridorPort, Vessel, VesselMode } from "./api";
import { useLocality } from "./useContext";

interface VesselSheetProps {
  vessel: Vessel | null;
  mode: VesselMode;
  corridor: CorridorPort[];
  onClose: () => void;
}

export default function VesselSheet({
  vessel,
  mode,
  corridor,
  onClose,
}: VesselSheetProps) {
  const { t } = useLanguage();
  const [result, setResult] = React.useState<string | null>(null);

  const evaluate = useMutation({
    mutationFn: async () => {
      const saved = loadJSON<{
        volume?: string | number;
        port?: string | { name?: string } | null;
        commodity?: string;
      }>("kargosetu_eval_v1", {});
      // The solver desk persists `port` as a { name, subtext } object while
      // landing widgets persist it as a string. Accept both so a stale or
      // desk-written value can never produce a 422 here.
      const dest_port_name = asPortName(saved.port) ?? "Haldia";
      const volumeRaw = String(saved.volume ?? "145,000").replace(/,/g, "");
      const parsedVolume = Number(volumeRaw);
      const volume_mt =
        Number.isFinite(parsedVolume) && parsedVolume > 0
          ? parsedVolume
          : 145000;
      const commodity =
        typeof saved.commodity === "string" && saved.commodity.trim()
          ? saved.commodity
          : "Iron Ore";
      const res = await fetch(`${getApiBase()}/api/v1/requisitions/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volume_mt, dest_port_name, commodity }),
      });
      if (!res.ok) {
        let detail = "";
        try {
          const body = (await res.json()) as { detail?: unknown };
          detail = formatDetail(body.detail);
        } catch {
          // non-JSON error body; fall through to status text
        }
        throw new Error(
          (detail ? `${res.status} ${detail}` : `HTTP ${res.status}`).slice(
            0,
            200,
          ),
        );
      }
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
    onError: (err: unknown) => {
      const reason =
        err instanceof TypeError
          ? "API unreachable"
          : err instanceof Error && err.message
            ? err.message
            : "unknown error";
      setResult(`Evaluation failed (${reason}). Retry from the solver desk.`);
    },
  });

  const locality = useLocality(vessel?.lat ?? null, vessel?.lon ?? null);

  if (!vessel) return null;

  const nearest = nearestPort(vessel.lat, vessel.lon, corridor);
  const eta = etaToRoads(vessel.sog, nearest?.nm ?? null);
  const badge =
    mode === "live"
      ? {
          text: t("globe.status.live"),
          cls: "bg-[#E9F5EE] text-[#0E7A3D] border-[#BFE3CD]",
        }
      : mode === "demo"
        ? {
            text: t("globe.status.demo"),
            cls: "bg-[#FDF1E7] text-[#B45309] border-[#F0D3B8]",
          }
        : mode === "stale"
          ? {
              text: t("globe.status.stale"),
              cls: "bg-[#F3F5F7] text-[#3D4F68] border-[#E2E6EB]",
            }
          : {
              text: t("globe.status.unavailable"),
              cls: "bg-[#FDECEC] text-[#B42318] border-[#F5C6C6]",
            };

  return (
    <div className="absolute left-3 right-3 bottom-12 sm:left-4 sm:right-auto sm:bottom-12 sm:w-[370px] z-30 rounded-2xl bg-white/98 border border-[#E2E6EB] shadow-2xl backdrop-blur p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="mono-label text-[#B45309]">Vessel Tracked</p>
          <h3 className="font-display font-black text-lg text-[#0A2342] leading-tight">
            {vessel.name || vessel.mmsi}
          </h3>
          <p className="font-mono text-[11px] text-[#6B7D99] mt-0.5">
            MMSI {vessel.mmsi} · {vessel.shipType || "Unknown type"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.12em] px-2 py-1 rounded border ${badge.cls}`}
          >
            {badge.text}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#E2E6EB] bg-[#FAF7F1] px-2 py-1 text-[12px] font-bold text-[#6B7D99] hover:text-[#0A2342] hover:bg-white transition-colors"
            aria-label="Close vessel sheet"
          >
            ✕
          </button>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 font-mono text-[12px]">
        <div className="rounded-lg bg-[#FAF7F1] border border-[#E2E6EB] px-2.5 py-2">
          <dt className="text-[10px] uppercase tracking-[0.12em] text-[#6B7D99]">
            SOG
          </dt>
          <dd className="font-bold text-[#0A2342]">{vessel.sog ?? "—"} kn</dd>
        </div>
        <div className="rounded-lg bg-[#FAF7F1] border border-[#E2E6EB] px-2.5 py-2">
          <dt className="text-[10px] uppercase tracking-[0.12em] text-[#6B7D99]">
            COG
          </dt>
          <dd className="font-bold text-[#0A2342]">{vessel.cog ?? "—"}°</dd>
        </div>
        <div className="rounded-lg bg-[#FAF7F1] border border-[#E2E6EB] px-2.5 py-2">
          <dt className="text-[10px] uppercase tracking-[0.12em] text-[#6B7D99]">
            Draught
          </dt>
          <dd className="font-bold text-[#0A2342]">
            {vessel.draught ?? "—"} m
          </dd>
        </div>
      </dl>

      <p className="mt-2 text-[12.5px] font-semibold text-[#0A2342]">
        Voyage: To {vessel.destination ?? "Unknown destination"}
      </p>
      <p className="mt-1 text-[12.5px] text-[#3D4F68]">
        {t("globe.sheet.distance").replace(
          "{n}",
          nearest ? `${nearest.nm.toFixed(1)} NM to ${nearest.name}` : "—",
        )}
      </p>
      <p className="mt-1 text-[12.5px] text-[#3D4F68]">
        {eta
          ? t("globe.sheet.eta")
              .replace("{h}", eta.hours)
              .replace("{t}", eta.clock)
          : t("globe.sheet.etaUnknown")}
        {locality.data?.label
          ? ` · ${t("globe.sheet.locality").replace("{label}", locality.data.label)}`
          : ""}
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
      {result && (
        <p className="mt-2 text-[12.5px] font-semibold text-[#0E7A3D]">
          {result}
        </p>
      )}
    </div>
  );
}

function asPortName(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (value && typeof value === "object") {
    const name = (value as { name?: unknown }).name;
    if (typeof name === "string" && name.trim()) return name;
  }
  return null;
}

function formatDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  // FastAPI request-validation errors arrive as a list of { loc, msg }.
  if (Array.isArray(detail)) {
    return detail
      .map((d) =>
        typeof d === "string"
          ? d
          : d &&
              typeof d === "object" &&
              typeof (d as { msg?: unknown }).msg === "string"
            ? (d as { loc?: unknown; msg: string }).loc
              ? `${JSON.stringify((d as { loc: unknown }).loc)}: ${(d as { msg: string }).msg}`
              : (d as { msg: string }).msg
            : JSON.stringify(d),
      )
      .join("; ");
  }
  return "";
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

function etaToRoads(
  sog: number | null,
  nm: number | null,
): { hours: string; clock: string } | null {
  if (typeof sog !== "number" || !(sog > 0.5) || typeof nm !== "number")
    return null;
  const hours = nm / sog;
  if (!Number.isFinite(hours) || hours > 720) return null;
  const arrival = new Date(Date.now() + hours * 3600 * 1000);
  return {
    hours: hours.toFixed(1),
    clock: arrival.toISOString().slice(11, 16),
  };
}
