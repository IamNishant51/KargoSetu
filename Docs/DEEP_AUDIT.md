# Deep Codebase Audit (Phase 0)

## 1. Complete Repository Tree
- `frontend/`: Next.js frontend application.
- `backend/`: FastAPI backend (active) and deprecated Node.js backend files.
- `Docs/`: Documentation folder.
- Root scripts: `deploy_hf.py`, `check_db.py`, `docker-compose.yml`.

## 2. Frontend Architecture
Next.js 15, React 19, Tailwind CSS, TanStack Query, and `cesium` for the 3D Globe visualization.

## 3. Backend Architecture
FastAPI, Uvicorn, Prisma ORM (Python), ORJSON for fast serialization, and ONNX Runtime for ML inference.

## 4. Database Schema
Defined in `backend/prisma/schema.prisma`. Contains models: `Port`, `Vessel`, `UserSetting`, `Requisition`, `MLModel`, and `User`.

## 5. ML Pipeline
Located in `backend/app/services/ml_predictor.py`. Fetches external data (BDRY, ^GSPC, CL=F) via `yfinance`. Calculates technical indicators (RSI/SMA), trains an LSTM, and exports to ONNX. 
**Critical Note:** Falls back to synthetic random data (`np.random`) if the external `yfinance` fetch fails.

## 6. API Inventory
Endpoints exist for: auth, commodities, context, forecast, hazards, health, market, notifications, ports, requisitions, settings, and vessels. Located in `backend/app/api/routers/`.

## 7. External Integrations
- `yfinance` for market indices.
- References to AIS and maritime data proxies.

## 8. Deployment Architecture
- **Backend:** Hugging Face Spaces via `deploy_hf.py` (gradio SDK). Docker Compose for local PostgreSQL + FastAPI.
- **Frontend:** Vercel.

## 9. Security Analysis
- Rate limiting implemented via `slowapi`.
- CORS middleware configured in FastAPI.
- Secrets managed via `.env` files.

## 10. Performance Analysis
- Frontend: React Compiler enabled.
- Backend: GZipMiddleware and ORJSON used for high-performance serialization.

## 11. Test Coverage Analysis
- Playwright tests exist for the frontend but have assertion mismatches (e.g., `home.spec.ts`).
- Pytest suite exists (58 items) but execution hangs, likely due to background ML warmup or missing DB connection timeouts during FastAPI lifespan startup.

## 12. Dead-code Analysis
Backend contains deprecated Node.js files: `index.js`, `routes/`, `models/`, `middleware/`, and a `DEPRECATED_NODEJS.md` file.

## 13. Duplicate/Legacy-code Analysis
The Node.js backend is fully duplicated by the new FastAPI implementation and needs to be removed.

## 14. Configuration/Env Analysis
Both frontend and backend include `.env.example` and `.env.test`. HF deployment securely injects secrets via the HF API.

## 15. Production-readiness Gaps
- Failing frontend tests.
- 30 unformatted Python files (black).
- Missing graceful degradation for DB connections causing Pytest hangs.

## 16. SIH26006 Requirement Traceability
- Forecast engine exists but relies on heuristics if the ML model fails.
- Route constraints exist but are simplistic and require expansion for real-world validation.

## 17. Broken/Partial/Fake/Demo Features
- **FAKE:** "Route-specific scaling" in `ml_predictor.py` uses a hardcoded hash modulo to generate a deterministic multiplier (0.70 to 1.30).
- **DEMO:** The ML pipeline falls back to completely synthetic random data if `yfinance` fails.

## 18. Unsupported Documentation Claims
`ARCHITECTURE.md` claims "zero-latency predictions" and "massive logistics data", which are unsubstantiated given reliance on network calls to `yfinance` and synthetic fallback data.

## 19. Highest-Risk Technical Debt
- Coexistence of legacy Node.js backend with FastAPI.
- ML predictor warmup in FastAPI `lifespan` blocks tests and delays application startup.

## 20. Prioritized Remediation Plan
- **P0:** Fix Playwright tests and delete legacy Node.js code to prevent deployment ambiguity.
- **P1:** Format Python code (`black`) and fix ESLint warnings.
- **P1:** Refactor ML startup sequence to prevent blocking `pytest`.
- **P2:** Implement real route constraints instead of hash-based multipliers.

---
**Summary of Execution Order:**
- **Top Blockers:** Pytest hangs, legacy code deployment ambiguity, Playwright test failures.
- **Top Strengths:** Clean FastAPI architecture, modern Next.js setup.
- **Top Opportunities:** Real port constraints, scientifically defensible ML validation.
