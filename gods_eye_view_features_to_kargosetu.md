# Gods Eye View Features to KargoSetu — Exact Build Plan for AI Agents

> Read this file top to bottom before writing any code. It contains every verified fact you need. Do not guess anything that is specified here. If something is not specified here, read the referenced KargoSetu file first, then decide.

## 0. How to use this document (mandatory)

1. Read order: this file first, then `agents.md`, then `MIGRATION_PLAN.md`, then `DEVELOPER_GUIDE.md`, then the exact files listed in Section 2.
2. Do NOT explore the whole repo. The file paths below are exact and verified.
3. Do NOT invent API shapes, field names, package versions, or file paths. Every contract in Section 6 is literal.
4. After each phase, run its verification gate in Section 8. Do not start the next phase until the gate passes.
5. No emojis in any `.md` file, code comment, or commit message (repo policy).
6. When you create or heavily change a file, update `DEVELOPER_GUIDE.md` in plain human-readable language.

## 1. Source repo facts (gods-eye-view, verified)

- Repository: `https://github.com/bilawalsidhu/gods-eye-view`, version `0.1.1`, license MIT for code only. Data and visual assets keep their own licenses (see 1.4).
- Stack (from its live `package.json`): `cesium ^1.124.0`, `vite-plugin-cesium ^1.2.23`, `vite ^6.0.0`, `satellite.js ^6.0.2` (SGP4), `mgrs ^2.1.0`, `egm96-universal ^1.1.1`, `pbf ^5.1.2`, `@mapbox/vector-tile ^3.0.0`, `ws ^8.21.0`. Node engines `>=24.14 <25 || >=26 <27`. Language is vanilla JS, no React. Entry `src/main.js` (11 lines) calls `createStandaloneApplication()`.
- Key source files to mirror as patterns (do not copy-paste blindly, adapt to Next.js + FastAPI):
  - `src/mapStackController.js` — basemap switching (Google 3D / Esri / OSM / ion stacks).
  - `src/app/viewer.js` — Cesium Viewer setup + `viewer.creditDisplay.addStaticCredit` attribution.
  - `src/data/dataCredits.js` — attribution registry feeding the on-globe credit popover.
  - `src/data/aisLiveVessels.js` (79KB) + `aisStreamAdapter.js` (19KB) + `aisWatchdog.js` (18KB) — vessel socket, dedupe, stale/outage handling.
  - `src/data/iconOrientation.js` — per-frame screen-space heading projection + horizon cull.
  - `src/data/terrainHeightsProxy.js` — geoid-aware height sampling against rendered mesh.
  - `src/data/detection.js` + `detectionDraw.js` — screen-space bounding boxes + IDs.
  - `src/scenes/` — cinematic scene director (tours with banked turns, eased ends).
  - `src/voice/gevRealtime.js` + `gevActions.js` (28 tools) + `voiceCost.js` — NOT in scope (see skip list).
  - `server/providers/traffic.js`, `firms.js`, `terrain.js`, `gbfs.js`, `aircraft/*`, `vessels/*`, `space/*` — hardened server proxies (SSRF protection, response caps, sanitized errors, TTL cache + serve-stale, daily budget governor like `TOMTOM_DAILY_TILE_BUDGET=40000`).
  - `src/data/adsbLolFallback.js` — capped 250nm fallback snapshot pattern with provenance row.
- Basemap ladder: Esri World Imagery (keyless default) -> OSM fallback if Esri unreachable -> Cesium ion token (free Community, personal/non-commercial, quotas) -> Google Maps key (metered, billing on, first 1000 3D sessions/month free, key must be URL-restricted, budget alert required). Terrain: Re:Earth/Mapterhorn `cesium-mesh/ellipsoid` quantized-mesh via `Cesium.CesiumTerrainProvider`, fallback to flat `EllipsoidTerrainProvider`.
- Motion pattern: feeds arrive every 15-30s; globe renders one interval behind real time and interpolates between known fixes; dead reckoning fills gaps. Satellites use SGP4 with orbit rings locked via GMST realignment.
- Share links serialize camera + style + layers + one tracked target into URL. Reset Globe restores full Earth. Sensor styles (CRT, NVG, FLIR/Ironbow, Noir, Snow) ride along in cockpit. Cockpit carries briefing strip (signals, headlines, weather) and 250km contacts roster.

### 1.1 Live-layer source table (auth and cost, verified from DATA_SOURCES.md)

