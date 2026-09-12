# KargoSetu - Developer Tour (What Does What?)

Welcome to the team! If you are new to the codebase, don't worry. This guide explains exactly what every major folder and file does in plain, easy-to-understand English.

---

## 1. The Frontend (frontend/ folder)
This is everything the user sees and interacts with in their browser. It is built using Next.js and React.

### Main Pages
* **`app/page.tsx`**: The **Landing Page**. The comprehensive, high-converting homepage featuring the hero section, live Baltic ticker, interactive sandbox, and SIH 26006 problem specifications.
* **`app/layout.tsx`**: The **App Wrapper**. This file sets up application metadata, fonts, and global client providers.
* **`app/dashboard/page.tsx`**: The **Command Center**. When you click "Launch Dashboard", this is the page that loads. **New Update:** The static mock UI has been completely wired up using TanStack React Query to display real-time live calculations from the backend!

### Dashboard Shell & Theme (`app/dashboard/` folder)
The whole command center speaks the landing page's harbour language: light paper background `#FAF7F1`, white cards on `#E2E6EB` hairlines, Inter everywhere, mono-label eyebrows over display-black titles, cargo-orange `#D95D0F` primary buttons, leaf/sea/cargo status chips. There is no dark surface anywhere — the old `bg-navy-950` chart and `#0A1727` buttons are gone. **`components/Sidebar.tsx`** (white rail, cargo active link, live Haldia draft slip, paper profile card) and **`components/TopHeader.tsx`** (mono crumb, cargo notification dot, language + profile menus) form the shell. Status colors: Feasible = leaf wash, Pending = cargo wash, Infeasible = dossier red, Converted = sea wash. If you add a new dashboard page, copy a page header (eyebrow + `font-display font-black` h1) and use the same tokens.

### Languages & Notifications (`i18n/`, `hooks/useNotifications.ts`, backend `routers/notifications.py`)
Every user-facing string in the dashboard, auth pages, and shell lives in `src/i18n/translations/` — 7 dictionaries (en/hi/bn/mr/ta/te/gu) with enforced key parity. Always add a new key to **all seven files** (short functional copy only). Dynamic values use `{n}`/`{a}`/`{b}`/`{c}` templates filled with `.replace()` since `t()` has no interpolation. Critical rule: filter and select **values stay English** — only display labels translate (see `STATUS_OPTS`/`COMMODITY_OPTS`/`ORIGIN_OPTS`/`RANGE_OPTS` in RequisitionsClient and the `value=` attributes on settings `<option>`s), otherwise API queries break on language switch. Commodity names, ports, units, currencies, model versions, and timezones intentionally stay English (desk convention). Notifications come from the live FastAPI feed (latest requisitions + draft alerts + newest ML model, fault-isolated per source); the frontend polls every 30s, keeps read receipts in localStorage by notification id, and shows All/Unread tabs with retry on failure.

### Reload persistence (`lib/storage.ts` + per-page keys)
Reloads must never lose desk state. The rule: **lazy `useState` initializers rehydrate, effects only write to localStorage** (never `setState` in effects). Keys: `kargosetu_lang` (language, single lazy init — never a restore effect), `kargosetu_eval_v1` (solver form + last answer + unit), `kargosetu_req_view_v1` (register filters + page + search), `kargosetu_req_draft_v1` (unsent indent, auto-cleared on create), `kargosetu_fc_view_v1` (shock + horizon + table page), `kargosetu_notif_read` (read receipts). `loadJSON` merges over defaults so corrupt blobs degrade, never crash. Ephemeral UI (open modals/dropdowns, spinners, sidebar) intentionally resets.

