"""AIS vessel proxy with demo/stale/unavailable modes.

Reuses the global httpx.AsyncClient from lifespan via maritime_math.http_client.
Live path uses AISStream WebSocket (wss://stream.aisstream.io/v0/stream) with
a bounded collect window. No key means demo-cache mode. Upstream outage never
raises 500; it serves stale cache or unavailable.
"""

from __future__ import annotations

import asyncio
import datetime as dt
import json
import time as time_module

import structlog

logger = structlog.get_logger(__name__)

AIS_WS_URL = "wss://stream.aisstream.io/v0/stream"
AIS_TIMEOUT = 5.0
VESSEL_CACHE_TTL = 30.0
VESSEL_MAX_RESULTS = 500
DEFAULT_BBOX = {"minLon": 80.0, "minLat": 15.0, "maxLon": 95.0, "maxLat": 23.5}
MAX_BBOX_SPAN = 30.0

_vessel_cache: list[dict] | None = None
_vessel_cache_time: float = 0.0
_vessel_lock = asyncio.Lock()

# Daily upstream budget governor (UTC day) for AISStream collects, plus the
# last served mode for the health endpoint.
_ais_day: str = ""
_ais_used: int = 0
_last_mode: str = "unavailable"
_last_collect_time: float = 0.0


def _ais_budget_hit(budget: int) -> bool:
    """True when today's AISStream collects reached the configured budget."""
    global _ais_day, _ais_used
    today = dt.datetime.now(dt.UTC).strftime("%Y-%m-%d")
    if today != _ais_day:
        _ais_day = today
        _ais_used = 0
    if _ais_used >= budget:
        return True
    _ais_used += 1
    return False


def get_vessel_feed_status() -> dict:
    """Snapshot of vessel feed health for the health endpoint."""
    return {
        "mode": _last_mode,
        "cachedAt": _vessel_cache_time,
        "collectsToday": _ais_used,
        "collectDay": _ais_day,
    }


def validate_bbox(minLon: float, minLat: float, maxLon: float, maxLat: float) -> tuple[float, float, float, float]:
    minLon = max(-180.0, min(180.0, float(minLon)))
    maxLon = max(-180.0, min(180.0, float(maxLon)))
    minLat = max(-90.0, min(90.0, float(minLat)))
    maxLat = max(-90.0, min(90.0, float(maxLat)))
    if minLon >= maxLon or minLat >= maxLat:
        raise ValueError("Invalid bbox: require minLon<maxLon and minLat<maxLat")
    if (maxLon - minLon) > MAX_BBOX_SPAN or (maxLat - minLat) > MAX_BBOX_SPAN:
        raise ValueError(f"bbox span exceeds {MAX_BBOX_SPAN} degrees per side")
    return minLon, minLat, maxLon, maxLat


def _utcnow_iso() -> str:
    return dt.datetime.now(dt.UTC).isoformat().replace("+00:00", "Z")


