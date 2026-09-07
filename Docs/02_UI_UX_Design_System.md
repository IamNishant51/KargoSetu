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


---

### Potential Judge Questions

Based on the provided UI/UX documentation, here are 10 thoughtful and probing questions to evaluate the team's design and technical implementation strategies:

1. **Theme Accessibility:** You have chosen an "Enterprise Maritime Dark Mode" as your primary theme. How are you addressing accessibility and contrast ratios, particularly for users who might need to view these dashboards in brightly lit environments, such as a sunlit port office or a ship's bridge? 
2. **Semantic Color Overload:** You’ve assigned specific semantic meanings to your color palette (e.g., Amber for tidal dependencies, Red for grounding risks). In a worst-case scenario where a vessel faces multiple simultaneous risks, how does the UI prioritize and display these colors to prevent cognitive overload for the operator?
3. **Typography Responsiveness:** Using JetBrains Mono for telemetry, DWT, and pricing figures is a great choice for readability. However, how does your design system handle the responsive scaling and wrapping of these monospace data tables on smaller devices (like tablets) without breaking the layout?
4. **Visualizing Uncertainty (Screen 1):** The Executive Command Center features a 90-day forward freight index projection curve. How does your UI visually communicate the margin of error or confidence intervals to executives so they understand the risk profile of these 90-day projections?
5. **Handling Latency (Screen 1 & 2):** Your design includes a real-time BDI ticker and a Real-time Constraint Validator. What UX patterns (e.g., skeleton loaders, stale data indicators, or offline states) have you implemented to inform the user if the data feed experiences latency or connection drops?
6. **Decision Clarity (Screen 2):** When the Smart Charter Optimizer’s Constraint Validator yields a "Split vs. Direct" recommendation, how exactly do the Recommendation Cards visually break down the cost, time, and risk trade-offs to help the user make an immediate, informed decision?
7. **Rendering Performance (Screen 3):** Integrating Deck.gl and Mapbox for an interactive, georeferenced Port Fairway simulator can be highly resource-intensive. What UX/UI strategies are you using to handle loading states or prevent UI freezing while the map and dynamic water depth layers render?
8. **Interactive Feedback (Screen 3):** Regarding the dynamic water depth vs. vessel arrival draft slider, how does the UI provide immediate, tactile feedback (e.g., leveraging the Red "Danger" color token) if a user accidentally drags the slider into a time window that poses a grounding risk?
9. **Data Comprehension (Screen 4):** The Market Analyzer uses ECharts with shaded P10/P90 bands to show multi-horizon forecasts. Since P10/P90 statistical bands can be confusing to non-technical users, how does your UI design (through tooltips, legends, or "Optimal Booking Window" markers) simplify this data into actionable insights?
10. **Cross-Screen User Journey:** You have designed four highly data-dense core screens. What is the overarching navigation strategy, and how seamlessly can a user transition their workflow—for example, spotting a rate dip on Screen 4 and immediately carrying those parameters over to requisition a charter on Screen 2?
