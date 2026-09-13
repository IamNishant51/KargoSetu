"""Globe program contracts and Wave-0 audit regression tests.

Fast by design: no TestClient, no app lifespan (which warms the ML model and
touches the network). Endpoints are called directly with a synthetic Request
for the rate limiter; upstream caches are seeded so no network is hit.
"""

import time as time_module
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException, Request
from pydantic import ValidationError

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


def test_globe_evaluate_payload_shape():
    """The exact body VesselSheet.tsx posts must validate.

    Regression: the solver desk persists `port` as a { name, subtext }
    object under the shared kargosetu_eval_v1 key. If that object ever
    reaches dest_port_name the API correctly returns 422, so the globe
    must normalize it to a string first. Whole-number JS volumes must
    keep validating as float.
    """
    from app.schemas.requisition import RequisitionEvaluateRequest

    ok = RequisitionEvaluateRequest(
        volume_mt=145000, dest_port_name="Haldia", commodity="Iron Ore"
    )
    assert ok.volume_mt == 145000.0
    assert ok.dest_port_name == "Haldia"

    with pytest.raises(ValidationError):
        RequisitionEvaluateRequest(
            volume_mt=145000,
            dest_port_name={"name": "Haldia"},  # type: ignore[dict-item]
            commodity="Iron Ore",
        )


def test_voyage_eta_parsing():
    """AIS type-5 ETA components resolve to the next UTC occurrence."""
    import datetime as dt

    from app.services.ais_proxy import _parse_eta

    assert _parse_eta(None) is None
    assert _parse_eta({}) is None
    assert _parse_eta({"Month": 0, "Day": 0, "Hour": 0, "Minute": 0}) is None
    assert _parse_eta({"Month": 13, "Day": 40, "Hour": 25, "Minute": 61}) is None

    now = dt.datetime.now(dt.UTC)
    # A date 60 days out must land this year or next, always in the future.
    future = now + dt.timedelta(days=60)
    iso = _parse_eta(
        {"Month": future.month, "Day": future.day, "Hour": 12, "Minute": 0}
    )
    assert iso is not None
    parsed = dt.datetime.fromisoformat(iso.replace("Z", "+00:00"))
    assert parsed >= now - dt.timedelta(hours=1)


def test_voyage_destination_cleaning():
    from app.services.ais_proxy import _clean_destination

    assert _clean_destination("  HALDIA  ") == "HALDIA"
    assert _clean_destination("@@@") is None
    assert _clean_destination("UNKNOWN") is None
    assert _clean_destination(None) is None
    assert _clean_destination(123) is None


def test_voyage_fields_flow_to_position():
    """Static voyage data + nav status surface on normalized positions."""
    from app.services.ais_proxy import _normalize_position, _update_static_meta

    mmsi = "999000111"
    _update_static_meta(
        mmsi,
        {"ShipName": "VOYAGE TESTER"},
        {
            "Destination": "HALDIA",
            "Eta": {"Month": 12, "Day": 25, "Hour": 8, "Minute": 0},
            "Type": 70,
        },
    )
    norm = _normalize_position(
        mmsi,
        {"ShipName": "VOYAGE TESTER", "latitude": 20.0, "longitude": 88.0},
        {"Latitude": 20.0, "Longitude": 88.0, "Sog": 10.0, "NavigationalStatus": 0},
    )
    assert norm is not None
    assert norm["destination"] == "HALDIA"
    assert norm["eta"] is not None and norm["eta"].endswith("Z")
    assert norm["navStatus"] == 0
    assert norm["shipType"] == "Cargo / Bulk Carrier"

    # Out-of-range nav status is dropped, never served.
    norm2 = _normalize_position(
        mmsi,
        {"ShipName": "VOYAGE TESTER", "latitude": 20.0, "longitude": 88.0},
        {"Latitude": 20.0, "Longitude": 88.0, "NavigationalStatus": 99},
    )
    assert norm2 is not None
    assert norm2["navStatus"] is None


