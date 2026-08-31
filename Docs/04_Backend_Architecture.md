# MODULE 4: BACKEND ARCHITECTURE & CONSTRAINT SOLVER (FASTAPI)

## 4.1 Mathematical Formulation
Constraint validation requires deterministic physics and bathymetry checks:
1. **Arrival Draft Calculation:**
   `Draft_arrival = Draft_laden * (1 - (Distance * DailyFuel) / (Speed * Displacement)) +/- Delta_density`
2. **Clearance Check:**
   `Draft_arrival <= PermissibleDraft_port + Tide(t) - UKC`
3. **Splitting Objective Function:**
   `Minimize SUM(Vessel_i * (FreightRate_i * Capacity_i + PortFees_i))`
   Subject to: `SUM(Vessel_i * Capacity_i) >= TotalCargoVolume`

## 4.2 Python FastAPI Implementation
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import math

app = FastAPI(title="KargoSetu Port Constraint Solver")

class CargoRequisition(BaseModel):
    volume_mt: float
    dest_port_draft: float
    commodity: str

class VesselClass(BaseModel):
    name: str
    capacity: float
    laden_draft: float
    daily_cost: float

FLEET = [
    VesselClass(name="Capesize", capacity=150000, laden_draft=18.0, daily_cost=25000),
    VesselClass(name="Panamax", capacity=75000, laden_draft=14.0, daily_cost=15000),
    VesselClass(name="Supramax", capacity=50000, laden_draft=11.5, daily_cost=12000)
]

@app.post("/api/v1/requisitions/evaluate")
async def evaluate_constraints(req: CargoRequisition):
    UKC = 1.0  # Under Keel Clearance safety margin
    valid_vessels = [v for v in FLEET if v.laden_draft <= (req.dest_port_draft - UKC)]
    
    if not valid_vessels:
        return {"feasible": False, "strategy": "Offshore Transshipment Required", "details": "No vessel draft clears port limits."}
    
    # Sort by cost efficiency (daily_cost / capacity)
    valid_vessels.sort(key=lambda x: x.daily_cost / x.capacity)
    best_vessel = valid_vessels[0]
    
    # Splitting logic
    vessel_count = math.ceil(req.volume_mt / best_vessel.capacity)
    
    return {
        "feasible": True,
        "strategy": f"Split Cargo into {vessel_count}x {best_vessel.name}",
        "calculatedDraft": best_vessel.laden_draft,
        "portMaxDraft": req.dest_port_draft
    }
```
