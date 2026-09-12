<system-directives>
You are a Senior Principal Enterprise Architect and Maritime Logistics Systems Specialist working on KargoSetu (Smart India Hackathon 2026 - Problem SIH26006).

This file serves as the definitive architectural handoff and persistent directive context. It contains EVERYTHING you need to know about the codebase. Do not waste compute or time exploring the entire repository—read this file, understand the contracts, and start coding.

Before any Globe work, read `gods_eye_view_features_to_kargosetu.md` in the repo root first. It is the exact, hallucination-proof build plan (verified file paths, literal API contracts, phased gates). This agents.md file gives you the standing rules; that file gives you the task spec. When they conflict on a wire key or file path, the plan file wins for Globe scope and this file wins for repo-wide policy.
</system-directives>

<python-migration-mandate>
### CRITICAL ARCHITECTURE SHIFT
The backend is Python/FastAPI (migration from Node.js Express + TensorFlow.js is complete for active code). Before making ANY changes to the backend or ML models, you MUST read and strictly adhere to `MIGRATION_PLAN.md`. It contains the exact tech stack translations, directory structures, and optimized DSA patterns required. Never touch the deprecated Node backend (`backend/index.js`, `routes/`, `services/*.js`, `middleware/`, `models/` — see `DEPRECATED_NODEJS.md`).
</python-migration-mandate>

<no-emoji-policy>
STRICT RULE: NEVER use emojis in any `.md` file, documentation, or commit message. Emojis are strictly forbidden across the entire repository to maintain a professional enterprise standard.
</no-emoji-policy>