@pytest.mark.asyncio
async def test_hazards_bbox_span_raises_value_error():
    with pytest.raises(HTTPException) as exc_info:
        await get_hazards_summary(_req(), minLon=0.0, minLat=0.0, maxLon=100.0, maxLat=10.0)
    assert exc_info.value.status_code == 422


@pytest.mark.asyncio
async def test_hazards_bbox_order_raises_422():
    with pytest.raises(HTTPException) as exc_info:
        await get_hazards_summary(_req(), minLon=95.0, minLat=15.0, maxLon=80.0, maxLat=23.5)
    assert exc_info.value.status_code == 422


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
    from app.api.routers.context import (
        ROUTE_WAYPOINTS,
        geo_cell_key,
        sanitize_news_item,
    )

    good = sanitize_news_item(
        {"title": "  Haldia port congestion  ", "url": "https://x.com/a", "domain": "x.com", "seendate": "20260912"}
    )
    assert good is not None
    assert good["title"] == "Haldia port congestion" and good["source"] == "x.com"
    assert sanitize_news_item({"title": "   "}) is None
    assert sanitize_news_item({"title": "t", "url": "ftp://x"})["url"] is None  # type: ignore[index]
    assert geo_cell_key(22.03, 88.06) == "22.0,88.1"
    assert len(ROUTE_WAYPOINTS) == 5


def test_destination_matching():
    from app.api.routers.vessels import _destination_matches

    assert _destination_matches("Haldia", "HALDIA")
    assert _destination_matches("Haldia", "Haldia India")
    assert _destination_matches("Haldia", "IN HAL")
    assert _destination_matches("Paradip", "PARADEEP")
    assert not _destination_matches("Haldia", "PARADIP")
    assert not _destination_matches("Haldia", None)
    assert not _destination_matches("Haldia", "  ")
    # Short-code substring must not false-positive on long free text.
    assert not _destination_matches("Haldia", "SHALLOW WATER")


@pytest.mark.asyncio
async def test_arrivals_sorted_and_shaped(monkeypatch):
    from app.api.routers.vessels import get_expected_arrivals
    from app.services import ais_proxy

    monkeypatch.setattr(
        ais_proxy,
        "_vessel_cache",
        [
            {"mmsi": "1", "name": "FAR SHIP", "lat": 18.0, "lon": 90.0, "sog": 12.0,
             "destination": "HALDIA", "eta": None},
            {"mmsi": "2", "name": "NEAR SHIP", "lat": 21.9, "lon": 88.0, "sog": 10.0,
             "destination": "Haldia India", "eta": None},
            {"mmsi": "3", "name": "WRONG PORT", "lat": 21.9, "lon": 88.0, "sog": 10.0,
             "destination": "PARADIP", "eta": None},
            {"mmsi": "4", "name": "NO DEST", "lat": 21.9, "lon": 88.0, "sog": 10.0,
             "destination": None, "eta": None},
            {"mmsi": "5", "name": "DEAD SHIP", "lat": 21.9, "lon": 88.0, "sog": 0.0,
             "destination": "HALDIA", "eta": None},
        ],
    )
    data = await get_expected_arrivals(_req(), port="Haldia")
    assert data["port"] == "Haldia"
    mmsis = [a["mmsi"] for a in data["arrivals"]]
    assert mmsis == ["2", "1", "5"], f"expected ETA sort with dead ship last, got {mmsis}"
    assert data["arrivals"][0]["distanceNm"] is not None
    assert data["arrivals"][0]["etaHours"] is not None
    assert data["arrivals"][2]["etaHours"] is None
    assert data["notice"] is None


@pytest.mark.asyncio
async def test_arrivals_unknown_port_422():
    from fastapi import HTTPException

    from app.api.routers.vessels import get_expected_arrivals

    with pytest.raises(HTTPException) as exc_info:
        await get_expected_arrivals(_req(), port="Atlantis")
    assert exc_info.value.status_code == 422


