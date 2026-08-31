# MODULE 8: SYSTEM ARCHITECTURE & FLOWCHARTS

This document contains Mermaid diagrams visualizing the end-to-end architecture, user workflows, and data pipelines for KargoSetu. 

## 8.1 High-Level System Architecture

```mermaid
graph TD
    %% User Interfaces
    Client[Web Client: Next.js 15 / Zustand / ECharts]
    
    %% API Gateway / Routing
    Gateway[FastAPI REST Gateway]
    
    %% Microservices / Modules
    Solver[Deterministic Constraint Solver]
    ML[ML Forecasting Engine: XGBoost]
    
    %% Databases & External
    Postgres[(PostgreSQL + PostGIS)]
    Redis[(Redis Cache / Celery)]
    External[External APIs: yfinance, World Bank]
    
    %% Connections
    Client <-->|REST / JSON| Gateway
    Gateway <--> Solver
    Gateway <--> ML
    Solver <--> Postgres
    ML <--> Redis
    ML <--> Postgres
    ML <-->|Fetch Market Data| External
    
    classDef frontend fill:#080E1E,stroke:#00E5FF,stroke-width:2px,color:#fff;
    classDef backend fill:#101A30,stroke:#10B981,stroke-width:2px,color:#fff;
    classDef db fill:#26385C,stroke:#F59E0B,stroke-width:2px,color:#fff;
    
    class Client frontend;
    class Gateway,Solver,ML backend;
    class Postgres,Redis db;
```

## 8.2 Sequence Diagram: Charter Requisition Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User as Logistics Officer
    participant UI as Next.js Frontend
    participant API as FastAPI Backend
    participant DB as PostgreSQL (PostGIS)
    
    User->>UI: Input Cargo (Volume, Origin, Dest, Dates)
    UI->>API: POST /api/v1/requisitions/evaluate
    API->>DB: Query Port Constraints & Tidal Data
    DB-->>API: Return Permissible Draft, UKC, Max LOA
    API->>API: Calculate Arrival Drafts
    
    alt Vessel Fits Directly
        API-->>UI: Recommend Single Vessel Class (e.g., Capesize)
    else Draft Rejected
        API->>API: Run Cargo Splitting Algorithm
        API-->>UI: Recommend Split Strategy (e.g., 3x Supramax)
    end
    
    UI-->>User: Display Constraint Feedback Card
```

## 8.3 Flowchart: Machine Learning Predictive Pipeline

```mermaid
flowchart LR
    A[Raw Data Sources] -->|yfinance / APIs| B(Data Ingestion Layer)
    B --> C{Feature Engineering}
    C -->|Lagged Returns| D[XGBoost Quantile Model]
    C -->|Rolling Volatility| D
    C -->|EMA Crosses| D
    D --> E[P10: Optimistic Bound]
    D --> F[P50: Median Forecast]
    D --> G[P90: Pessimistic Bound]
    
    E --> H((Optimal Booking <br> Window API))
    F --> H
    G --> H
    
    style A fill:#26385C,stroke:#00E5FF,color:#fff
    style D fill:#101A30,stroke:#10B981,color:#fff
    style H fill:#080E1E,stroke:#F59E0B,color:#fff
```

## 8.4 Decision Tree: Port Constraint Solver

```mermaid
flowchart TD
    Start([New Cargo Requisition]) --> DraftCheck{Is Arrival Draft <= Port Max - UKC?}
    
    DraftCheck -->|Yes| DimensionCheck{LOA & Beam <= Berth Max?}
    DraftCheck -->|No| TidalCheck{Does High Tide provide clearance?}
    
    TidalCheck -->|Yes| ScheduleTide[Schedule Entry during Tidal Window]
    TidalCheck -->|No| SplitCargo[Initiate Cargo Splitting Algorithm]
    
    DimensionCheck -->|Yes| Assign[Assign Direct Vessel Fixture]
    DimensionCheck -->|No| SplitCargo
    
    SplitCargo --> Transshipment{Is Transshipment cheaper than splitting?}
    Transshipment -->|Yes| AssignLighterage[Assign Offshore Lighterage / Sandheads]
    Transshipment -->|No| AssignMultiple[Assign Multiple Smaller Vessels]
```