| Layer | Upstream | Auth | Cost | KargoSetu decision |
|---|---|---|---|---|
| Map stack | Esri World Imagery / OSM / Google 3D / ion | none / free ion token / metered Google key | 0 / quota / metered | TAKE keyless path only (Esri + OSM + Re:Earth) |
| Live vessels | AISStream.io WebSocket (terrestrial AIS) | free signup `AISSTREAM_API_KEY` | 0 (beta, no formal ToS) | TAKE via FastAPI proxy |
| Satellites 838 + Starlink shell | CelesTrak TLEs, SGP4 client-side, disk-cached TLEs | none | 0, citation requested "CelesTrak, Dr. T.S. Kelso" | TAKE only if time remains (low steel value) |
| Earthquakes 24h | USGS GeoJSON | none | 0, US public domain, credit "Data courtesy of USGS" | TAKE |
| Active fires 24h VIIRS (NOAA-20/21, Suomi-NPP merged) | NASA FIRMS `/api/firms` proxy, 30-min cache | free `FIRMS_MAP_KEY` | 0, CC0 data, mandatory acknowledgement text (Section 7.3) | TAKE (empty layer with hint when key absent) |
| Weather + WX clouds | Open-Meteo (CC BY 4.0 + adjacent-link attribution) | none | 0 | TAKE (extends existing marine tide call) |
| Reverse geocode | OSM Nominatim (ODbL + usage policy, max 1 req/s serialized, 0.1-degree cells, 5-min cache) | none | 0 | TAKE only inside cockpit-style vessel sheet locality line |
| Roads | OSM Overpass (ODbL) | none | 0 | TAKE only for port road context if cheap, else skip |
| Launches 30d | Launch Library 2 v2.3, 15-min mem+disk cache, serve-last-good | none, optional `LL2_API_TOKEN` (15 unauth calls/hour) | 0 | SKIP |
| Flights 11k+ | OpenSky REST primary + adsb.lol capped 250nm fallback | anon / optional OAuth | 0 but NC license | SKIP (license risk, zero steel story) |
| Military flights | adsb.lol registry (ODbL) | none | 0 | SKIP |
| CCTV ~800, Radio, Bikeshare | city APIs / Radio Browser (PDDL) / GBFS | none | 0 | SKIP |
| Traffic live flow | TomTom flow vector tiles, 120s TTL, daily budget governor | optional `TOMTOM_API_KEY` (200K tiles/mo free) | metered beyond free | SKIP (road traffic irrelevant to bulk) |
| Mapped installations | Overpass allow-listed `military=*` | none | 0 | SKIP (incomplete by nature, bad SIH optics) |

### 1.2 Skip list with reasons (do not build these)

1. Full voice agent (28 tools, OpenAI Realtime, spend metering with $2 warn / $5 cut). Reason: 1-3 weeks effort, metered cost, hackathon demo risk. Ship text-command bar instead (Phase 7).
2. Google Photorealistic 3D as default. Reason: billing must be enabled, key restriction + budget alerts required, tiles may not be cached/stored per ToS. Gate behind BYOK only.
3. TeleGeography submarine cables. Reason: CC BY-NC-SA 3.0 NonCommercial. Must delete the folder for commercial use. Do not copy it.
4. OpenSky flights. Reason: non-commercial research/education license, operational use may need written agreement. Do not pitch as commercial product on it.
5. Google News RSS headlines. Reason: personal/noncommercial only. Use GDELT path or omit headlines.

### 1.3 What EASY vs HARD means for estimation

- EASY (hours to 1 day): proxy+cache skeleton, attribution rail, layer toggles, USGS/CelesTrak/Open-Meteo reads, CSS/GLSL sensor styles, detection boxes.
- MEDIUM (2-5 days): AIS pipeline adaptation (socket reconnect, MMSI dedupe, watchdog), share links + scene director URL state, CCTV-style projection (not needed here).
- HARD (1-3 weeks, do not attempt): true-heading + terrain-clamped math from scratch, cockpit ride dynamics, voice agent, photorealistic 3D at scale.
- Plan below stays in EASY plus one MEDIUM item (AIS adaptation) with a demo-cache fallback so the demo never depends on the socket working.

### 1.4 License compliance rules (mandatory)

1. Code borrowed as patterns is MIT. Keep no copied license headers removed; write original code following the patterns.
2. Never copy `src/data/local_data/telegeography_submarine_cables/` into this repo.
3. Keep attribution visible at all times including clean-view/recording: on-globe credit line plus expandable attribution popover. Required strings: Esri ("Powered by Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"), OpenStreetMap contributors (any OSM-derived data), AISStream.io (courtesy), CelesTrak (if satellites shown), USGS (if quakes shown), NASA FIRMS acknowledgement verbatim (Section 7.3, if fires shown), Open-Meteo linked credit (if weather shown), TomTom (only if TomTom key ever added).
4. Never cache, store, rehost, or commit Google map content. Live use only.
5. Do not commit any API key. Keys live in HF Spaces secrets and local `.env` (gitignored) only.

## 2. KargoSetu current state (verified file by file, do not re-explore)

### 2.1 Frontend

