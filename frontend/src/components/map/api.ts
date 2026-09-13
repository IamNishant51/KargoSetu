export function getApiBase(): string {
  if (String(process.env.NODE_ENV) === "production") return "";
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}

export interface BBox {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

export const DEFAULT_BBOX: BBox = {
  minLon: 88.0,
  minLat: -13.0,
  maxLon: 118.0,
  maxLat: 17.0,
};

export interface Vessel {
  mmsi: string;
  name: string | null;
  lat: number;
  lon: number;
  sog: number | null;
  cog: number | null;
  draught: number | null;
  shipType: string | null;
  destination: string | null;
  eta: string | null;
  navStatus: number | null;
  timestamp: string;
  demo: boolean;
}

export type VesselMode = "live" | "demo" | "stale" | "unavailable" | "connecting";

export interface VesselsResponse {
  mode: VesselMode;
  vessels: Vessel[];
  updatedAt: string;
  notice: string | null;
}

export interface Earthquake {
  id: string;
  lat: number;
  lon: number;
  mag: number | null;
  place: string | null;
  time: string | null;
}

export interface Fire {
  lat: number;
  lon: number;
  confidence: string | null;
  acqDate: string | null;
}

export interface HazardWeather {
  waveHeightM: number | null;
  windSpeedKmh: number | null;
  source: string;
}

export interface HazardsResponse {
  earthquakes: Earthquake[];
  fires: Fire[];
  weather: HazardWeather | null;
  sources: { usgs: string; firms: string; meteo: string };
  updatedAt: string;
}

export interface CorridorPort {
  name: string;
  n: string;
  sub: string;
  draft: string;
  tide: string;
  ship: string;
  note: string;
  flag: string;
  liveVesselCount?: number | null;
  nearestVesselNm?: number | null;
  loiteringCount?: number | null;
  meanSogKn?: number | null;
  congestion?: "low" | "moderate" | "high" | null;
  lat?: number;
  lon?: number;
}

export interface NewsItem {
  title: string;
  url: string | null;
  source: string | null;
  date: string | null;
}

export interface PortNews {
  query: string;
  items: NewsItem[];
  source: string;
  updatedAt: string;
}

export interface GeoReverse {
  label: string | null;
  lat: number;
  lon: number;
  source: string;
}

export interface RouteWxPoint {
  id: string;
  lat: number;
  lon: number;
  waveHeightM: number | null;
  windSpeedKmh: number | null;
}

export interface RouteWx {
  points: RouteWxPoint[];
  source: string;
  updatedAt: string;
}

export function bboxToQuery(b: BBox): string {
  return `minLon=${b.minLon}&minLat=${b.minLat}&maxLon=${b.maxLon}&maxLat=${b.maxLat}`;
}

export function haversineNm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const r = 3440.065;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, a)))) * r;
}

// Singleton Cesium runtime: the prebuilt bundle served from /cesium
// (copied there by scripts/copy-cesium.mjs on postinstall) is loaded once
// via <script> and shared by every map layer. It is deliberately NEVER
// bundled: bundling Cesium's Source tree lets binary-adjacent string assets
// through the minifier as illegal octal escapes, which kills the whole 3D
// chunk with a SyntaxError in production. The `typeof import("cesium")`
// annotations below are type-only (erased at compile) and bundle nothing.
declare global {
  interface Window {
    Cesium?: unknown;
  }
}

let cesiumPromise: Promise<typeof import("cesium")> | null = null;
export function getCesium(): Promise<typeof import("cesium")> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Cesium needs a browser window"));
  }
  const win = window as Window & { Cesium?: typeof import("cesium") };
  if (win.Cesium) return Promise.resolve(win.Cesium);
  if (!cesiumPromise) {
    cesiumPromise = new Promise((resolve, reject) => {
      const el = document.createElement("script");
      el.src = "/cesium/Cesium.js";
      el.async = true;
      el.onload = () => {
        const loaded = (window as Window & { Cesium?: typeof import("cesium") }).Cesium;
        if (loaded) resolve(loaded);
        else {
          cesiumPromise = null;
          reject(new Error("Cesium initialised nothing"));
        }
      };
      el.onerror = () => {
        cesiumPromise = null;
        reject(new Error("Could not load /cesium/Cesium.js"));
      };
      document.head.appendChild(el);
    });
  }
  return cesiumPromise;
}

// Sprite cache: canvas rasterized once per key, reused across polls/rebuilds.
const spriteCache = new Map<string, string>();
export function cachedSprite(key: string, make: () => string): string {
  const hit = spriteCache.get(key);
  if (hit) return hit;
  const url = make();
  if (url) spriteCache.set(key, url);
  return url;
}
