import math
import time
from typing import Any

import httpx
import structlog
from fastapi import HTTPException

from app.api.dependencies import prisma
from app.core.config import settings
from app.schemas.requisition import RequisitionEvaluateRequest

import asyncio

logger = structlog.get_logger(__name__)

http_client: httpx.AsyncClient | None = None

_fleet_cache = None
_fleet_cache_time = 0
_fleet_lock = asyncio.Lock()

CARGO_RESTRICTIONS = {
    "Grain": ["Handysize", "Handymax", "Supramax", "Panamax"],
    "Iron Ore": ["Capesize", "Panamax", "Supramax"],
    "Coal": ["Capesize", "Panamax", "Supramax"],
    "Bauxite": ["Capesize", "Panamax", "Supramax"],
    "Fertilizer": ["Handysize", "Handymax", "Supramax", "Panamax"],
}

VESSEL_CLASS_ORDER = {
    "Handysize": 1,
    "Handymax": 2,
    "Supramax": 3,
    "Panamax": 4,
    "Capesize": 5,
}

async def get_fleet():
    """Fetch vessel fleet from database with in-memory caching."""
    global _fleet_cache, _fleet_cache_time
    now = time.time()

    if _fleet_cache is not None and (now - _fleet_cache_time) < settings.fleet_cache_ttl_seconds:
        return _fleet_cache

    async with _fleet_lock:
        now = time.time()
        if _fleet_cache is not None and (now - _fleet_cache_time) < settings.fleet_cache_ttl_seconds:
            return _fleet_cache

        _fleet_cache = await prisma.vessel.find_many()
        _fleet_cache_time = now

    return _fleet_cache

def calculate_brackish_sinkage(draft_laden: float, port_density: float) -> float:
    """Calculate the additional sinkage when moving from standard seawater (1.025) to brackish water."""
    return draft_laden * ((1.025 - port_density) / port_density)

def calculate_hydrodynamic_squat(block_coeff: float, speed_knots: float) -> float:
    """Calculate the squat effect based on Barrass formula."""
    return (2 * block_coeff * math.pow(speed_knots, 2)) / 100

def calculate_dynamic_ukc(
    charted_depth: float,
    tidal_height: float,
    draft_laden: float,
    delta_draft: float,
    squat: float,
) -> float:
    """Calculate the dynamic Under Keel Clearance."""
    return (charted_depth + tidal_height) - (draft_laden + delta_draft + squat)

