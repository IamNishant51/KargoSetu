# Comprehensive Python Backend Migration Plan for AI Agents

## Overview
This document serves as the strictly enforced blueprint for migrating the KargoSetu backend from Node.js (Express + TensorFlow.js) to Python (FastAPI + TensorFlow/PyTorch).

### Why Python?
Python's native ecosystem (Pandas, NumPy, TensorFlow/PyTorch) natively handles multi-dimensional array operations in C, bypassing Node.js's V8 garbage collection overhead and single-threaded event loop limitations. It provides a robust, enterprise-grade environment suitable for heavy ML inference and financial time-series analysis, perfectly aligning with the Hugging Face Spaces deployment target.

---

## 1. Technology Stack Translation Mapping
To prevent hallucination, agents MUST use these exact libraries:
*   **Web Framework:** `Express.js` → `FastAPI` (Provides automatic OpenAPI docs and async support).
*   **Web Server:** `Node` → `Uvicorn` (ASGI server).
*   **Validation:** `Zod` → `Pydantic` (Native to FastAPI).
*   **Database ORM:** `Prisma (JS)` → `Prisma Client Python` (Allows keeping the exact `schema.prisma` file untouched as mandated by `AGENTS.md`).
*   **Machine Learning:** `@tensorflow/tfjs-node` → `tensorflow` (Keras API for 1:1 translation of the CNN-LSTM model) OR `torch` (PyTorch).
*   **Financial Data:** `yahoo-finance2` → `yfinance`.
*   **Math/Data Handling:** Manual `Float32Array` loops → `pandas` and `numpy`.
*   **HTTP Client (for Open-Meteo):** `fetch()` → `httpx` (async).

## 1.5 Frontend-Backend Connection Architecture
To ensure a seamless connection between the Next.js frontend and the FastAPI backend, implement the following:
1.  **CORS & Environment Variables:**
    *   FastAPI MUST configure `CORSMiddleware` to strictly allow origins defined in `process.env.FRONTEND_URL` (e.g., `https://kargosetu.vercel.app`, `http://localhost:3000`).
    *   Next.js MUST define `NEXT_PUBLIC_API_URL` pointing to the Hugging Face Space URL.
2.  **TanStack Query Integration:**
    *   The frontend uses TanStack Query (`@tanstack/react-query`). The backend must return HTTP 400/500 errors with standard JSON `{ "detail": "error message" }` so TanStack Query's `onError` handlers trigger correctly.
    *   Use `useQuery` for `GET /api/v1/forecast/rates` (cache data for 24h as freight rates update daily).
    *   Use `useMutation` for `POST /api/v1/requisitions/evaluate` (do not cache, as port constraints might change).
3.  **Strictly Typed API Contracts:** The Pydantic schemas in FastAPI (e.g., `RequisitionEvaluateRequest`, `ForecastResponse`) MUST mirror the TypeScript interfaces in Next.js 1:1. Do not rename keys.

---

## 2. Directory Structure Blueprint
Agents must scaffold the Python backend with the following exact structure:

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application instance (replaces index.js)
│   ├── core/
│   │   ├── config.py           # Pydantic BaseSettings for env vars
│   │   └── exceptions.py       # Global error handlers
│   ├── api/
│   │   ├── dependencies.py     # Prisma DB connection yields
│   │   ├── routers/            # Replaces routes/ folder
│   │   │   ├── health.py
│   │   │   ├── requisitions.py
│   │   │   ├── forecast.py
│   │   │   ├── market.py
│   │   │   ├── ports.py
│   │   │   └── commodities.py
│   ├── services/               # Replaces services/ folder
│   │   ├── maritime_math.py    # Math & constraint solver logic
│   │   └── ml_predictor.py     # TF/Keras ML logic & yfinance
│   ├── schemas/                # Pydantic models (replaces Zod schemas)
│   │   ├── requisition.py
│   │   └── forecast.py
├── prisma/
│   └── schema.prisma           # EXACT SAME FILE FROM NODE.JS
├── .env
├── requirements.txt
└── Dockerfile                  # Updated for Python/FastAPI on Hugging Face
```

---

## 3. Phase-by-Phase Execution Plan

### Phase 1: Foundation & Database
1.  **Initialize Python Project:** Create `requirements.txt` containing `fastapi`, `uvicorn`, `prisma`, `pydantic`, `yfinance`, `pandas`, `numpy`, `tensorflow`, `httpx`.
2.  **Prisma Setup:**
    *   Retain `backend/prisma/schema.prisma`.
    *   Change the generator to:
        ```prisma
        generator client {
          provider = "prisma-client-py"
          interface = "asyncio"
        }
        ```
    *   Run `prisma generate` to build the Python client.
3.  **Database Connection Pooling & Async Lifecycle:**
    *   Use `prisma.connect()` in FastAPI's `@asynccontextmanager` `lifespan` event on application startup, and `prisma.disconnect()` on shutdown to prevent connection leaks.
    *   Ensure all database operations are explicitly awaited (e.g., `await prisma.port.find_unique(...)`).
    *   If using Hugging Face Spaces connecting to an external PostgreSQL DB (like Supabase/Neon), ensure the `DATABASE_URL` uses transaction pooling (e.g., `pgbouncer=true` or Neon's pooling URL) to prevent exhausting DB connections during heavy ML prediction traffic.
4.  **App Entrypoint:** Create `app/main.py`. Initialize FastAPI app, add CORS middleware (allowing frontend URL), and mount routers. Include startup/shutdown events to connect/disconnect the Prisma client.

### Phase 2: Maritime Math & Constraint Solver (`maritime_math.py`)
1.  **Translate Pure Functions:** Translate `calculateBrackishSinkage`, `calculateHydrodynamicSquat`, and `calculateDynamicUKC` maintaining exact math.
2.  **Translate API Calls:** Replace the `fetch` call to `https://marine-api.open-meteo.com...` with an async call using `httpx.AsyncClient()`.
3.  **Translate Logic:** Port the `evaluateRequisition` function.
    *   Query the DB using `await prisma.vessel.find_many()`.
    *   Apply the `CARGO_RESTRICTIONS` and `VESSEL_CLASS_ORDER` dictionaries.
    *   Calculate costs and return the exact JSON structure expected by the frontend (`feasible`, `strategy`, `calculatedDraft`, etc.).
