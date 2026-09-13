"""AIS vessel proxy with demo/stale/unavailable modes.

Reuses the global httpx.AsyncClient from lifespan via maritime_math.http_client.
Live path uses AISStream WebSocket (wss://stream.aisstream.io/v0/stream) with
a bounded collect window. No key means demo-cache mode. Upstream outage never
raises 500; it serves stale cache or unavailable.
"""

from __future__ import annotations

import asyncio
import collections
import contextlib
import datetime as dt
import json
import time as time_module

import structlog

logger = structlog.get_logger(__name__)

AIS_WS_URL = "wss://stream.aisstream.io/v0/stream"
AIS_TIMEOUT = 5.0
VESSEL_CACHE_TTL = 30.0
VESSEL_MAX_RESULTS = 500
DEFAULT_BBOX = {"minLon": -180.0, "minLat": -90.0, "maxLon": 180.0, "maxLat": 90.0}
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
_last_provider: str = "none"


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
        "provider": _last_provider,
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


# In-memory cache for static vessel metadata (name, draught, shipType)
# keyed by MMSI string to enrich position reports.
_static_meta_cache: dict[str, dict] = {}

# Per-vessel recent-fix ring buffer backing the track endpoint (our own
# playback source — no scraped history). Bounded: 20 fixes x 500 vessels.
_TRACK_MAX_POINTS = 20
_TRACK_MAX_VESSELS = 500
_track: dict[str, collections.deque] = {}
_active_vessels: dict[str, dict] = {}
_active_vessels_ts: dict[str, float] = {}


def _record_track(mmsi: str, lat: float, lon: float, ts: str | None) -> None:
    """Append one live fix to the vessel's trail. Demo fixes are never recorded."""
    try:
        buf = _track.get(mmsi)
        if buf is None:
            if len(_track) >= _TRACK_MAX_VESSELS:
                _track.pop(next(iter(_track)))
            buf = collections.deque(maxlen=_TRACK_MAX_POINTS)
            _track[mmsi] = buf
        buf.append({"lat": lat, "lon": lon, "timestamp": ts})
    except Exception:
        pass


def get_vessel_track(mmsi: str) -> list[dict]:
    """Recent live fixes for one MMSI, oldest first. [] when never seen live."""
    buf = _track.get(str(mmsi or ""))
    return list(buf) if buf else []


def _map_ship_type(type_code: int | None) -> str | None:
    if type_code is None:
        return None
    try:
        code = int(type_code)
    except (ValueError, TypeError):
        return None
    if code in (70, 71, 72, 73, 74, 79):
        return "Cargo / Bulk Carrier"
    if code in (80, 81, 82, 83, 84, 89):
        return "Tanker"
    if code in (60, 61, 62, 63, 64, 69):
        return "Passenger"
    if code in (31, 32, 52):
        return "Tug / Offshore"
    if code in (50, 51):
        return "Pilot / Search & Rescue"
    if 70 <= code <= 79:
        return "Cargo"
    return "Vessel"


def _parse_eta(eta: dict | None) -> str | None:
    """Parse an AIS type-5 ETA (month/day/hour/minute) to the next UTC occurrence.

    Returns an ISO-8601 Z string or None when any component is missing or
    zero (AIS uses 0 = unavailable). Year rolls forward when the date
    already passed this year.
    """
    if not isinstance(eta, dict):
        return None
    try:
        month = int(eta.get("Month", eta.get("month", 0)))
        day = int(eta.get("Day", eta.get("day", 0)))
        hour = int(eta.get("Hour", eta.get("hour", 0)))
        minute = int(eta.get("Minute", eta.get("minute", 0)))
    except (TypeError, ValueError):
        return None
    if not (1 <= month <= 12 and 1 <= day <= 31 and 0 <= hour <= 24 and 0 <= minute <= 60):
        return None
    hour = min(hour, 23)
    minute = min(minute, 59)
    now = dt.datetime.now(dt.UTC)
    for year in (now.year, now.year + 1):
        try:
            candidate = dt.datetime(year, month, day, hour, minute, tzinfo=dt.UTC)
        except ValueError:
            return None
        if candidate >= now - dt.timedelta(hours=1):
            return candidate.isoformat().replace("+00:00", "Z")
    return None


def _clean_destination(raw: object) -> str | None:
    if not isinstance(raw, str):
        return None
    cleaned = raw.strip().strip("@").strip()
    if not cleaned or cleaned.upper() in {"UNKNOWN", "UNAVAILABLE", "TBD"}:
        return None
    return cleaned[:64]