### Landing Page Components (`components/landing/` folder)
* **`Navbar.tsx`**: Sticky responsive navigation with desktop solutions dropdown and mobile drawer.
* **`HeroSection.tsx`**: Hero section with Indian tricolor arch ship artwork and floating live Market Snapshot card.
* **`MarketTicker.tsx`**: Real-time marquee ticker streaming live Baltic indices and East Coast port tide levels.
* **`SocialProofLogos.tsx`**: Authentic SVG vector marks for MAERSK, MSC, COSCO SHIPPING, CMA CGM, Hapag-Lloyd, and EVERGREEN.
* **`SolutionsSection.tsx`**: Three-card solutions grid for Market Intelligence, Charter & Freight, and Operations Hub.
* **`InteractiveSandbox.tsx`**: Interactive simulator featuring Port Constraint Solving, ML Volatility Shock testing, and SAIL PSU Financial ROI calculations. **New Update:** This component is now live-wired to the backend API via React Query, discarding static mock data to display real-time evaluations and forecasts!
* **`BentoFeatures.tsx`**: Four-pillar bento grid detailing Hydrodynamics, TensorFlow.js LSTM, Sandheads Lighterage, and Green Fleet ESG.
* **`PortCorridor.tsx`**: East Coast India bathymetry telemetry cards for Haldia, Paradip, Dhamra, and Sandheads.
* **`WorkflowSection.tsx`**: Four-step automated procurement process from requisition to demurrage-free berthing.
* **`TestimonialsSection.tsx`**: Persona-driven executive endorsements from SAIL, Haldia Dock Complex, and NMDC.
* **`FaqSection.tsx`**: Interactive accordion answering key questions on bathymetry, LSTM models, and ERP integration.
* **`CtaSection.tsx`**: Conversion call-to-action banner for launching the Executive Command Center.
* **`Footer.tsx`**: Complete enterprise footer with port corridors, SIH 26006 problem badge, and system status.
* **`DemoModal.tsx`**: Interactive 5-chapter guided walkthrough modal triggered by Watch Demo buttons. Chapter 5 is the Live Globe tour and deep-links to `/dashboard/globe?preset=newcastle`.

### Live Corridor Globe (`app/dashboard/globe/` + `components/map/` folder)
This is the 3D "Gods Eye View" of the Bay of Bengal. It is lazy-loaded so the landing page stays fast: only the globe route ever imports Cesium (resolved version 1.145.0, `^1.124.0` series per plan). Cesium workers live in `public/cesium/` (copied by `scripts/copy-cesium.mjs` on postinstall) and the globe sets `CESIUM_BASE_URL` to `/cesium` before building the Viewer. Default map is keyless Esri World Imagery with automatic OSM fallback; terrain is Re:Earth quantized-mesh with a flat-ellipsoid fallback. No Google tiles and no committed keys.
* **Route files**: `app/dashboard/globe/page.tsx` (server component, renders the dynamic wrapper), `DynamicGlobeClient.tsx` (`ssr: false` + skeleton, same pattern as the dashboard), `GlobeClient.tsx` (layout and state only, no Cesium calls). The page breaks out of the dashboard content padding (negative margins) so the canvas fills the whole content area edge to edge; all chrome (compact header, HUD chips, vessel sheet, control panel, attribution pill) floats above the canvas, and the control panel collapses via the header toggle.
* **Map components**: `KargoGlobe.tsx` (Viewer lifecycle: create once, destroy on unmount; imports Cesium `widgets.css` inside the lazy chunk so the canvas and toolbar size correctly; frames the corridor instantly with `setView`, resizes via ResizeObserver, fades in on ready; default help/infobox/selection widgets off, home button resets to the corridor overview), `VesselLayer.tsx` (one billboard per vessel, interpolated between 30s polls), `HazardLayer.tsx` (quake circles, fire dots, weather label), `CorridorLayer.tsx` (Newcastle to Sandheads to Haldia/Paradip/Dhamra lines plus port markers), `VesselSheet.tsx` (click a ship, see its data, press Evaluate to call the same solver the desk uses), `LayerToggles.tsx`, `Hud.tsx` (camera and counts, max 4Hz), `TourDirector.tsx` (5-stop SIH stage tour, Esc exits), `SensorStyles.tsx` (Normal/CRT/NVG/FLIR via CSS overlay, keys 1-4), `CommandBar.tsx` (text commands like "take me to haldia").
* **Data hooks**: `useVessels.ts` (30s poll, debounced bbox), `useHazards.ts` (60s poll), `useCorridor.ts` (5min poll with the same hardcoded fallback the landing uses). Server data stays in TanStack Query; `globeStore.ts` holds only UI state (camera preset, layers, selected ship) persisted under `kargosetu_globe_v1`.
* **Words in 7 languages**: every globe label lives in `src/i18n/translations/` under `globe.*` keys in all seven files (en/hi/bn/mr/ta/te/gu). Values sent to the API stay English.
* **Credits that never hide**: `attribution.ts` holds one shared line used by both the in-app popover and the landing footer, so they cannot drift: Esri, OpenStreetMap contributors, AISStream.io, USGS, NASA FIRMS (full acknowledgement text), Open-Meteo.

### Auth Pages (`app/login/`, `app/register/`, `components/auth/` folder)
Both pages share one shell so they always look like the same office. **`AuthShell.tsx`** renders the top bar (wordmark + SIH tag + back link), the hard-shadow card, a quiet navy panel on the left (eyebrow, headline, one sub-line, SIH footnote — deliberately minimal), and the white form desk on the right. The login and register pages only pass different copy (eyebrow, title, sub) plus their own form fields. All auth logic is untouched: forms POST to the FastAPI backend and `persistSessionAndRedirect` in `lib/auth.ts` hard-navigates to `/dashboard` so the middleware sees the cookie. If you change one auth page, mirror the copy shape in the other.

