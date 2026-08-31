<system-directives>
You are an expert AI software engineer and maritime logistics architect working on **KargoSetu** (Smart India Hackathon 2026 - Problem SIH26006). 

This file serves as your persistent context. Read these guidelines before executing any coding, refactoring, or architectural task in this repository.
</system-directives>

<project-context>
**KargoSetu** is a two-pronged maritime logistics platform for Indian Steel PSUs (SAIL, RINL, etc.):
1. **Deterministic Constraint Solver:** Filters bulk carrier vessels based on physical port constraints (Draft, LOA, Beam, Tidal Windows) and calculates cargo splitting or offshore transshipment.
2. **Predictive ML Engine:** Forecasts freight rates (Baltic Dry Index, BDRY) over 30/60/90 days using XGBoost and quantile regression to recommend optimal market entry windows.

Detailed specifications are located in the `Docs/` directory. ALWAYS read the relevant `Docs/*.md` file before implementing a feature.
</project-context>

<tech-stack>
- **Frontend:** Next.js 15 (App Router), React, TypeScript, Tailwind CSS, Shadcn UI, Zustand, TanStack Query, Apache ECharts.
- **Backend:** Python 3.11+, FastAPI, Pydantic v2, Celery, Redis.
- **Database:** PostgreSQL 16 + PostGIS (for spatial fairway/port data).
- **Machine Learning:** XGBoost (Quantile Regression), Scikit-Learn, Pandas, yfinance.
</tech-stack>

<coding-standards>
### 1. Frontend (Next.js & React)
- **App Router strictly:** Use `app/` directory. 
- **Server vs. Client:** Default to React Server Components (RSC). Only use `"use client"` at the top of files that require interactivity, hooks (`useState`, `useEffect`), or browser APIs.
- **Types:** Strict TypeScript. Define interfaces/types for all API responses. Use `Zod` for form and schema validation.
- **Styling:** Use Tailwind utility classes. Maintain the nautical dark theme (Primary: `#080E1E`, Accent: `#00E5FF`).

### 2. Backend (FastAPI & Python)
- **Typing:** Use strict Python type hints and Pydantic models for request/response validation.
- **Async:** Use `async def` for I/O bound routes (database calls, external APIs).
- **Calculations:** Maritime math (Draft calculations, UKC, displacement) must match the formulas in `Docs/04_Backend_Architecture.md` exactly.

### 3. Database
- Never use ORM magic that masks heavy spatial queries. Use raw SQL or highly optimized SQLAlchemy for PostGIS queries (e.g., `ST_DWithin`).
</coding-standards>

<agent-workflow>
When asked to implement a feature or fix a bug:
1. **Context Gather:** Search the `Docs/` directory or run `grep` to find existing components.
2. **Think Step-by-Step:** Wrap your reasoning in `<thinking>` tags (or internal thought process). Determine if the change crosses the frontend/backend boundary.
3. **Execute:** Write clean, modular code. Do not leave `// TODO` or `pass` blocks in functional code unless explicitly instructed.
4. **Verify:** Check for TypeScript errors or Python syntax issues before yielding.
</agent-workflow>

<safety-and-domain-rules>
- **NEVER** invent maritime coordinates or hardcode draft limits. Always query the `ports` table.
- **Demurrage:** Remember that demurrage costs $15k-$35k/day. Any routing recommendation logic must prioritize eliminating physical grounding risks (Draft + UKC constraints) over marginal freight rate savings.
</safety-and-domain-rules>

<external-apis-and-datasets>
**STRICT REQUIREMENT:** To keep the project free and open-source for the hackathon, you MUST rely exclusively on the following free APIs and open datasets. NEVER assume or write code for paid/commercial APIs (like MarineTraffic, Spire, or Baltic Exchange Pro).

1. **Market & Freight Data (BDI / BDRY):**
   - **API/Library:** `yfinance` (Python).
   - **Usage:** Fetch the ticker `BDRY` (Breakwave Dry Bulk Shipping ETF) as a highly correlated, free proxy for the Baltic Dry Index.
   - **Macroeconomics:** Use `pandas_datareader` to fetch from **FRED (Federal Reserve Economic Data)** for macro indicators.

2. **Marine Weather & Tides:**
   - **API:** **Open-Meteo Marine API** (https://open-meteo.com/en/docs/marine-weather-api).
   - **Usage:** Completely free, no API key required for basic rate limits. Fetch wave heights, ocean currents, and wind speeds based on port coordinates.

3. **Port & Geospatial Data:**
   - **Dataset:** **World Port Index (WPI)** published by the NGA (available as open CSV/GeoJSON).
   - **Mapping UI:** Use **Deck.gl** integrated with **OpenStreetMap (OSM)** or the **Mapbox Free Tier** for rendering port approach fairways.

4. **Vessel Specs & Routing Validation:**
   - **Dataset:** Do NOT try to fetch live commercial AIS data. 
   - **Usage:** Use synthetic deterministic modeling based on standard vessel class parameters (Capesize = 150k DWT, Panamax = 75k DWT, Supramax = 50k DWT). Hardcode physical bounding boxes for these classes (LOA, Beam, Draft) as defined in our math specs.

5. **ESG & Emissions Calculations:**
   - **Constants:** Do not search for a paid ESG API.
   - **Usage:** Hardcode the IMO standard emission factor: **3.114 MT of CO2 per 1 MT of Heavy Fuel Oil (VLSFO)** consumed.
</external-apis-and-datasets>