"use client";

import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { CAMERA_PRESETS, TOUR_STOPS } from "./globeStore";
import type { CameraPresetId, GlobePersistedState } from "./globeStore";
import type { CesiumViewer } from "./KargoGlobe";

interface TourDirectorProps {
  viewer: CesiumViewer | null;
  onPreset: (preset: CameraPresetId, patch?: Partial<GlobePersistedState>) => void;
}

export default function TourDirector({ viewer, onPreset }: TourDirectorProps) {
  const { t } = useLanguage();
  const [playing, setPlaying] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const priorRef = React.useRef<CameraPresetId>("corridor");

  const stop = React.useCallback(() => {
    setPlaying(false);
    onPreset(priorRef.current);
  }, [onPreset]);

  React.useEffect(() => {
    if (!playing) return;
    if (!viewer) {
      // Advance captions even before the viewer is ready.
      const id = window.setTimeout(() => {
        setStep((s) => (s + 1 < TOUR_STOPS.length ? s + 1 : 0));
      }, 8000);
      return () => window.clearTimeout(id);
    }
    const current = TOUR_STOPS[step];
    onPreset(current.preset);
    const id = window.setTimeout(() => {
      setStep((s) => {
        if (s + 1 >= TOUR_STOPS.length) {
          setPlaying(false);
          return 0;
        }
        return s + 1;
      });
    }, 8000);
    return () => window.clearTimeout(id);
  }, [playing, step, viewer, onPreset]);

  React.useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing, stop]);

  const start = () => {
    priorRef.current = "corridor";
    setStep(0);
    setPlaying(true);
  };

  return (
    <div className="rounded-2xl bg-white border border-[#E2E6EB] p-3 shadow-sm">
      <div className="flex items-center gap-2">
        {!playing ? (
          <button
            type="button"
            onClick={start}
            className="flex-1 rounded-lg bg-[#0A2342] px-3 py-2 text-[13px] font-bold text-white hover:bg-[#14315C]"
          >
            {t("globe.tour.play")}
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="flex-1 rounded-lg bg-white border border-[#E2E6EB] px-3 py-2 text-[13px] font-bold text-[#0A2342] hover:bg-[#FAF7F1]"
          >
            {t("globe.tour.stop")}
          </button>
        )}
        <button
          type="button"
          onClick={() => onPreset("corridor")}
          className="rounded-lg bg-white border border-[#E2E6EB] px-3 py-2 text-[13px] font-bold text-[#0A2342] hover:bg-[#FAF7F1]"
        >
          {t("globe.tour.reset")}
        </button>
      </div>
      {playing && (
        <div className="mt-2.5 rounded-xl bg-[#FAF7F1] border border-[#E2E6EB] px-3 py-2.5">
          <p className="text-[12.5px] font-semibold text-[#0A2342]">
            {step + 1}. {TOUR_STOPS[step].caption}
          </p>
          <div className="mt-2 flex gap-1.5">
            {TOUR_STOPS.map((s, i) => (
              <span
                key={s.id}
                className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-[#D95D0F]" : "bg-[#E2E6EB]"}`}
              />
            ))}
          </div>
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#6B7D99]">
            {CAMERA_PRESETS[TOUR_STOPS[step].preset].id} · Esc exits
          </p>
        </div>
      )}
    </div>
  );
}
