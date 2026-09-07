# MODULE 1: PRODUCT REQUIREMENTS DOCUMENT (PRD) & USER PERSONAS

## 1.1 Executive Summary & Value Proposition
KargoSetu transforms overseas dry bulk cargo procurement for Indian Public Sector Undertakings (SAIL, RINL, NMDC, NTPC) from a reactive, spot-market dependency into a deterministic, predictive pipeline.
**Core ROI Metrics:**
*   **Freight Savings:** 8%–15% reduction in annual freight expenditure via ML-driven market timing.
*   **Demurrage Elimination:** 100% mitigation of physical port mismatch, eliminating grounding risks and saving $15,000–$35,000/day in demurrage penalties.

## 1.2 User Personas & Workflows
*   **Persona A: Central Procurement & Chartering GM (SAIL)**
    *   *Goal:* High-level budget allocation, contract approvals, risk tolerance settings.
    *   *Workflow:* Reviews macro predictive trends; approves transition from spot fixtures to multi-voyage Contracts of Affreightment (CoA) during predicted rate dips.
*   **Persona B: Port Logistics & Marine Operations Officer (Haldia/Paradip)**
    *   *Goal:* Safe, congestion-free vessel berthing and lighterage coordination.
    *   *Workflow:* Operates fairway simulations; tests dynamic tidal drafts against vessel arrival ETAs; coordinates Sandheads transshipment splitting.
*   **Persona C: Supply Chain & Market Intelligence Analyst**
    *   *Goal:* Audit model performance and cross-correlate BDI macro factors.
    *   *Workflow:* Drills into TensorFlow.js feature importances; monitors BDRY, VLSFO, and commodity crack spreads.

## 1.3 Functional & Non-Functional Requirements (FRs & NFRs)
**Functional Requirements:**
*   **FR-01:** Constraint solver must filter fleet candidates by Draft, LOA, Beam, and Tidal Windows.
*   **FR-02:** System must auto-calculate cargo splitting (e.g., 150k MT -> 3x 50k MT Supramax) when single-vessel routing is physically infeasible.
*   **FR-03:** ML engine must ingest BDRY/BDI and output P10/P50/P90 confidence interval forecasts for 30, 60, and 90-day horizons.

**Non-Functional Requirements (SLAs):**
*   **NFR-01 (Latency):** Constraint solver response time <= 150ms.
*   **NFR-02 (Inference):** ML forecast inference latency <= 800ms.
*   **NFR-03 (Reliability):** 99.9% uptime with cross-region failover.
*   **NFR-04 (Compliance):** Data sovereignty enforcement (hosted on MeitY-empanelled domestic cloud).


---

### Potential Judge Questions

Based on the provided Product Requirements Document (PRD) excerpt for KargoSetu, here are 10 probing technical questions to evaluate the team's engineering, architectural choices, and domain logic:

1. **ROI & Bold Claims (Executive Summary):** You claim a "100% mitigation of physical port mismatch" to eliminate demurrage penalties. Maritime logistics are notoriously affected by unpredictable external factors (e.g., extreme weather, sudden port congestion). How exactly does your dynamic tidal draft modeling and fairway simulation account for these real-time anomalies to guarantee *100%* mitigation?
2. **Machine Learning Architecture (Persona C & NFR-02):** The PRD notes that the Market Intelligence Analyst will drill into "TensorFlow.js feature importances." What was the architectural rationale for utilizing TensorFlow.js (typically browser or Node.js bound) for complex time-series forecasting, especially given your strict inference SLA of <= 800ms? 
3. **Algorithmic Trade-offs in Cargo Splitting (FR-02):** When the system auto-calculates cargo splitting (e.g., converting a 150k MT load into three 50k MT Supramax vessels), how does the constraint solver balance the physical necessity of the split against the potentially higher combined freight costs of chartering multiple smaller vessels?
4. **Constraint Solver Performance (FR-01 & NFR-01):** You have mandated a constraint solver response time of <= 150ms while simultaneously cross-filtering fleet candidates by Draft, LOA, Beam, and dynamic Tidal Windows. What specific algorithmic approach or in-memory data indexing strategy are you using to guarantee this sub-150ms latency?
5. **Confidence Intervals & Decision Logic (FR-03 & Persona A):** The ML engine outputs P10/P50/P90 confidence intervals for 30/60/90-day horizons. How does the system mathematically map these statistical probabilities to Persona A's subjective "risk tolerance settings" to recommend a definitive transition from spot fixtures to multi-voyage Contracts of Affreightment (CoA)?
6. **Data Pipeline & Feature Engineering (Persona C & FR-03):** Your ML model ingests BDRY, BDI, VLSFO (bunker fuel), and commodity crack spreads. Given the high volatility and different update frequencies of these macro factors, how does your data pipeline normalize and weight these features to prevent overfitting on the 90-day forecast horizon?
7. **Cloud Infrastructure & Compliance (NFR-03 & NFR-04):** You require 99.9% uptime with cross-region failover, while strictly enforcing data sovereignty on a MeitY-empanelled domestic cloud. Since domestic clouds often lack the seamless managed failover services of global providers (like AWS/GCP), how are you architecting this cross-region redundancy?
8. **Simulation Data Sourcing (Persona B):** Persona B relies on testing dynamic tidal drafts against vessel arrival ETAs to prevent grounding risks. Where is your system sourcing this real-time fairway and tidal data, and what is your fallback mechanism if the live ETA data feed experiences an outage?
9. **Lighterage Constraints (Persona B & FR-02):** When coordinating Sandheads transshipment splitting, does your constraint solver only evaluate the physical dimensions (Draft/LOA/Beam) of the primary vessels, or does it also ingest the real-time availability and capacity of local lighterage barges to ensure the split is actually executable?
10. **Evaluating Forecast Accuracy (FR-03 & Executive Summary):** To achieve the projected 8%–15% annual freight savings, the market timing must be highly accurate. How will the platform continuously backtest and audit the ML engine's P50/P90 predictions against actual historical spot market rates to prove this ROI to PSUs like SAIL and NTPC?
