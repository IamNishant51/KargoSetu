"""Port-context endpoints: GDELT news, Nominatim reverse-geocode, route weather.

All three are keyless, fault-isolated, TTL-cached with serve-stale, and never
fail with 500 for an upstream outage. No browser-direct third-party calls:
the globe reads these through FastAPI only.
"""

from __future__ import annotations

import asyncio
import datetime as dt
import time as time_module

import httpx
import structlog
from fastapi import APIRouter, Query, Request
from pydantic import BaseModel, Field
from slowapi import Limiter
from slowapi.util import get_remote_address

import app.services.maritime_math as maritime_math
from app.services.meteo_common import current_hour_index, utcnow_iso

router = APIRouter(prefix="/api/v1/context", tags=["context"])
limiter = Limiter(key_func=get_remote_address)
logger = structlog.get_logger(__name__)

GDELT_HOST = "https://api.gdeltproject.org"
NOMINATIM_HOST = "https://nominatim.openstreetmap.org"
METEO_MARINE_HOST = "https://marine-api.open-meteo.com"
METEO_HOST = "https://api.open-meteo.com"

NEWS_TTL = 900.0
GEO_TTL = 300.0
ROUTE_WX_TTL = 300.0
NEWS_MAX_RECORDS = 8

# Fixed metocean sampling points along the corridor (id, lat, lon).
ROUTE_WAYPOINTS = [
    {"id": "sandheads", "lat": 21.35, "lon": 88.45},
    {"id": "midbay", "lat": 19.50, "lon": 87.50},
    {"id": "haldia-roads", "lat": 21.90, "lon": 88.10},
    {"id": "paradip-roads", "lat": 20.20, "lon": 86.90},
    {"id": "dhamra-roads", "lat": 20.70, "lon": 87.10},
]

_news_cache: dict[str, tuple[list[dict], float]] = {}
_geo_cache: dict[str, tuple[dict, float]] = {}
_route_wx_cache: list[dict] | None = None
_route_wx_time: float = 0.0
_lock = asyncio.Lock()
_nominatim_last: float = 0.0


def _client() -> httpx.AsyncClient | None:
    try:
        return maritime_math.http_client
    except AttributeError:
        return None


async def _get_json(url: str, params: dict | None = None, headers: dict | None = None, timeout: float = 6.0):
    client = _client()
    if client is None:
        async with httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=5.0)) as tmp:
            res = await tmp.get(url, params=params, headers=headers, timeout=timeout)
            return res.json()
    res = await client.get(url, params=params, headers=headers, timeout=timeout)
    return res.json()


class NewsItem(BaseModel):
    title: str
    url: str | None = None
    source: str | None = None
    date: str | None = None


class NewsResponse(BaseModel):
    query: str
    items: list[NewsItem]
    source: str = "gdelt"
    updatedAt: str


class GeoResponse(BaseModel):
    label: str | None = None
    lat: float
    lon: float
    source: str = "nominatim"


class RouteWxPoint(BaseModel):
    id: str
    lat: float
    lon: float
    waveHeightM: float | None = None
    windSpeedKmh: float | None = None


class RouteWxResponse(BaseModel):
    points: list[RouteWxPoint]
    source: str = "open-meteo"
    updatedAt: str


def sanitize_news_item(raw: dict) -> dict | None:
    """Pick only the fields we render; drop anything malformed."""
    if not isinstance(raw, dict):
        return None
    title = raw.get("title")
    if not isinstance(title, str) or not title.strip():
        return None
    url = raw.get("url")
    return {
        "title": title.strip()[:200],
        "url": url if isinstance(url, str) and url.startswith("http") else None,
        "source": str(raw.get("domain") or raw.get("source") or "")[:80] or None,
        "date": str(raw.get("seendate") or raw.get("date") or "")[:32] or None,
    }


def geo_cell_key(lat: float, lon: float) -> str:
    """0.1-degree cache cell, matching the Nominatim usage-policy pattern."""
    return f"{round(lat, 1):.1f},{round(lon, 1):.1f}"


def _geo_label(data: dict) -> str | None:
    if not isinstance(data, dict):
        return None
    addr = data.get("address") or {}
    parts = [addr.get("city") or addr.get("town") or addr.get("village") or addr.get("county"), addr.get("state"), addr.get("country")]
    label = ", ".join(p for p in parts if isinstance(p, str) and p)
    if label:
        return label[:160]
    disp = data.get("display_name")
    return str(disp)[:160] if isinstance(disp, str) and disp else None