@pytest.mark.asyncio
async def test_arrivals_empty_honest_notice(monkeypatch):
    from app.api.routers.vessels import get_expected_arrivals
    from app.services import ais_proxy

    monkeypatch.setattr(ais_proxy, "_vessel_cache", [])
    data = await get_expected_arrivals(_req(), port="Haldia")
    assert data["arrivals"] == []
    assert data["notice"] is not None


def test_congestion_levels():
    from app.api.routers.ports import _congestion_level

    assert _congestion_level(0, 0) == "low"
    assert _congestion_level(5, 1) == "moderate"
    assert _congestion_level(9, 0) == "high"
    assert _congestion_level(2, 3) == "high"


def test_corridor_congestion_additive(monkeypatch):
    import app.api.routers.ports as ports

    vessels = [
        {"lat": 22.03, "lon": 88.06, "sog": 8.4},
        {"lat": 22.10, "lon": 88.10, "sog": 0.5},
        {"lat": 22.00, "lon": 87.95, "sog": 9.1},
        {"lat": 10.0, "lon": 80.0, "sog": 12.0},
    ]
    monkeypatch.setattr(ais_proxy, "get_cached_vessels", lambda: vessels)
    stats = ports._corridor_live_stats()
    assert stats["Haldia"]["liveVesselCount"] == 3
    assert stats["Haldia"]["congestion"] == "moderate"


def test_mt_row_mapping():
    from app.services import marinetraffic_proxy as mt

    row = {
        "MMSI": "419001234", "SHIPNAME": "MT TESTER", "LAT": 21.5, "LON": 88.2,
        "SPEED": 9.5, "COURSE": 45, "STATUS": 0, "SHIPTYPE": 70,
        "DRAUGHT": 12.5, "DESTINATION": "HALDIA", "ETA": "2026-12-01T08:00",
        "TIMESTAMP": "2026-09-13T12:00:00",
    }
    mapped = mt._map_mt_row(row)
    assert mapped is not None
    assert mapped["mmsi"] == "419001234"
    assert mapped["destination"] == "HALDIA"
    assert mapped["eta"] == "2026-12-01T08:00"
    assert mapped["navStatus"] == 0
    assert mapped["shipType"] == "Cargo / Bulk Carrier"
    assert mapped["demo"] is False

    assert mt._map_mt_row({"MMSI": "1"}) is None  # no coords
    assert mt._map_mt_row("not-a-dict") is None
    assert mt._map_mt_row(["MMSI"]) is None
    # Out-of-range draught/nav status degrade to None, row survives.
    bad = dict(row, DRAUGHT=999, STATUS=99)
    mapped_bad = mt._map_mt_row(bad)
    assert mapped_bad is not None
    assert mapped_bad["draught"] is None
    assert mapped_bad["navStatus"] is None


@pytest.mark.asyncio
async def test_mt_disabled_without_key():
    from app.services import marinetraffic_proxy as mt

    assert await mt.fetch_mt_vessels("", 80.0, 15.0, 95.0, 23.5) == []
    assert await mt.fetch_mt_vessels("   ", 80.0, 15.0, 95.0, 23.5) == []


