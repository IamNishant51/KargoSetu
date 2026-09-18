from datetime import UTC, datetime, timedelta

import pytest

from app.schemas.risk import RiskRequest
from app.services.risk_engine import RiskEngine


@pytest.fixture
def base_request():
    return RiskRequest(
        origin_port="INHAL",
        destination_port="INVTZ",
        vessel_class="Panamax",
        laycan_start=datetime.now(UTC) + timedelta(days=10),
        laycan_end=datetime.now(UTC) + timedelta(days=20),
        contract_horizon_days=30,
        forecast_confidence=0.8,
        market_volatility=0.2,
        port_congestion_origin=1.0,
        port_congestion_destination=1.0,
        weather_hazard_score=0.1,
        data_freshness_hours=1.0,
        provider_failure=False,
        missing_data=False,
    )


def test_risk_engine_baseline(base_request):
    engine = RiskEngine()
    result = engine.evaluate_request(base_request)
    assert result.overall_score < 0.5
    assert result.data_quality_risk.level == "LOW"
    assert result.market_risk.level == "MEDIUM"


def test_risk_stale_data(base_request):
    base_request.data_freshness_hours = 48.0
    engine = RiskEngine()
    result = engine.evaluate_request(base_request)
    assert result.data_quality_risk.score > 0.5
    assert "Stale data" in result.data_quality_risk.contributors[0]


def test_risk_missing_data(base_request):
    base_request.missing_data = True
    engine = RiskEngine()
    result = engine.evaluate_request(base_request)
    assert result.data_quality_risk.score >= 0.8
    assert result.overall_score >= 0.8  # Overridden overall score
    assert "Missing critical data" in result.data_quality_risk.contributors[0]


def test_risk_provider_failure(base_request):
    base_request.provider_failure = True
    engine = RiskEngine()
    result = engine.evaluate_request(base_request)
    assert result.data_quality_risk.level == "CRITICAL"
    assert result.overall_score >= 0.8


def test_risk_severe_congestion(base_request):
    base_request.port_congestion_destination = 8.0  # High congestion
    engine = RiskEngine()
    result = engine.evaluate_request(base_request)
    assert result.port_risk.score >= 0.8
    assert result.port_risk.level in ["HIGH", "CRITICAL"]


def test_risk_high_volatility(base_request):
    base_request.market_volatility = 0.6  # High volatility
    engine = RiskEngine()
    result = engine.evaluate_request(base_request)
    assert result.market_risk.level == "CRITICAL"


def test_risk_low_forecast_confidence(base_request):
    base_request.forecast_confidence = 0.3  # Low confidence
    engine = RiskEngine()
    result = engine.evaluate_request(base_request)
    assert result.model_uncertainty_risk.score >= 0.7
    assert result.model_uncertainty_risk.level in ["HIGH", "CRITICAL"]