- Framework: Next.js `16.3.4`, React `19.2.8`, `recharts ^3.10.1`, `@tanstack/react-query ^5.102.8`, `js-cookie 3.0.8`, `lucide-react ^1.39.0`, Tailwind v4. No map/3D dependency exists.
- `frontend/src/app/page.tsx` — landing composition: Navbar, HeroSection, MarketTicker, SocialProofLogos, SolutionsSection, InteractiveSandbox (801 lines), BentoFeatures, PortCorridor, WorkflowSection, TestimonialsSection, FaqSection, CtaSection, Footer, DemoModal. Heavy sections are `next/dynamic` with no SSR.
- `frontend/src/app/dashboard/page.tsx` — 6 lines, renders `DynamicDashboardClient`. Real logic is `DashboardClient.tsx` (781 lines, `"use client"`): left form (volume text input default `"145,000"`, port dropdown default Haldia, commodity default Iron Ore, vessel Supramax/Panamax/Capesize/Handysize) via `useMutation` to evaluate; persisted to localStorage `kargosetu_eval_v1`. Right panel: strategy string, `ai_insight` box, 5-stat row, draft visualization built from static `/dashboard-draft-analysis-ship-image.png` with absolutely positioned dashed lines. Meters/Feet toggle. There is no map component.
- `frontend/src/app/dashboard/` subpages: `requisitions/` (RequisitionsClient + Dynamic wrapper), `forecasts/` (ForecastClient + Dynamic wrapper), `settings/` (SettingsClient). Shell: `layout.tsx`, `components/Sidebar.tsx`, `SidebarContext.tsx`, `TopHeader.tsx`, `DashboardLayoutWrapper.tsx`, `error.tsx`.
- `frontend/src/components/` — `ForecastPriceChart.tsx` (109 lines, renders `data[0]` as 3 stat cards only), `Providers.tsx` (React Query + LanguageProvider + Google OAuth), `auth/AuthShell.tsx`, `ui/` (button, card, input, label, skeleton), `landing/` (14 files, see list above).
- `frontend/src/hooks/` — `useUser.ts`, `useNotifications.ts` (30s REST polling, read receipts in localStorage, no WebSocket/SSE).
- `frontend/src/i18n/` — `LanguageContext.tsx` (`en|hi|bn|mr|ta|te|gu`, key `kargosetu_lang`, dynamic `./translations/<lang>.json` import). Rule: filter/select VALUES stay English, only display labels translate, otherwise API queries break on language switch. New keys must be added to all seven files with enforced parity. Dynamic values use `{n}/{a}/{b}/{c}` templates with `.replace()` because `t()` has no interpolation. Commodity names, ports, units, currencies, model versions, timezones stay English by desk convention.
- `frontend/src/lib/` — `auth.ts` (`persistSessionAndRedirect` via js-cookie + hard navigate), `storage.ts` (`loadJSON`/`saveJSON`, SSR-safe, corrupt blobs return fallback, writes never throw).
- `frontend/src/middleware.ts` — `auth_token` guard.
- Theme: light harbour language. Paper background `#FAF7F1`, white cards on `#E2E6EB` hairlines, Inter everywhere, mono-label eyebrows over display-black titles, cargo-orange `#D95D0F` primary buttons. Status chips: Feasible = leaf wash, Pending = cargo wash, Infeasible = dossier red, Converted = sea wash. No dark surfaces. Old `bg-navy-950` tokens are removed; do not reintroduce them.
- Storage keys in use: `kargosetu_lang`, `kargosetu_eval_v1`, `kargosetu_req_view_v1`, `kargosetu_req_draft_v1`, `kargosetu_fc_view_v1`, `kargosetu_notif_read`. Rule: lazy `useState` initializers rehydrate, effects only write (never `setState` in effects). Ephemeral UI (modals, spinners, sidebar) resets on reload.
- `TradeRouteMap.tsx` DOES NOT EXIST. Any doc reference to it is stale. You are creating the map greenfield under `frontend/src/components/map/`.
- `public/` map assets are static PNGs only (`corridor-map.png`, `dashboard-draft-analysis-ship-image.png`, `hero.png`, `ukc-explainer*.png`, `workflow-ship*.png`). Keep them until the live globe replaces their jobs, then stop referencing the ones the globe supersedes (Section 5.6).

### 2.2 Backend

- Entry `backend/app/main.py` (148 lines). Lifespan: configure structlog, create global `httpx.AsyncClient` (max 100 connections, 50 keepalive, 10s timeout/5s connect) assigned to `maritime_math.http_client`, `await prisma.connect()`, `asyncio.create_task(predictor_instance.init_model())`, `asyncio.create_task(schedule_retraining(6h))`. Shutdown closes client then disconnects Prisma. App uses `ORJSONResponse` default, `GZipMiddleware(minimum_size=1000)`, CORS allow_origins `[settings.frontend_url]` only, methods GET/POST/PATCH/DELETE/OPTIONS, `register_exception_handlers(app)`, slowapi limiter with `get_remote_address`.
- Routers mounted: `health (/api/health)`, `auth (/api/v1/auth: POST register/login/google, GET me)`, `requisitions`, `forecast`, `market`, `ports`, `commodities`, `settings`, `notifications`. New routers MUST be imported and `include_router`d here.
- `backend/app/api/dependencies.py` — Prisma client singleton. Reuse it; do not create a second client.
- `backend/app/api/routers/requisitions.py` — `GET ""` paginated/filtered list, `POST /evaluate` calling `maritime_math.evaluate_requisition(req)`, `POST ""` create + auto-evaluate, `GET/PATCH/DELETE /{req_id}`. Do not change its JSON keys.
- `backend/app/api/routers/forecast.py` — exact signature: `GET /api/v1/forecast/rates` with `origin` (default `"Newcastle, Australia"`), `destination` (default `"Haldia"`), `shockMultiplier` (default `1.0`, `ge=0.1`, `le=5.0`), limiter `30/minute`, response `list[ForecastRateResponse]`. New endpoints copy this shape (limiter + Query validation + response_model).
- `backend/app/api/routers/market.py` — yfinance ticker with 60s in-memory cache (`_market_cache`, `_market_cache_time`, `MARKET_CACHE_TTL=60`) and `asyncio.gather(asyncio.to_thread(_quote, s))` fan-out with per-symbol try/except returning `"N/A"`. Copy this cache + fan-out idiom for vessels/hazards.
- `backend/app/api/routers/ports.py` — `GET /api/v1/ports` raw DB list; `GET /api/v1/ports/corridor` merges DB `permissibleDraft` over `CORRIDOR_STATIC_DATA` dict for Haldia/Paradip/Dhamra/Sandheads with fields `n, sub, draft, tide, ship, note, flag`. Extend, do not reshape.
- `backend/app/services/maritime_math.py` (268 lines) — `calculate_brackish_sinkage`, `calculate_hydrodynamic_squat` (Barrass `2*Cb*V^2/100`), `calculate_dynamic_ukc`, `_haversine` (R=3440.065 NM), `get_fleet()` (Prisma + TTL cache), `evaluate_requisition(req)` (port lookup, live tide via `marine-api.open-meteo.com` with `typicalTidalRange` fallback, fleet filter by `CARGO_RESTRICTIONS` + `maxVesselClass`, UKC>=1.0m gate, cheapest $/DWT, `ceil(volume/capacity)` split, strategy strings `"Direct Fixture: 1x X"` / `"Split Cargo into Nx Xs"`, infeasible -> `"Offshore Transshipment (Lighterage at Sandheads)"` + haversine nearest-port suggestion, `ai_insight` text).
- `backend/app/services/ml_predictor.py` (414 lines) — `MLPredictor.init_model()` (yfinance BDRY+^GSPC+CL=F 5y, sma14/rsi14, RobustScaler, Conv1D+BN+LSTM64+Dropout+Dense, ONNX export, Huber loss), `schedule_retraining(6h)`, `_fetch_and_prepare_data()` (6h cache, synthetic fallback), `predict_sync(shock, origin, destination)` (ONNX infer, route-hash 0.7-1.29, vol*sqrt(t)*shock bands `p10/p90 = p50*(1∓vol*1.28)`, per-day cache). Call inference only via existing entry `get_freight_forecast(shock, origin, destination)` from routers; never import internals.
- `backend/requirements.txt` — pinned majors: fastapi, uvicorn, gunicorn, orjson, pydantic, prisma, tensorflow + tf2onnx, scikit-learn, onnxruntime, numpy, pandas, yfinance, httpx, pyjwt, bcrypt, google-auth, structlog, slowapi, gradio. Adding a Python package requires `pip install` + lock update per CI rules and a Dockerfile check (Section 8).
- `backend/prisma/schema.prisma` — generator `prisma-client-py` asyncio; datasource postgresql with `DATABASE_URL` + `DIRECT_URL`. Models: `Port` (id uuid, name unique, chartedDepth, permissibleDraft, brackishDensity default 1.025, lat, lon, typicalTidalRange default 0, maxVesselClass default Capesize), `Vessel` (id, name unique, capacity Int, laden_draft, ballast_draft 0, daily_cost Int, block_coeff 0.85, speed_knots 12), `UserSetting`, `Requisition` (volume_mt Float, destPortName mapped `dest_port`, commodity, status default Pending, origin default Global), `MLModel`, `User`. DO NOT rename tables/columns. New tables only if Section 6 explicitly allows (it does not require any).
- Legacy `backend/index.js`, `routes/`, `services/*.js`, `middleware/`, `models/` are deprecated (`DEPRECATED_NODEJS.md`). Do not touch them.
- Python version pin: check `.python-version` before adding syntax. Dockerfile CMD targets port 7860 (HF Spaces default).