### Phase 3: The ML Predictor Engine (`ml_predictor.py`)
*This is the most critical translation. Agents must utilize highly optimized code, advanced DSA patterns, and integrate multiple free data sources to prevent hallucinations and improve predictive accuracy.*

1.  **Multiple Free Data Sources (Data Fusion):** Stop relying solely on Yahoo Finance. Combine multiple APIs for robust multivariate forecasting:
    *   **yfinance (Yahoo Finance):** Fetch BDRY (Baltic Dry Proxy), ^GSPC (S&P 500), CL=F (Crude Oil).
    *   **FRED API (Federal Reserve Economic Data):** Fetch global macroeconomic indicators (e.g., US Dollar Index, Global GDP Growth estimates). Use the `fredapi` library (free tier).
    *   **World Bank API / DBnomics:** Fetch global trade volume datasets as secondary exogenous variables.
    *   *Implementation:* Use `asyncio.gather` with `httpx` and `yfinance` to fetch all these sources concurrently, minimizing I/O blocking.
2.  **Optimized DSA Patterns & Data Preprocessing:** Replace manual loops with C-optimized vectorized operations to handle thousands of rows instantly:
    *   **Time-Series Alignment (O(N log N)):** Use `pandas.DataFrame.merge()` with `how='outer'` on datetime indexes, then apply `df.ffill().bfill()` to handle missing values instantly, completely replacing the manual `dateMap` iteration.
    *   **Vectorized Indicators (O(N)):** Calculate Technical Indicators (RSI, SMA) using Pandas rolling windows. Example: `df['bdry'].rolling(window=14).mean()`.
    *   **Zero-Copy Sliding Windows (O(1) memory):** Instead of manually pushing sequences into flat arrays, use `numpy.lib.stride_tricks.sliding_window_view`. This creates a sliding window tensor (e.g., shape `[samples, LOOKBACK, features]`) over the 2D data matrix *without allocating new memory*, drastically reducing garbage collection overhead and RAM usage.
    *   **Robust Scaling:** Use `sklearn.preprocessing.RobustScaler` instead of `MinMaxScaler`. Freight markets have extreme outliers (shocks). `RobustScaler` scales based on IQR, preventing extreme shocks from squashing normal variance.
3.  **Model Architecture (TensorFlow/Keras):** Create a 1:1, but highly optimized, mapping of the CNN-LSTM hybrid:
    ```python
    model = Sequential([
        # Spatial feature extraction across indicators
        Conv1D(filters=64, kernel_size=3, activation='relu', input_shape=(60, num_features)),
        # Temporal sequence modeling
        LSTM(units=64, return_sequences=False, recurrent_dropout=0.2),
        Dropout(0.3),
        # Dense layers with L2 regularization to prevent overfitting
        Dense(units=128, activation='relu', kernel_regularizer=l2(0.001)),
        Dropout(0.2),
        # Direct multi-step prediction (OUTLOOK_DAYS) to avoid recursive error accumulation
        Dense(units=90, activation='linear')
    ])
    ```
    *   Compile using `tf.keras.losses.Huber()` loss function to handle volatile freight price spikes gracefully.
4.  **Inference & Caching Strategy:**
    *   Load the compiled `.keras` or `.h5` model into global memory during the FastAPI `lifespan` startup.
    *   Wrap inference in a non-blocking thread using `asyncio.to_thread(model.predict, input_tensor)` to prevent heavy tensor multiplication from blocking FastAPI's async event loop.
    *   Calculate stochastic bounds (p10, p50, p90) using Numpy's vectorized math for speed.

### Phase 4: API Routing & Schemas
1.  **Pydantic Models:** Create `app/schemas/requisition.py` mirroring the input contract:
    ```python
    class RequisitionEvaluateRequest(BaseModel):
        volume_mt: float
        dest_port_name: str
        commodity: str
    ```