@router.get("/news/port", response_model=NewsResponse)
@limiter.limit("30/minute")
async def get_port_news(
    request: Request,
    q: str = Query(default="Haldia", min_length=2, max_length=60),
    maxRecords: int = Query(default=8, ge=1, le=15),
):
    query = f"{q.strip()} port shipping".strip()
    now = time_module.time()
    cached = _news_cache.get(query)
    if cached and (now - cached[1]) < NEWS_TTL:
        items, _ = cached
        return {"query": query, "items": items, "source": "gdelt", "updatedAt": utcnow_iso()}
    try:
        # Allow-listed host only; user input travels as query params.
        data = await _get_json(
            f"{GDELT_HOST}/api/v2/doc/doc",
            params={"query": query, "mode": "artlist", "maxrecords": maxRecords, "format": "json"},
            timeout=6.0,
        )
        arts = data.get("articles") if isinstance(data, dict) else None
        items: list[dict] = []
        for raw in arts or []:
            clean = sanitize_news_item(raw)
            if clean:
                items.append(clean)
            if len(items) >= maxRecords:
                break
        async with _lock:
            _news_cache[query] = (items, now)
        return {"query": query, "items": items, "source": "gdelt", "updatedAt": utcnow_iso()}
    except Exception as exc:
        logger.warning("context_news_failed", error=str(exc))
        async with _lock:
            if cached:
                items, _ = cached
                return {"query": query, "items": items, "source": "gdelt", "updatedAt": utcnow_iso()}
        return {"query": query, "items": [], "source": "gdelt", "updatedAt": utcnow_iso()}


@router.get("/geo/reverse", response_model=GeoResponse)
@limiter.limit("30/minute")
async def get_reverse_geocode(
    request: Request,
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0),
):
    global _nominatim_last
    key = geo_cell_key(lat, lon)
    now = time_module.time()
    cached = _geo_cache.get(key)
    if cached and (now - cached[1]) < GEO_TTL:
        payload, _ = cached
        return payload
    try:
        # Serialize Nominatim to at most 1 req/s per the usage policy.
        async with _lock:
            gap = now - _nominatim_last
            if gap < 1.0:
                await asyncio.sleep(1.0 - gap)
            data = await _get_json(
                f"{NOMINATIM_HOST}/reverse",
                params={"lat": lat, "lon": lon, "format": "jsonv2"},
                headers={"User-Agent": "KargoSetu/2.0 (SIH26006; contact: desk)"},
                timeout=6.0,
            )
            _nominatim_last = time_module.time()
        payload = {"label": _geo_label(data), "lat": lat, "lon": lon, "source": "nominatim"}
        async with _lock:
            _geo_cache[key] = (payload, now)
        return payload
    except Exception as exc:
        logger.warning("context_geo_failed", error=str(exc))
        async with _lock:
            if cached:
                payload, _ = cached
                return payload
        return {"label": None, "lat": lat, "lon": lon, "source": "nominatim"}


async def _fetch_route_point(wp: dict) -> dict:
    lat, lon = wp["lat"], wp["lon"]
    try:
        marine, wind = await asyncio.gather(
            _get_json(f"{METEO_MARINE_HOST}/v1/marine?latitude={lat}&longitude={lon}&hourly=wave_height,time&timezone=UTC"),
            _get_json(f"{METEO_HOST}/v1/forecast?latitude={lat}&longitude={lon}&hourly=wind_speed_10m,time&timezone=UTC"),
        )
        wave = wind_v = None
        try:
            hourly = (marine.get("hourly") or {}) if isinstance(marine, dict) else {}
            wh = hourly.get("wave_height") or []
            idx = current_hour_index(hourly.get("time") or [])
            wave = float(wh[idx]) if idx < len(wh) and wh[idx] is not None else None
        except (TypeError, ValueError, IndexError):
            pass
        try:
            hourly_w = (wind.get("hourly") or {}) if isinstance(wind, dict) else {}
            ws = hourly_w.get("wind_speed_10m") or []
            idx_w = current_hour_index(hourly_w.get("time") or [])
            wind_v = float(ws[idx_w]) if idx_w < len(ws) and ws[idx_w] is not None else None
        except (TypeError, ValueError, IndexError):
            pass
        return {"id": wp["id"], "lat": lat, "lon": lon, "waveHeightM": wave, "windSpeedKmh": wind_v}
    except Exception as exc:
        logger.warning("context_route_wx_point_failed", point=wp["id"], error=str(exc))
        return {"id": wp["id"], "lat": lat, "lon": lon, "waveHeightM": None, "windSpeedKmh": None}


@router.get("/route/weather", response_model=RouteWxResponse)
@limiter.limit("30/minute")
async def get_route_weather(request: Request):
    global _route_wx_cache, _route_wx_time
    now = time_module.time()
    if _route_wx_cache is not None and (now - _route_wx_time) < ROUTE_WX_TTL:
        return {"points": _route_wx_cache, "source": "open-meteo", "updatedAt": utcnow_iso()}
    points = await asyncio.gather(*[_fetch_route_point(wp) for wp in ROUTE_WAYPOINTS])
    async with _lock:
        _route_wx_cache = list(points)
        _route_wx_time = now
    return {"points": list(points), "source": "open-meteo", "updatedAt": utcnow_iso()}