### UI Components (`components/` folder)
These are the reusable LEGO blocks used to build the dashboard.
* **`ExecutiveDashboard.tsx`**: The main layout grid that holds all the other dashboard components together.
* **`ConstraintSolverCard.tsx`**: The input box where users type in cargo weight and select ports to see if a ship will fit.
* **`ForecastPriceChart.tsx`**: The full 90-day freight outlook chart. It draws all three bands (P10/P50/P90) with a shaded P10-P90 region, thin date ticks, and the shock-multiplier note in the header. Empty and error states use the same short desk tone as everywhere else. The shock slider covers the full 0.1-5.0 contract range.
* **`TradeRouteMap.tsx`**: The visual map that draws lines connecting global ports to India.
* **`IdleFleetManager.tsx`** & **`MarketShockSlider.tsx`**: Smaller interactive widgets on the dashboard.
* **`ui/` folder**: Tiny, basic UI parts like button, card, and badge (provided by Shadcn UI).

---

## 2. The Backend (`backend/` folder)
This is the invisible "engine" running on the server. It handles all the heavy math and AI predictions. **New Update:** It has been completely migrated to a hyper-optimized **Python** stack using **FastAPI**!

### The Brain
* **`main.py`**: The **Server Entry Point**. Think of this as a traffic cop. It uses FastAPI for ultra-fast routing. When running in production, it is managed by **Gunicorn** with Uvicorn workers to handle heavy concurrent traffic.
* **`core/` folder**: Contains centralized settings (`config.py`), global error handlers (`exceptions.py`), and authentication utilities (`security.py`).
* **`api/routers/` folder**: Contains specific API endpoints modularized by feature (`health`, `requisitions`, `forecast`, `market`, `auth`, `commodities`, `ports`, `notifications`, `settings`, plus `vessels` and `hazards` for the globe).
* **`api/routers/vessels.py`**: `GET /api/v1/vessels/live` with a Bay of Bengal bbox. Without `AISSTREAM_API_KEY` it returns clearly-flagged demo traffic; with a key it collects the AISStream WebSocket for up to 5 seconds. Upstream trouble never becomes a 500: it serves the last good snapshot as `stale` or an empty `unavailable` with a short notice.
* **`api/routers/hazards.py`**: `GET /api/v1/hazards/summary` fans out to USGS quakes, NASA FIRMS fires, and Open-Meteo weather at the same time, each with its own cache. One feed failing only marks its own source as `stale` or `unavailable`; the endpoint still returns 200 with whatever survived. FIRMS without a key reports `disabled`.
* **`api/routers/ports.py`**: `GET /api/v1/ports/corridor` keeps every existing field exactly as before and adds two optional fields per port: `liveVesselCount` (ships within 50 km) and `nearestVesselNm` (rounded to 1 decimal, `None` when the feed is down).
* **`services/ais_proxy.py`**: The vessel cache and demo fleet live here. It reuses the global HTTP client from lifespan and caps bboxes at 30 degrees per side and vessels at 500.
* **Environment keys**: `AISSTREAM_API_KEY` (free at aisstream.io, empty means demo mode) and `FIRMS_MAP_KEY` (free at firms.modaps.eosdis.nasa.gov/api/map_key, empty means the fires layer reports disabled). Both go in `backend/.env.example` as empty placeholders and in Hugging Face Spaces secrets for real runs. Never commit real keys.
* **`requirements.txt` & `pyproject.toml`**: The pinned Python dependencies and project build configurations.

### The Services (`services/` folder)
* **`maritime_math.py`**: The **Calculator**. This file handles the physical physics of ships. It calculates "Squat" and "Sinkage" to ensure a ship won't scrape the ocean floor. It dynamically fetches critical port constraints and real-time tide data.
* **`ml_predictor.py`**: The **Crystal Ball**. This is our Artificial Intelligence (AI) file. It trains an advanced CNN-LSTM Hybrid model on Baltic Dry Index data, exports it to **ONNX**, and uses **ONNX Runtime** for bare-metal CPU inference speeds.
---

### The Database (`prisma/` folder)
* **`schema.prisma`**: The **Blueprint**. We added Prisma ORM to talk to a PostgreSQL database! This file defines what our port data looks like (Charted Depth, Permissible Draft, etc.) and also tracks the `Vessel` fleet (Capesize, Panamax, Supramax, Handysize).
* **`scripts/seed.py`**: The **Data Filler**. A Python script used to load real-world bathymetry data for 15 Indian ports and 5 fleet specs into the database, generating 500 mock historical requisitions.

