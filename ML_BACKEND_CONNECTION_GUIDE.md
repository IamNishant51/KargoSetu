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