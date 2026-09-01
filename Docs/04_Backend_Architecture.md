# MODULE 4: BACKEND ARCHITECTURE & CONSTRAINT SOLVER (NODE.JS)

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

## 4.2 Node.js & Express Implementation (TypeScript)
```typescript
import express, { Request, Response } from "express";
import { z } from "zod";

const app = express();
app.use(express.json());

const CargoRequisitionSchema = z.object({
  volume_mt: z.number().positive(),
  dest_port_draft: z.number().positive(),
  commodity: z.string().min(3),
});

type VesselClass = {
  name: string;
  capacity: number;
  laden_draft: number;
  daily_cost: number;
  block_coefficient: number;
  speed_knots: number;
};

const FLEET: VesselClass[] = [
  { name: "Capesize", capacity: 150000, laden_draft: 18.0, daily_cost: 25000, block_coefficient: 0.85, speed_knots: 12.0 },
  { name: "Panamax", capacity: 75000, laden_draft: 14.0, daily_cost: 15000, block_coefficient: 0.85, speed_knots: 12.0 },
  { name: "Supramax", capacity: 50000, laden_draft: 11.5, daily_cost: 12000, block_coefficient: 0.85, speed_knots: 12.0 }
];

app.post("/api/v1/requisitions/evaluate", (req: Request, res: Response) => {
  const parseResult = CargoRequisitionSchema.safeParse(req.body);
  
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error });
  }

  const { volume_mt, dest_port_draft } = parseResult.data;
  const UKC_MARGIN = 1.0;  // Under Keel Clearance safety margin
  const PORT_DENSITY = 1.010; // Brackish water density at Haldia
  const TIDAL_HEIGHT = 1.5; // Current dynamic tide

  const valid_vessels: VesselClass[] = [];

  for (const v of FLEET) {
    // 1. Brackish Water Sinkage
    const delta_draft = v.laden_draft * ((1.025 - PORT_DENSITY) / PORT_DENSITY);
    
    // 2. Hydrodynamic Squat
    const squat = (2 * v.block_coefficient * Math.pow(v.speed_knots, 2)) / 100;
    
    // 3. Dynamic UKC
    const ukc_dynamic = dest_port_draft + TIDAL_HEIGHT - (v.laden_draft + delta_draft + squat);
    
    if (ukc_dynamic >= UKC_MARGIN) {
      valid_vessels.push(v);
    }
  }
  
  if (valid_vessels.length === 0) {
    return res.json({ 
      feasible: false, 
      strategy: "Offshore Transshipment Required", 
      details: "No vessel clears dynamic UKC limits." 
    });
  }
  
  // Sort by cost efficiency (daily_cost / capacity)
  valid_vessels.sort((a, b) => (a.daily_cost / a.capacity) - (b.daily_cost / b.capacity));
  const best_vessel = valid_vessels[0];
  
  // Splitting logic
  const vessel_count = Math.ceil(volume_mt / best_vessel.capacity);
  
  return res.json({
    feasible: true,
    strategy: `Split Cargo into ${vessel_count}x ${best_vessel.name}`,
    calculatedDraft: best_vessel.laden_draft,
    portMaxDraft: dest_port_draft
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`KargoSetu Port Constraint Solver running on port ${PORT}`);
});
```