## 3. Target architecture (what done looks like)

```
Browser (Vercel, Next.js 16)
  /dashboard/globe -> DynamicGlobeClient (ssr:false, lazy Cesium chunk)
    KargoGlobe (Cesium Viewer: Esri keyless, OSM fallback, Re:Earth terrain w/ flat fallback)
    VesselLayer (TanStack Query -> FastAPI, 30s poll, interpolated rendering)
    HazardLayer (quakes + fires + weather toggles)
    CorridorLayer (Newcastle -> Sandheads -> Haldia/Paradip/Dhamra polylines + port markers from /ports/corridor lat/lon)
    VesselSheet (click -> metadata + Evaluate button -> POST /requisitions/evaluate)
    Hud + TourDirector + SensorStyles + CommandBar
          |
          | HTTPS REST only (no direct third-party calls from browser except Esri/OSM/Re:Earth tiles)
          v
FastAPI (HF Spaces Docker :7860, Gunicorn + Uvicorn workers)
  /api/v1/vessels/live?bbox=   (AISStream proxy, 30s cache, serve-stale, cap 500)
  /api/v1/hazards/summary?bbox= (USGS + FIRMS + Open-Meteo fan-out, per-source cache, fault-isolated)
  /api/v1/ports/corridor        (extended with live counts, same shape + 2 additive fields)
  existing: requisitions/evaluate, forecast/rates, market/ticker (unchanged keys)
```

## 4. Phase 0 — Dependencies and environment (do first)

1. Frontend: add `cesium` to `frontend/package.json` dependencies. Use the same major as source (`^1.124.0` series; if the registry resolves newer 1.x, accept it but record the exact resolved version in this file and DEVELOPER_GUIDE.md). Then run `npm install` inside `frontend/` to regenerate `package-lock.json` (CI runs `npm ci`; out-of-sync lockfile fails the pipeline).

   Resolved 2026-09-12: `cesium@1.145.0` (accepted newer 1.x per rule above).
2. Configure Cesium static assets in `frontend/next.config.ts`: copy Cesium `Build/Cesium` workers/assets to a served path (e.g. `/cesium`) and set `CESIUM_BASE_URL` accordingly at runtime before Viewer construction. Keep the import lazy so the landing page bundle does not grow: only `app/dashboard/globe/` may import from `cesium`.
3. Backend: no new Python package is required for Phase 1-2 (stdlib + httpx + structlog + slowapi + pydantic suffice). If you later need `websockets` for a persistent AISStream socket, add it to `requirements.txt`, install, and verify the Docker build. Prefer the AISStream REST snapshot endpoint first; persistent socket is optional hardening.

   Implemented 2026-09-12: AISStream is WebSocket-only (no REST snapshot exists per aisstream.io/documentation), so `websockets>=14.0,<16.0` was added to `backend/requirements.txt` for the bounded 5s collect window. Demo/stale/unavailable modes keep the demo green without a key.