@pytest.mark.asyncio
async def test_mt_envelope_shapes_and_budget(monkeypatch):
    from app.services import marinetraffic_proxy as mt

    row = {"MMSI": "419001234", "SHIPNAME": "MT TESTER", "LAT": 21.5, "LON": 88.2,
           "SPEED": 9.5, "TIMESTAMP": "2026-09-13T12:00:00"}

    class _Resp:
        def __init__(self, payload):
            self._payload = payload

        def json(self):
            return self._payload

    class _Client:
        def __init__(self, payload):
            self._payload = payload

        async def get(self, url, timeout=None):
            assert "services.marinetraffic.com/api/exportvessels/KEY" in url
            assert "MINLAT=15.0" in url and "protocol=jsono" in url
            return _Resp(self._payload)

    monkeypatch.setattr(mt, "_client", lambda: _Client({"DATA": [row]}))
    monkeypatch.setattr(mt, "_mt_day", "")
    monkeypatch.setattr(mt, "_mt_used", 0)
    out = await mt.fetch_mt_vessels("KEY", 80.0, 15.0, 95.0, 23.5, budget=100)
    assert len(out) == 1 and out[0]["mmsi"] == "419001234"

    # Bare-list envelope also parses.
    monkeypatch.setattr(mt, "_client", lambda: _Client([row]))
    out2 = await mt.fetch_mt_vessels("KEY", 80.0, 15.0, 95.0, 23.5, budget=100)
    assert len(out2) == 1

    # Over budget serves [] without touching upstream.
    monkeypatch.setattr(mt, "_mt_used", 100)
    assert await mt.fetch_mt_vessels("KEY", 80.0, 15.0, 95.0, 23.5, budget=100) == []


@pytest.mark.asyncio
async def test_vessels_mt_fallback_when_aisstream_empty(monkeypatch):
    import app.services.ais_proxy as proxy
    from app.api.routers.vessels import VesselLiveResponse

    mt_vessel = {"mmsi": "999000111", "name": "MT FALLBACK", "lat": 21.5, "lon": 88.2,
                 "sog": 9.0, "cog": 40.0, "draught": None, "shipType": "Cargo",
                 "destination": "HALDIA", "eta": None, "navStatus": 0,
                 "timestamp": "2026-09-13T12:00:00Z", "demo": False}

    async def _empty_collect(api_key, *args):
        return []

    async def _mt_hit(minLon, minLat, maxLon, maxLat):
        return [mt_vessel]

    monkeypatch.setattr(proxy, "_collect_live", _empty_collect)
    monkeypatch.setattr(proxy, "_try_marinetraffic", _mt_hit)
    monkeypatch.setattr(proxy, "_vessel_cache", None)
    monkeypatch.setattr(proxy, "_vessel_cache_time", 0.0)

    result = await proxy.get_vessels(api_key="AISKEY")
    parsed = VesselLiveResponse(**result)
    assert parsed.mode == "live"
    assert parsed.vessels[0].mmsi == "999000111"
    assert parsed.vessels[0].destination == "HALDIA"
    assert proxy.get_vessel_feed_status()["provider"] == "marinetraffic"


def test_track_buffer_bounded():
    import app.services.ais_proxy as proxy

    mmsi = "TRACKBOUND1"
    proxy._track.pop(mmsi, None)
    for i in range(30):
        proxy._record_track(mmsi, 20.0 + i * 0.01, 88.0, None)
    points = proxy.get_vessel_track(mmsi)
    assert len(points) == proxy._TRACK_MAX_POINTS
    assert points[0]["lat"] == 20.0 + 10 * 0.01
    assert proxy.get_vessel_track("NEVER-SEEN") == []
    proxy._track.pop(mmsi, None)


@pytest.mark.asyncio
async def test_track_endpoint_shapes():
    from fastapi import HTTPException

    import app.services.ais_proxy as proxy
    from app.api.routers.vessels import get_vessel_track

    proxy._track.pop("TRACKEND1", None)
    proxy._record_track("TRACKEND1", 21.0, 88.1, "2026-09-13T12:00:00Z")
    data = await get_vessel_track(_req(), mmsi="TRACKEND1")
    assert data["mmsi"] == "TRACKEND1"
    assert len(data["points"]) == 1
    assert data["notice"] is None
    proxy._track.pop("TRACKEND1", None)

    empty = await get_vessel_track(_req(), mmsi="NOPE-NOT-SEEN")
    assert empty["points"] == []
    assert empty["notice"] is not None

    with pytest.raises(HTTPException) as exc_info:
        await get_vessel_track(_req(), mmsi="   ")
    assert exc_info.value.status_code == 422
