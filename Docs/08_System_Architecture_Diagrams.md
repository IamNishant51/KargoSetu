# MODULE 8: SYSTEM ARCHITECTURE & FLOWCHARTS

This document contains Mermaid diagrams visualizing the end-to-end architecture, user workflows, and data pipelines for KargoSetu. 

## 8.1 High-Level System Architecture

```mermaid
graph TD
    subgraph Client Layer Next.js 15
        UI[Executive Command Center]
        Sim[What-If Market Shock Slider]
        Map[MapLibre GL / OpenSeaMap GIS]
    end

    subgraph API Gateway Node.js & Express
        Router[API Router & Data Cache]
    end

    subgraph Core Engines
        Solver[Constraint Solver & Maritime Hydrodynamics]
        MLEngine[TensorFlow.js LSTM Predictor P10/P50/P90]
        ESG[IMO Scope 3 Carbon Calculator]
    end

    subgraph 100% Free Data Pipeline
        YF[Yahoo Finance / node-fetch BDRY]
        OM[Open-Meteo Marine API]
        WPI[NGA World Port Index GeoJSON]
        SR[Searoute Offline Engine]
    end

    UI <--> Router
    Sim <--> Router
    Map <--> Router

    Router <--> Solver
    Router <--> MLEngine
    Router <--> ESG

    MLEngine <--> YF
    Solver <--> OM
    Solver <--> WPI
    Solver <--> SR
```


## 8.2 Sequence Diagram: Charter Requisition Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User as Logistics Officer
    participant UI as Next.js Frontend
    participant API as Express Backend
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
    A[Raw Data Sources] -->|node-fetch / APIs| B(Data Ingestion Layer)
    B --> C{Feature Engineering}
    C -->|Lagged Returns| D[TensorFlow.js LSTM Model]
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

## 8.4 Constraint Solver Algorithm Flowchart

```mermaid
flowchart TD
    A[Cargo Request: Volume, Commodity, Port, Laycan] --> B{Fetch Port Bathymetry & Density}
    B --> C[Calculate Water Sinkage & Hydrodynamic Squat]
    C --> D[Compute Dynamic UKC Clearance]
    D --> E{Is UKC >= 1.0m Safety Margin?}
    E -->|Yes| F[Check Berth LOA & Beam Limits]
    F -->|Pass| G[Approve Direct Single Vessel Fixture]
    E -->|No / Rejected| H[Initiate Cargo Splitting Engine]
    F -->|Fail| H
    H --> I[Calculate Optimal Vessel Combo e.g. 3x Supramax]
    I --> J[Evaluate ESG Carbon & Demurrage Risk]
    J --> K[Return Recommendations & Strategy Envelope]
    G --> K
```
