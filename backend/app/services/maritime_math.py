import math
import time
import httpx
from app.main import prisma
from app.schemas.requisition import RequisitionEvaluateRequest

cached_fleet = None
last_fleet_fetch = 0

async def get_fleet():
    global cached_fleet, last_fleet_fetch
    now = time.time()
    # Cache for 1 hour to prevent DB spam
    if not cached_fleet or (now - last_fleet_fetch) > 3600:
        cached_fleet = await prisma.vessel.find_many()
        last_fleet_fetch = now
    return cached_fleet

def calculate_brackish_sinkage(draft_laden: float, port_density: float) -> float:
    # 1.025 is standard seawater density
    return draft_laden * ((1.025 - port_density) / port_density)

def calculate_hydrodynamic_squat(block_coeff: float, speed_knots: float) -> float:
    return (2 * block_coeff * math.pow(speed_knots, 2)) / 100

def calculate_dynamic_ukc(charted_depth: float, tidal_height: float, draft_laden: float, delta_draft: float, squat: float) -> float:
    return (charted_depth + tidal_height) - (draft_laden + delta_draft + squat)

async def evaluate_requisition(req_data: RequisitionEvaluateRequest) -> dict:
    port = await prisma.port.find_unique(where={"name": req_data.dest_port_name})
    
    fleet = await get_fleet()
    ukc_margin = 1.0  # 1.0 meter safety margin
    
    # Use port details if available, else fallbacks matching JS version
    port_density = port.brackishDensity if port else 1.025
    charted_depth = port.chartedDepth if port else 15.0
    typical_tidal_range = port.typicalTidalRange if port else 1.5
    dest_port_draft = port.permissibleDraft if port else 14.0
    lat = port.lat if port else 21.02
    lon = port.lon if port else 88.06
    max_vessel_class = port.maxVesselClass if port else None

    # Fetch real-time wave/tide data from Open-Meteo Marine API
    tidal_height = typical_tidal_range
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"https://marine-api.open-meteo.com/v1/marine?latitude={lat}&longitude={lon}&hourly=ocean_tide"
            )
            if res.status_code == 200:
                data = res.json()
                if "hourly" in data and "ocean_tide" in data["hourly"] and len(data["hourly"]["ocean_tide"]) > 0:
                    first_tide = data["hourly"]["ocean_tide"][0]
                    if first_tide is not None:
                        tidal_height = first_tide
    except Exception as e:
        print(f"Failed to fetch live tide data, using fallback. {e}")

    cargo_restrictions = {
        "Grain": ["Handysize", "Handymax", "Supramax", "Panamax"],
        "Iron Ore": ["Capesize", "Panamax", "Supramax"],
        "Coal": ["Capesize", "Panamax", "Supramax"],
        "Bauxite": ["Capesize", "Panamax", "Supramax"],
        "Fertilizer": ["Handysize", "Handymax", "Supramax", "Panamax"]
    }

    vessel_class_order = {
        "Handysize": 1,
        "Handymax": 2,
        "Supramax": 3,
        "Panamax": 4,
        "Capesize": 5
    }

    valid_vessels = []

    for vessel in fleet:
        # Compatibility matrix check
        if req_data.commodity in cargo_restrictions and vessel.name not in cargo_restrictions[req_data.commodity]:
            continue

        # Port max vessel class check
        if max_vessel_class and vessel_class_order.get(vessel.name, 99) > vessel_class_order.get(max_vessel_class, 99):
            continue

        # Calculate Brackish Water Sinkage using dynamic port density
        delta_draft = calculate_brackish_sinkage(vessel.laden_draft, port_density)

        # Calculate Hydrodynamic Squat
        squat = calculate_hydrodynamic_squat(vessel.block_coeff, vessel.speed_knots)

        # Calculate Dynamic Under Keel Clearance using dynamic charted depth
        ukc_dynamic = calculate_dynamic_ukc(charted_depth, tidal_height, vessel.laden_draft, delta_draft, squat)

        if ukc_dynamic >= ukc_margin:
            calculated_draft = round(vessel.laden_draft + delta_draft, 2)
            valid_vessels.append({
                "vessel": vessel,
                "calculatedDraft": calculated_draft,
                "clearance_margin": round(ukc_dynamic, 2)
            })

    if not valid_vessels:
        return {
            "feasible": False,
            "strategy": "Offshore Transshipment Required (e.g., Lighterage at Sandheads)",
            "calculatedDraft": 0.0,
            "portMaxDraft": float(dest_port_draft)
        }

    # Sort by cost efficiency per metric ton
    valid_vessels.sort(key=lambda x: x["vessel"].daily_cost / x["vessel"].capacity)
    
    best = valid_vessels[0]
    best_vessel = best["vessel"]
    vessel_count = math.ceil(req_data.volume_mt / best_vessel.capacity)

    strategy = f"Direct Fixture: 1x {best_vessel.name}"
    if vessel_count > 1:
        strategy = f"Split Cargo into {vessel_count}x {best_vessel.name}s"

    return {
        "feasible": True,
        "strategy": strategy,
        "calculatedDraft": float(best["calculatedDraft"]),
        "portMaxDraft": float(dest_port_draft)
    }