2.  **Endpoints:**
    *   `POST /api/v1/requisitions/evaluate`: Validate with Pydantic, call `maritime_math.evaluate_requisition()`.
    *   `GET /api/v1/forecast/rates`: Accept `shockMultiplier` as a query parameter (default 1.0), call `ml_predictor.get_freight_forecast()`.

### Phase 5: Deployment Constraints (Hugging Face)
1.  **Dockerfile:** Create a Dockerfile using a standard Python image (e.g., `python:3.11-slim`).
2.  **Install OS dependencies:** Ensure build essentials are installed if needed by `prisma` or `numpy`.
3.  **Prisma Generation in Docker:** The Dockerfile must explicitly run `prisma generate` during the image build step before starting the Uvicorn server.
4.  **Startup Command:** `CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]` (Hugging Face Spaces default port is 7860).

---
## Strict Anti-Hallucination Directives for Agents:
1.  **DO NOT** change the JSON output signatures of ANY endpoint. The Next.js frontend strictly relies on the current keys (e.g., `calculatedDraft`, `portMaxDraft`, `p10`, `p50`, `p90`).
2.  **DO NOT** modify `schema.prisma` database tables, column names, or relationships.
3.  **DO NOT** use emojis in any code, comments, or documentation, as per the `AGENTS.md` mandate.
4.  **DO NOT** write TypeScript. The Python backend is typed using Python Type Hints (`-> list[dict]`, `str`, etc.).


---

### Potential Judge Questions

Based on the provided `MIGRATION_PLAN.md` excerpt, here are 10 thoughtful, probing questions to ask the team as an expert technical judge:

1. **On Concurrency and Event Loops:** You mentioned moving away from Node.js to bypass its single-threaded event loop limitations. However, standard Python is constrained by the Global Interpreter Lock (GIL), and heavy NumPy/ML operations are CPU-bound. How do you plan to prevent these synchronous, heavy inference tasks from blocking FastAPI's asynchronous event loop (Uvicorn)? 

2. **On Schema Naming Conventions:** Your migration plan strictly mandates that Pydantic schemas in FastAPI must mirror TypeScript interfaces 1:1 without renaming keys. Since Python standard practice dictates `snake_case` while TypeScript heavily utilizes `camelCase`, how are you handling this serialization mismatch in Pydantic without breaking native Python conventions?

3. **On Prisma Client Python Maturity:** You've chosen to use *Prisma Client Python* to keep the exact `schema.prisma` file untouched. Given that the Python implementation of Prisma is historically a community project and far less mature than the official Node.js version, what risks have you identified, and what is your fallback strategy if you encounter missing features or bugs?

4. **On Hugging Face Spaces Deployment:** You are targeting Hugging Face Spaces for your backend deployment. Spaces are typically designed as ephemeral containers for ML demos rather than persistent enterprise web servers. How do you plan to reliably manage your Prisma database connections and environment variables (`process.env`) in this specific hosting environment?

5. **On Model Translation Validity:** The document mentions a "1:1 translation of the CNN-LSTM model" from TensorFlow.js to either Python TensorFlow (Keras) or PyTorch. Have you finalized the decision between TensorFlow and PyTorch, and more importantly, how are you technically verifying that the migrated Python model outputs the exact same inference weights and predictions as the original Node.js model?

6. **On Backend Caching Capabilities:** You mentioned caching the `GET /api/v1/forecast/rates` endpoint for 24 hours on the frontend using TanStack Query. Are you also implementing a caching strategy on the FastAPI backend? If not, how will you prevent redundant, heavy ML inferences and external API calls if multiple different users request the same daily freight rates?

7. **On External Data Reliability:** You are replacing `yahoo-finance2` with `yfinance`. `yfinance` is known to rely on scraping Yahoo Finance's API, which can be brittle and subject to sudden rate limits or schema changes. How is your `exceptions.py` or FastAPI architecture designed to gracefully handle these third-party failures without crashing the application?

8. **On Global Error Handling:** You specified that all 400/500 errors must return a standardized `{ "detail": "error message" }` JSON to correctly trigger TanStack Query's `onError` handlers. How are you designing your `exceptions.py` to catch complex database errors from Prisma or matrix errors from NumPy/Pandas and safely translate them into this simple format without leaking sensitive stack traces?

9. **On CORS and API Security:** You are utilizing FastAPI's `CORSMiddleware` to restrict access to `process.env.FRONTEND_URL`. Since CORS only protects against browser-based requests, how are you securing your Hugging Face Space endpoint to prevent unauthorized server-to-server or cURL requests from burning through your ML compute resources?

10. **On Async HTTP Requests:** You correctly mapped `fetch()` to `httpx` to maintain asynchronous HTTP calls (e.g., for Open-Meteo). Will you be instantiating a new `httpx.AsyncClient()` per request, or do you have a plan to manage a global client session within FastAPI's lifespan to prevent socket exhaustion during high-traffic periods?