def get_demo_vessels() -> list[dict]:
    base = _utcnow_iso()
    return [
        {"mmsi": "419001234", "name": "NORDIC HALDIA", "lat": 21.55, "lon": 88.12, "sog": 8.4, "cog": 45.0, "draught": 12.5, "shipType": "Bulk Carrier", "timestamp": base, "demo": True},
        {"mmsi": "412356789", "name": "SANDHEADS PIONEER", "lat": 21.35, "lon": 88.45, "sog": 0.5, "cog": 120.0, "draught": 14.0, "shipType": "Bulk Carrier", "timestamp": base, "demo": True},
        {"mmsi": "419876543", "name": "PARADIP STAR", "lat": 20.26, "lon": 86.90, "sog": 10.2, "cog": 90.0, "draught": 11.8, "shipType": "Panamax", "timestamp": base, "demo": True},
        {"mmsi": "413112233", "name": "DHAMRA COAL RUNNER", "lat": 20.79, "lon": 87.10, "sog": 9.1, "cog": 200.0, "draught": 15.2, "shipType": "Capesize", "timestamp": base, "demo": True},
        {"mmsi": "419445566", "name": "HOOGHLY SHUTTLE 3", "lat": 22.03, "lon": 88.06, "sog": 6.0, "cog": 180.0, "draught": 7.1, "shipType": "Supramax", "timestamp": base, "demo": True},
        {"mmsi": "412778899", "name": "BAY BULKER", "lat": 19.50, "lon": 86.50, "sog": 11.0, "cog": 30.0, "draught": 12.0, "shipType": "Supramax", "timestamp": base, "demo": True},
        {"mmsi": "419990011", "name": "NEWCASTLE EXPRESS", "lat": 18.20, "lon": 90.50, "sog": 12.5, "cog": 300.0, "draught": 16.5, "shipType": "Capesize", "timestamp": base, "demo": True},
        {"mmsi": "413445577", "name": "COROMANDEL LIGHT", "lat": 16.80, "lon": 83.20, "sog": 7.8, "cog": 60.0, "draught": 9.5, "shipType": "Handymax", "timestamp": base, "demo": True},
        {"mmsi": "419223344", "name": "SAGAR BANDHU", "lat": 21.10, "lon": 89.00, "sog": 5.4, "cog": 250.0, "draught": 8.2, "shipType": "Supramax", "timestamp": base, "demo": True},
        {"mmsi": "412667788", "name": "EASTERN DILIGENCE", "lat": 22.50, "lon": 91.00, "sog": 9.9, "cog": 140.0, "draught": 10.6, "shipType": "Panamax", "timestamp": base, "demo": True},
    ]


def _normalize_position(mmsi: str, meta: dict, msg: dict) -> dict | None:
    try:
        lat = meta.get("latitude", msg.get("Latitude", msg.get("latitude")))
        lon = meta.get("longitude", msg.get("Longitude", msg.get("longitude")))
        if lat is None or lon is None:
            return None
        lat_f = float(lat)
        lon_f = float(lon)
        sog = msg.get("Sog", msg.get("sog"))
        cog = msg.get("Cog", msg.get("cog"))
        try:
            sog_f = float(sog) if sog is not None else None
        except (TypeError, ValueError):
            sog_f = None
        try:
            cog_f = float(cog) if cog is not None else None
        except (TypeError, ValueError):
            cog_f = None
        name = meta.get("ShipName", meta.get("shipName", "UNKNOWN"))
        name = name.strip() or "UNKNOWN" if isinstance(name, str) else "UNKNOWN"
        ts = meta.get("time_utc", meta.get("TimeUTC", _utcnow_iso()))
        if not isinstance(ts, str):
            ts = _utcnow_iso()
        return {
            "mmsi": str(mmsi),
            "name": str(name)[:64],
            "lat": lat_f,
            "lon": lon_f,
            "sog": sog_f,
            "cog": cog_f,
            "draught": None,
            "shipType": None,
            "timestamp": ts,
            "demo": False,
        }
    except (TypeError, ValueError):
        return None


async def _collect_live(api_key: str, minLon: float, minLat: float, maxLon: float, maxLat: float) -> list[dict]:
    try:
        import websockets  # type: ignore
    except ImportError as exc:
        raise RuntimeError("websockets package not installed") from exc

    # AISStream expects [lat, lon] corner pairs.
    sub = {
        "APIKey": api_key,
        "BoundingBoxes": [[[minLat, minLon], [maxLat, maxLon]]],
        "FilterMessageTypes": ["PositionReport"],
    }
    vessels: dict[str, dict] = {}

    async def _run() -> None:
        async with websockets.connect(AIS_WS_URL, max_size=2**20) as ws:
            await ws.send(json.dumps(sub))
            end = time_module.monotonic() + AIS_TIMEOUT
            async for raw in ws:
                if time_module.monotonic() >= end:
                    break
                try:
                    env = json.loads(raw)
                except (ValueError, TypeError):
                    continue
                if not isinstance(env, dict) or env.get("MessageType") != "PositionReport":
                    continue
                meta = env.get("MetaData") or {}
                inner = (env.get("Message") or {}).get("PositionReport") or {}
                mmsi = str(meta.get("MMSI", inner.get("UserID", "")))
                if not mmsi:
                    continue
                norm = _normalize_position(mmsi, meta, inner)
                if norm is None:
                    continue
                # bbox guard (defensive; server already filters)
                if not (minLat <= norm["lat"] <= maxLat and minLon <= norm["lon"] <= maxLon):
                    continue
                vessels[mmsi] = norm
                if len(vessels) >= VESSEL_MAX_RESULTS:
                    break

    await asyncio.wait_for(_run(), timeout=AIS_TIMEOUT + 1.5)
    return list(vessels.values())[:VESSEL_MAX_RESULTS]


