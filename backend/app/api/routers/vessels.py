"""Live vessels endpoint via AISStream proxy."""

import math
import re

from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel, Field
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.services.ais_proxy import DEFAULT_BBOX, get_vessels

router = APIRouter(prefix="/api/v1/vessels", tags=["vessels"])
limiter = Limiter(key_func=get_remote_address)


class Vessel(BaseModel):
    mmsi: str = Field(..., description="MMSI as string to preserve leading zeros")
    name: str | None = None
    lat: float
    lon: float
    sog: float | None = None
    cog: float | None = None
    draught: float | None = None
    shipType: str | None = None
    destination: str | None = Field(None, description="AIS type-5 declared destination (free text)")
    eta: str | None = Field(None, description="AIS type-5 ETA as ISO-8601 UTC, next occurrence")
    navStatus: int | None = Field(None, description="AIS navigational status code 0-15")
    timestamp: str
    demo: bool = False


class VesselLiveResponse(BaseModel):
    mode: str = Field(..., description="live|demo|stale|unavailable")
    vessels: list[Vessel]
    updatedAt: str
    notice: str | None = None


@router.get("/live", response_model=VesselLiveResponse)
@limiter.limit("30/minute")
async def get_live_vessels(
    request: Request,
    minLon: float = Query(default=DEFAULT_BBOX["minLon"], ge=-180.0, le=180.0),
    minLat: float = Query(default=DEFAULT_BBOX["minLat"], ge=-90.0, le=90.0),
    maxLon: float = Query(default=DEFAULT_BBOX["maxLon"], ge=-180.0, le=180.0),
    maxLat: float = Query(default=DEFAULT_BBOX["maxLat"], ge=-90.0, le=90.0),
):
    result = await get_vessels(minLon, minLat, maxLon, maxLat, api_key=settings.aisstream_api_key)
    return result


# Ports served by the arrivals board, with AIS destination-text aliases.
# AIS destinations are free text ("HALDIA", "Haldia India", "IN HAL"), so
# matching is token-based, never substring on short codes.
PORT_COORDS = {
    "Haldia": (22.03, 88.06),
    "Paradip": (20.26, 86.68),
    "Dhamra": (20.79, 86.99),
    "Sandheads": (21.35, 88.45),
}

DEST_ALIASES = {
    "Haldia": {"HALDIA", "INHAL", "HALDIARIVER", "HOOGHLY"},
    "Paradip": {"PARADIP", "PRADIP", "INPRD", "PARADEEP"},
    "Dhamra": {"DHAMRA", "INDAH", "DHAMRAPORT"},
    "Sandheads": {"SANDHEADS", "SANDHEAD", "SANDHEADROADS"},
}

_EARTH_R_NM = 3440.065


def _haversine_nm(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * math.asin(math.sqrt(max(0.0, min(1.0, a)))) * _EARTH_R_NM


def _destination_matches(port: str, destination: str | None) -> bool:
    if not destination:
        return False
    aliases = DEST_ALIASES.get(port, set())
    norm = destination.upper()
    tokens = set(re.split(r"[^A-Z0-9]+", norm)) - {""}
    if tokens & aliases:
        return True
    compact = re.sub(r"[^A-Z0-9]+", "", norm)
    if compact in aliases:
        return True
    return any(len(a) >= 6 and a in compact for a in aliases)


class Arrival(BaseModel):
    mmsi: str
    name: str | None = None
    lat: float
    lon: float
    sog: float | None = None
    destination: str | None = None
    eta: str | None = None
    distanceNm: float | None = None
    etaHours: float | None = None


class ArrivalsResponse(BaseModel):
    port: str
    arrivals: list[Arrival]
    updatedAt: str
    notice: str | None = None


@router.get("/arrivals", response_model=ArrivalsResponse)
@limiter.limit("30/minute")
async def get_expected_arrivals(request: Request, port: str = Query(default="Haldia")):
    """Vessels whose AIS-declared destination matches a corridor port.

    Derived purely from our own AIS cache (never scraped). Sorted by
    ETA-hours at current speed, unknown ETAs last. Empty list (not 500)
    when no vessel declares this port — including demo mode, where
    destinations are honestly absent.
    """
    from app.services import ais_proxy
    from app.services.meteo_common import utcnow_iso as _utcnow_iso

    if port not in PORT_COORDS:
        raise HTTPException(
            status_code=422,
            detail=f"Unknown port '{port}'. Expected one of: {', '.join(PORT_COORDS)}",
        )
    plat, plon = PORT_COORDS[port]
    vessels = ais_proxy.get_cached_vessels() or []
    arrivals: list[dict] = []
    for v in vessels:
        try:
            if not _destination_matches(port, v.get("destination")):
                continue
            vlat = float(v.get("lat"))
            vlon = float(v.get("lon"))
        except (TypeError, ValueError):
            continue
        dist = round(_haversine_nm(plat, plon, vlat, vlon), 1)
        eta_hours = None
        try:
            sog = v.get("sog")
            sog_f = float(sog) if sog is not None else None
            if sog_f is not None and sog_f > 0.5:
                eta_hours = round(dist / sog_f, 1)
        except (TypeError, ValueError):
            eta_hours = None
        arrivals.append(
            {
                "mmsi": str(v.get("mmsi", "")),
                "name": v.get("name"),
                "lat": vlat,
                "lon": vlon,
                "sog": v.get("sog"),
                "destination": v.get("destination"),
                "eta": v.get("eta"),
                "distanceNm": dist,
                "etaHours": eta_hours,
            }
        )
    arrivals.sort(key=lambda a: (a["etaHours"] is None, a["etaHours"] or 0.0))
    notice = None
    if not arrivals:
        notice = f"No vessel currently declares {port} as destination."
    return {
        "port": port,
        "arrivals": arrivals[:50],
        "updatedAt": _utcnow_iso(),
        "notice": notice,
    }


class TrackPoint(BaseModel):
    lat: float
    lon: float
    timestamp: str | None = None


class TrackResponse(BaseModel):
    mmsi: str
    points: list[TrackPoint]
    updatedAt: str
    notice: str | None = None


@router.get("/track", response_model=TrackResponse)
@limiter.limit("30/minute")
async def get_vessel_track(request: Request, mmsi: str = Query(default="")):
    """Recent live fixes for one vessel, oldest first (our own trail store).

    Feeds the globe's trail polyline — the honest equivalent of a
    historical-track replay, built only from fixes we collected live.
    Empty points (not 404) when the vessel was never seen live.
    """
    from app.services import ais_proxy
    from app.services.meteo_common import utcnow_iso as _utcnow_iso

    mmsi_s = (mmsi or "").strip()
    if not mmsi_s:
        raise HTTPException(status_code=422, detail="mmsi is required")
    points = ais_proxy.get_vessel_track(mmsi_s)
    return {
        "mmsi": mmsi_s,
        "points": points,
        "updatedAt": _utcnow_iso(),
        "notice": None if points else "No live trail recorded for this vessel yet.",
    }
