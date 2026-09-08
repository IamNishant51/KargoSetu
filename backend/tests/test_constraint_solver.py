import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException
from app.services.maritime_math import evaluate_requisition
from app.schemas.requisition import RequisitionEvaluateRequest

class MockPort:
    def __init__(self, id, name, chartedDepth, permissibleDraft, brackishDensity, lat, lon, typicalTidalRange, maxVesselClass=None):
        self.id = id
        self.name = name
        self.chartedDepth = chartedDepth
        self.permissibleDraft = permissibleDraft
        self.brackishDensity = brackishDensity
        self.lat = lat
        self.lon = lon
        self.typicalTidalRange = typicalTidalRange
        self.maxVesselClass = maxVesselClass

class MockVessel:
    def __init__(self, name, capacity, laden_draft, ballast_draft, daily_cost, block_coeff, speed_knots):
        self.name = name
        self.capacity = capacity
        self.laden_draft = laden_draft
        self.ballast_draft = ballast_draft
        self.daily_cost = daily_cost
        self.block_coeff = block_coeff
        self.speed_knots = speed_knots

mock_ports = [
    MockPort(1, "Paradip", 25.0, 18.0, 1.025, 20.0, 86.0, 2.0),
    MockPort(2, "Haldia", 15.0, 12.0, 1.010, 22.0, 88.0, 1.5, "Supramax"),
]

mock_fleet = [
    MockVessel("Capesize", 150000, 17.5, 9.0, 25000, 0.85, 14.5),
    MockVessel("Panamax", 75000, 13.5, 7.0, 15000, 0.82, 14.0),
    MockVessel("Supramax", 55000, 11.5, 6.0, 12000, 0.80, 14.0),
]

@pytest.fixture
def override_get_fleet(monkeypatch):
    async def mock_get_fleet():
        return mock_fleet
    monkeypatch.setattr("app.services.maritime_math.get_fleet", mock_get_fleet)

@pytest.fixture
def setup_mock_prisma(monkeypatch):
    mock_prisma = MagicMock()
    
    async def find_unique(where):
        name = where.get("name")
        for p in mock_ports:
            if p.name == name:
                return p
        return None
        
    async def find_many():
        return mock_ports
        
    mock_prisma.port.find_unique.side_effect = find_unique
    mock_prisma.port.find_many.side_effect = find_many
    monkeypatch.setattr("app.services.maritime_math.prisma", mock_prisma)

@pytest.mark.asyncio
async def test_evaluate_feasible_deep_port(override_get_fleet, setup_mock_prisma):
    req = RequisitionEvaluateRequest(volume_mt=150000, dest_port_name="Paradip", commodity="Coal")
    res = await evaluate_requisition(req)
    assert res["feasible"] is True
    assert "Capesize" in res["strategy"]

@pytest.mark.asyncio
async def test_evaluate_infeasible_shallow_port(override_get_fleet, setup_mock_prisma):
    # Capesize cannot go to Haldia due to depth and maxVesselClass
    # Supramax should be feasible
    req = RequisitionEvaluateRequest(volume_mt=150000, dest_port_name="Haldia", commodity="Coal")
    res = await evaluate_requisition(req)
    assert res["feasible"] is True
    assert "Split Cargo" in res["strategy"]
    assert "Supramax" in res["strategy"]

@pytest.mark.asyncio
async def test_evaluate_cargo_split(override_get_fleet, setup_mock_prisma):
    # Volume exceeds single Panamax
    req = RequisitionEvaluateRequest(volume_mt=100000, dest_port_name="Paradip", commodity="Grain")
    res = await evaluate_requisition(req)
    assert res["feasible"] is True
    assert res["total_vessels"] > 1

@pytest.mark.asyncio
async def test_evaluate_commodity_restriction(override_get_fleet, setup_mock_prisma):
    # Grain should not allow Capesize, even if port is Paradip.
    # Capesize is not in Grain's allowed vessels.
    req = RequisitionEvaluateRequest(volume_mt=150000, dest_port_name="Paradip", commodity="Grain")
    res = await evaluate_requisition(req)
    assert res["feasible"] is True
    # The cheapest valid vessel per ton will be picked (Panamax or Supramax)
    assert "Capesize" not in res["strategy"]

@pytest.mark.asyncio
async def test_evaluate_port_not_found(override_get_fleet, setup_mock_prisma):
    req = RequisitionEvaluateRequest(volume_mt=150000, dest_port_name="UnknownPort", commodity="Coal")
    with pytest.raises(HTTPException) as exc:
        await evaluate_requisition(req)
    assert exc.value.status_code == 404
