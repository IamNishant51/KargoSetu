# MODULE 2: UI/UX DESIGN SYSTEM & USER JOURNEY SPECIFICATIONS

## 2.1 Design System & Visual Tokens
*   **Theme:** Enterprise Maritime Dark Mode (Primary).
*   **Color Palette:**
    *   Primary: Deep Nautical Navy `#080E1E`
    *   Accent: Cyan `#00E5FF`
    *   Success: Emerald `#10B981` (Clearance approved)
    *   Warning: Amber `#F59E0B` (Tidal dependency)
    *   Danger: Red `#EF4444` (Draft rejected/Grounding risk)
    *   Surface/Cards: `#101A30` | Borders: `#26385C`
*   **Typography:** Space Grotesk (Headers, Display), Inter (Body, UI elements), JetBrains Mono (Telemetry, DWT, Pricing figures).

## 2.2 Core Screen Layouts
*   **Screen 1: Executive Command Center:** Global map visualization of active fleet, real-time BDI ticker, 90-day forward freight index projection curve, aggregated demurrage risk gauge.
*   **Screen 2: Requisition & Smart Charter Optimizer:** Left pane: Cargo input form (Origin, Dest, Tonnage, Laycan). Right pane: Real-time Constraint Validator yielding Split vs. Direct Recommendation Cards.
*   **Screen 3: Interactive Port Fairway & Berth Simulator:** Georeferenced map (Deck.gl/Mapbox). Dynamic water depth vs. vessel arrival draft slider linked to a tidal curve (Haldia/Paradip).
*   **Screen 4: Market Timing & Rate Dip Analyzer:** Multi-horizon forecast charts (ECharts). Shaded P10/P90 bands. "Optimal Booking Window" trigger markers.
