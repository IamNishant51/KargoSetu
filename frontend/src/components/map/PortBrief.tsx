"use client";

import { useLanguage } from "@/i18n/LanguageContext";
import type { CorridorPort, HazardWeather, PortNews } from "./api";

interface PortBriefProps {
  port: CorridorPort | undefined;
  weather: HazardWeather | null | undefined;
  news: PortNews | undefined;
  onFlyTo: () => void;
}

export default function PortBrief({
  port,
  weather,
  news,
  onFlyTo,
}: PortBriefProps) {
  const { t } = useLanguage();
  if (!port) return null;

  const items = (news?.items ?? []).slice(0, 3);

  return (
    <div className="rounded-2xl bg-white border border-[#E2E6EB] p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2 px-1 pb-2">
        <p className="mono-label text-[#6B7D99]">{t("globe.brief.title")}</p>
        <button
          type="button"
          onClick={onFlyTo}
          className="rounded-lg bg-[#0A2342] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#14315C]"
        >
          {port.name}
        </button>
      </div>
      <p className="px-1 text-[12px] text-[#3D4F68]">
        {port.sub} · {t("globe.brief.tide").replace("{t}", port.tide)}
      </p>
      <div className="mt-2 grid grid-cols-3 gap-1.5 font-mono text-[12px]">
        <div className="rounded-lg bg-[#FAF7F1] border border-[#E2E6EB] px-2 py-1.5 text-center">
          <p className="text-[9.5px] uppercase tracking-[0.1em] text-[#6B7D99]">
            Ships
          </p>
          <p className="font-bold text-[#0A2342]">
            {port.liveVesselCount ?? "—"}
          </p>
        </div>
        <div className="rounded-lg bg-[#FAF7F1] border border-[#E2E6EB] px-2 py-1.5 text-center">
          <p className="text-[9.5px] uppercase tracking-[0.1em] text-[#6B7D99]">
            Loiter
          </p>
          <p className="font-bold text-[#0A2342]">
            {port.loiteringCount ?? "—"}
          </p>
        </div>
        <div className="rounded-lg bg-[#FAF7F1] border border-[#E2E6EB] px-2 py-1.5 text-center">
          <p className="text-[9.5px] uppercase tracking-[0.1em] text-[#6B7D99]">
            SOG
          </p>
          <p className="font-bold text-[#0A2342]">{port.meanSogKn ?? "—"}</p>
        </div>
      </div>
      <p className="mt-2 px-1 text-[12px] text-[#3D4F68]">
        {t("globe.brief.weather")
          .replace(
            "{w}",
            weather?.waveHeightM != null ? String(weather.waveHeightM) : "?",
          )
          .replace(
            "{k}",
            weather?.windSpeedKmh != null ? String(weather.windSpeedKmh) : "?",
          )}
        {" · "}
        {t("globe.brief.draft").replace("{d}", port.draft)}
      </p>
      <p className="mt-1.5 px-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[#6B7D99]">
        {t("globe.brief.news")}
      </p>
      {items.length === 0 ? (
        <p className="px-1 text-[12px] text-[#6B7D99]">
          {t("globe.brief.nonews")}
        </p>
      ) : (
        <ul className="mt-1 space-y-1">
          {items.map((n, i) => (
            <li
              key={`${n.title}-${i}`}
              className="px-1 text-[12px] leading-snug"
            >
              {n.url ? (
                <a
                  href={n.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#0A2342] underline decoration-[#D95D0F]/60 underline-offset-2 hover:text-[#D95D0F]"
                >
                  {n.title}
                </a>
              ) : (
                <span className="font-semibold text-[#0A2342]">{n.title}</span>
              )}
              {n.source && (
                <span className="text-[#6B7D99]"> · {n.source}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