4. Environment: add to `backend/.env.example` (never commit real keys):
   - `AISSTREAM_API_KEY=` (free signup at aisstream.io; empty = demo-cache mode)
   - `FIRMS_MAP_KEY=` (free at firms.modaps.eosdis.nasa.gov/api/map_key; empty = fires layer reports unavailable)
   - Confirm existing `DATABASE_URL`, `DIRECT_URL`, `FRONTEND_URL` remain set in HF Spaces secrets.
5. Verification gate: `npm run lint` and `npm run build` in `frontend/` pass; `python -m compileall` (or existing backend test command) passes; `git status` shows lockfile updated and no stray untracked files except intended new sources.

## 5. Phase 1 — Backend vessels endpoint (P0, build before frontend globe)

Create `backend/app/services/ais_proxy.py`:

- Reuse the global `httpx.AsyncClient` pattern: accept an optional client param defaulting to `maritime_math.http_client` (created in lifespan). Never create an unbounded client per request.
- Constants: `AIS_TIMEOUT = 5.0` seconds; `VESSEL_CACHE_TTL = 30.0` seconds; `VESSEL_MAX_RESULTS = 500`; Bay of Bengal default bbox `minLon=80.0, minLat=15.0, maxLon=95.0, maxLat=23.5` (covers Haldia/Paradip/Dhamra/Sandheads roads).
- Behavior:
  - Parse and validate bbox (floats, min<max, clamp to world ranges, clamp span to max 30 degrees per side to bound cost).
  - If `AISSTREAM_API_KEY` is empty: return `{"mode": "demo", "vessels": [...sample 8-12 vessels near Sandheads/Haldia with realistic fields...], "notice": "Set AISSTREAM_API_KEY for live traffic."}`. Sample data must be clearly flagged `demo: true` per vessel so the UI can badge it.
  - Else request the AISStream snapshot for the bbox, timeout 5s. On success: normalize each vessel to the exact vessel object in 6.1, cache the list with timestamp, return `mode: live`.
  - On failure/timeout: if cache exists (any age), return it with `mode: stale` plus `notice`. Else return `mode: unavailable`, empty list, and a short notice. Never raise 500 for upstream outage; log with `structlog` (`logger.warning("ais_upstream_failed", error=str(e))`) following `market.py`.
- Threading: AIS normalization is small; keep async. If parsing grows CPU-heavy, move parse to `asyncio.to_thread` like `market.py` does for yfinance.

Create `backend/app/api/routers/vessels.py`:

- Prefix `/api/v1/vessels`, tag `vessels`. Limiter `30/minute` (same as forecast).
- `GET /live` query params: `minLon, minLat, maxLon, maxLat` (floats, defaults = Bay of Bengal bbox above), response_model `VesselLiveResponse` (Section 6.1).
- SSRF rule: the proxy may only request the single allow-listed AISStream host (constant in `ais_proxy.py`). Bbox values never become URL hosts; they are query params only.
- Register router in `backend/app/main.py` (`from app.api.routers import vessels` + `app.include_router(vessels.router)`), keeping import order alphabetical as existing.

Extend `backend/app/api/routers/ports.py` (additive only):

- Keep `GET ""` and `GET /corridor` shapes byte-identical for existing fields. Add two optional additive fields per corridor entry: `liveVesselCount: int | None` (vessels within 50km of the port, computed with numpy vectorized haversine over the cached vessel list; `None` when vessel feed unavailable) and `nearestVesselNm: float | None` (distance to closest vessel, rounded to 1 decimal; `None` when unavailable).
- Never import Cesium or frontend code in backend. Distance math uses the existing `_haversine` approach (vectorize with numpy, same R=3440.065 constant for consistency).

## 6. API contracts (literal — do not rename keys)

### 6.1 Vessel objects and responses

```json
{
  "mmsi": "419001234",
  "name": "NORDIC HALDIA",
  "lat": 21.55,
  "lon": 88.12,
  "sog": 8.4,
  "cog": 45.0,
  "draught": 12.5,
  "shipType": "Bulk Carrier",
  "timestamp": "2026-09-12T10:30:00Z",
  "demo": false
}
```

- Field rules: `mmsi` string (preserve leading zeros, some MMSIs are 9 digits starting with 0). `sog` knots float or null. `cog` degrees 0-360 float or null. `draught` meters float or null (upstream calls it draught/draft; normalize to `draught`). `shipType` string or null. `timestamp` ISO-8601 UTC string. `demo` boolean always present.
- `GET /api/v1/vessels/live?minLon=&minLat=&maxLon=&maxLat=` returns:

```json
{
  "mode": "live",
  "vessels": [{ "...": "vessel objects" }],
  "updatedAt": "2026-09-12T10:30:05Z",
  "notice": null
}
```

- `mode` is exactly one of `live | demo | stale | unavailable`. `notice` is a short human string or null. Frontend branches on `mode` (Section 7.2).

### 6.2 Hazards response

`GET /api/v1/hazards/summary?minLon=&minLat=&maxLon=&maxLat=` returns:

```json
{
  "earthquakes": [{ "id": "us6000xyz", "lat": 19.2, "lon": 92.8, "mag": 4.8, "place": "Bay of Bengal", "time": "2026-09-12T08:00:00Z" }],
  "fires": [{ "lat": 22.1, "lon": 88.4, "confidence": "h", "acqDate": "2026-09-12" }],
  "weather": { "waveHeightM": 2.1, "windSpeedKmh": 28.0, "source": "open-meteo" },
  "sources": { "usgs": "ok", "firms": "ok", "meteo": "ok" },
  "updatedAt": "2026-09-12T10:30:05Z"
}
```

