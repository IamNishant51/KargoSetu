<!-- PROJECT SHIELDS -->
<div align="center">
  <a href="#"><img src="https://img.shields.io/badge/Contributors-Team_KargoSetu-blue?style=for-the-badge" alt="Contributors"></a>
  <a href="#"><img src="https://img.shields.io/badge/Forks-0-green?style=for-the-badge" alt="Forks"></a>
  <a href="#"><img src="https://img.shields.io/badge/Stars-0-yellow?style=for-the-badge" alt="Stars"></a>
  <a href="#"><img src="https://img.shields.io/badge/Issues-0-red?style=for-the-badge" alt="Issues"></a>
  <a href="#"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License"></a>
</div>

<!-- PROJECT LOGO & HEADER -->
<br />
<div align="center">
  <img src="assets/KargoSetu-LOGO.png" alt="KargoSetu Logo" width="350" />

  <h2 align="center">Intelligent Freight Forecasting & Bulk Cargo Procurement</h2>

  <p align="center">
    <strong>Official Submission for Smart India Hackathon (SIH) 2026</strong>
    <br />
    <br />
    <a href="MIGRATION_PLAN.md"><strong>Explore the Backend Migration Plan »</strong></a>
    <br />
    <br />
    <a href="#">View Live Demo</a>
    ·
    <a href="#">Watch Pitch Video</a>
    ·
    <a href="DEVELOPER_GUIDE.md">Read Developer Guide</a>
  </p>
</div>

<hr />

## SYSTEM OVERVIEW: SIH 26006

<details>
  <summary><strong>Click to expand Problem Statement Details</strong></summary>

| Category | Details |
| :--- | :--- |
| **Problem Statement ID** | `SIH26006` |
| **Problem Title** | Intelligent Freight Forecasting & Bulk Cargo Procurement Platform for East Coast of India |
| **Target Organization** | Ministry of Steel (SAIL) |
| **Hackathon Theme** | Smart Automation & Logistics |

> **Core Objective:** Eradicate the financial inefficiency of single spot contract dependency. KargoSetu enables highly predictive Short/Medium-Term Contracts of Affreightment (CoA) paired with dual-ended port constraint optimization, maximizing fleet ROI and minimizing idle losses for the Ministry of Steel.
</details>

<hr />

## SYSTEM ARCHITECTURE & DATA FLOW

The KargoSetu platform is powered by a hyper-optimized architecture. We utilize **Next.js 15 with the React Compiler** for zero-overhead frontend rendering, and a **FastAPI backend managed by Gunicorn** leveraging **ORJSON** for lightning-fast serialization. Machine learning inference is accelerated via **ONNX Runtime**, and the entire stack is securely containerized using **multi-stage Docker builds**.

For a comprehensive structural breakdown, please see our [Architecture Documentation](ARCHITECTURE.md).

```mermaid
graph TD
    %% Define Client Layer
    subgraph Client [Frontend UI - Next.js 15]
        UI[Executive Dashboard]
        Charts[ECharts Data Viz]
        TQ[TanStack React Query]
    end

    %% Define Server Layer
    subgraph Backend [Backend API - Python / FastAPI]
        WSGI[Gunicorn + Uvicorn Workers]
        API[FastAPI Router & ORJSON]
        Math[Maritime Physics Engine]
        ML[ONNX Runtime Predictor]
        Auth[Pydantic Validation Layer]
    end

    %% Define Data & External Layers
    subgraph Database [Persistence Layer]
        PG[(PostgreSQL)]
        Prisma[Prisma Client Python]
    end

    subgraph External [External APIs]
        YF[Yahoo Finance / FRED API]
        Meteo[Open-Meteo Marine Tide]
    end

    %% Connections
    UI <-->|JSON payload via TanStack Query| API
    Charts -.-> UI
    TQ -.-> UI

    API --> Auth
    Auth --> Math
    Auth --> ML

    Math <-->|Fetch Bathymetry| Prisma
    Prisma <--> PG
    Math <-->|Async Tide Data via httpx| Meteo

    ML <-->|Ingest Market Data| YF
```

