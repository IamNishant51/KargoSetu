<p align="center">
  <img src="assets/KargoSetu-LOGO.png" alt="KargoSetu Logo" width="350" />
</p>

# KargoSetu

[![Project Status: Active](https://www.repostatus.org/badges/latest/active.svg)](#)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)](#)
[![PostgreSQL](https://img.shields.io/badge/PostGIS-Enabled-336791?logo=postgresql)](#)
[![SIH Problem Statement](https://img.shields.io/badge/SIH-26006-080E1E)](#)

**KargoSetu** is an enterprise-grade maritime logistics and predictive vessel chartering platform developed for the Smart India Hackathon (SIH26006). It serves Indian Public Sector Undertakings (PSUs) such as SAIL, RINL, NMDC, and NTPC by transforming overseas dry bulk cargo procurement from a reactive, spot-market dependency into a deterministic, data-driven pipeline.

---

## Executive Summary

Indian steel conglomerates import tens of millions of metric tons of raw materials annually. Traditional procurement strategies rely heavily on volatile spot markets and suffer from severe port mismatch risks. KargoSetu addresses these challenges through a dual-pronged architecture:

1. **Physical Port Constraint Satisfaction:** Eliminates physical grounding risks and demurrage penalties by matching vessel dimensions (Draft, LOA, Beam) against dynamic tidal windows and fairway depths.
2. **Predictive Freight Modeling:** Forecasts forward freight rates utilizing macroeconomic proxy data to recommend optimal market entry windows and contract structures.

---

## System Architecture

KargoSetu utilizes a robust microservices architecture segregated into distinct domains:

*   **Frontend (Command Center):** Built with Next.js 15 (App Router), TypeScript, and Tailwind CSS. State management and data visualization are powered by Zustand, TanStack Query, and Apache ECharts.
*   **Backend (Constraint Solver):** High-performance RESTful APIs built with Python 3.11 and FastAPI. Implements complex maritime physics equations to calculate arrival drafts and cargo splitting heuristics.
*   **Machine Learning Engine:** Multivariate Time-Series Forecasting utilizing XGBoost, Quantile Regression, and Facebook Prophet to generate P10/P50/P90 confidence interval bands for future freight rates.
*   **Database:** PostgreSQL 16 extended with PostGIS for spatial fairway mapping, georeferenced berth coordinates, and historical market data storage.

---

## Documentation Directory

Comprehensive technical specifications, design documents, and API contracts are available in the `Docs/` directory:

| Module | Document | Description |
| :--- | :--- | :--- |
| **01** | [PRD & User Personas](Docs/01_PRD_User_Personas.md) | ROI metrics, functional requirements, and SLA parameters. |
| **02** | [UI/UX Design System](Docs/02_UI_UX_Design_System.md) | Visual tokens, typography, and core screen layouts. |
| **03** | [Frontend Architecture](Docs/03_Frontend_Architecture.md) | Component blueprints, validation schemas, and ECharts logic. |
| **04** | [Backend Architecture](Docs/04_Backend_Architecture.md) | Mathematical formulations and FastAPI solver implementation. |
| **05** | [Machine Learning](Docs/05_Machine_Learning.md) | Feature engineering pipelines and quantile regression models. |
| **06** | [Database Schemas](Docs/06_Database_Schemas.md) | PostgreSQL Data Definition Language (DDL) and spatial indexes. |
| **07** | [API Specification](Docs/07_API_Specification.md) | JSON request/response contracts for core REST endpoints. |
| **08** | [System Architecture](Docs/08_System_Architecture_Diagrams.md) | Mermaid flowcharts, sequence diagrams, and decision trees. |

---

## Core Capabilities

### 1. Smart Charter Optimizer
Calculates arrival draft via bunker burn approximations and compares it against permissible berth drafts and tidal curves. When single-vessel fixtures are physically impossible, the engine automatically recommends mathematically optimized cargo splitting (e.g., splitting a Capesize cargo into multiple Supramax vessels).

### 2. Market Timing & Rate Dip Analyzer
Ingests the Baltic Dry Index (BDRY), VLSFO bunker rates, and commodity crack spreads to output a 30-, 60-, and 90-day forward projection curve. Identifies optimal booking windows to transition from volatile spot market fixtures to long-term Contracts of Affreightment (CoA).

### 3. Interactive Port Fairway Simulator
Provides dynamic visualizations of approach channels and berths. Calculates exact Under Keel Clearance (UKC) safety margins based on estimated times of arrival (ETAs) and harmonic tidal predictions.

---

## Local Development Setup

**Prerequisites:**
*   Node.js 20.x+
*   Python 3.11+
*   Docker & Docker Compose (for PostgreSQL/PostGIS and Redis)

**Quick Start:**
```bash
# 1. Clone the repository
git clone https://github.com/IamNishant51/KargoSetu.git
cd KargoSetu

# 2. Start Infrastructure (PostgreSQL + Redis)
docker-compose up -d

# 3. Initialize Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 4. Initialize Frontend
cd ../frontend
npm install
npm run dev
```

---

*For detailed contribution guidelines and AI agent context rules, please refer to the `agents.md` file located at the repository root.*