- Fault isolation: each source has its own try/except and TTL (USGS 300s, FIRMS 1800s, Meteo 300s). One source failing sets its `sources` entry to `stale` or `unavailable` and yields an empty array / null weather, but the endpoint still returns 200 with the surviving sources. Never fail the whole endpoint for one feed.
- `sources` values are exactly `ok | stale | unavailable | disabled` (`disabled` = key missing for FIRMS).

### 6.3 Untouched contracts (regression rule)

- `POST /api/v1/requisitions/evaluate` request keys (`volume_mt`, `dest_port_name`, `commodity`) and response keys (`feasible`, `strategy`, `calculatedDraft`, `portMaxDraft`, plus existing extras like `ai_insight`) are frozen. The globe only calls it; it never redefines it.
- `GET /api/v1/forecast/rates` params (`origin`, `destination`, `shockMultiplier` 0.1-5.0) and item keys (`date`, `p10`, `p50`, `p90`) are frozen.
- Pydantic schemas use camelCase field names exactly as the TypeScript interfaces expect (e.g. `shockMultiplier`, `calculatedDraft`, `portMaxDraft`). If a Python alias is needed, set `populate_by_name=True` and serialize by alias so wire keys never change.

## 7. Phase 2 — Frontend globe (P0)

### 7.1 Routes and files (exact)

- New route `frontend/src/app/dashboard/globe/page.tsx`: server component, 6 lines like its sibling, renders `DynamicGlobeClient`. No data fetching here.
- New `frontend/src/app/dashboard/globe/DynamicGlobeClient.tsx`: `"use client"`, `next/dynamic` import of `GlobeClient` with `ssr: false` and a paper-background loading skeleton (copy `DynamicDashboardClient.tsx` pattern).
- New `frontend/src/app/dashboard/globe/GlobeClient.tsx`: composition only (state + layout + children). All Cesium code lives in `components/map/`.
- New `frontend/src/components/map/` files:
  - `KargoGlobe.tsx` — Viewer lifecycle (create once, destroy on unmount). Props: camera preset, layer visibility, vessels, hazards, corridor, selection callbacks. No fetching here.
  - `VesselLayer.tsx` — Cesium entities from vessel array (billboard + label + polyline trail per tracked vessel). Interpolation between polls (Section 7.4).
  - `HazardLayer.tsx` — quake circles (size by mag), fire markers, weather wash/label.
  - `CorridorLayer.tsx` — Newcastle -> Sandheads -> Haldia/Paradip/Dhamra polylines + port markers from corridor API lat/lon.
  - `VesselSheet.tsx` — bottom sheet: name, MMSI, type, sog/cog/draught, distance to selected port, data-mode badge, Evaluate button.
  - `LayerToggles.tsx` — checkboxes: Vessels / Hazards / Weather / Boundaries / Corridor.
  - `Hud.tsx` — tactical readout: camera lat/lon/alt, entity counts, selected vessel telemetry, feed mode.
  - `TourDirector.tsx` — plays the Section 5.7 tour (play/stop, step captions, Esc exits).
  - `SensorStyles.tsx` — Normal/CRT/NVG/FLIR buttons (keys 1-4).
  - `CommandBar.tsx` — text commands (Phase 7).
  - `useVessels.ts`, `useHazards.ts`, `useCorridor.ts` — TanStack Query hooks (Section 7.2).
  - `globeStore.ts` — minimal local UI state only (camera preset id, visible layers, selected MMSI, tour step). Server data stays in React Query, never duplicated here.
- Sidebar: add "Globe" nav item in `dashboard/components/Sidebar.tsx` (white rail, cargo active link, same tokens). Keep route order logical (after Dashboard, before Requisitions).

### 7.2 Data hooks (exact behavior)

- `useVessels(bbox)`: `useQuery({ queryKey: ["vessels", bbox], queryFn: fetch(/api/v1/vessels/live?bbox...), staleTime: 30000, refetchInterval: 30000, retry: 1, refetchOnWindowFocus: false })`. Debounce bbox updates 500ms before they enter the query key (prevents backend spam while orbiting). On `mode: demo` show amber "Demo traffic — set AISSTREAM_API_KEY" badge. On `stale` show gray "Last updated Xm ago". On `unavailable` show empty layer + retry button, never a crash.
- `useHazards(bbox)`: same shape, `staleTime: 60000`, `refetchInterval: 60000`. Render per-source status dot from `sources` (ok green, stale amber, unavailable/disabled gray).
- `useCorridor()`: `useQuery({ queryKey: ["corridor"], staleTime: 300000 })` hitting existing `GET /api/v1/ports/corridor` with the same hardcoded fallback the current `PortCorridor.tsx` uses if the fetch fails.
- Evaluate from VesselSheet: `useMutation` POST to `/api/v1/requisitions/evaluate` with `{ volume_mt, dest_port_name, commodity }` taken from current desk defaults (same defaults as DashboardClient: port Haldia unless user picked another, commodity from desk). Do not cache mutations. On success, offer "Open in solver" linking to `/dashboard` (desk state already persists via `kargosetu_eval_v1`; optionally write the result there so the solver shows it).
- Base URL: `process.env.NEXT_PUBLIC_API_URL` with same fallback logic the existing dashboard client uses. Do not hardcode localhost or the HF URL.

### 7.3 Cesium configuration (exact)

