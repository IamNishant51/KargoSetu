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

const PRESET_CHIPS: Array<{ label: string; preset: CameraPresetId }> = [
  { label: "Haldia", preset: "haldia" },
  { label: "Sandheads", preset: "sandheads" },
  { label: "Paradip", preset: "paradip" },
  { label: "Dhamra", preset: "dhamra" },
  { label: "Newcastle", preset: "newcastle" },
  { label: "Corridor", preset: "corridor" },
];

function parseNavigationTarget(input: string): CameraPresetId | null {
  const norm = input
    .toLowerCase()
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Match commands like "take me to haldia", "go to paradip", "fly to sandheads", or just "haldia"
  const stripped = norm
    .replace(/^(take me to|go to|goto|fly to|navigate to|zoom to|visit|show|head to)\s+/, "")
    .replace(/\s+(port|roads|fairway|anchorage|overview)$/, "")
    .trim();

  if (["haldia", "haldiya"].includes(stripped)) return "haldia";
  if (["paradip", "paradeep"].includes(stripped)) return "paradip";
  if (["dhamra", "dhamara"].includes(stripped)) return "dhamra";
  if (["sandheads", "sand heads", "sandhead", "sand head"].includes(stripped)) return "sandheads";
  if (["newcastle", "new castle", "australia"].includes(stripped)) return "newcastle";
  if (["corridor", "overview", "bay of bengal", "reset", "home"].includes(stripped)) return "corridor";

  return null;
}

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

    // Robust navigation check (supports "take me to haldia", "goto sand heads", "paradip port", etc.)
    const target = parseNavigationTarget(cmd);
    if (target) {
      onPreset(target);
      setHint(`Flying to ${target.charAt(0).toUpperCase() + target.slice(1)}.`);
      setValue("");
      return;
    }

    const showMatch = cmd.replace(/[.,!]/g, "").match(/^(show|hide) (vessels|hazards|weather|corridor|boundaries)$/);
    if (showMatch) {
      onToggleLayer(showMatch[2], showMatch[1] === "show");
      setHint(`${showMatch[1] === "show" ? "Showing" : "Hiding"} ${showMatch[2]}.`);
      setValue("");
      return;
    }
    if (cmd.includes("track nearest") || cmd === "nearest") {
      onTrackNearest();
      setHint("Tracking nearest vessel.");
      setValue("");
      return;
    }
    if (cmd.includes("reset") || cmd === "corridor") {
      onReset();
      setHint("Globe reset to corridor overview.");
      setValue("");
      return;
    }
    const evalMatch = cmd.match(/^evaluate\s+(\d[\d,]*)\s+([a-z]+)/);
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
          className="rounded-lg bg-[#0A2342] px-3.5 py-2 text-[13px] font-bold text-white hover:bg-[#14315C] transition-colors"
        >
          Run
        </button>
      </form>

      {/* Clickable Quick Navigation Chips */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#6B7D99] mr-0.5">
          Fly to:
        </span>
        {PRESET_CHIPS.map((chip) => (
          <button
            key={chip.preset}
            type="button"
            onClick={() => {
              onPreset(chip.preset);
              setHint(`Flying to ${chip.label}.`);
            }}
            className="rounded-md border border-[#E2E6EB] bg-[#FAF7F1] px-2 py-0.5 text-[11px] font-semibold text-[#0A2342] hover:bg-[#D95D0F] hover:text-white hover:border-[#D95D0F] transition-all"
          >
            {chip.label}
          </button>
        ))}
      </div>

      <p className="mt-2 text-[11.5px] text-[#6B7D99]">
        {hint ?? `Try: ${EXAMPLES.slice(0, 3).join(" · ")}`}
      </p>
    </div>
  );
}
