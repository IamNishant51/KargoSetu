import { loadJSON, saveJSON } from "@/lib/storage";

export const GLOBE_STORAGE_KEY = "kargosetu_globe_v1";

export type CameraPresetId =
  "corridor" | "haldia" | "paradip" | "dhamra" | "sandheads" | "newcastle";

export interface CameraPreset {
  id: CameraPresetId;
  lon: number;
  lat: number;
  height: number;
}

export const CAMERA_PRESETS: Record<CameraPresetId, CameraPreset> = {
  corridor: { id: "corridor", lon: 92.0, lat: 10.0, height: 4000000 },
  haldia: { id: "haldia", lon: 88.06, lat: 22.03, height: 180000 },
  paradip: { id: "paradip", lon: 86.68, lat: 20.26, height: 180000 },
  dhamra: { id: "dhamra", lon: 86.99, lat: 20.79, height: 180000 },
  sandheads: { id: "sandheads", lon: 88.45, lat: 21.35, height: 220000 },
  newcastle: { id: "newcastle", lon: 151.78, lat: -32.92, height: 400000 },
};

export interface LayerVisibility {
  vessels: boolean;
  hazards: boolean;
  weather: boolean;
  boundaries: boolean;
  corridor: boolean;
}

export interface GlobePersistedState {
  camera: CameraPresetId;
  layers: LayerVisibility;
  selectedMmsi: string | null;
}

export const DEFAULT_GLOBE_STATE: GlobePersistedState = {
  camera: "corridor",
  layers: {
    vessels: true,
    hazards: true,
    weather: true,
    boundaries: true,
    corridor: true,
  },
  selectedMmsi: null,
};

export function loadGlobeState(): GlobePersistedState {
  return loadJSON<GlobePersistedState>(GLOBE_STORAGE_KEY, DEFAULT_GLOBE_STATE);
}

export function saveGlobeState(state: GlobePersistedState): void {
  saveJSON(GLOBE_STORAGE_KEY, state);
}

export type SensorStyle = "normal" | "crt" | "nvg" | "flir";

export const TOUR_STOPS = [
  {
    id: "newcastle",
    preset: "newcastle" as CameraPresetId,
    caption: "Coking coal loads at Newcastle.",
  },
  {
    id: "transit",
    preset: "corridor" as CameraPresetId,
    caption: "Capesize economical deep-sea leg.",
  },
  {
    id: "sandheads",
    preset: "sandheads" as CameraPresetId,
    caption: "Big ships break bulk at Sandheads roads.",
  },
  {
    id: "haldia",
    preset: "haldia" as CameraPresetId,
    caption: "Haldia 7.5m draft forces Supramax splits.",
  },
  {
    id: "coa",
    preset: "haldia" as CameraPresetId,
    caption: "Book the contract in the rate dip.",
  },
] as const;
