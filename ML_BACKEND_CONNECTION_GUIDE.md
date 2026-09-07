# KargoSetu: Backend & ML Connection Guide

## Overview
This guide defines the precise contracts, architecture, and deployment constraints for the **KargoSetu** (SIH26006) backend. Any AI Agent or team member working on this repository MUST abide by these rules.

## 1. Machine Learning Engine (`backend/services/mlPredictor.js`)
The ML model predicts the **Baltic Dry Index (BDRY)** using a highly optimized **CNN-LSTM Hybrid** network powered by `@tensorflow/tfjs-node`.

### How it Works (DSA & ML Optimizations):
- **Real API Data:** It fetches 5 years of multivariate financial data (`BDRY`, `^GSPC` (S&P 500), `CL=F` (Crude Oil)) via the `yahoo-finance2` API. No mock data is used.
- **Memory Optimized Tensors:** We avoid V8 array garbage collection overhead by compiling the entire dataset into flat `Float32Array` buffers. These are passed directly into `tf.tensor3d()`.
- **O(N) Preprocessing:** Time series alignment uses raw timestamp hashing (`Math.floor(date.getTime() / 86400000)`) instead of slow string manipulation. Feature bounds calculation and Technical Indicators (RSI, SMA) are strictly single-pass O(N).
- **Direct Multi-step Forecasting:** We use a 90-neuron Dense output layer to predict the entire 90-day trajectory at once, avoiding autoregressive drift.
- **Inference Wrapper:** `tf.tidy()` strictly manages memory during the API request cycle.

### Exposing to the Frontend:
- **Endpoint:** `GET /api/v1/forecast/rates?shockMultiplier=1.0`
- **Output:**
```json
[
  { "date": "2026-09-03", "p10": 1350.2, "p50": 1420.5, "p90": 1490.8 },
  ...
]
```
*(The frontend accesses this via React Query or Zustand).*

---

## 2. Maritime Constraint Solver (`backend/services/maritimeMath.js`)
Computes deep-water physics limitations.

### Core Formulas Implemented:
- **Fresh Water Allowance (FWA):** Adjusts vessel draft based on port brackish density.
- **Hydrodynamic Squat Effect:** Calculates the draft increase due to vessel speed in shallow fairways.
- **Dynamic Under Keel Clearance (UKC):** Safely prevents vessel grounding.

### Exposing to the Frontend:
- **Endpoint:** `POST /api/v1/requisitions/evaluate`
- **Body:** `{ "volume_mt": 150000, "dest_port_name": "Haldia", "commodity": "Coal" }`
- **Output:** Optimal split strategy (e.g., "Split Cargo into 3x Supramax") factoring in PostgreSQL `Port.permissibleDraft`.

---

## 3. PostgreSQL Database (Prisma)
The backend requires a PostgreSQL database to hold `Port` metadata (charted depth, permissible draft, lat/lon).

**See below for DB Setup Instructions.**

## 4. CI/CD & Deployment Constraints
- **NO Serverless for Backend:** Because TensorFlow requires native C++ bindings, the backend MUST be deployed via Docker (e.g., Hugging Face Spaces, Render, DigitalOcean). Vercel is strictly for the Frontend.
- **Dependencies:** Always run `npm install` and commit `package-lock.json` if dependencies change to prevent pipeline crashes.
- **JavaScript:** Pure JS CommonJS only. Do not use TypeScript in the backend folder.


---

### Potential Judge Questions

As an expert technical judge evaluating the **KargoSetu** project for the Smart India Hackathon, here are 10 thoughtful and probing questions based directly on your provided backend and ML documentation:

1. **Node.js vs. Python for ML Workloads:** You are using `@tensorflow/tfjs-node` for a complex CNN-LSTM model, which forces you to use Docker deployment due to native C++ bindings. Why did you choose to tightly couple heavy ML inference inside your Node.js backend rather than decoupling it into a dedicated Python microservice, which would offer a much richer data science ecosystem?
2. **Handling Missing Trading Days:** Your O(N) preprocessing aligns time series data using a timestamp hashing mechanism (`Math.floor(date.getTime() / 86400000)`). How exactly does this single-pass hashing algorithm handle the missing data gaps inherently present in the `yahoo-finance2` API (e.g., market closures on weekends and holidays for the S&P 500 and Crude Oil)?
3. **Node.js Event Loop Blocking:** You are fetching 5 years of API data and running neural network inference directly within the API request cycle for `GET /api/v1/forecast/rates`. Given Node's single-threaded nature, how do you ensure that these CPU-heavy tensor operations do not block the event loop and degrade the response times of your other endpoints?
4. **Generating Probabilistic Bounds:** Your endpoint output provides probabilistic confidence bounds (`p10`, `p50`, `p90`), yet your stated architecture is a standard CNN-LSTM ending in a 90-neuron Dense output layer. What specific technique (e.g., Quantile Regression, Monte Carlo Dropout) are you employing to extract these percentiles from the Dense layer?
5. **Direct Multi-step Forecasting & Market Shocks:** Predicting an entire 90-day trajectory at once via a 90-neuron layer successfully avoids autoregressive drift, but it can be rigid. How does this architecture handle sudden market anomalies, and mathematically, how does the `shockMultiplier=1.0` query parameter interact with the model's tensor output to simulate these shocks?
6. **Dynamic Physics vs. Static Database:** Your Maritime Constraint Solver calculates dynamic variables like Hydrodynamic Squat and Under Keel Clearance (UKC). Because your PostgreSQL database is only holding static `Port` metadata (charted depth, permissible draft), how are you factoring in the real-time variables required for these physics formulas, such as current vessel speed, tidal changes, or local water density for the Fresh Water Allowance?
7. **Cargo Split Optimization Algorithm:** The requisition endpoint takes a bulk cargo volume (e.g., 150,000 MT) and outputs an optimal split strategy (e.g., "3x Supramax"). What specific mathematical or algorithmic approach (e.g., Knapsack algorithm, Linear Programming) are you using to determine this exact split while ensuring no vessel exceeds the `permissibleDraft` of the destination port?
8. **Sacrificing Type Safety:** The documentation explicitly forbids TypeScript in the backend, mandating pure JS CommonJS. Given the extreme complexity of 3D tensor shapes, multi-variable maritime physics formulas, and Prisma database interactions, why did your team decide to sacrifice the compile-time bug prevention and type safety that TypeScript provides?
9. **Tensor Memory Management:** You highlight memory optimization by compiling the entire dataset into flat `Float32Array` buffers to bypass V8 garbage collection overhead before passing them to `tf.tensor3d()`. How do you safely manage the interleaving and stride alignment of your three different multivariate features (BDRY, S&P 500, Crude Oil) within a single flat buffer to ensure the CNN receives correctly shaped data?
10. **Single-Pass Window Calculations:** You state that feature bounds and Technical Indicators (RSI, SMA) are calculated in a "strictly single-pass O(N)" manner. Since metrics like SMA and RSI inherently require lookback windows (e.g., 14 days), how are you accurately calculating these in a true single forward pass without buffering or recalculating historical states?
