import asyncio
import random
from datetime import datetime, timedelta, timezone

from app.api.dependencies import prisma

async def main():
    await prisma.connect()
    
    ports_data = [
        {"name": "Haldia", "chartedDepth": 10.0, "permissibleDraft": 7.5, "brackishDensity": 1.010, "lat": 22.02, "lon": 88.06, "typicalTidalRange": 1.5, "maxVesselClass": "Supramax"},
        {"name": "Paradip", "chartedDepth": 17.0, "permissibleDraft": 14.5, "brackishDensity": 1.025, "lat": 20.26, "lon": 86.67, "typicalTidalRange": 2.0, "maxVesselClass": "Capesize"},
        {"name": "Dhamra", "chartedDepth": 18.0, "permissibleDraft": 16.0, "brackishDensity": 1.025, "lat": 20.82, "lon": 86.97, "typicalTidalRange": 2.2, "maxVesselClass": "Capesize"},
        {"name": "Mumbai", "chartedDepth": 14.0, "permissibleDraft": 11.0, "brackishDensity": 1.025, "lat": 18.94, "lon": 72.83, "typicalTidalRange": 4.5, "maxVesselClass": "Panamax"},
        {"name": "Kandla", "chartedDepth": 13.0, "permissibleDraft": 12.0, "brackishDensity": 1.025, "lat": 23.00, "lon": 70.21, "typicalTidalRange": 6.0, "maxVesselClass": "Panamax"},
        {"name": "Mundra", "chartedDepth": 16.0, "permissibleDraft": 14.0, "brackishDensity": 1.025, "lat": 22.73, "lon": 69.70, "typicalTidalRange": 4.0, "maxVesselClass": "Capesize"},
        # Additional missing ports
        {"name": "Vizag", "chartedDepth": 18.0, "permissibleDraft": 16.5, "brackishDensity": 1.025, "lat": 17.68, "lon": 83.21, "typicalTidalRange": 1.8, "maxVesselClass": "Capesize"},
        {"name": "Chennai", "chartedDepth": 16.5, "permissibleDraft": 14.5, "brackishDensity": 1.025, "lat": 13.08, "lon": 80.29, "typicalTidalRange": 1.2, "maxVesselClass": "Capesize"},
        {"name": "Kolkata", "chartedDepth": 8.0, "permissibleDraft": 6.5, "brackishDensity": 1.005, "lat": 22.57, "lon": 88.36, "typicalTidalRange": 1.5, "maxVesselClass": "Handysize"},
        {"name": "Cochin", "chartedDepth": 13.5, "permissibleDraft": 12.5, "brackishDensity": 1.020, "lat": 9.93, "lon": 76.26, "typicalTidalRange": 1.0, "maxVesselClass": "Panamax"},
        {"name": "Mangalore", "chartedDepth": 14.0, "permissibleDraft": 12.0, "brackishDensity": 1.025, "lat": 12.87, "lon": 74.84, "typicalTidalRange": 1.5, "maxVesselClass": "Panamax"},
        {"name": "Tuticorin", "chartedDepth": 14.2, "permissibleDraft": 12.8, "brackishDensity": 1.025, "lat": 8.76, "lon": 78.13, "typicalTidalRange": 1.1, "maxVesselClass": "Panamax"},
        {"name": "Ennore", "chartedDepth": 16.0, "permissibleDraft": 14.5, "brackishDensity": 1.025, "lat": 13.25, "lon": 80.33, "typicalTidalRange": 1.2, "maxVesselClass": "Capesize"},
        {"name": "Gangavaram", "chartedDepth": 21.0, "permissibleDraft": 19.5, "brackishDensity": 1.025, "lat": 17.62, "lon": 83.24, "typicalTidalRange": 1.8, "maxVesselClass": "Capesize"},
        {"name": "Krishnapatnam", "chartedDepth": 18.5, "permissibleDraft": 17.0, "brackishDensity": 1.025, "lat": 14.24, "lon": 80.12, "typicalTidalRange": 1.5, "maxVesselClass": "Capesize"},
    ]
    
    for port in ports_data:
        await prisma.port.upsert(
            where={"name": port["name"]},
            data={
                "create": port,
                "update": port,
            }
        )

    vessels_data = [
        {"name": "Capesize", "capacity": 150000, "laden_draft": 17.5, "ballast_draft": 9.0, "daily_cost": 25000, "block_coeff": 0.85, "speed_knots": 14.5},
        {"name": "Panamax", "capacity": 75000, "laden_draft": 13.5, "ballast_draft": 7.0, "daily_cost": 15000, "block_coeff": 0.82, "speed_knots": 14.0},
        {"name": "Supramax", "capacity": 55000, "laden_draft": 11.5, "ballast_draft": 6.0, "daily_cost": 12000, "block_coeff": 0.80, "speed_knots": 14.0},
        {"name": "Handymax", "capacity": 50000, "laden_draft": 11.5, "ballast_draft": 5.5, "daily_cost": 11000, "block_coeff": 0.79, "speed_knots": 14.0},
        {"name": "Handysize", "capacity": 35000, "laden_draft": 10.0, "ballast_draft": 5.0, "daily_cost": 9000, "block_coeff": 0.75, "speed_knots": 13.5},
    ]

    for vessel in vessels_data:
        await prisma.vessel.upsert(
            where={"name": vessel["name"]},
            data={
                "create": vessel,
                "update": vessel,
            }
        )

    await prisma.requisition.delete_many()
    
    req_data = []
    dest_ports = [p["name"] for p in ports_data]
    commodities = ["Thermal Coal", "Coking Coal", "Metallurgical Coal", "Iron Ore", "Bauxite", "Grain"]
    statuses = ["Infeasible", "Pending Evaluation", "Converted", "Feasible", "Allocated"]
    origins = [
        "Port Hedland, Australia",
        "Newcastle, Australia",
        "Richards Bay, South Africa",
        "Dampier, Australia",
        "Tubarão, Brazil",
        "Samarinda, Indonesia",
        "Baltimore, USA",
        "Gladstone, Australia"
    ]
    
    for i in range(500):
        req_data.append({
            "volume_mt": float(random.randint(30000, 200000)),
            "commodity": random.choice(commodities),
            "origin": random.choice(origins),
            "destPortName": random.choice(dest_ports),
            "status": random.choice(statuses),
            "createdAt": datetime.now(timezone.utc) - timedelta(days=random.randint(0, 730))
        })
        
    await prisma.requisition.create_many(data=req_data)

    print("Seed complete.")
    await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
