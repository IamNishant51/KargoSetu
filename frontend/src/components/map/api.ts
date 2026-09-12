export function getApiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv.replace(/\/$/, "");
  return "http://localhost:8000";
}

export interface BBox {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

export const DEFAULT_BBOX: BBox = {
  minLon: 80.0,
  minLat: 15.0,
  maxLon: 95.0,
  maxLat: 23.5,
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
  timestamp: string;
  demo: boolean;
}

export type VesselMode = "live" | "demo" | "stale" | "unavailable";

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

// Singleton Cesium module: dynamic-imported once per page lifetime and shared
// by every map layer. Never import("cesium") inside loops or animation frames.
let cesiumModule: typeof import("cesium") | null = null;
export async function getCesium(): Promise<typeof import("cesium")> {
  if (!cesiumModule) cesiumModule = await import("cesium");
  return cesiumModule;
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
