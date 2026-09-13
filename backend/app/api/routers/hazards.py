"""Hazards summary endpoint: USGS quakes + NASA FIRMS fires + Open-Meteo weather.

Fault-isolated per source with TTL cache and serve-stale. Never fails the
whole endpoint for one feed.
"""

from __future__ import annotations

import asyncio
import csv
import datetime as dt
import io
import time as time_module

import httpx
import structlog
from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel, Field
from slowapi import Limiter
from slowapi.util import get_remote_address

import app.services.maritime_math as maritime_math
from app.core.config import settings
from app.services.meteo_common import current_hour_index as _current_hour_index
from app.services.meteo_common import utcnow_iso as _utcnow_iso

router = APIRouter(prefix="/api/v1/hazards", tags=["hazards"])
limiter = Limiter(key_func=get_remote_address)
logger = structlog.get_logger(__name__)

USGS_HOST = "https://earthquake.usgs.gov"
USGS_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson"
FIRMS_HOST = "https://firms.modaps.eosdis.nasa.gov"
METEO_MARINE_HOST = "https://marine-api.open-meteo.com"
METEO_HOST = "https://api.open-meteo.com"

USGS_TTL = 300.0
FIRMS_TTL = 1800.0
METEO_TTL = 300.0
DEFAULT_BBOX = {"minLon": 80.0, "minLat": 15.0, "maxLon": 95.0, "maxLat": 23.5}

_usgs_cache: list[dict] = []
_usgs_time: float = 0.0
_usgs_status: str = "unavailable"
_firms_cache: list[dict] = []
_firms_time: float = 0.0
_firms_status: str = "unavailable"
_meteo_cache: dict | None = None
_meteo_time: float = 0.0
_meteo_status: str = "unavailable"
_lock = asyncio.Lock()

# Daily upstream budget governor (UTC day): caps FIRMS MAP_KEY transactions
# so a client loop or cache bug can never burn the shared quota. Over budget
# the proxy serves stale cache instead of hitting upstream.
_firms_day: str = ""
_firms_used: int = 0


def _firms_budget_hit() -> bool:
    """True when today's FIRMS upstream calls reached the configured budget."""
    global _firms_day, _firms_used
    today = dt.datetime.now(dt.UTC).strftime("%Y-%m-%d")
    if today != _firms_day:
        _firms_day = today
        _firms_used = 0
    budget = getattr(settings, "firms_daily_budget", 200)
    budget = 200 if budget is None else int(budget)
    if _firms_used >= budget:
        return True
    _firms_used += 1
    return False


def get_hazard_feed_status() -> dict:
    """Snapshot of per-source feed health for the health endpoint."""
    return {
        "usgs": _usgs_status,
        "firms": _firms_status,
        "meteo": _meteo_status,
        "firmsUsedToday": _firms_used,
        "firmsDay": _firms_day,
    }


class Earthquake(BaseModel):
    id: str
    lat: float
    lon: float
    mag: float | None = None
    place: str | None = None
    time: str | None = None


class Fire(BaseModel):
    lat: float
    lon: float
    confidence: str | None = None
    acqDate: str | None = None


class Weather(BaseModel):
    waveHeightM: float | None = None
    windSpeedKmh: float | None = None
    source: str = "open-meteo"


class HazardSources(BaseModel):
    usgs: str = Field(..., description="ok|stale|unavailable|disabled")
    firms: str = Field(..., description="ok|stale|unavailable|disabled")
    meteo: str = Field(..., description="ok|stale|unavailable|disabled")


class HazardsSummaryResponse(BaseModel):
    earthquakes: list[Earthquake]
    fires: list[Fire]
    weather: Weather | None = None
    sources: HazardSources
    updatedAt: str




def _client() -> httpx.AsyncClient | None:
    try:
        return maritime_math.http_client
    except AttributeError:
        return None


