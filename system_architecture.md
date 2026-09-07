# KargoSetu System Architecture

This document contains the system architecture diagrams for the KargoSetu platform (SIH26006). These diagrams are written in Mermaid.js syntax and can be directly rendered in GitHub, Notion, or exported as images for PowerPoint presentations.

## 1. High-Level Infrastructure & Deployment

This diagram illustrates the split architecture, separating the interactive UI layer from the heavy compute required by the Maritime Math Engine and ML models.

```mermaid
graph TD
    subgraph Client ["Client Layer"]
        Browser["Web Browser / User"]
    end

    subgraph Frontend ["Frontend (Deployed on Vercel)"]
        Next["Next.js 15 (React 19)"]
        State["Zustand (State Management)"]
        Fetch["TanStack Query (Data Fetching)"]
        Next --> State
        Next --> Fetch
    end

    subgraph Backend ["Backend (Deployed on Hugging Face Spaces Docker)"]
        API["FastAPI (Python)"]
        Math["Maritime Math Engine\n(FWA, Squat, UKC)"]
        ML["ML Predictor\n(PyTorch / TensorFlow)"]
        API --> Math
        API --> ML
    end

    subgraph Data ["Data Layer"]
        ORM["Prisma Client Python"]
        DB[(PostgreSQL)]
        ORM --> DB
    end

    Browser -->|HTTPS| Next
    Fetch -->|REST API| API
    API -->|Queries| ORM
```

## 2. Constraint Solver & Cargo Splitting Flow

This sequence diagram details the interaction between the frontend, backend, and database when calculating whether a vessel can safely berth given tidal constraints and required cargo splitting.

```mermaid
sequenceDiagram
    participant UI as Next.js Dashboard
    participant API as FastAPI Router
    participant DB as PostgreSQL (via Prisma)
    participant Engine as Maritime Math Engine

    UI->>API: POST /api/v1/requisitions/evaluate
    Note over UI,API: Payload: Volume MT, Destination, Commodity
    
    API->>DB: Query Destination Port Data
    DB-->>API: Return permissibleDraft, lat, lon
    
    API->>DB: Query Available Vessel Types
    DB-->>API: Return Vessel capacities, laden_draft
    
    API->>Engine: Process constraints (FWA, UKC, Squat)
    Engine-->>API: Safe Draft & Cargo Split Strategy
    
    API-->>UI: Return {feasible, strategy, calculatedDraft, portMaxDraft}
    Note over UI: Renders ConstraintSolverCard
```

## 3. Predictive ML Freight Engine

This flowchart explains how market shock multipliers (like geopolitical events or fuel hikes) are fed into the system to generate P10/P50/P90 probability forecasts.

```mermaid
graph LR
    Input["Shock Multiplier Slider\n(Zustand State)"] -->|Query Param| API["GET /api/v1/forecast/rates"]
    
    subgraph Python Compute
        API --> Model["LSTM Model Inference\n(Pre-trained Weights)"]
        Model --> Process["Apply Shock Multipliers"]
        Process --> Array["Generate Confidence Intervals\n(P10, P50, P90)"]
    end
    
    Array -->|JSON Array| UI["ForecastPriceChart\n(Recharts / ECharts)"]
```