<hr />

## CORE CAPABILITIES & BUSINESS IMPACT

### 1. Optimal Market Entry Timing & Quantile Forecasting (ONNX Runtime)
*   **Mechanism:** Multi-horizon Quantile Regression models trained in TensorFlow/Keras and exported to ONNX. Inference is executed in C++ on the backend via ONNX Runtime for ultra-low latency predictions of 30, 60, and 90-day freight rate curves.
*   **Impact:** Automatically detects 12.5% rate dip windows, alerting executives to trigger optimal CoA contract bookings.

### 2. Dual-Ended Port Infrastructure & Vessel Type Optimization
*   **Mechanism:** Analyzes Draft, LOA, Beam, and Daily Handling Rates at both origin (e.g., Newcastle) and destination (e.g., Haldia). Handled via asynchronous DB transactions.
*   **Impact:** Auto-recommends Capesize, Panamax, Supramax, or calculates optimal offshore lighterage and cargo splitting thresholds.

<hr />

## TECHNOLOGY STACK

**Frontend Environment**<br/>
![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TanStack Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Compiler](https://img.shields.io/badge/React_Compiler-000000?style=for-the-badge&logo=react&logoColor=61DAFB)
![Accessibility](https://img.shields.io/badge/a11y_Optimized-4B32C3?style=for-the-badge&logo=w3c&logoColor=white)
![ESLint](https://img.shields.io/badge/Strict_ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
**Backend & Physics Engine**<br/>
![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_Python-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Gunicorn](https://img.shields.io/badge/Gunicorn-499848?style=for-the-badge&logo=gunicorn&logoColor=white)
![ORJSON](https://img.shields.io/badge/ORJSON-316192?style=for-the-badge&logo=json&logoColor=white)
![Docker](https://img.shields.io/badge/Multi--stage_Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
**Machine Learning & Intelligence**<br/>
![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)
![ONNX Runtime](https://img.shields.io/badge/ONNX_Runtime-005CED?style=for-the-badge&logo=onnx&logoColor=white)
<hr />

## LOCAL DEVELOPMENT SETUP

Follow these instructions to run the enterprise platform locally.

<details open>
  <summary><strong>1. Initialize the Python Backend Services</strong></summary>
  <br/>

  The backend is built with FastAPI and runs on Python 3.11+.

  ```bash
  # Navigate to the backend directory
  cd backend

  # Install required Python dependencies
  pip install -r requirements.txt

  # Setup Prisma Database Connection
  # Ensure a .env file is present with the DATABASE_URL string
  prisma generate

  # Boot the FastAPI Server via Gunicorn
  gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:7860
  ```
  *The backend API will be live at `http://localhost:7860`*
</details>

<details>
  <summary><strong>2. Initialize the Next.js Frontend Application</strong></summary>
  <br/>

  ```bash
  # Open a secondary terminal instance
  cd frontend

  # Install Node dependencies
  npm install

  # Boot the Next.js development server
  npm run dev
  ```
  *Access the Executive Command Center at `http://localhost:3000`*
</details>

<hr />

## ENTERPRISE SECURITY & OPTIMIZATIONS
This system is engineered to enterprise logistics standards:
* **Multi-stage Docker Builds:** Ensures minimal image sizes and a hardened attack surface for production deployments.
* **High-Performance Serialization:** Uses `orjson` in FastAPI for the fastest JSON serialization available in Python.
* **Payload Validation:** Strict `Pydantic` schemas enforced on all Server parameters.
* **ML Sandboxing & ONNX:** Dedicated asynchronous `asyncio.to_thread()` implementations run highly optimized ONNX inference, preventing I/O blocking during high-load LSTM prediction sequences.
* **Database Pooling:** `prisma.connect()` and `disconnect()` managed via FastAPI Lifespan Hooks to prevent zombie connections.

<hr />

## PROJECT CONTRIBUTORS
* **Nishant** - Full Stack Architect & ML Lead
* *(Additional team members to be added)*

<br/>
<div align="center">
  <p>Engineered for the Smart India Hackathon 2026</p>
</div>
