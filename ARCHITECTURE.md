# KargoSetu System Architecture

This document provides a comprehensive overview of the KargoSetu system architecture, highlighting our hyper-optimized data flow, rendering strategies, and machine learning pipelines.

## High-Level Architecture Diagram

The following Mermaid flowchart illustrates the precise interaction between the frontend client, the backend API, the database, and the ML prediction engine. We have integrated industry-leading optimizations including Next.js React Compiler, Gunicorn ASGI deployment, and ONNX Runtime for blistering fast inference.

```mermaid
graph TD
    %% Define the Frontend Client Layer
    subgraph Frontend [Frontend Client - Next.js 15]
        UI[Next.js App Router UI]
        RC[React Compiler Optimized Components]
        a11y[Accessibility Context / Radix UI]
        TQ[TanStack React Query]
    end

    %% Define the Server Layer
    subgraph Backend [Backend API - FastAPI + Gunicorn]
        WSGI[Gunicorn Process Manager & Uvicorn Workers]
        API[FastAPI Router]
        JSON[ORJSON Fast Serialization]
        Math[Maritime Physics Engine]
    end

    %% Define Machine Learning Layer
    subgraph MachineLearning [ML Prediction Engine]
        ONNX[ONNX Runtime / Inference Engine]
        Models[Quantile Regression & LSTM Models]
    end

    %% Define Database Layer
    subgraph Database [Persistence & Data Layer]
        Prisma[Prisma ORM Client]
        PG[(PostgreSQL Database)]
    end

    %% Define Infrastructure
    subgraph Infra [Deployment Infrastructure]
        Docker[Multi-stage Docker Containers]
    end

    %% External
    subgraph External [External Integrations]
        YF[Financial Data & Metrics]
        Meteo[Tide & Weather Data]
    end

    %% Wiring the Frontend
    UI --> RC
    RC --> a11y
    a11y --> TQ

    %% Frontend to Backend Communication
    TQ <-->|Async JSON Requests| WSGI

    %% Inside Backend
    WSGI --> API
    API --> JSON
    JSON --> Math
    JSON --> ONNX

    %% Backend to ML
    ONNX <--> Models
    Models <--> YF

    %% Backend to Database
    Math <--> Prisma
    Prisma <--> PG
    Math <--> Meteo

    %% Infra Wrapper (Styling only, applying logically)
    Frontend -.-> Docker
    Backend -.-> Docker
    MachineLearning -.-> Docker

    classDef tech fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff;
    class Frontend,Backend,MachineLearning,Database,Infra tech;
```

## Architectural Hyper-Optimizations

Our system is engineered to handle massive logistics data with zero-latency predictions. Key optimizations include:

1. **Frontend**:
    - **React Compiler**: Next.js 15 uses the React Compiler to auto-memoize components, completely eliminating unnecessary re-renders.
    - **Strict ESLint & Accessibility**: Enforced strict linting and WCAG accessibility standards ensure a robust, inclusive, and bug-free user interface.
2. **Backend Engine**:
    - **FastAPI with Gunicorn**: We leverage Gunicorn with Uvicorn worker classes to handle concurrent incoming requests robustly.
    - **ORJSON**: Replaced standard JSON parsing with `orjson` for the fastest possible API response serialization.
3. **Machine Learning Engine**:
    - **ONNX Runtime**: Transitioned our deep learning models (LSTM/Quantile regression) into ONNX format, executed via the highly optimized ONNX Runtime for bare-metal inference speeds.
4. **DevOps & Infrastructure**:
    - **Multi-stage Docker**: Containerized the entire stack using multi-stage builds to drastically reduce image sizes and minimize the deployment attack surface.