## 3. The Documentation (`Docs/` folder)
These files are strictly for reading. They contain the official rules and planning for the Hackathon.
* **`01_PRD_User_Personas.md`**: Explains *who* we are building this for (e.g., General Managers, Logistics Officers).
* **`04_Backend_Architecture.md`**: Contains the hard math formulas used in `maritimeMath.js`.
* **`05_Machine_Learning.md`**: Explains the logic behind how the AI predicts prices.
* **`08_System_Architecture_Diagrams.md`**: Contains flowchart code (Mermaid) to visually map out how the app works.
* **`10_Comprehensive_Architecture_And_Security_Plan.md`**: The definitive **Master Plan**. It details exactly how the Frontend, Backend, Machine Learning, and Database connect securely. It outlines all best practices (Next.js App Router, TF.js memory management, and Enterprise Security). **Read this before writing any new code.**

---

## 4. Core Best Practices & Security
If you are writing code for KargoSetu, you MUST follow these rules (detailed fully in Doc 10):
* **Frontend:** Use React Server Components by default. Use `"use client"` only when necessary. **New Update:** We are leveraging Next.js 15 with the **React Compiler**, which automatically memoizes components—you do not need to manually write `useMemo` or `useCallback` anymore! We strictly enforce **ESLint** and **WCAG Accessibility** standards to keep the UI bug-free and inclusive.
* **Backend:** Keep the FastAPI routes thin. Do the heavy math in the `services/` folder. Use **Pydantic** for strict input validation on every single API route. Utilize **ORJSON** for serialization to maintain high throughput.
* **ML & DB:** Run **ONNX Runtime** in asynchronous threads (`asyncio.to_thread()`) to prevent I/O blocking during inference. Use Prisma for all database queries to prevent SQL injection.
* **DevOps & Security:** Never expose `.env` variables to the frontend. The entire application is deployed using **multi-stage Docker builds** to ensure minimal image sizes and a secure, hardened runtime environment. The backend must use strict CORS policies and Rate Limiting.
---

### A Note for Developers and AI Agents:
If you create a new file or make a massive change to what a file does, **you must update this document**. Keep it simple, and keep it human-readable!


---

### Potential Judge Questions

1. You mention using TanStack React Query to display "real-time live calculations" on the dashboard, but your notification system relies on the frontend polling the FastAPI backend every 30 seconds. Why did you choose polling instead of WebSockets or Server-Sent Events (SSE) for a system that requires real-time data?
2. The developer guide notes that read receipts for notifications are stored in `localStorage` by notification ID. Doesn't this mean a user's read/unread state will not sync if they log in from a different device or browser? How do you justify this trade-off for an enterprise or operational tool?
3. You have intentionally hardcoded your application to a light "harbour language" theme and explicitly stripped out dark mode surfaces (e.g., `bg-navy-950`). Given that many operators look at screens in low-light environments (like night shifts at ports), how does this strict design choice impact accessibility and user eye strain?
4. Your internationalization (i18n) setup uses a custom string replacement approach (`.replace()`) for dynamic values because your translation function lacks native interpolation. Why did you build a custom templating system instead of leveraging established, robust i18n libraries that handle pluralization and interpolation natively?
5. The guide states there is a "critical rule" that filter and select values must stay in English, otherwise API queries will break on a language switch. What architectural safeguards or backend validations have you implemented to prevent the system from crashing if a translated value accidentally leaks into an API payload?
6. You maintain seven different language dictionaries (en/hi/bn/mr/ta/te/gu) and mandate "enforced key parity" across all of them. What automated CI/CD checks or linting tools do you have in place to guarantee a developer doesn't break the application by forgetting to update one of the seven files?
7. By intentional "desk convention," you leave commodity names, ports, units, and currencies strictly in English across all translations. Have you validated with actual regional end-users that keeping these critical operational terms in English won't hinder the usability of your localized interfaces?
8. The documentation states that notifications from the FastAPI feed are "fault-isolated per source" (requisitions, draft alerts, ML models). Can you explain exactly how this fault isolation is implemented on the frontend during your 30-second polling intervals?
9. The Landing Page features an "interactive sandbox" tied to the SIH 26006 problem specifications. How does this sandbox actually process user input, and does it use the same live backend calculations as the Dashboard, or is it running mocked data?
10. For the dashboard's live calculations wired through TanStack React Query, how are you handling cache invalidation and data staleness to ensure the user isn't making critical freight or draft decisions based on cached, outdated numbers?