- Before constructing Viewer, set the Cesium base URL to the copied workers path from Phase 0.
- Viewer options: `baseLayerPicker: false` (custom LayerToggles instead), `timeline: false`, `animation: false`, `geocoder: false` (use CommandBar presets instead), `homeButton: true` (wired to Reset Globe = Corridor overview), `sceneModePicker: true`, `creditContainer` kept visible at all times (license rule).
- Imagery: default Esri World Imagery provider; on failure event switch to OSM standard tile provider automatically and show a one-line notice. Optional BYOK: if `NEXT_PUBLIC_CESIUM_ION_TOKEN` is set, offer "3D" toggle that swaps in Google Photorealistic 3D via ion; if `NEXT_PUBLIC_GOOGLE_MAPS_KEY` is set, offer direct Google tiles + place search. Neither key may be committed; both read from env at runtime. Default demo path uses zero keys.
- Terrain: Re:Earth/Mapterhorn quantized-mesh `CesiumTerrainProvider`; on failure fall back to `EllipsoidTerrainProvider` silently (log only).
- Camera presets (exact, flyTo with 2.2s duration, same pitch/heading):
  - Corridor overview: lon 86.5, lat 19.5, height 2_200_000m.
  - Haldia: lon 88.06, lat 22.03, height 180_000m.
  - Paradip: lon 86.68, lat 20.26, height 180_000m.
  - Dhamra: lon 86.99, lat 20.79, height 180_000m.
  - Sandheads roads: lon 88.45, lat 21.35, height 220_000m.
  - Newcastle origin: lon 151.78, lat -32.92, height 400_000m.
- Entity policy: one Billboard per vessel (batch by keeping a Map keyed by MMSI, update positions instead of recreating). Labels show on selection/hover only (performance). Trails: polyline of last N reported positions for the selected vessel only (cap 20 points). Cap rendered vessels at 500 (backend already caps; frontend slices defensively).
- Cleanup: `viewer.destroy()` on unmount; remove all event listeners; cancel pending flyTo. Verify by navigating away and back with no console errors and no GPU memory growth.

### 7.4 Motion smoothing (copy the source pattern, simplified)

- Polls arrive every 30s. Keep previous + current fix per MMSI. Each animation frame, interpolate position linearly between fixes by elapsed/interval fraction (clamped 0-1). Do not extrapolate beyond the newest fix (no fake sailing past known data). On `stale` mode, freeze at last fix and badge it; do not animate.
- Headings: rotate billboards to `cog` when present; when null, keep last heading (never spin to 0). No per-frame allocation in the hot loop (reuse Cartesian3 scratch objects).

### 7.5 i18n keys (add to ALL seven files or CI-equivalent manual check fails the desk)

Add a `globe` namespace to `en/hi/bn/mr/ta/te/gu.json` with identical key sets. Minimum keys: `title, subtitle, layers.vessels, layers.hazards, layers.weather, layers.boundaries, layers.corridor, presets.corridor, presets.haldia, presets.paradip, presets.dhamra, presets.sandheads, presets.newcastle, sheet.evaluate, sheet.openSolver, sheet.distance, status.live, status.demo, status.stale, status.unavailable, tour.play, tour.stop, tour.reset, sensors.normal, sensors.crt, sensors.nvg, sensors.flir, commands.placeholder, retry`. Values stay English for anything sent to the API. Only labels translate. Verify by switching each language and confirming no missing-key fallback text appears on the globe page.

### 7.6 Theme and shell rules

- Panels: white cards on `#E2E6EB` hairlines over `#FAF7F1` page; mono-label eyebrows over display-black titles; Inter; cargo-orange `#D95D0F` primary buttons. Status colors per desk (leaf/cargo-red/sea). No dark surfaces in chrome; the 3D canvas itself is exempt (satellite imagery is naturally dark).
- Sidebar item and TopHeader crumb follow existing components; do not restyle the shell.
- Loading skeleton uses existing `ui/skeleton.tsx`. Empty states use the same copy tone as the desk (short, functional).

### 7.7 Demo tour (exact 5-stop script for TourDirector)

1. "Newcastle loading" (Newcastle preset, corridor layer on): caption "Coking coal loads at Newcastle."
2. "Deep-sea transit" (Corridor overview): caption "Capesize economical deep-sea leg."
3. "Sandheads lighterage" (Sandheads preset, vessels on): caption "Big ships break bulk at Sandheads roads."
4. "Haldia draft split" (Haldia preset, select nearest vessel): caption "Haldia 7.5m draft forces Supramax splits."
5. "CoA dip window" (stay on Haldia, open forecast mini-card if available): caption "Book the contract in the rate dip."
Each stop 8 seconds with flyTo, caption bar, progress dots, Esc or Stop exits and restores prior camera. This is the SIH stage path; test it end to end on throttled wifi.

## 8. Phase 3 — Landing page updates (each section, exact)

Goal: the landing page must sell the globe and stay truthful (no mock-live claims). Update in this order:

