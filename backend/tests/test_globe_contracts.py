"""Globe program contracts and Wave-0 audit regression tests.

Fast by design: no TestClient, no app lifespan (which warms the ML model and
touches the network). Endpoints are called directly with a synthetic Request
for the rate limiter; upstream caches are seeded so no network is hit.
"""

import time as time_module
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import Request

import app.api.routers.hazards as hazards
import app.api.routers.ports as ports
import app.services.ais_proxy as ais_proxy
from app.api.routers import health as health_router
from app.api.routers.hazards import _current_hour_index, get_hazards_summary
from app.api.routers.ports import get_port_corridor
from app.api.routers.vessels import VesselLiveResponse, get_live_vessels
from app.core.config import settings
from app.core.exceptions import value_error_handler

VESSEL_KEYS = {"mmsi", "name", "lat", "lon", "sog", "cog", "draught", "shipType", "timestamp", "demo"}


def _req() -> Request:
    return Request(
        {"type": "http", "method": "GET", "path": "/", "headers": [], "client": ("127.0.0.1", 5000)}
    )


@pytest.mark.asyncio
async def test_vessels_demo_mode_shape():
    result = await ais_proxy.get_vessels(api_key="")
    parsed = VesselLiveResponse(**result)
    assert parsed.mode == "demo"
    assert 8 <= len(parsed.vessels) <= 500
    for v in parsed.vessels:
        assert VESSEL_KEYS.issubset(set(v.model_dump().keys()))
        assert isinstance(v.mmsi, str)


@pytest.mark.asyncio
async def test_vessels_bbox_span_raises_value_error():
    with pytest.raises(ValueError):
        await get_live_vessels(_req(), minLon=0.0, minLat=0.0, maxLon=100.0, maxLat=10.0)


@pytest.mark.asyncio
async def test_value_error_maps_to_400():
    res = await value_error_handler(None, ValueError("bbox span exceeds 30 degrees per side"))  # type: ignore[arg-type]
    assert res.status_code == 400
    import json

    assert "bbox span" in json.loads(res.body.decode())["detail"]


@pytest.mark.asyncio
async def test_hazards_bbox_span_raises_value_error():
    with pytest.raises(ValueError):
        await get_hazards_summary(_req(), minLon=0.0, minLat=0.0, maxLon=100.0, maxLat=10.0)


@pytest.mark.asyncio
async def test_hazards_summary_shape_seeded(monkeypatch):
    now = time_module.time()
    quake = {"id": "us1", "lat": 19.2, "lon": 92.8, "mag": 4.8, "place": "Bay of Bengal", "time": "2026-09-12T08:00:00Z"}
    fire = {"lat": 22.1, "lon": 88.4, "confidence": "h", "acqDate": "2026-09-12"}
    wx = {"waveHeightM": 2.1, "windSpeedKmh": 28.0, "source": "open-meteo"}
    monkeypatch.setattr(hazards, "_usgs_cache", [quake])
    monkeypatch.setattr(hazards, "_usgs_time", now)
    monkeypatch.setattr(hazards, "_firms_cache", [fire])
    monkeypatch.setattr(hazards, "_firms_time", now)
    monkeypatch.setattr(hazards, "_meteo_cache", wx)
    monkeypatch.setattr(hazards, "_meteo_time", now)
    monkeypatch.setattr(settings, "firms_map_key", "TESTKEY", raising=False)
    data = await get_hazards_summary(_req(), minLon=80.0, minLat=15.0, maxLon=95.0, maxLat=23.5)
    assert set(data.keys()) == {"earthquakes", "fires", "weather", "sources", "updatedAt"}
    assert data["earthquakes"] == [quake] and data["fires"] == [fire] and data["weather"] == wx
    assert data["sources"] == {"usgs": "ok", "firms": "ok", "meteo": "ok"}