<repository-map>
### Exact File Locations
- **GitHub Repository:** `https://github.com/IamNishant51/KargoSetu`
- **Globe Build Plan (read first for any Globe task):** `gods_eye_view_features_to_kargosetu.md` (root; phased spec with literal contracts and verification gates)
- **Backend Entry:** `backend/app/main.py` (FastAPI lifespan, middleware, router registration)
- **Math/Physics Engine:** `backend/app/services/maritime_math.py` (FWA, Squat, UKC, haversine, tide via Open-Meteo, fleet via Prisma)
- **ML Engine:** `backend/app/services/ml_predictor.py` (CNN-LSTM, ONNX Runtime, yfinance; call only via `get_freight_forecast`)
- **New AIS Proxy:** `backend/app/services/ais_proxy.py` (to be created per plan; reuses lifespan `httpx.AsyncClient`)
- **New Routers:** `backend/app/api/routers/vessels.py` (`GET /api/v1/vessels/live`), `backend/app/api/routers/hazards.py` (`GET /api/v1/hazards/summary`)
- **Extended Router:** `backend/app/api/routers/ports.py` (`GET /corridor` keeps shape, adds `liveVesselCount`, `nearestVesselNm`)
- **Existing Routers:** `requisitions.py`, `forecast.py`, `market.py` (60s cache idiom to copy), `commodities.py`, `auth.py`, `settings.py`, `notifications.py`, `health.py`
- **Database Schema:** `backend/prisma/schema.prisma` (Prisma Client Python, asyncio; models Port, Vessel, Requisition, UserSetting, MLModel, User — do not rename anything)
- **Frontend Entry:** `frontend/src/app/page.tsx` & `layout.tsx`
- **Dashboard UI:** `frontend/src/app/dashboard/page.tsx` (renders `DynamicDashboardClient` -> `DashboardClient.tsx`, 781 lines)
- **Globe Route (to be created):** `frontend/src/app/dashboard/globe/page.tsx` + `DynamicGlobeClient.tsx` + `GlobeClient.tsx`
- **Globe Components (to be created):** `frontend/src/components/map/` (KargoGlobe, VesselLayer, HazardLayer, CorridorLayer, VesselSheet, LayerToggles, Hud, TourDirector, SensorStyles, CommandBar, useVessels, useHazards, useCorridor, globeStore)
- **Frontend Components:** `frontend/src/components/` (ForecastPriceChart — must chart full 90-day p10/p50/p90, not `data[0]`; landing/* 14 files; auth/*; ui/*)
- **State/Persistence:** `frontend/src/lib/storage.ts` (`loadJSON`/`saveJSON`), `frontend/src/i18n/` (7 langs, key parity, English-only values), `frontend/src/hooks/useNotifications.ts` (30s polling)
- **CI/CD Workflow:** `.github/workflows/ci.yml`
</repository-map>

<tech-stack-and-conventions>
### Frontend (Next.js 16.3.4, React 19.2.8)
- **Server Components:** Use React Server Components by default.
- **Client Components:** Use `"use client"` strictly at the lowest level possible (only for interactive forms, ECharts/recharts, Query-driven widgets, and the globe leaves). Pages stay server components rendering dynamic client wrappers (see `DynamicDashboardClient.tsx` pattern; globe copies it with `ssr: false`).
- **Globe Rendering:** Cesium (`^1.124` series) is lazy-loaded ONLY under `app/dashboard/globe/`. Landing bundle must not grow. Cesium workers served from a copied static path with `CESIUM_BASE_URL` set before Viewer construction. Default imagery Esri World Imagery (keyless) with OSM fallback; terrain Re:Earth quantized-mesh with flat-ellipsoid fallback. Google Photorealistic 3D / ion are BYOK-only and never default.
- **State:** Use `Zustand`-style minimal local store only for globe UI state (camera preset, layers, selection, tour step). Server data lives in `TanStack Query` with debounced bbox keys (`vessels` 30s poll, `hazards` 60s poll, `corridor` 5min). Never duplicate server data into local stores.
- **Styling:** Tailwind CSS v4 + Shadcn UI. Strictly adhere to the light harbour theme: paper `#FAF7F1`, white cards on `#E2E6EB` hairlines, Inter, mono eyebrows over display-black titles, cargo-orange `#D95D0F` primaries. Status chips: Feasible leaf, Pending cargo, Infeasible dossier-red, Converted sea. Do NOT reintroduce dark nautical tokens (`bg-navy-950` etc.). The 3D canvas itself is exempt.
- **i18n:** Every user string via `t()` with keys present in ALL of `en/hi/bn/mr/ta/te/gu.json`. Filter/select VALUES stay English (API safety). Dynamic values use `{n}/{a}/{b}/{c}` + `.replace()`. Ports, commodities, units, currencies, model versions, timezones stay English.
- **Persistence:** `loadJSON`/`saveJSON` from `lib/storage.ts`. Lazy `useState` initializers rehydrate; effects write only. New key: `kargosetu_globe_v1` (camera, layers, selection). Ephemeral UI resets.

### Backend (Python/FastAPI — active stack)
- **Entry/Lifecycle:** `app/main.py` lifespan owns the global `httpx.AsyncClient` (100 conns/50 keepalive/10s timeout), `prisma.connect()`, ML warmup + 6h retraining. New services reuse the lifespan client; never build unbounded per-request clients.
- **Conventions:** `ORJSONResponse` default, GZip over 1000 bytes, CORS limited to `settings.frontend_url`, `register_exception_handlers` error shape `{detail:...}`, slowapi per-router limits (forecast is `30/minute` — vessels/hazards match it), `structlog` logging, Pydantic v2 with wire keys in camelCase matching TypeScript 1:1 (`shockMultiplier`, `calculatedDraft`, `portMaxDraft`).
- **Proxy Pattern (copy `market.py`):** in-memory TTL cache + `asyncio.gather` fan-out + per-source try/except returning degraded (not 500) results + serve-stale fallback. Vessels TTL 30s, USGS 300s, FIRMS 1800s, Meteo 300s. Cap vessels at 500, bbox span at 30 degrees per side.
- **Validation:** Every API route validates with Pydantic (Query bounds included). SSRF rule: proxies request one allow-listed host constant; user input never becomes a host.
- **TF/ONNX:** Inference via `asyncio.to_thread` (never block the event loop). Model cached in memory. Do not change forecast math in this program.
- **Database:** Prisma Client Python only, all calls awaited, connect/disconnect via lifespan. No schema renames. No new tables required for the Globe program.
</tech-stack-and-conventions>

<globe-program-mandate>
### Gods Eye View Integration (SIH Wow Factor) — Standing Rules
1. **Source of truth:** `gods_eye_view_features_to_kargosetu.md` holds the phased spec. Phases: 0 deps/env, 1 vessels backend, 2 globe frontend, 3 landing updates, 4 forecast-chart fix, 5 showmanship (tour/HUD/sensors/commands). Build in order; each phase has a verification gate that must pass before the next begins.
2. **Take (adapted patterns, original code):** keyless Cesium globe + corridor focus; AISStream vessels via FastAPI proxy with demo/stale/unavailable modes; USGS quakes + FIRMS fires + Open-Meteo weather overlays; Natural Earth public-domain boundaries; interpolation-one-interval-behind rendering; share links + scene tour + sensor styles + detection overlay; attribution rail.
3. **Skip (do not build):** full voice agent (text CommandBar instead), Google 3D default, TeleGeography cables (NC license — never copy), OpenSky flights (NC license), Google News RSS, CCTV/radio/bikeshare/traffic-sim, military-installations layer.
4. **Truthfulness:** badge every non-live state (`demo` amber, `stale` gray with age, `unavailable` + retry). Never render fake numbers. Ticker/landing items hide when feeds are down.
5. **Attribution (always visible, including clean-view):** Esri, OSM contributors, AISStream, USGS, FIRMS acknowledgement verbatim (in plan file), Open-Meteo link, CelesTrak only if satellites ship. One shared constant feeds the in-app popover and the footer line so they cannot drift. Never cache/store/commit Google tile content. Never commit keys.
6. **Browser rule:** no direct third-party data calls from the browser except tile/terrain endpoints. All feeds go through FastAPI.
</globe-program-mandate>

<api-contracts>
### 1. Constraint Solver & Cargo Splitting (FROZEN)
- **Endpoint:** `POST /api/v1/requisitions/evaluate`
- **Request Payload:**
  ```json
  {
    "volume_mt": 150000,
    "dest_port_name": "Haldia",
    "commodity": "Coking Coal"
  }
  ```
- **Response Payload (keys frozen):**
  ```json
  {
    "feasible": true,
    "strategy": "Split Cargo into 3x Supramax",
    "calculatedDraft": 11.5,
    "portMaxDraft": 7.5
  }
  ```
  (Plus existing extras such as `ai_insight` — the globe calls this, never redefines it.)

### 2. ML Predictive Freight Rates (FROZEN)
- **Endpoint:** `GET /api/v1/forecast/rates?shockMultiplier=1.5`
- **Params:** `origin` (default `"Newcastle, Australia"`), `destination` (default `"Haldia"`), `shockMultiplier` (default `1.0`, range `0.1-5.0`), limit `30/minute`.
- **Response Payload:** Array of prediction objects:
  ```json
  [
    { "date": "2026-09-01", "p10": 1200, "p50": 1450, "p90": 1800 },
    ...
  ]
  ```
  (90-day series; the chart must render all of it, not `data[0]`.)

### 3. Live Vessels (NEW — literal, see plan Section 6.1)
- **Endpoint:** `GET /api/v1/vessels/live?minLon=&minLat=&maxLon=&maxLat=` (default Bay of Bengal bbox `80.0,15.0,95.0,23.5`), limit `30/minute`.
- **Vessel object keys (exact):** `mmsi` (string), `name`, `lat`, `lon`, `sog`, `cog`, `draught`, `shipType`, `timestamp` (ISO UTC), `demo` (bool).
- **Response keys (exact):** `mode` (`live|demo|stale|unavailable`), `vessels`, `updatedAt`, `notice`.

### 4. Hazards Summary (NEW — literal, see plan Section 6.2)
- **Endpoint:** `GET /api/v1/hazards/summary?minLon=&minLat=&maxLon=&maxLat=`, limit `30/minute`.
- **Response keys (exact):** `earthquakes[]` (`id,lat,lon,mag,place,time`), `fires[]` (`lat,lon,confidence,acqDate`), `weather` (`waveHeightM,windSpeedKmh,source`) or null, `sources` (`usgs,firms,meteo` each `ok|stale|unavailable|disabled`), `updatedAt`. Single-source failure never fails the endpoint.

### 5. Port Corridor (EXTENDED ADDITIVELY)
- **Endpoint:** `GET /api/v1/ports/corridor` returns Haldia/Paradip/Dhamra/Sandheads entries with existing fields (`name,n,sub,draft,tide,ship,note,flag`) plus additive `liveVesselCount: int | null` and `nearestVesselNm: float | null`. Existing fields byte-identical.
</api-contracts>

<database-schema>
### Prisma PostgreSQL Models (Reference)
*Do not alter these without consulting the architecture plan. The Globe program requires NO migration.*

- **Model `Port`**:
  - `id` (UUID, PK)
  - `name` (String, Unique)
  - `chartedDepth` (Float)
  - `permissibleDraft` (Float) - Maximum depth a ship can safely reach.
  - `brackishDensity` (Float, default 1.025)
  - `lat` (Float)
  - `lon` (Float)
  - `typicalTidalRange` (Float, default 0.0)
  - `maxVesselClass` (String, default "Capesize")
- **Model `Vessel`** (static fleet table — NOT live positions):
  - `id` (UUID, PK)
  - `name` (String, Unique) - e.g., Capesize, Panamax.
  - `capacity` (Int)
  - `laden_draft` (Float)
  - `ballast_draft` (Float, default 0.0)
  - `daily_cost` (Int)
  - `block_coeff` (Float, default 0.85)
  - `speed_knots` (Float, default 12.0)
- **Model `Requisition`**: `volume_mt` Float, `destPortName` mapped `dest_port`, `commodity`, `status` default Pending, `origin` default Global.
- **Models `UserSetting`, `MLModel`, `User`**: unchanged; see `schema.prisma`.
</database-schema>

<what-to-build-next>
### Immediate Tasks (Globe program order — details in `gods_eye_view_features_to_kargosetu.md`)
0. **Phase 0 Deps/Env:** Add `cesium`, sync lockfile, wire static workers path, add `AISSTREAM_API_KEY` + `FIRMS_MAP_KEY` to `.env.example` (never commit keys).
1. **Phase 1 Vessels Backend:** `ais_proxy.py` + `vessels.py` + register in `main.py`; extend `ports.py` corridor additively. Gate: live/demo/stale/unavailable modes verified, corridor shape intact.
2. **Phase 2 Globe Frontend:** `/dashboard/globe` route + `components/map/*` + sidebar item + Query hooks + i18n parity (7 files) + storage key. Gate: keyless load, click-to-Evaluate works, 7-language switch clean, reload restores, zero console errors on unmount.
3. **Phase 3 Landing Updates:** Navbar/Hero/Ticker/Solutions/Sandbox(solver dedupe)/PortCorridor(badges or preview)/Bento/Workflow/DemoModal(5th chapter)/Footer(attribution)/FAQ entry. Gate: links correct, no fake numbers, tour deep-link works.
4. **Phase 4 Chart Fix:** `ForecastPriceChart` renders full 90-day p10/p50/p90 band. Gate: 90-item + empty payloads render correctly.
5. **Phase 5 Showmanship:** TourDirector 5-stop script, HUD at 4Hz max, sensor toggles, detection toggle, text CommandBar. Gate: Esc restores camera, credits always visible.
</what-to-build-next>

<ci-cd-mandate>
### Strict CI/CD Pipeline Rules for AI Agents
To ensure the GitHub Actions CI/CD pipeline NEVER fails, you MUST strictly adhere to the following rules before executing any `git push`:

1. **Dependency Synchronization:** If you add or modify a dependency in `package.json` (frontend or backend), you MUST run `npm install` in that specific directory to regenerate the `package-lock.json` file. If `package-lock.json` is missing or out of sync, the `npm ci` command in the pipeline will fatally crash. Same for `requirements.txt` (pip install + Docker build check).
2. **No Untracked Files:** Before committing, always run `git status`. Ensure that no crucial project files (like scaffold directories, lockfiles, or configuration files) are left untracked.
3. **Local Pre-commit Validation:** If you make significant logic changes, verify the build locally (e.g., `npm run lint` + `npm run build` in `frontend/`, backend import/test check) before pushing.
4. **Node Version Consistency:** Be aware that the CI pipeline is configured to use Node.js 24.x.
5. **Globe Addition:** After adding `cesium`, confirm the landing bundle did not regress (globe chunk lazy only) and that `git grep` for key names hits only `.env.example` plus env-var references (no committed secrets).
</ci-cd-mandate>

<where-to-deploy>
### Deployment Constraints
- **Frontend:** Vercel. Globe uses only keyless tile/terrain endpoints by default; BYOK toggles (ion/Google) read runtime env and are never committed.
- **Backend:** Hugging Face Spaces (Docker), port 7860, Gunicorn + Uvicorn workers. Secrets (`DATABASE_URL`, `DIRECT_URL`, `FRONTEND_URL`, `AISSTREAM_API_KEY`, `FIRMS_MAP_KEY`) live in Spaces secrets, never in the repo. Backend serves the heavier ML inference + proxies; never deploy it serverless.
</where-to-deploy>

<developer-experience-mandate>
### Maintain the Developer Guide
We have `DEVELOPER_GUIDE.md` for human team members. Whenever you create a new file or significantly change architecture, you MUST update `DEVELOPER_GUIDE.md`. Keep the tone human-readable. Globe additions (route, components, routers, env keys, attribution) must be documented there with the same plain-English style as existing entries.
</developer-experience-mandate>
