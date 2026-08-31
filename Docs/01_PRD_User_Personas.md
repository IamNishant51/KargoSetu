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
    *   *Workflow:* Drills into XGBoost feature importances; monitors BDRY, VLSFO, and commodity crack spreads.

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