@pytest.mark.asyncio
async def test_corridor_shape_additive():
    with patch("app.api.routers.ports.prisma") as mock_prisma:
        mock_prisma.port.find_many = AsyncMock(return_value=[])
        data = await get_port_corridor(_req())
    assert [p["name"] for p in data] == ["Haldia", "Paradip", "Dhamra", "Sandheads"]
    for p in data:
        for key in ("n", "sub", "draft", "tide", "ship", "note", "flag"):
            assert key in p
        assert "liveVesselCount" in p and "nearestVesselNm" in p


def test_corridor_live_stats_counts_real_numbers(monkeypatch):
    vessels = [
        {"lat": 22.03, "lon": 88.06, "sog": 8.4},
        {"lat": 22.10, "lon": 88.10, "sog": 0.5},
        {"lat": 22.00, "lon": 87.95, "sog": 9.1},
        {"lat": 10.0, "lon": 80.0, "sog": 12.0},
    ]
    monkeypatch.setattr(ais_proxy, "get_cached_vessels", lambda: vessels)
    stats = ports._corridor_live_stats()
    # Regression: the old int(bool(sum())) coercion could only yield 0 or 1.
    assert stats["Haldia"]["liveVesselCount"] == 3
    assert stats["Haldia"]["nearestVesselNm"] == 0.0
    assert stats["Haldia"]["loiteringCount"] == 1
    assert stats["Haldia"]["meanSogKn"] == 6.0
    assert stats["Paradip"]["liveVesselCount"] == 0
    assert isinstance(stats["Paradip"]["nearestVesselNm"], float)


def test_corridor_live_stats_empty_cache_none(monkeypatch):
    monkeypatch.setattr(ais_proxy, "get_cached_vessels", lambda: None)
    assert ports._corridor_live_stats() == {}
    monkeypatch.setattr(ais_proxy, "get_cached_vessels", lambda: [])
    assert ports._corridor_live_stats() == {}


def test_current_hour_index_picks_now():
    import datetime as dt

    now = dt.datetime.now(dt.UTC).replace(minute=0, second=0, microsecond=0)
    times = [(now - dt.timedelta(hours=h)).isoformat() for h in range(5, -1, -1)]
    assert _current_hour_index(times) == 5
    assert _current_hour_index([]) == 0


@pytest.mark.asyncio
async def test_firms_budget_serves_stale_over_cap(monkeypatch):
    seed = [{"lat": 22.1, "lon": 88.4, "confidence": "h", "acqDate": "2026-09-12"}]
    monkeypatch.setattr(hazards, "_firms_cache", seed)
    monkeypatch.setattr(hazards, "_firms_time", 0.0)
    monkeypatch.setattr(hazards, "_firms_status", "unavailable")
    monkeypatch.setattr(hazards, "_firms_used", 0)
    monkeypatch.setattr(hazards, "_firms_day", "")
    monkeypatch.setattr(settings, "firms_map_key", "TESTKEY", raising=False)
    monkeypatch.setattr(settings, "firms_daily_budget", 0, raising=False)
    out, status = await hazards._fetch_firms(80.0, 15.0, 95.0, 23.5)
    assert status == "stale"
    assert out == seed


@pytest.mark.asyncio
async def test_health_reports_feeds():
    with patch("app.api.routers.health.prisma") as mock_prisma:
        mock_prisma.execute_raw = AsyncMock(return_value=None)
        data = await health_router.health_check()
    assert "feeds" in data
    assert "vessels" in data["feeds"] and "hazards" in data["feeds"]


def test_context_sanitizer_and_geo_cell():
    from app.api.routers.context import ROUTE_WAYPOINTS, geo_cell_key, sanitize_news_item

    good = sanitize_news_item(
        {"title": "  Haldia port congestion  ", "url": "https://x.com/a", "domain": "x.com", "seendate": "20260912"}
    )
    assert good is not None
    assert good["title"] == "Haldia port congestion" and good["source"] == "x.com"
    assert sanitize_news_item({"title": "   "}) is None
    assert sanitize_news_item({"title": "t", "url": "ftp://x"})["url"] is None  # type: ignore[index]
    assert geo_cell_key(22.03, 88.06) == "22.0,88.1"
    assert len(ROUTE_WAYPOINTS) == 5