async def _fetch_usgs(minLon: float, minLat: float, maxLon: float, maxLat: float) -> tuple[list[dict], str]:
    global _usgs_cache, _usgs_time, _usgs_status
    now = time_module.time()
    if _usgs_cache and (now - _usgs_time) < USGS_TTL:
        return _usgs_cache, "ok"
    client = _client()
    try:
        if client is None:
            async with httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=5.0)) as tmp:
                res = await tmp.get(USGS_URL, timeout=5.0)
                data = res.json()
        else:
            res = await client.get(USGS_URL, timeout=5.0)
            data = res.json()
        out: list[dict] = []
        for feat in (data.get("features") or [])[:200]:
            try:
                geom = feat.get("geometry") or {}
                coords = geom.get("coordinates") or []
                props = feat.get("properties") or {}
                if len(coords) < 2:
                    continue
                lon_f, lat_f = float(coords[0]), float(coords[1])
                if not (minLon <= lon_f <= maxLon and minLat <= lat_f <= maxLat):
                    continue
                mag = props.get("mag")
                t_ms = props.get("time")
                t_iso = None
                if isinstance(t_ms, (int, float)):
                    t_iso = dt.datetime.fromtimestamp(t_ms / 1000.0, tz=dt.UTC).isoformat().replace("+00:00", "Z")
                out.append({"id": str(feat.get("id", "")), "lat": lat_f, "lon": lon_f, "mag": float(mag) if mag is not None else None, "place": props.get("place"), "time": t_iso})
            except (TypeError, ValueError):
                continue
        async with _lock:
            _usgs_cache = out
            _usgs_time = now
            _usgs_status = "ok"
        return out, "ok"
    except Exception as exc:
        logger.warning("hazards_usgs_failed", error=str(exc))
        async with _lock:
            if _usgs_cache:
                _usgs_status = "stale"
                return _usgs_cache, "stale"
            _usgs_status = "unavailable"
            return [], "unavailable"


async def _fetch_firms(minLon: float, minLat: float, maxLon: float, maxLat: float) -> tuple[list[dict], str]:
    global _firms_cache, _firms_time, _firms_status
    now = time_module.time()
    key = (settings.firms_map_key or "").strip()
    if not key:
        _firms_status = "disabled"
        return [], "disabled"
    if _firms_cache and (now - _firms_time) < FIRMS_TTL:
        return _firms_cache, "ok"
    if _firms_budget_hit():
        logger.warning("hazards_firms_budget_exceeded", used=_firms_used)
        async with _lock:
            if _firms_cache:
                _firms_status = "stale"
                return _firms_cache, "stale"
            _firms_status = "unavailable"
            return [], "unavailable"
    # Allow-listed host only; bbox goes into path as query, never as host.
    url = f"{FIRMS_HOST}/api/area/csv/1.0/{key}/VIIRS_SNPP_NRT/world/1"
    try:
        client = _client()
        if client is None:
            async with httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=5.0)) as tmp:
                res = await tmp.get(url, timeout=8.0)
                text = res.text
        else:
            res = await client.get(url, timeout=8.0)
            text = res.text
        reader = csv.DictReader(io.StringIO(text))
        out: list[dict] = []
        for row in reader:
            try:
                lat_f = float(row.get("latitude", ""))
                lon_f = float(row.get("longitude", ""))
            except (TypeError, ValueError):
                continue
            if not (minLon <= lon_f <= maxLon and minLat <= lat_f <= maxLat):
                continue
            out.append({"lat": lat_f, "lon": lon_f, "confidence": (row.get("confidence") or None), "acqDate": (row.get("ac_date") or None)})
            if len(out) >= 500:
                break
        async with _lock:
            _firms_cache = out
            _firms_time = now
            _firms_status = "ok"
        return out, "ok"
    except Exception as exc:
        logger.warning("hazards_firms_failed", error=str(exc))
        async with _lock:
            if _firms_cache:
                _firms_status = "stale"
                return _firms_cache, "stale"
            _firms_status = "unavailable"
            return [], "unavailable"