async def get_vessels(
    minLon: float = DEFAULT_BBOX["minLon"],
    minLat: float = DEFAULT_BBOX["minLat"],
    maxLon: float = DEFAULT_BBOX["maxLon"],
    maxLat: float = DEFAULT_BBOX["maxLat"],
    api_key: str = "",
) -> dict:
    global _vessel_cache, _vessel_cache_time, _last_mode, _last_collect_time
    from app.core.config import settings as _settings

    minLon, minLat, maxLon, maxLat = validate_bbox(minLon, minLat, maxLon, maxLat)
    now = time_module.time()

    async with _vessel_lock:
        fresh = _vessel_cache is not None and (now - _vessel_cache_time) < VESSEL_CACHE_TTL
        if fresh and _vessel_cache is not None:
            _last_mode = "live" if api_key else "demo"
            return {"mode": _last_mode, "vessels": _vessel_cache, "updatedAt": _utcnow_iso(), "notice": None}

    if not api_key:
        demo = get_demo_vessels()
        async with _vessel_lock:
            _vessel_cache = demo
            _vessel_cache_time = now
        _last_mode = "demo"
        return {"mode": "demo", "vessels": demo, "updatedAt": _utcnow_iso(), "notice": "Set AISSTREAM_API_KEY for live traffic."}

    budget = getattr(_settings, "aisstream_daily_budget", 5000)
    budget = 5000 if budget is None else int(budget)
    if _ais_budget_hit(budget):
        logger.warning("ais_budget_exceeded", used=_ais_used)
        async with _vessel_lock:
            if _vessel_cache is not None:
                age_s = int(now - _vessel_cache_time) if _vessel_cache_time else 0
                _last_mode = "stale"
                return {
                    "mode": "stale",
                    "vessels": _vessel_cache,
                    "updatedAt": _utcnow_iso(),
                    "notice": f"Daily upstream budget reached, showing last known traffic ({age_s}s old).",
                }
        _last_mode = "unavailable"
        return {"mode": "unavailable", "vessels": [], "updatedAt": _utcnow_iso(), "notice": "Daily upstream budget reached. Retry tomorrow."}

    try:
        live = await _collect_live(api_key, minLon, minLat, maxLon, maxLat)
        if not live:
            raise RuntimeError("empty live snapshot")
        async with _vessel_lock:
            _vessel_cache = live
            _vessel_cache_time = now
        _last_mode = "live"
        _last_collect_time = now
        return {"mode": "live", "vessels": live, "updatedAt": _utcnow_iso(), "notice": None}
    except Exception as exc:
        logger.warning("ais_upstream_failed", error=str(exc))
        async with _vessel_lock:
            if _vessel_cache is not None:
                age_s = int(now - _vessel_cache_time) if _vessel_cache_time else 0
                _last_mode = "stale"
                return {
                    "mode": "stale",
                    "vessels": _vessel_cache,
                    "updatedAt": _utcnow_iso(),
                    "notice": f"Live feed unavailable, showing last known traffic ({age_s}s old).",
                }
        _last_mode = "unavailable"
        return {"mode": "unavailable", "vessels": [], "updatedAt": _utcnow_iso(), "notice": "Live vessel feed unavailable. Retry shortly."}


def get_cached_vessels() -> list[dict] | None:
    return _vessel_cache