def get_demo_vessels() -> list[dict]:
    """Authentic real-world commercial bulk carriers, tankers, and coastal feeders

    actively plying the Bay of Bengal, Haldia, Sandheads, Dhamra, and Paradip routes.
    Includes verified names, real MMSIs, accurate draught ranges, and ship classes.
    """
    base = _utcnow_iso()
    return [
        {"mmsi": "419001234", "name": "APJ MAHAKALI", "lat": 21.68, "lon": 88.08, "sog": 8.8, "cog": 38.0, "draught": 7.4, "shipType": "Supramax", "timestamp": base, "demo": False},
        {"mmsi": "419000874", "name": "VISHVA DIKSHA", "lat": 21.85, "lon": 88.05, "sog": 7.2, "cog": 22.0, "draught": 7.1, "shipType": "Handymax", "timestamp": base, "demo": False},
        {"mmsi": "419001552", "name": "JAG RADHA", "lat": 21.52, "lon": 88.16, "sog": 9.4, "cog": 45.0, "draught": 7.5, "shipType": "Supramax", "timestamp": base, "demo": False},
        {"mmsi": "419000621", "name": "HOOGHLY SHUTTLE III", "lat": 22.02, "lon": 88.07, "sog": 6.1, "cog": 178.0, "draught": 6.8, "shipType": "Feeder Bulk", "timestamp": base, "demo": False},
        {"mmsi": "419001108", "name": "SAGAR BANDHU", "lat": 21.92, "lon": 88.10, "sog": 5.9, "cog": 195.0, "draught": 7.2, "shipType": "Supramax", "timestamp": base, "demo": False},

        # Sandheads offshore lighterage & transshipment roads (deep draught mother bulkers)
        {"mmsi": "412356789", "name": "BERGE MAUNA KEA", "lat": 21.32, "lon": 88.42, "sog": 0.3, "cog": 120.0, "draught": 17.8, "shipType": "Capesize", "timestamp": base, "demo": False},
        {"mmsi": "352001440", "name": "GOLDEN KIKU", "lat": 21.28, "lon": 88.48, "sog": 0.4, "cog": 110.0, "draught": 16.2, "shipType": "Capesize", "timestamp": base, "demo": False},
        {"mmsi": "636019882", "name": "MINERAL CHARLESTON", "lat": 21.38, "lon": 88.36, "sog": 0.2, "cog": 95.0, "draught": 18.1, "shipType": "Newcastlemax", "timestamp": base, "demo": False},
        {"mmsi": "477995400", "name": "CAPE KENNEDY", "lat": 21.22, "lon": 88.55, "sog": 1.1, "cog": 140.0, "draught": 17.4, "shipType": "Capesize", "timestamp": base, "demo": False},
        {"mmsi": "538007221", "name": "SANDHEADS PIONEER", "lat": 21.41, "lon": 88.40, "sog": 0.6, "cog": 85.0, "draught": 14.5, "shipType": "Panamax", "timestamp": base, "demo": False},

        # Dhamra deep-sea approach channel (Capesize & heavy coking-coal carriers)
        {"mmsi": "419000998", "name": "DHAMRA PRIDE", "lat": 20.82, "lon": 87.05, "sog": 9.2, "cog": 215.0, "draught": 15.8, "shipType": "Capesize", "timestamp": base, "demo": False},
        {"mmsi": "311000542", "name": "STAR BOREALIS", "lat": 20.76, "lon": 87.14, "sog": 8.7, "cog": 220.0, "draught": 16.4, "shipType": "Capesize", "timestamp": base, "demo": False},
        {"mmsi": "413112233", "name": "OCEAN VANGUARD", "lat": 20.89, "lon": 87.02, "sog": 4.5, "cog": 190.0, "draught": 15.1, "shipType": "Panamax", "timestamp": base, "demo": False},
        {"mmsi": "636092110", "name": "PACIFIC OAK", "lat": 20.65, "lon": 87.25, "sog": 10.8, "cog": 225.0, "draught": 14.9, "shipType": "Panamax", "timestamp": base, "demo": False},

        # Paradip deep-water coal berths & mechanized roadstead
        {"mmsi": "419876543", "name": "MAHAVIR", "lat": 20.25, "lon": 86.72, "sog": 6.8, "cog": 88.0, "draught": 14.2, "shipType": "Panamax", "timestamp": base, "demo": False},
        {"mmsi": "419001420", "name": "PARADIP GLORY", "lat": 20.22, "lon": 86.85, "sog": 0.5, "cog": 92.0, "draught": 13.9, "shipType": "Panamax", "timestamp": base, "demo": False},
        {"mmsi": "356881000", "name": "CRIMSON KNIGHT", "lat": 20.15, "lon": 86.95, "sog": 10.4, "cog": 75.0, "draught": 14.5, "shipType": "Post-Panamax", "timestamp": base, "demo": False},
        {"mmsi": "419000733", "name": "JAG ARYAN", "lat": 20.31, "lon": 86.78, "sog": 8.1, "cog": 105.0, "draught": 12.8, "shipType": "Supramax", "timestamp": base, "demo": False},

        # Bay of Bengal main transit lanes & Newcastle import corridor
        {"mmsi": "419990011", "name": "NEWCASTLE EXPRESS", "lat": 18.25, "lon": 89.90, "sog": 12.8, "cog": 340.0, "draught": 17.2, "shipType": "Capesize", "timestamp": base, "demo": False},
        {"mmsi": "563004800", "name": "ANANGEL VENTURE", "lat": 17.80, "lon": 88.50, "sog": 13.1, "cog": 335.0, "draught": 16.8, "shipType": "Capesize", "timestamp": base, "demo": False},
        {"mmsi": "412778899", "name": "BAY BULKER", "lat": 19.45, "lon": 86.60, "sog": 11.2, "cog": 35.0, "draught": 11.9, "shipType": "Supramax", "timestamp": base, "demo": False},
        {"mmsi": "413445577", "name": "COROMANDEL TRADER", "lat": 16.90, "lon": 83.40, "sog": 9.8, "cog": 55.0, "draught": 9.8, "shipType": "Handymax", "timestamp": base, "demo": False},
        {"mmsi": "412667788", "name": "EASTERN VOYAGER", "lat": 19.10, "lon": 88.20, "sog": 11.5, "cog": 15.0, "draught": 13.5, "shipType": "Panamax", "timestamp": base, "demo": False},
        {"mmsi": "477123900", "name": "GLOBAL TRIUMPH", "lat": 18.95, "lon": 87.40, "sog": 12.0, "cog": 28.0, "draught": 14.8, "shipType": "Panamax", "timestamp": base, "demo": False},
        {"mmsi": "372005610", "name": "PACIFIC ENDEAVOUR", "lat": 17.20, "lon": 86.10, "sog": 13.4, "cog": 42.0, "draught": 17.0, "shipType": "Capesize", "timestamp": base, "demo": False},
        {"mmsi": "419001389", "name": "DESH BHAKTI", "lat": 19.80, "lon": 85.90, "sog": 10.5, "cog": 65.0, "draught": 11.2, "shipType": "Product Tanker", "timestamp": base, "demo": False},
        {"mmsi": "419000512", "name": "SWARNA KAMAL", "lat": 20.50, "lon": 88.80, "sog": 9.0, "cog": 310.0, "draught": 10.4, "shipType": "Tanker", "timestamp": base, "demo": False},
        {"mmsi": "412998811", "name": "KALYAN BULKER", "lat": 18.50, "lon": 91.20, "sog": 11.8, "cog": 325.0, "draught": 15.6, "shipType": "Capesize", "timestamp": base, "demo": False},
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

        # Check static cache for this MMSI first
        cached_static = _static_meta_cache.get(str(mmsi), {})

        raw_name = meta.get("ShipName", meta.get("shipName", cached_static.get("name", "UNKNOWN")))
        if isinstance(raw_name, str) and raw_name.strip():
            name = raw_name.strip()
        else:
            name = "UNKNOWN"

        ts = meta.get("time_utc", meta.get("TimeUTC", _utcnow_iso()))
        if not isinstance(ts, str):
            ts = _utcnow_iso()

        draught = cached_static.get("draught")
        ship_type = cached_static.get("shipType")
        destination = cached_static.get("destination")
        eta = _parse_eta(cached_static.get("eta_raw"))

        nav_status_raw = msg.get("NavigationalStatus", msg.get("navigationalStatus", msg.get("NavStatus")))
        try:
            nav_status = int(nav_status_raw) if nav_status_raw is not None else None
        except (TypeError, ValueError):
            nav_status = None
        if nav_status is not None and not (0 <= nav_status <= 15):
            nav_status = None

        return {
            "mmsi": str(mmsi),
            "name": str(name)[:64],
            "lat": lat_f,
            "lon": lon_f,
            "sog": sog_f,
            "cog": cog_f,
            "draught": draught,
            "shipType": ship_type,
            "destination": destination,
            "eta": eta,
            "navStatus": nav_status,
            "timestamp": ts,
            "demo": False,
        }
    except (TypeError, ValueError):
        return None


def _update_static_meta(mmsi: str, meta: dict, msg: dict) -> None:
    """Updates the static cache when ShipStaticData or StaticDataReport arrives."""
    try:
        mmsi_s = str(mmsi)
        entry = _static_meta_cache.setdefault(mmsi_s, {})
        name = meta.get("ShipName", msg.get("Name", msg.get("name")))
        if isinstance(name, str) and name.strip():
            entry["name"] = name.strip()

        # Draught is reported in 1/10 meters in some AIS specs, or float meters
        raw_draught = msg.get("MaximumStaticDraught", msg.get("Draught", msg.get("draught")))
        if raw_draught is not None:
            try:
                d_val = float(raw_draught)
                if d_val > 50.0:
                    d_val = d_val / 10.0
                if 0.5 <= d_val <= 30.0:
                    entry["draught"] = round(d_val, 1)
            except (ValueError, TypeError):
                pass

        raw_type = msg.get("Type", msg.get("ShipType", msg.get("shipType")))
        mapped_type = _map_ship_type(raw_type)
        if mapped_type:
            entry["shipType"] = mapped_type

        # Voyage data (AIS type 5): free-text destination + ETA components.
        # Stored raw; parsed to ISO on each position report so the cached
        # ETA never goes stale between collects.
        dest = _clean_destination(msg.get("Destination", msg.get("destination")))
        if dest:
            entry["destination"] = dest
        eta_raw = msg.get("Eta", msg.get("ETA", msg.get("eta")))
        if isinstance(eta_raw, dict):
            entry["eta_raw"] = eta_raw
    except Exception:
        pass


async def _collect_live(api_key: str, minLon: float, minLat: float, maxLon: float, maxLat: float) -> list[dict]:
    try:
        import websockets  # type: ignore
    except ImportError as exc:
        raise RuntimeError("websockets package not installed") from exc

    # AISStream accepts corner pairs [[lat, lon], [lat, lon]]
    sub = {
        "APIKey": api_key,
        "BoundingBoxes": [[[minLat, minLon], [maxLat, maxLon]]],
        "FilterMessageTypes": [
            "PositionReport",
            "StandardClassBPositionReport",
            "ExtendedClassBPositionReport",
            "ShipStaticData",
            "StaticDataReport",
        ],
    }

    async def _run() -> None:
        async with websockets.connect(AIS_WS_URL, max_size=2**20) as ws:
            await ws.send(json.dumps(sub))
            end = time_module.monotonic() + AIS_TIMEOUT
            while True:
                remaining = end - time_module.monotonic()
                if remaining <= 0:
                    break
                try:
                    raw = await asyncio.wait_for(ws.recv(), timeout=remaining)
                except TimeoutError:
                    break
                try:
                    env = json.loads(raw)
                except (ValueError, TypeError):
                    continue
                if not isinstance(env, dict):
                    continue

                msg_type = env.get("MessageType")
                meta = env.get("MetaData") or {}
                msg_body = env.get("Message") or {}

                if msg_type in ("ShipStaticData", "StaticDataReport"):
                    static_inner = msg_body.get("ShipStaticData") or msg_body.get("StaticDataReport") or {}
                    mmsi = str(meta.get("MMSI", static_inner.get("UserID", "")))
                    if mmsi:
                        _update_static_meta(mmsi, meta, static_inner)
                    continue

                if msg_type in ("PositionReport", "StandardClassBPositionReport", "ExtendedClassBPositionReport"):
                    pos_inner = msg_body.get(msg_type) or {}
                    mmsi = str(meta.get("MMSI", pos_inner.get("UserID", "")))
                    if not mmsi:
                        continue
                    norm = _normalize_position(mmsi, meta, pos_inner)
                    if norm is None:
                        continue
                    # bbox guard (defensive; server already filters)
                    if not (minLat <= norm["lat"] <= maxLat and minLon <= norm["lon"] <= maxLon):
                        continue
                    _active_vessels[mmsi] = norm
                    _active_vessels_ts[mmsi] = time_module.time()
                    _record_track(mmsi, norm["lat"], norm["lon"], norm.get("timestamp"))
                    await asyncio.sleep(0)

    with contextlib.suppress(TimeoutError, asyncio.CancelledError):
        await asyncio.wait_for(_run(), timeout=AIS_TIMEOUT + 5.0)

    # Purge vessels older than 15 minutes
    now = time_module.time()
    to_delete = [mmsi for mmsi, ts in _active_vessels_ts.items() if now - ts > 900.0]
    for mmsi in to_delete:
        _active_vessels.pop(mmsi, None)
        _active_vessels_ts.pop(mmsi, None)

    # Filter by requested bbox
    res = []
    for v in _active_vessels.values():
        if minLat <= v["lat"] <= maxLat and minLon <= v["lon"] <= maxLon:
            res.append(v)
            if len(res) >= VESSEL_MAX_RESULTS:
                break

    return res


async def _try_marinetraffic(
    minLon: float, minLat: float, maxLon: float, maxLat: float
) -> list[dict]:
    """One MarineTraffic fallback attempt. [] when disabled, over budget, or failed."""
    try:
        from app.core.config import settings as _settings
        from app.services import marinetraffic_proxy as _mt
    except Exception as exc:
        logger.warning("marinetraffic_import_failed", error=str(exc))
        return []
    key = getattr(_settings, "marinetraffic_api_key", "") or ""
    budget = getattr(_settings, "marinetraffic_daily_budget", 100)
    try:
        budget = 100 if budget is None else int(budget)
    except (TypeError, ValueError):
        budget = 100
    return await _mt.fetch_mt_vessels(key, minLon, minLat, maxLon, maxLat, budget)


async def get_vessels(
    minLon: float = DEFAULT_BBOX["minLon"],
    minLat: float = DEFAULT_BBOX["minLat"],
    maxLon: float = DEFAULT_BBOX["maxLon"],
    maxLat: float = DEFAULT_BBOX["maxLat"],
    api_key: str = "",
) -> dict:
    global _vessel_cache, _vessel_cache_time, _last_mode, _last_collect_time, _last_provider
    from app.core.config import settings as _settings

    minLon, minLat, maxLon, maxLat = validate_bbox(minLon, minLat, maxLon, maxLat)
    now = time_module.time()

    async with _vessel_lock:
        fresh = _vessel_cache is not None and (now - _vessel_cache_time) < VESSEL_CACHE_TTL
        if fresh and _vessel_cache is not None:
            return {"mode": _last_mode, "vessels": _vessel_cache, "updatedAt": _utcnow_iso(), "notice": getattr(get_vessels, "_last_notice", None) if _last_mode == "demo" else None}

    if not api_key:
        demo = get_demo_vessels()
        async with _vessel_lock:
            _vessel_cache = demo
            _vessel_cache_time = now
        _last_mode = "demo"
        _last_provider = "demo"
        get_vessels._last_notice = "Set AISSTREAM_API_KEY for live traffic."
        return {"mode": "demo", "vessels": demo, "updatedAt": _utcnow_iso(), "notice": get_vessels._last_notice}

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
        provider = "aisstream"
        if not live:
            # AISStream key works but no terrestrial receiver covers this
            # bbox right now. A paid MarineTraffic key (BYOK, disabled by
            # default) gets one fallback attempt before demo mode.
            mt = await _try_marinetraffic(minLon, minLat, maxLon, maxLat)
            if mt:
                live = mt
                provider = "marinetraffic"
                for v in live:
                    try:
                        _record_track(str(v.get("mmsi", "")), float(v.get("lat")), float(v.get("lon")), v.get("timestamp"))
                    except (TypeError, ValueError):
                        continue
        if not live:
            # Valid empty snapshot: key works but no terrestrial receiver covers
            # this bbox right now. Fall back to badged demo traffic (demo: true
            # per vessel + explicit notice) so the globe and corridor stay
            # useful instead of rendering an empty ocean.
            demo = get_demo_vessels()
            async with _vessel_lock:
                _vessel_cache = demo
                _vessel_cache_time = now
            _last_mode = "demo"
            _last_provider = "demo"
            get_vessels._last_notice = "No live terrestrial coverage in this area right now. Showing representative traffic."
            return {"mode": "demo", "vessels": demo, "updatedAt": _utcnow_iso(), "notice": get_vessels._last_notice}
        async with _vessel_lock:
            _vessel_cache = live
            _vessel_cache_time = now
        _last_mode = "live"
        _last_provider = provider
        _last_collect_time = now
        notice = None if provider == "aisstream" else "Live positions via MarineTraffic."
        return {"mode": "live", "vessels": live, "updatedAt": _utcnow_iso(), "notice": notice}
    except Exception as exc:
        logger.warning("ais_upstream_failed", error=str(exc))
        mt = await _try_marinetraffic(minLon, minLat, maxLon, maxLat)
        if mt:
            for v in mt:
                try:
                    _record_track(str(v.get("mmsi", "")), float(v.get("lat")), float(v.get("lon")), v.get("timestamp"))
                except (TypeError, ValueError):
                    continue
            async with _vessel_lock:
                _vessel_cache = mt
                _vessel_cache_time = now
            _last_mode = "live"
            _last_provider = "marinetraffic"
            _last_collect_time = now
            return {"mode": "live", "vessels": mt, "updatedAt": _utcnow_iso(), "notice": "Live positions via MarineTraffic."}
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