1. `Navbar.tsx`: add "Live Globe" link (routes `/dashboard/globe`) in desktop nav and mobile drawer, same styling as existing links. No new nav library.
2. `HeroSection.tsx`: add one secondary CTA beside the existing primary ("View live vessel globe") linking `/dashboard/globe`. Keep the tricolor arch artwork and Market Snapshot card untouched. Sub-copy may add one clause: "live coastal vessel picture" only if Phase 1 is merged; otherwise "3D corridor view".
3. `MarketTicker.tsx`: append two live items sourced from existing APIs only: vessel count in Bay bbox (from `/vessels/live`, cached) and corridor max draft note (from `/ports/corridor`). If feeds unavailable, those items hide (never show fake numbers).
4. `SolutionsSection.tsx`: change the Operations Hub card (or add a fourth card only if the grid supports it without restyle) to "Live Corridor Globe" with three bullets: click-to-track vessels, draft-constrained corridor, hazard overlays. Link to `/dashboard/globe`.
5. `InteractiveSandbox.tsx`: replace the client-side duplicated solver math with a call to the same `POST /requisitions/evaluate` mutation the dashboard uses. This is a correctness fix disguised as a feature: one solver everywhere. Keep the volatility-shock and ROI tabs calling forecast/market as they do now.
6. `PortCorridor.tsx`: replace the static `/corridor-map.png` hero image with an embedded read-only globe preview (same `KargoGlobe` component with interactions disabled, Corridor overview preset, auto-rotate if cheap) OR, if performance budget forbids, keep the image but overlay live badges from `/ports/corridor` (liveVesselCount per port). Do not do both. Recommended: live badges first (cheap), preview embed second (only if build stays green and LCP does not regress).
7. `BentoFeatures.tsx`: update the Sandheads Lighterage tile copy to reference live roads traffic ("see it live in the globe" link). Leave Hydrodynamics/TensorFlow/ESG tiles untouched.
8. `WorkflowSection.tsx`: insert globe as step 1.5 ("Track the corridor live") between requisition and evaluation steps; renumber captions accordingly. Four steps become five only if the layout supports it; otherwise fold into step 1 copy.
9. `DemoModal.tsx`: add a 5th chapter "Live Globe tour" that deep-links the 5-stop tour (Section 7.7). Keep existing 4 chapters byte-identical.
10. `Footer.tsx`: add attribution line for the new data sources (Esri, OSM, AISStream, USGS, FIRMS, Open-Meteo, CelesTrak if used) plus keep the SIH 26006 badge and system status. Attribution text lives in one constant shared with the in-app popover so they cannot drift.
11. `SocialProofLogos, TestimonialsSection, FaqSection, CtaSection`: add one FAQ entry ("Where does the live vessel picture come from?") stating AISStream terrestrial AIS with mid-ocean limits and attribution. No other changes.

## 9. Phase 4 — Forecast chart fix (small, high value)

`ForecastPriceChart.tsx` currently renders `data[0]` only. Change to render the full 90-point series with `recharts` (already installed): three lines (p10/p50/p90) with shaded p10-p90 band, x-axis dates (thin ticks), shock-multiplier note in the header, empty/error states matching desk tone. Keep the shock slider wiring (`shockMultiplier` 0.1-5.0 to `GET /forecast/rates`) exactly as is. Verify against 90-item payload and against empty array.

## 10. Phase 5 — Showmanship details (gated on P0 green)

- HUD: camera lon/lat/alt, counts (vessels shown, hazards shown), selected vessel line, feed mode badge. Update at most 4Hz (not per frame).
- Sensors: Normal/CRT/NVG/FLIR post-process toggles (keys 1-4 + buttons). Implement as the cheapest path that looks right (CSS filter overlay first; GLSL pass only if needed). Must not break credit visibility.
- Detection toggle: boxes + MMSI labels for vessels in view, density follows visible count (no separate density slider for v1).
- CommandBar (text only): commands `take me to {haldia|paradip|dhamra|sandheads|newcastle|corridor}`, `show|hide {vessels|hazards|weather|corridor}`, `track nearest`, `reset globe`, `evaluate {volume} {port}` (parses volume + port, prefills Evaluate). Unknown input shows the 6 example commands. No network call except the actions the buttons already perform.

## 11. Verification gates (run in order, do not skip)

- Gate A (deps): `npm run lint` + `npm run build` in `frontend/` pass; backend imports clean; `git status` shows lockfile updated, no stray files.
- Gate B (backend): vessels endpoint returns `mode: live|demo` with valid vessel objects for the default bbox; hazards endpoint returns 200 with each source isolated (kill one upstream by unsetting its key and confirm the others still return); corridor still returns the 4 ports with original fields intact plus 2 additive fields.
- Gate C (globe): page loads with no keys set (Esri/OSM path), vessels render in bbox, click -> sheet -> Evaluate posts successfully, language switch across all 7 shows no missing keys, reload restores camera/layers/selection via storage key, navigate away/back with zero console errors.
- Gate D (landing): every updated section links correctly, ticker hides (not fakes) missing data, `DemoModal` 5th chapter launches the tour, footer attribution matches in-app popover.
- Gate E (perf): globe chunk lazy (landing bundle unchanged within noise), vessels capped at 500 entities, HUD throttled, 30s/60s poll intervals observed in network tab, no per-frame allocations flagged.
- Gate F (licenses): credit line + popover visible in normal and clean-view modes; no TeleGeography files present (`glob` check); no keys committed (`git grep` for key names returns only `.env.example` + code references to env vars).

## 12. Do-not lists (hallucination guards)

1. Do not rename any wire key in Section 6. Do not add/remove required fields. Additive optional fields only where explicitly allowed.
2. Do not alter `schema.prisma` tables/columns/relations. No migration in this plan.
3. Do not touch `backend/index.js`, `routes/`, `services/*.js`, `middleware/`, `models/` (deprecated Node).
4. Do not call third-party live APIs from the browser except tile/terrain endpoints. All data feeds go through FastAPI proxies.
5. Do not introduce a second Prisma client, a second HTTP client pool, or a new state library. Use dependencies.py, lifespan client, TanStack Query + minimal local store.
6. Do not use dark nautical tokens (`bg-navy-950` etc.). Harbour light theme only.
7. Do not claim live data that is demo/stale. Badge every non-live state in UI.
8. Do not exceed bbox span caps or render caps to "show more ships". Bounds are load protection.
9. Do not add `"use client"` above the page level. Lowest interactive leaf only; server components by default.
10. Do not commit `.env`, keys, or Google tile content. Ever.
