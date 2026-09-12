"use client";

import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { LayerVisibility } from "./globeStore";

interface LayerTogglesProps {
  layers: LayerVisibility;
  onChange: (next: LayerVisibility) => void;
}

export default function LayerToggles({ layers, onChange }: LayerTogglesProps) {
  const { t } = useLanguage();
  const items: Array<{ key: keyof LayerVisibility; label: string }> = [
    { key: "vessels", label: t("globe.layers.vessels") },
    { key: "hazards", label: t("globe.layers.hazards") },
    { key: "weather", label: t("globe.layers.weather") },
    { key: "boundaries", label: t("globe.layers.boundaries") },
    { key: "corridor", label: t("globe.layers.corridor") },
  ];
  return (
    <div className="rounded-2xl bg-white border border-[#E2E6EB] p-3 shadow-sm">
      <p className="mono-label text-[#6B7D99] px-1 pb-2">Layers</p>
      <div className="space-y-1.5">
        {items.map((it) => (
          <label key={it.key} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-[#FAF7F1] cursor-pointer text-[13.5px] font-semibold text-[#0A2342]">
            <input
              type="checkbox"
              checked={layers[it.key]}
              onChange={(e) => onChange({ ...layers, [it.key]: e.target.checked })}
              className="h-4 w-4 accent-[#D95D0F]"
            />
            {it.label}
          </label>
        ))}
      </div>
    </div>
  );
}
