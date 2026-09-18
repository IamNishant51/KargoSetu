"""MarineTraffic AIS positions provider (optional, BYOK).

MarineTraffic offers NO free API tier: access is credit-based via Kpler
sales and website accounts do not include API access. This module is
therefore strictly opt-in — it activates only when MARINETRAFFIC_API_KEY
is set (HF Spaces secret or local .env, never committed). With no key it
returns [] and the caller keeps its existing AISStream/demo behavior.

Endpoint mirrored from https://servicedocs.marinetraffic.com (exportvessels):
  GET https://services.marinetraffic.com/api/exportvessels/{key}
      ?v=8&MINLAT=..&MAXLAT=..&MINLON=..&MAXLON=..&protocol=jsono
Rows are mapped defensively onto our frozen vessel shape; unknown or
missing fields degrade to None, never to 500. Each call spends one
MarineTraffic credit batch, so a daily budget governor caps upstream
calls and serves [] over budget.
"""

from __future__ import annotations

import datetime as dt

import structlog

logger = structlog.get_logger(__name__)

MT_HOST = "https://services.marinetraffic.com"
MT_EXPORT_PATH = "/api/exportvessels"
MT_API_VERSION = "8"

_mt_day: str = ""
_mt_used: int = 0


def _client():
    try:
        import app.services.maritime_math as maritime_math

        return maritime_math.http_client
    except AttributeError:
        return None


def _budget_hit(budget: int) -> bool:
    global _mt_day, _mt_used
    today = dt.datetime.now(dt.UTC).strftime("%Y-%m-%d")
    if today != _mt_day:
        _mt_day = today
        _mt_used = 0
    if _mt_used >= budget:
        return True
    _mt_used += 1
    return False


def _num(value: object) -> float | None:
    try:
        return float(value) if value is not None else None
    except (TypeError, ValueError):
        return None


def _str(value: object, limit: int = 64) -> str | None:
    if not isinstance(value, str):
        return None
    cleaned = value.strip()
    return cleaned[:limit] if cleaned else None


def _map_mt_row(row: object) -> dict | None:
    """Map one MarineTraffic jsono position row onto our vessel shape."""
    if not isinstance(row, dict):
        return None
    try:
        lat = _num(row.get("LAT", row.get("Latitude", row.get("latitude"))))
        lon = _num(row.get("LON", row.get("Longitude", row.get("longitude"))))
        if lat is None or lon is None:
            return None
        mmsi = row.get("MMSI", row.get("MMSI_NUMBER", row.get("mmsi")))
        if mmsi is None:
            return None
        ts = row.get("TIMESTAMP", row.get("LAST_POS", row.get("timestamp")))
        if not isinstance(ts, str):
            ts = dt.datetime.now(dt.UTC).isoformat().replace("+00:00", "Z")

        from app.services.ais_proxy import _map_ship_type

        ship_type = _map_ship_type(
            row.get("SHIPTYPE", row.get("TYPE", row.get("shipType")))
        )

        draught = _num(row.get("DRAUGHT", row.get("DRAFT", row.get("draught"))))
        if draught is not None and not (0.5 <= draught <= 30.0):
            draught = None

        nav_status = row.get("STATUS", row.get("NAV_STATUS", row.get("navStatus")))
        try:
            nav_status = int(nav_status) if nav_status is not None else None
        except (TypeError, ValueError):
            nav_status = None
        if nav_status is not None and not (0 <= nav_status <= 15):
            nav_status = None

        return {
            "mmsi": str(mmsi),
            "name": _str(row.get("SHIPNAME", row.get("SHIP_NAME", row.get("name"))))
            or "UNKNOWN",
            "lat": lat,
            "lon": lon,
            "sog": _num(row.get("SPEED", row.get("SOG", row.get("sog")))),
            "cog": _num(row.get("COURSE", row.get("COG", row.get("cog")))),
            "draught": round(draught, 1) if draught is not None else None,
            "shipType": ship_type,
            "destination": _str(
                row.get("DESTINATION", row.get("DEST", row.get("destination")))
            ),
            "eta": _str(row.get("ETA", row.get("eta")), limit=32),
            "navStatus": nav_status,
            "timestamp": ts,
            "demo": False,
        }
    except (TypeError, ValueError):
        return None


async def fetch_mt_vessels(
    api_key: str,
    minLon: float,
    minLat: float,
    maxLon: float,
    maxLat: float,
    budget: int = 100,
) -> list[dict]:
    """Fetch area positions from MarineTraffic. Never raises: [] on any failure.

    Empty key means disabled. Over-budget, HTTP errors, bad payloads and
    missing httpx client all degrade to [] so the caller falls through to
    demo/stale/unavailable modes.
    """
    key = (api_key or "").strip()
    if not key:
        return []
    if _budget_hit(budget):
        logger.warning("marinetraffic_budget_exceeded", used=_mt_used)
        return []
    url = (
        f"{MT_HOST}{MT_EXPORT_PATH}/{key}"
        f"?v={MT_API_VERSION}&MINLAT={minLat}&MAXLAT={maxLat}"
        f"&MINLON={minLon}&MAXLON={maxLon}&protocol=jsono"
    )
    try:
        client = _client()
        if client is None:
            import httpx

            async with httpx.AsyncClient(
                timeout=httpx.Timeout(10.0, connect=5.0)
            ) as tmp:
                res = await tmp.get(url, timeout=8.0)
                payload = res.json()
        else:
            res = await client.get(url, timeout=8.0)
            payload = res.json()
        if isinstance(payload, dict):
            rows = payload.get("DATA", payload.get("data", []))
        elif isinstance(payload, list):
            rows = payload
        else:
            return []
        out: list[dict] = []
        for row in rows if isinstance(rows, list) else []:
            mapped = _map_mt_row(row)
            if mapped is None:
                continue
            if not (
                minLat <= mapped["lat"] <= maxLat and minLon <= mapped["lon"] <= maxLon
            ):
                continue
            out.append(mapped)
            if len(out) >= 500:
                break
        logger.info("marinetraffic_collect_ok", count=len(out))
        return out
    except Exception as exc:
        logger.warning("marinetraffic_upstream_failed", error=str(exc))
        return []
