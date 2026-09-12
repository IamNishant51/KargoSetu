import math

import structlog
from fastapi import APIRouter

from app.api.dependencies import prisma

router = APIRouter(prefix="/api/v1/ports", tags=["ports"])
logger = structlog.get_logger(__name__)


@router.get("")
async def get_ports():
    ports = await prisma.port.find_many()
    return ports

CORRIDOR_STATIC_DATA = {
    "Haldia": {"n": "01", "sub": "Hooghly river · tide-bound", "draft": "7.5 m", "tide": "+2.8 – 4.2 m", "ship": "Supramax direct", "note": "Heavy siltation. The reason splits exist.", "flag": "Watch"},
    "Paradip": {"n": "02", "sub": "Bay of Bengal · all-weather", "draft": "14.5 m", "tide": "+1.2 – 2.4 m", "ship": "Panamax / baby Cape", "note": "Mechanised coal berths. Laycan discipline matters.", "flag": "Open"},
    "Dhamra": {"n": "03", "sub": "Deep-sea fairway", "draft": "16.0 m", "tide": "+1.5 – 2.8 m", "ship": "Full Capesize 180k", "note": "Coking-coal front door when Haldia chokes.", "flag": "Open"},
    "Sandheads": {"n": "04", "sub": "Offshore roads · lighterage", "draft": "22 m+", "tide": "Open ocean", "ship": "All classes", "note": "Where big ships break bulk into shuttles.", "flag": "Hub"}
}

@router.get("/corridor")
async def get_port_corridor():
    ports_db = await prisma.port.find_many()
    db_map = {p.name: p for p in ports_db}

    live_counts = _corridor_live_stats()

    results = []
    for name, static_info in CORRIDOR_STATIC_DATA.items():
        draft = f"{db_map[name].permissibleDraft} m" if name in db_map else static_info["draft"]

        merged = {
            "name": name,
            **static_info,
            "draft": draft,
        }
        stats = live_counts.get(name, {"liveVesselCount": None, "nearestVesselNm": None})
        merged["liveVesselCount"] = stats["liveVesselCount"]
        merged["nearestVesselNm"] = stats["nearestVesselNm"]
        results.append(merged)

    return results


PORT_COORDS = {
    "Haldia": (22.03, 88.06),
    "Paradip": (20.26, 86.68),
    "Dhamra": (20.79, 86.99),
    "Sandheads": (21.35, 88.45),
}

_EARTH_R_NM = 3440.065


def _corridor_live_stats() -> dict:
    try:
        from app.services.ais_proxy import get_cached_vessels

        vessels = get_cached_vessels()
    except Exception as exc:
        logger.warning("corridor_vessel_lookup_failed", error=str(exc))
        return {}
    if not vessels:
        return {}
    try:
        import numpy as np

        out: dict = {}
        for port_name, (plat, plon) in PORT_COORDS.items():
            lats = np.array([v.get("lat") for v in vessels], dtype=float)
            lons = np.array([v.get("lon") for v in vessels], dtype=float)
            valid = ~(np.isnan(lats) | np.isnan(lons))
            if not bool(valid.any()):
                out[port_name] = {"liveVesselCount": None, "nearestVesselNm": None}
                continue
            lats = lats[valid]
            lons = lons[valid]
            rlat1 = np.radians(plat)
            rlon1 = np.radians(plon)
            rlat2 = np.radians(lats)
            rlon2 = np.radians(lons)
            dlat = rlat2 - rlat1
            dlon = rlon2 - rlon1
            a = np.sin(dlat / 2.0) ** 2 + np.cos(rlat1) * np.cos(rlat2) * np.sin(dlon / 2.0) ** 2
            c = 2 * np.arcsin(np.sqrt(np.clip(a, 0.0, 1.0)))
            dist_nm = c * _EARTH_R_NM
            # 50 km radius for live count.
            dist_km = dist_nm * 1.852
            count = int(bool((dist_km <= 50.0).sum()))
            nearest = round(float(dist_nm.min()), 1)
            out[port_name] = {"liveVesselCount": count, "nearestVesselNm": nearest}
        return out
    except Exception as exc:
        logger.warning("corridor_vessel_math_failed", error=str(exc))
        # Fallback pure-python path without numpy.
        out = {}
        for port_name, (plat, plon) in PORT_COORDS.items():
            best = float("inf")
            count = 0
            for v in vessels:
                try:
                    vlat = float(v.get("lat"))
                    vlon = float(v.get("lon"))
                except (TypeError, ValueError):
                    continue
                d = _haversine_nm(plat, plon, vlat, vlon)
                if d < best:
                    best = d
                if d * 1.852 <= 50.0:
                    count += 1
            out[port_name] = {
                "liveVesselCount": count,
                "nearestVesselNm": round(best, 1) if best != float("inf") else None,
            }
        return out


def _haversine_nm(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))
    return c * _EARTH_R_NM
