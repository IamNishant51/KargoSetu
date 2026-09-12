"""Live vessels endpoint via AISStream proxy."""

from fastapi import APIRouter, Query, Request
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
