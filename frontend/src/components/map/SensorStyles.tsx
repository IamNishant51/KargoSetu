"use client";

import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { SensorStyle } from "./globeStore";

interface SensorStylesProps {
  value: SensorStyle;
  onChange: (next: SensorStyle) => void;
}

const ORDER: SensorStyle[] = ["normal", "crt", "nvg", "flir"];

export function sensorFilter(style: SensorStyle): string {
  switch (style) {
    case "crt":
      return "contrast(1.15) saturate(1.4) brightness(0.95)";
    case "nvg":
      return "sepia(1) saturate(3) hue-rotate(70deg) brightness(0.9) contrast(1.2)";
    case "flir":
      return "grayscale(1) invert(1) contrast(1.4) brightness(1.05)";
    default:
      return "none";
  }
}

export default function SensorStyles({ value, onChange }: SensorStylesProps) {
  const { t } = useLanguage();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "1") onChange("normal");
      if (e.key === "2") onChange("crt");
      if (e.key === "3") onChange("nvg");
      if (e.key === "4") onChange("flir");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onChange]);

  return (
    <div className="rounded-2xl bg-white border border-[#E2E6EB] p-3 shadow-sm">
      <p className="mono-label text-[#6B7D99] px-1 pb-2">Sensors</p>
      <div className="grid grid-cols-4 gap-1.5">
        {ORDER.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            title={`Key ${i + 1}`}
            className={`rounded-lg px-2 py-2 text-[12px] font-bold border ${
              value === s
                ? "bg-[#0A2342] text-white border-[#0A2342]"
                : "bg-white text-[#0A2342] border-[#E2E6EB] hover:bg-[#FAF7F1]"
            }`}
          >
            {t(`globe.sensors.${s}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
