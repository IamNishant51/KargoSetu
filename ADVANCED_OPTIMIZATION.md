# KargoSetu: Advanced Hyper-Optimization Plan

This document outlines extreme, edge-case micro-optimizations for the KargoSetu platform. These optimizations are targeted at enterprise-scale workloads, focusing on shaving off milliseconds of latency, minimizing memory footprint, and preventing thread blocking.

## 1. Machine Learning Engine (ML Predictor)

### 1.1 Vectorize Python Inference Loops
**Current State:** Inside `app/services/ml_predictor.py` -> `predict_sync`, a Python `for` loop (lines 234-248) calculates P10, P50, and P90 values for 90 days sequentially using scalar math.
**Optimization:** Replace the loop with Numpy vectorized operations.
```python
p50_trajectory = np.array([self._denormalize_bdry(p) for p in prediction])
days = np.arange(1, OUTLOOK_DAYS + 1)
time_scaled_volatility = self.historical_volatility * np.sqrt(days)
variance_pct = time_scaled_volatility * shock_multiplier

p10 = np.maximum(0, p50_trajectory * (1 - variance_pct * 1.28)).round(2)
p90 = (p50_trajectory * (1 + variance_pct * 1.28)).round(2)
```
**Impact:** Eliminates Python interpreter overhead during critical inference paths, resulting in ~10-50x faster execution per API call.

### 1.2 ONNX Runtime Export & Quantization
**Current State:** Model inference runs directly via `self.cached_model(input_tensor).numpy()`, bringing the entire TensorFlow/Keras graph overhead into the response latency.
**Optimization:**
1. Export the trained Keras model to ONNX format (`.onnx`).
2. Implement Dynamic Quantization (FP16 to INT8) on the ONNX graph.
3. Replace TensorFlow in the inference environment with `onnxruntime` (`InferenceSession`).
**Impact:** ~3-5x faster CPU inference latency and an 80%+ reduction in RAM utilization.

### 1.3 Hyperparameter & Early Stopping Tuning
**Current State:** Flat `Adam(learning_rate=0.001)` and `patience=2` for 5 epochs.
**Optimization:**
- Implement `ReduceLROnPlateau` or `CosineAnnealing` callbacks for adaptive convergence.
- Increase training epochs to `50-100` and `patience=10-15` to avoid halting at local minima.

---

## 2. Backend (FastAPI / Uvicorn)

### 2.1 Multi-Process Gunicorn Workers
**Current State:** `Dockerfile` executes `uvicorn app.main:app --host 0.0.0.0 --port 7860`. This runs FastAPI on a single process.
**Optimization:** Switch to Gunicorn acting as a process manager utilizing Uvicorn workers.
```dockerfile
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "app.main:app", "--bind", "0.0.0.0:7860", "--workers", "4"]
```
**Impact:** Maximizes CPU core utilization, drastically improving concurrent request handling.

### 2.2 ORJSON Serialization
**Current State:** FastAPI defaults to the standard Python JSON encoder (`JSONResponse`).
**Optimization:** Implement `ORJSONResponse` across all API routers.
```python
from fastapi.responses import ORJSONResponse
router = APIRouter(..., default_response_class=ORJSONResponse)
```
**Impact:** ORJSON is implemented in Rust. It serialize complex dictionaries and large time-series arrays (forecast outputs) 2-3x faster than the standard library.

### 2.3 GZip / Brotli Compression Middleware
**Current State:** No response compression is configured in `main.py`.
**Optimization:** Wrap the FastAPI app with `GZipMiddleware` or `BrotliMiddleware`.
```python
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
```
**Impact:** Time-series arrays (prices, dates) compress exceptionally well, reducing network egress payloads by up to ~80%.

### 2.4 Prisma Connection Pooling Limits
**Optimization:** Append explicit connection pooling flags to the `DATABASE_URL` in production (e.g., `?connection_limit=50&pool_timeout=10`) to match the new Gunicorn worker concurrency limits, preventing DB starvation.

---

## 3. Frontend (Next.js / React)

### 3.1 Debounce React-Query API Calls
**Current State:** In `ForecastPriceChart.tsx`, `useQuery` is bound directly to `shockMultiplier`. Dragging the slider fires API requests on every intermediate tick, creating a self-DDoS.
**Optimization:**
- Wrap `setShockMultiplier` or the query key in a `useDebounce` hook (e.g., 300ms).
- Add `placeholderData: (prev) => prev` in the `useQuery` config to prevent layout shifting and "loading spinners" while adjusting the slider.
**Impact:** Smoother 60 FPS UI experience, zero UI thread blocking, and massive reduction in unnecessary API calls.

### 3.2 Enable React Compiler (Next.js 15)
**Current State:** Standard Next.js build.
**Optimization:** Add the experimental React Compiler to `next.config.ts`.
```typescript
const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true
  }
}
```
**Impact:** Automatically memoizes components, eliminating the need for manual `React.memo`, `useMemo`, and `useCallback`, ensuring buttery-smooth renders across complex dashboards.

### 3.3 Next/Image for Static Assets
**Current State:** Standard `<img>` tags point to `public/` PNG assets.
**Optimization:** Replace with `next/image` (`import Image from 'next/image'`) to force automatic conversion to WebP/AVIF formats, lazy-loading below-the-fold content, and generating responsive `srcset` sizes. Add `images: { formats: ['image/avif', 'image/webp'] }` to `next.config.ts`.
**Impact:** Substantial decrease in Largest Contentful Paint (LCP) times for the Landing Page.