async def _fetch_meteo(minLon: float, minLat: float, maxLon: float, maxLat: float) -> tuple[dict | None, str]:
    global _meteo_cache, _meteo_time, _meteo_status
    now = time_module.time()
    if _meteo_cache is not None and (now - _meteo_time) < METEO_TTL:
        return _meteo_cache, "ok"
    lat_c = (minLat + maxLat) / 2.0
    lon_c = (minLon + maxLon) / 2.0
    marine_url = f"{METEO_MARINE_HOST}/v1/marine?latitude={lat_c}&longitude={lon_c}&hourly=wave_height&timezone=UTC"
    wind_url = f"{METEO_HOST}/v1/forecast?latitude={lat_c}&longitude={lon_c}&hourly=wind_speed_10m&timezone=UTC"
    try:
        client = _client()
        if client is None:
            async with httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=5.0)) as tmp:
                marine_res, wind_res = await asyncio.gather(tmp.get(marine_url, timeout=5.0), tmp.get(wind_url, timeout=5.0))
                marine = marine_res.json()
                wind = wind_res.json()
        else:
            marine_res, wind_res = await asyncio.gather(client.get(marine_url, timeout=5.0), client.get(wind_url, timeout=5.0))
            marine = marine_res.json()
            wind = wind_res.json()
        wave = None
        try:
            hourly = marine.get("hourly") or {}
            wh = hourly.get("wave_height") or []
            idx = _current_hour_index(hourly.get("time") or [])
            wave = float(wh[idx]) if idx < len(wh) and wh[idx] is not None else None
        except (TypeError, ValueError, IndexError):
            wave = None
        wind_v = None
        try:
            hourly_w = wind.get("hourly") or {}
            ws = hourly_w.get("wind_speed_10m") or []
            idx_w = _current_hour_index(hourly_w.get("time") or [])
            wind_v = float(ws[idx_w]) if idx_w < len(ws) and ws[idx_w] is not None else None
        except (TypeError, ValueError, IndexError):
            wind_v = None
        payload = {"waveHeightM": wave, "windSpeedKmh": wind_v, "source": "open-meteo"}
        async with _lock:
            _meteo_cache = payload
            _meteo_time = now
            _meteo_status = "ok"
        return payload, "ok"
    except Exception as exc:
        logger.warning("hazards_meteo_failed", error=str(exc))
        async with _lock:
            if _meteo_cache is not None:
                _meteo_status = "stale"
                return _meteo_cache, "stale"
            _meteo_status = "unavailable"
            return None, "unavailable"


@router.get("/summary", response_model=HazardsSummaryResponse)
@limiter.limit("30/minute")
async def get_hazards_summary(
    request: Request,
    minLon: float = Query(default=DEFAULT_BBOX["minLon"], ge=-180.0, le=180.0),
    minLat: float = Query(default=DEFAULT_BBOX["minLat"], ge=-90.0, le=90.0),
    maxLon: float = Query(default=DEFAULT_BBOX["maxLon"], ge=-180.0, le=180.0),
    maxLat: float = Query(default=DEFAULT_BBOX["maxLat"], ge=-90.0, le=90.0),
):
    if not (minLon < maxLon and minLat < maxLat):
        raise HTTPException(status_code=422, detail="min must be less than max for lon/lat bounds")
    if (maxLon - minLon) > 30.0 or (maxLat - minLat) > 30.0:
        raise HTTPException(status_code=422, detail="bbox span exceeds 30 degrees per side")
    quakes, firms, meteo = await asyncio.gather(
        _fetch_usgs(minLon, minLat, maxLon, maxLat),
        _fetch_firms(minLon, minLat, maxLon, maxLat),
        _fetch_meteo(minLon, minLat, maxLon, maxLat),
    )
    quake_list, usgs_status = quakes
    fire_list, firms_status = firms
    weather_payload, meteo_status = meteo
    return {
        "earthquakes": quake_list,
        "fires": fire_list,
        "weather": weather_payload,
        "sources": {"usgs": usgs_status, "firms": firms_status, "meteo": meteo_status},
        "updatedAt": _utcnow_iso(),
    }
