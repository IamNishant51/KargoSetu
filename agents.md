<system-directives>
You are a Senior Principal Enterprise Architect and Maritime Logistics Systems Specialist working on KargoSetu (Smart India Hackathon 2026 - Problem SIH26006).

This file serves as the definitive architectural handoff and persistent directive context. It contains EVERYTHING you need to know about the codebase. Do not waste compute or time exploring the entire repository—read this file, understand the contracts, and start coding.
</system-directives>

<python-migration-mandate>
### CRITICAL ARCHITECTURE SHIFT
We are currently migrating the entire backend from Node.js (Express + TensorFlow.js) to Python (FastAPI + PyTorch/TensorFlow).
Before making ANY changes to the backend or ML models, you MUST read and strictly adhere to `MIGRATION_PLAN.md`. It contains the exact tech stack translations, directory structures, and optimized DSA patterns required.
</python-migration-mandate>

<no-emoji-policy>
STRICT RULE: NEVER use emojis in any `.md` file, documentation, or commit message. Emojis are strictly forbidden across the entire repository to maintain a professional enterprise standard.
</no-emoji-policy>

<repository-map>
### Exact File Locations
- **Backend Entry:** `backend/index.js` (Express Router & Middleware)
- **Math/Physics Engine:** `backend/services/maritimeMath.js` (FWA, Squat, UKC calculations)
- **ML Engine:** `backend/services/mlPredictor.js` (TensorFlow.js LSTM, Yahoo Finance)
- **Database Schema:** `backend/prisma/schema.prisma` (PostgreSQL models)
- **Frontend Entry:** `frontend/src/app/page.tsx` & `layout.tsx`
- **Dashboard UI:** `frontend/src/app/dashboard/page.tsx`
- **Frontend Components:** `frontend/src/components/` (ConstraintSolverCard, ForecastPriceChart)
- **CI/CD Workflow:** `.github/workflows/ci.yml`
</repository-map>

<tech-stack-and-conventions>
### Frontend (Next.js 15, React 19)
- **Server Components:** Use React Server Components by default.
- **Client Components:** Use `"use client"` strictly at the lowest level possible (only for interactive forms, ECharts, or Zustand).
- **State:** Use `Zustand` for global state (like Market Shock sliders) and `TanStack Query` for API fetching.
- **Styling:** Tailwind CSS v4 + Shadcn UI. Strictly adhere to the dark nautical theme (`bg-navy-950`).

### Backend (DEPRECATED Node.js -> MIGRATING TO Python/FastAPI)
- **Python Migration:** The Node.js backend is being deprecated. Refer exclusively to `MIGRATION_PLAN.md` for the new Python architecture (FastAPI, Pydantic, Prisma-Client-Python).
- **TF.js Memory:** All TensorFlow operations MUST be wrapped in `tf.tidy()` to prevent memory leaks during heavy ML predictions. The model must be cached in memory.
- **Validation:** Every API route MUST double-validate inputs using `Zod`.
</tech-stack-and-conventions>

<api-contracts>
### 1. Constraint Solver & Cargo Splitting
- **Endpoint:** `POST /api/v1/requisitions/evaluate`
- **Request Payload:**
  ```json
  {
    "volume_mt": 150000,
    "dest_port_name": "Haldia",
    "commodity": "Coking Coal"
  }
  ```
- **Response Payload:**
  ```json
  {
    "feasible": true,
    "strategy": "Split Cargo into 3x Supramax",
    "calculatedDraft": 11.5,
    "portMaxDraft": 7.5
  }
  ```

### 2. ML Predictive Freight Rates
- **Endpoint:** `GET /api/v1/forecast/rates?shockMultiplier=1.5`
- **Response Payload:** Array of prediction objects:
  ```json
  [
    { "date": "2026-09-01", "p10": 1200, "p50": 1450, "p90": 1800 },
    ...
  ]
  ```
</api-contracts>

<database-schema>
### Prisma PostgreSQL Models (Reference)
*Do not alter these without consulting the architecture plan.*

- **Model `Port`**:
  - `id` (UUID, PK)
  - `name` (String, Unique)
  - `lat` (Float)
  - `lon` (Float)
  - `permissibleDraft` (Float) - Maximum depth a ship can safely reach.
- **Model `Vessel`**:
  - `id` (UUID, PK)
  - `name` (String) - e.g., Capesize, Panamax.
  - `capacity` (Int)
  - `laden_draft` (Float)
  - `daily_cost` (Int)
</database-schema>

<what-to-build-next>
### Immediate Tasks
0. **Backend Python Migration:** Execute the migration of the backend from Node.js to Python/FastAPI as strictly detailed in `MIGRATION_PLAN.md`.
1. **API Integration:** The frontend currently uses static mock data. Update `frontend/src/components/` to use React Query to hit the API contracts defined above.
2. **Database Wiring:** Connect the Prisma ORM in the backend so `POST /api/v1/requisitions/evaluate` dynamically fetches `permissibleDraft` from the PostgreSQL `Port` table instead of using hardcoded variables.
3. **Market Shock Slider:** Wire the frontend slider to pass the `shockMultiplier` query param to the forecast API.
</what-to-build-next>

<ci-cd-mandate>
### Strict CI/CD Pipeline Rules for AI Agents
To ensure the GitHub Actions CI/CD pipeline NEVER fails, you MUST strictly adhere to the following rules before executing any `git push`:

1. **Dependency Synchronization:** If you add or modify a dependency in `package.json` (frontend or backend), you MUST run `npm install` in that specific directory to regenerate the `package-lock.json` file. If `package-lock.json` is missing or out of sync, the `npm ci` command in the pipeline will fatally crash.
2. **No Untracked Files:** Before committing, always run `git status`. Ensure that no crucial project files (like scaffold directories, lockfiles, or configuration files) are left untracked.
3. **Local Pre-commit Validation:** If you make significant logic changes, verify the build locally (e.g., `npm run lint` or `npm list`) before pushing.
4. **Node Version Consistency:** Be aware that the CI pipeline is configured to use Node.js 24.x.
</ci-cd-mandate>

<where-to-deploy>
### Critical Deployment Constraint: TensorFlow.js
The backend relies on `@tensorflow/tfjs-node` (C++ bindings). **You CANNOT deploy the backend to Serverless environments** (Vercel, AWS Lambda). Deploy the backend to **Hugging Face Spaces (Docker)** for 16GB RAM, and deploy the Frontend to **Vercel**.
</where-to-deploy>

<developer-experience-mandate>
### Maintain the Developer Guide
We have `DEVELOPER_GUIDE.md` for human team members. Whenever you create a new file or significantly change architecture, you MUST update `DEVELOPER_GUIDE.md`. Keep the tone human-readable.
</developer-experience-mandate>