def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance in nautical miles between two points on the earth."""
    # Convert decimal degrees to radians 
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    # Haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a)) 
    r = 3440.065 # Radius of earth in nautical miles.
    return c * r

async def evaluate_requisition(req_data: RequisitionEvaluateRequest) -> dict[str, Any]:
    """
    Evaluate if a cargo requisition is feasible at the destination port.
    
    Calculates dynamic draft including brackish water sinkage and squat,
    verifies under keel clearance, and suggests the optimal vessel strategy
    or an alternative port if infeasible.
    """
    port = await prisma.port.find_unique(where={"name": req_data.dest_port_name})
    if port is None:
        available_ports = await prisma.port.find_many()
        port_names = [p.name for p in available_ports]
        raise HTTPException(
            status_code=404,
            detail=f"Port '{req_data.dest_port_name}' not found. Available ports: {', '.join(port_names)}"
        )

    fleet = await get_fleet()
    ukc_margin = 1.0  # 1.0 meter safety margin

    port_density = port.brackishDensity
    charted_depth = port.chartedDepth
    typical_tidal_range = port.typicalTidalRange
    dest_port_draft = port.permissibleDraft
    lat = port.lat
    lon = port.lon
    max_vessel_class = port.maxVesselClass

    tidal_height = typical_tidal_range
    try:
        global http_client
        client = http_client
        if client is None:
            client = httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=5.0))
        
        res = await client.get(
            f"https://marine-api.open-meteo.com/v1/marine?latitude={lat}&longitude={lon}&hourly=ocean_tide",
            timeout=5.0
        )
        
        if res.status_code == 200:
            data = res.json()
            if (
                "hourly" in data
                and "ocean_tide" in data["hourly"]
                and len(data["hourly"]["ocean_tide"]) > 0
            ):
                first_tide = data["hourly"]["ocean_tide"][0]
                if first_tide is not None:
                    tidal_height = first_tide
                    
        if http_client is None:
            await client.aclose()
    except Exception as e:
        logger.warning("tide_fetch_failed", error=str(e), fallback=typical_tidal_range)

    valid_vessels = []

    for vessel in fleet:
        if (
            req_data.commodity in CARGO_RESTRICTIONS
            and vessel.name not in CARGO_RESTRICTIONS[req_data.commodity]
        ):
            continue

        if max_vessel_class and VESSEL_CLASS_ORDER.get(
            vessel.name, 99
        ) > VESSEL_CLASS_ORDER.get(max_vessel_class, 99):
            continue

        delta_draft = calculate_brackish_sinkage(vessel.laden_draft, port_density)
        squat = calculate_hydrodynamic_squat(vessel.block_coeff, vessel.speed_knots)
        ukc_dynamic = calculate_dynamic_ukc(
            charted_depth, tidal_height, vessel.laden_draft, delta_draft, squat
        )

        if ukc_dynamic >= ukc_margin:
            calculated_draft = round(vessel.laden_draft + delta_draft, 2)
            valid_vessels.append(
                {
                    "vessel": vessel,
                    "calculatedDraft": calculated_draft,
                    "clearance_margin": round(ukc_dynamic, 2),
                }
            )

    if not valid_vessels:
        # Find alternative port
        alternative_port_suggestion = None
        all_ports = await prisma.port.find_many()
        best_alt_dist = float('inf')
        
        for alt_port in all_ports:
            if alt_port.id == port.id:
                continue
                
            alt_valid = False
            for vessel in fleet:
                if (req_data.commodity in CARGO_RESTRICTIONS and vessel.name not in CARGO_RESTRICTIONS[req_data.commodity]):
                    continue
                if alt_port.maxVesselClass and VESSEL_CLASS_ORDER.get(vessel.name, 99) > VESSEL_CLASS_ORDER.get(alt_port.maxVesselClass, 99):
                    continue
                
                alt_delta = calculate_brackish_sinkage(vessel.laden_draft, alt_port.brackishDensity)
                alt_squat = calculate_hydrodynamic_squat(vessel.block_coeff, vessel.speed_knots)
                alt_ukc = calculate_dynamic_ukc(alt_port.chartedDepth, alt_port.typicalTidalRange, vessel.laden_draft, alt_delta, alt_squat)
                
                if alt_ukc >= ukc_margin:
                    alt_valid = True
                    break
                    
            if alt_valid:
                dist = _haversine(lat, lon, alt_port.lat, alt_port.lon)
                if dist < best_alt_dist:
                    best_alt_dist = dist
                    alternative_port_suggestion = f"{alt_port.name} ({int(dist)} NM away)"

        response = {
            "feasible": False,
            "strategy": "Offshore Transshipment Required (e.g., Lighterage at Sandheads)",
            "calculatedDraft": 0.0,
            "portMaxDraft": float(dest_port_draft),
            "clearance_margin": 0.0,
            "total_vessels": 0,
            "vesselCapacity": 0,
            "requestedVolume": req_data.volume_mt,
            "vessel_class": "N/A",
            "ai_insight": "Evaluative models conclude that no available vessel class satisfies the strict Under Keel Clearance (UKC) safety thresholds at this destination. Strategic alternatives, such as offshore transshipment or lighterage operations, are highly recommended to proceed.",
        }
        if alternative_port_suggestion:
            response["alternativePort"] = alternative_port_suggestion
            
        return response

    valid_vessels.sort(key=lambda x: x["vessel"].daily_cost / x["vessel"].capacity)

    best = valid_vessels[0]
    best_vessel = best["vessel"]
    vessel_count = math.ceil(req_data.volume_mt / best_vessel.capacity)

    strategy = f"Direct Fixture: 1x {best_vessel.name}"
    if vessel_count > 1:
        strategy = f"Split Cargo into {vessel_count}x {best_vessel.name}s"

    clearance = round(best["clearance_margin"], 2)
    draft_pct = round((best["calculatedDraft"] / dest_port_draft) * 100, 1) if dest_port_draft else 0

    if vessel_count == 1:
        vessel_class = best_vessel.name
    else:
        vessel_class = f"{vessel_count}x {best_vessel.name}"

    if clearance < 2.0:
        ukc_note = f"However, the Under Keel Clearance (UKC) is extremely tight at {clearance:.2f}m. Navigational caution and strict adherence to neap tide windows are strongly advised."
    elif clearance < 3.5:
        ukc_note = f"The projected Under Keel Clearance (UKC) of {clearance:.2f}m provides a sufficient, albeit standard, safety margin for transit."
    else:
        ukc_note = f"An ample Under Keel Clearance (UKC) of {clearance:.2f}m affords a highly comfortable margin, ensuring robust operational safety."

    ai_insight = (
        f"Analysis indicates the projected draft utilizes {draft_pct:.1f}% of the port's maximum permissible limits. "
        f"{ukc_note} "
        f"The optimal logistical strategy recommends deploying {vessel_class} to accommodate the {req_data.volume_mt:,.1f} MT of {req_data.commodity} efficiently. "
    )
    
    if req_data.commodity == "Iron Ore":
        ai_insight += "Iron Ore shipments typically require deep-draft Capesize vessels, which may face challenges at riverine ports."
    elif req_data.commodity == "Grain":
        ai_insight += "Grain shipments often benefit from Handysize flexibility for restricted berths."

    return {
        "feasible": True,
        "strategy": strategy,
        "calculatedDraft": float(best["calculatedDraft"]),
        "portMaxDraft": float(dest_port_draft),
        "clearance_margin": clearance,
        "total_vessels": vessel_count,
        "vesselCapacity": best_vessel.capacity,
        "requestedVolume": req_data.volume_mt,
        "vessel_class": vessel_class,
        "ai_insight": ai_insight,
    }
