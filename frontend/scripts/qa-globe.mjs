#!/usr/bin/env node
/* KargoSetu globe regression gate (Wave 1).
 * Zero dependencies. Run: npm run qa:globe
 * Checks: backend feed shapes + modes, i18n key parity (7 langs),
 * lockfile/dependency sanity, secret hygiene, banned datasets absent.
 * Exits nonzero on any failure. Backend must be up (default localhost:8000).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
const FRONTEND = path.join(ROOT, "frontend");
const BACKEND = path.join(ROOT, "backend");
const API = process.env.KARGO_API_URL || "http://localhost:8000";

let failures = 0;
function check(name, ok, detail = "") {
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`,
  );
  if (!ok) failures += 1;
}
async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// 1. Backend feed contracts (live server).
try {
  const h = await getJson(`${API}/api/health/`);
  check(
    "health ok",
    h.status === "ok" || h.status === "degraded",
    `status=${h.status}`,
  );
  check(
    "health feeds present",
    !!(h.feeds && h.feeds.vessels && h.feeds.hazards),
  );
} catch (e) {
  check("health reachable", false, String(e));
}
try {
  const v = await getJson(
    `${API}/api/v1/vessels/live?minLon=80&minLat=15&maxLon=95&maxLat=23.5`,
  );
  const keys = [
    "mmsi",
    "name",
    "lat",
    "lon",
    "sog",
    "cog",
    "draught",
    "shipType",
    "timestamp",
    "demo",
  ];
  check(
    "vessels mode enum",
    ["live", "demo", "stale", "unavailable"].includes(v.mode),
    `mode=${v.mode}`,
  );
  check(
    "vessels keys frozen",
    Array.isArray(v.vessels) &&
      v.vessels.every((s) => keys.every((k) => k in s)),
  );
  check("vessels capped", v.vessels.length <= 500, `n=${v.vessels.length}`);
} catch (e) {
  check("vessels endpoint", false, String(e));
}
try {
  const z = await getJson(
    `${API}/api/v1/hazards/summary?minLon=80&minLat=15&maxLon=95&maxLat=23.5`,
  );
  const srcOk = ["ok", "stale", "unavailable", "disabled"];
  check(
    "hazards shape",
    Array.isArray(z.earthquakes) &&
      Array.isArray(z.fires) &&
      "weather" in z &&
      srcOk.includes(z.sources?.usgs) &&
      srcOk.includes(z.sources?.firms) &&
      srcOk.includes(z.sources?.meteo),
  );
} catch (e) {
  check("hazards endpoint", false, String(e));
}
try {
  const c = await getJson(`${API}/api/v1/ports/corridor`);
  const names = (c || []).map((p) => p.name).join(",");
  check(
    "corridor ports intact",
    names === "Haldia,Paradip,Dhamra,Sandheads",
    names,
  );
  check(
    "corridor additive counts sane",
    (c || []).every(
      (p) =>
        p.liveVesselCount === null ||
        (Number.isInteger(p.liveVesselCount) && p.liveVesselCount >= 0),
    ),
  );
} catch (e) {
  check("corridor endpoint", false, String(e));
}

// 2. i18n parity across 7 languages.
try {
  const dir = path.join(FRONTEND, "src", "i18n", "translations");
  const langs = ["en", "hi", "bn", "mr", "ta", "te", "gu"];
  const sets = langs.map((l) =>
    Object.keys(
      JSON.parse(fs.readFileSync(path.join(dir, `${l}.json`), "utf8")),
    ),
  );
  const base = new Set(sets[0]);
  const parity = sets.every(
    (s) => s.length === base.size && s.every((k) => base.has(k)),
  );
  check("i18n key parity (7 langs)", parity, `${sets[0].length} keys`);
  const globeKeys = sets[0].filter((k) => k.startsWith("globe."));
  check(
    "globe namespace present",
    globeKeys.length > 30,
    `${globeKeys.length} globe.* keys`,
  );
} catch (e) {
  check("i18n parity", false, String(e));
}

// 3. Dependency sanity.
try {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(FRONTEND, "package.json"), "utf8"),
  );
  const lock = fs.readFileSync(
    path.join(FRONTEND, "package-lock.json"),
    "utf8",
  );
  check(
    "cesium dep + lockfile in sync",
    !!pkg.dependencies?.cesium && lock.includes(`"node_modules/cesium"`),
  );
  check(
    "cesium static copy script",
    pkg.scripts?.postinstall?.includes("copy-cesium"),
  );
  check(
    "ship.glb bundled",
    fs.existsSync(path.join(FRONTEND, "public", "models", "ship.glb")),
  );
} catch (e) {
  check("dependency sanity", false, String(e));
}

// 4. Hygiene: no secrets in example env, no banned datasets, attribution synced.
try {
  const ex = fs.readFileSync(path.join(BACKEND, ".env.example"), "utf8");
  const placeholder =
    /(localhost|example|user:password|change[-_]?me|openssl|generate|your_|YOUR_|<[^>]*>)/i;
  const leaked = ex
    .split("\n")
    .filter(
      (l) =>
        /=(AIza|sk-|xox|-----BEGIN|.{24,})/.test(l) && !placeholder.test(l),
    );
  check("no secrets in .env.example", leaked.length === 0, leaked.join("; "));
} catch (e) {
  check("env hygiene", false, String(e));
}
try {
  const banned = ["telegeography_submarine_cables", "submarine_cables"];
  const found = banned.filter(
    (b) =>
      fs.existsSync(path.join(ROOT, b)) ||
      fs.existsSync(path.join(FRONTEND, b)),
  );
  check("no banned datasets", found.length === 0, found.join(","));
} catch (e) {
  check("banned datasets", false, String(e));
}
try {
  const attr = fs.readFileSync(
    path.join(FRONTEND, "src", "components", "map", "attribution.ts"),
    "utf8",
  );
  const footer = fs.readFileSync(
    path.join(FRONTEND, "src", "components", "landing", "Footer.tsx"),
    "utf8",
  );
  check(
    "attribution synced (app + footer + ship model)",
    attr.includes("ATTRIBUTION_LINE") &&
      footer.includes("ATTRIBUTION_LINE") &&
      attr.includes("Javier_Fernandez"),
  );
} catch (e) {
  check("attribution sync", false, String(e));
}

console.log(
  failures === 0
    ? "\nAll globe gates passed."
    : `\n${failures} gate(s) FAILED.`,
);
// Immediate exit: avoids a Windows libuv teardown assertion from idle fetch
// handles after the report is printed. Exit code carries the result.
process.exit(failures === 0 ? 0 : 1);
