"use client";

import { useLanguage } from "@/i18n/LanguageContext";
import type { VesselMode } from "./api";
import type { FeedSnapshot } from "./useFeeds";

interface SourcesPanelProps {
  feeds: FeedSnapshot | undefined;
  mode: VesselMode;
}

function dot(cls: string) {
  return <span className={`inline-block h-2 w-2 rounded-full ${cls}`} />;
}

export default function SourcesPanel({ feeds, mode }: SourcesPanelProps) {
  const { t } = useLanguage();
  const hz = feeds?.feeds?.hazards;
  const collects = feeds?.feeds?.vessels?.collectsToday;
  const firmsUsed = hz?.firmsUsedToday;

  const statusDot = (s: string | undefined) =>
    s === "ok" || s === "live"
      ? dot("bg-[#0E7A3D]")
      : s === "demo" || s === "stale"
        ? dot("bg-[#B45309]")
        : dot("bg-[#9AA7B8]");

  return (
    <div className="rounded-2xl bg-white border border-[#E2E6EB] p-3 shadow-sm">
      <p className="mono-label text-[#6B7D99] px-1 pb-2">
        {t("globe.sources.title")}
      </p>
      <ul className="space-y-1.5 text-[12.5px] text-[#0A2342]">
        <li className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            {statusDot(mode)} {t("globe.sources.vessels")}
          </span>
          <span className="font-mono text-[11px] text-[#6B7D99]">
            {mode}
            {typeof collects === "number"
              ? ` · ${t("globe.sources.collects").replace("{n}", String(collects))}`
              : ""}
          </span>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            {statusDot(hz?.usgs)} USGS
          </span>
          <span className="font-mono text-[11px] text-[#6B7D99]">
            {hz?.usgs ?? "—"}
          </span>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            {statusDot(hz?.firms)} FIRMS
          </span>
          <span className="font-mono text-[11px] text-[#6B7D99]">
            {hz?.firms ?? "—"}
            {typeof firmsUsed === "number"
              ? ` · ${t("globe.sources.budget").replace("{n}", String(firmsUsed))}`
              : ""}
          </span>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            {statusDot(hz?.meteo)} Open-Meteo
          </span>
          <span className="font-mono text-[11px] text-[#6B7D99]">
            {hz?.meteo ?? "—"}
          </span>
        </li>
      </ul>
      {(mode !== "live" || hz?.firms === "disabled") && (
        <div className="mt-2.5 rounded-xl bg-[#FAF7F1] border border-[#E2E6EB] px-3 py-2.5">
          <p className="text-[12px] font-bold text-[#0A2342]">
            {t("globe.sources.golive")}
          </p>
          <p className="mt-1 text-[11.5px] leading-snug text-[#3D4F68]">
            {t("globe.sources.goliveBody")}
          </p>
        </div>
      )}
    </div>
  );
}
