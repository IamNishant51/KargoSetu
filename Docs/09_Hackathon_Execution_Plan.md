# MODULE 9: HACKATHON EXECUTION & JUDGE FEEDBACK SCALING PLAN

**Author:** Principal Enterprise Architect
**Context:** This document translates critical hackathon jury feedback into actionable, sprint-ready engineering tasks. The focus shifts from foundational architecture to "Wow Factor" demo-ability, ESG compliance, and real-world edge case handling.

---

## 9.1 Phase 1: ESG & Scope 3 Emissions Tracking (The Carbon Factor)
**Objective:** Quantify the environmental tradeoff between direct lightering (1 Capesize) vs. multi-vessel splitting (3 Supramax). 

### Technical Implementation

**1. Database Schema Update (PostgreSQL):**
We must track the Energy Efficiency Design Index (EEDI) proxy and calculate CO2 emissions based on the IMO standard emission factor for Heavy Fuel Oil (3.114 tonnes CO2 per tonne of fuel).

```sql
-- Track vessel carbon efficiency
ALTER TABLE vessels ADD COLUMN eedi_rating_score DECIMAL(5,2) DEFAULT 0.0;
ALTER TABLE vessels ADD COLUMN fuel_type VARCHAR(20) DEFAULT 'VLSFO';

-- Track recommended route emissions
ALTER TABLE charter_recommendations ADD COLUMN projected_co2_mt DECIMAL(10,2);
ALTER TABLE charter_recommendations ADD COLUMN green_freight_score DECIMAL(3,2);
```

**2. Backend Logic Update (FastAPI - `PortConstraintService.py`):**
```python
IMO_HFO_CARBON_FACTOR = 3.114 # MT of CO2 per MT of fuel

def calculate_route_emissions(vessel, sailing_days: float) -> float:
    total_fuel_mt = vessel.fuel_cons_laden_tpd * sailing_days
    return total_fuel_mt * IMO_HFO_CARBON_FACTOR

# Inside the splitting algorithm:
option_a_co2 = calculate_route_emissions(capesize, days) # + lightering barge emissions
option_b_co2 = sum([calculate_route_emissions(supra, days) for supra in split_fleet])
```

---

## 9.2 Phase 2: "What-If" Market Shock Simulator
**Objective:** Provide an interactive slider for judges to simulate geopolitical crises, triggering instant ML model recalculations.

### Technical Implementation

**1. Frontend State Management (Zustand - Next.js):**
```typescript
import { create } from 'zustand';

interface SimulationState {
    marketShockFactor: number; // 1.0 = Normal, 1.5 = +50% spike
    setShockFactor: (val: number) => void;
    geopoliticalEvent: string | null;
    triggerEvent: (event: string, severity: number) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
    marketShockFactor: 1.0,
    setShockFactor: (val) => set({ marketShockFactor: val }),
    geopoliticalEvent: null,
    triggerEvent: (event, severity) => set({ geopoliticalEvent: event, marketShockFactor: severity }),
}));
```

**2. ECharts Integration:**
Bind the `marketShockFactor` to the y-axis data of the `ForecastPriceChart.tsx`. When a user drags the slider, the React component immediately multiplies the base P50/P90 arrays by the shock multiplier, showing an immediate visual spike.

---

## 9.3 Phase 3: Executive Alerting System (Push Notifications)
**Objective:** Prove to judges that we understand Persona A (the GM) by shifting from a "pull" dashboard to a "push" alert system.

### Technical Implementation
**1. UI/UX Update (`ExecutiveDashboard.tsx`):**
Create a Toast/Snack-bar notification system that listens for threshold breaches.

```tsx
useEffect(() => {
    if (forecast.p50 < user.targetPriceUsd * 0.9) {
        toast({
            title: "🚨 Market Opportunity Detected",
            description: `BDRY index dropped 10% below target. Lock in Q3 Laycan now for estimated $1.2M savings.`,
            action: <Button onClick={triggerBooking}>Approve CoA</Button>
        })
    }
}, [forecast, user.targetPriceUsd]);
```

---

## 9.4 Phase 4: Weather & Monsoon Fallback (Real-World Chaos)
**Objective:** Disable offshore lightering (transshipment) during severe weather events, proving domain expertise.

### Technical Implementation
**1. External API Integration:**
Integrate `OpenWeatherMap API` or `Stormglass.io` for marine weather.

**2. Constraint Solver Modification:**
```python
def check_transshipment_feasibility(port_code: str, eta_timestamp: int) -> bool:
    weather = fetch_marine_weather(port_code, eta_timestamp)
    if weather.wave_height_meters > 2.5 or weather.wind_knots > 25:
        # Transshipment barges cannot operate safely
        return False
    return True
```

---

## 9.5 Phase 5: UI Progressive Disclosure Architecture
**Objective:** Keep the UI clean. Prevent technical data from overwhelming the business pitch.

### Technical Implementation
**Route Structure (Next.js):**
*   `/dashboard/executive`: High-level numbers, Net Savings, Carbon Impact, and the "Market Shock" slider.
*   `/dashboard/operations`: The Interactive Map, Tidal Draft Simulator, and splitting physics.
*   `/dashboard/intelligence`: XGBoost feature importance charts, BDI correlation matrices, and model telemetry (for technical judges only).