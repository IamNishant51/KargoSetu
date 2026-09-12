"use client";

import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { CameraPresetId } from "./globeStore";
import { haversineNm } from "./api";
import type { CorridorPort, Vessel } from "./api";

interface CommandBarProps {
  onPreset: (preset: CameraPresetId) => void;
  onToggleLayer: (layer: string, show: boolean) => void;
  onTrackNearest: () => void;
  onReset: () => void;
  onEvaluate: (volume: number, port: string) => void;
  vessels: Vessel[];
  corridor: CorridorPort[];
}

const EXAMPLES = [
  "take me to haldia",
  "show vessels",
  "hide hazards",
  "track nearest",
  "reset globe",
  "evaluate 150000 Haldia",
];

export default function CommandBar({
  onPreset,
  onToggleLayer,
  onTrackNearest,
  onReset,
  onEvaluate,
  vessels,
  corridor,
}: CommandBarProps) {
  const { t } = useLanguage();
  const [value, setValue] = React.useState("");
  const [hint, setHint] = React.useState<string | null>(null);

  function run(raw: string) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    const takeMatch = cmd.match(/^take me to (haldia|paradip|dhamra|sandheads|newcastle|corridor)$/);
    if (takeMatch) {
      onPreset(takeMatch[1] as CameraPresetId);
      setHint(`Flying to ${takeMatch[1]}.`);
      setValue("");
      return;
    }
    const showMatch = cmd.match(/^(show|hide) (vessels|hazards|weather|corridor|boundaries)$/);
    if (showMatch) {
      onToggleLayer(showMatch[2], showMatch[1] === "show");
      setHint(`${showMatch[1] === "show" ? "Showing" : "Hiding"} ${showMatch[2]}.`);
      setValue("");
      return;
    }
    if (cmd === "track nearest") {
      onTrackNearest();
      setHint("Tracking nearest vessel.");
      setValue("");
      return;
    }
    if (cmd === "reset globe") {
      onReset();
      setHint("Globe reset to corridor overview.");
      setValue("");
      return;
    }
    const evalMatch = cmd.match(/^evaluate (\d[\d,]*)\s+([a-z]+)$/);
    if (evalMatch) {
      const volume = Number(evalMatch[1].replace(/,/g, ""));
      const portRaw = evalMatch[2];
      const port = portRaw.charAt(0).toUpperCase() + portRaw.slice(1);
      if (!Number.isFinite(volume) || volume <= 0) {
        setHint("Volume must be a positive number.");
        return;
      }
      onEvaluate(volume, port);
      setHint(`Evaluating ${volume.toLocaleString("en-US")} MT to ${port}.`);
      setValue("");
      return;
    }
    if (cmd.startsWith("evaluate")) {
      setHint("Try: evaluate 150000 Haldia");
      return;
    }
    setHint(`Unknown command. Try: ${EXAMPLES.join(" · ")}`);
  }

  // Expose nearest helper for track-nearest wiring verification.
  void haversineNm;
  void vessels;
  void corridor;

  return (
    <div className="rounded-2xl bg-white border border-[#E2E6EB] p-3 shadow-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(value);
        }}
        className="flex gap-2"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("globe.commands.placeholder")}
          aria-label="Globe command bar"
          className="flex-1 rounded-lg border border-[#E2E6EB] bg-[#FAF7F1] px-3 py-2 text-[13px] text-[#0A2342] outline-none focus:border-[#D95D0F]"
        />
        <button
          type="submit"
          className="rounded-lg bg-[#0A2342] px-3.5 py-2 text-[13px] font-bold text-white hover:bg-[#14315C]"
        >
          Run
        </button>
      </form>
      <p className="mt-2 text-[11.5px] text-[#6B7D99]">
        {hint ?? `Try: ${EXAMPLES.slice(0, 3).join(" · ")}`}
      </p>
    </div>
  );
}
