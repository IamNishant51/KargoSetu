# MODULE 4: BACKEND ARCHITECTURE & CONSTRAINT SOLVER (FASTAPI)

## 4.1 Mathematical Formulation
Constraint validation requires deterministic physics and bathymetry checks:

1. **Brackish Water Sinkage (FWA - Fresh Water Allowance):**
   `Delta_Draft = Draft_laden * ((1.025 - Port_Density) / Port_Density)`
2. **Hydrodynamic Squat Effect (Shallow Fairways):**
   `Squat = (2 * Block_Coefficient * (Speed_Knots^2)) / 100`
3. **Dynamic Arrival Draft & UKC Clearance:**
   `UKC_dynamic = Charted_Depth + Tidal_Height - (Draft_laden + Delta_Draft + Squat)`
   `Constraint: UKC_dynamic >= 1.0m`
4. **Splitting Objective Function:**
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
    block_coefficient: float = 0.85
    speed_knots: float = 12.0

FLEET = [
    VesselClass(name="Capesize", capacity=150000, laden_draft=18.0, daily_cost=25000),
    VesselClass(name="Panamax", capacity=75000, laden_draft=14.0, daily_cost=15000),
    VesselClass(name="Supramax", capacity=50000, laden_draft=11.5, daily_cost=12000)
]

@app.post("/api/v1/requisitions/evaluate")
async def evaluate_constraints(req: CargoRequisition):
    UKC_MARGIN = 1.0  # Under Keel Clearance safety margin
    PORT_DENSITY = 1.010 # Brackish water density at Haldia
    TIDAL_HEIGHT = 1.5 # Current dynamic tide

    valid_vessels = []
    for v in FLEET:
        # 1. Brackish Water Sinkage
        delta_draft = v.laden_draft * ((1.025 - PORT_DENSITY) / PORT_DENSITY)
        
        # 2. Hydrodynamic Squat
        squat = (2 * v.block_coefficient * (v.speed_knots ** 2)) / 100
        
        # 3. Dynamic UKC
        # We equate req.dest_port_draft to Charted_Depth for this evaluation
        ukc_dynamic = req.dest_port_draft + TIDAL_HEIGHT - (v.laden_draft + delta_draft + squat)
        
        if ukc_dynamic >= UKC_MARGIN:
            valid_vessels.append(v)
    
    if not valid_vessels:
        return {"feasible": False, "strategy": "Offshore Transshipment Required", "details": "No vessel clears dynamic UKC limits."}
    
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
