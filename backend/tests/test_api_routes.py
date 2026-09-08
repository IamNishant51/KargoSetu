from unittest.mock import patch, AsyncMock
import pytest

def test_health_endpoint_returns_200(client, mock_prisma):
    response = client.get("/api/health/")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "version" in data

def test_forecast_rates_default_shock(client):
    mock_response = [{"date": "2026-09-08", "p10": 1000, "p50": 1200, "p90": 1400}]
    with patch("app.services.ml_predictor.get_freight_forecast", new_callable=AsyncMock) as mock_forecast:
        mock_forecast.return_value = mock_response
        response = client.get("/api/v1/forecast/rates")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        mock_forecast.assert_called_once_with(1.0)

def test_forecast_rates_invalid_shock(client):
    response = client.get("/api/v1/forecast/rates?shockMultiplier=10.0")
    # Pydantic validation should fail since le=5.0
    assert response.status_code == 422

def test_evaluate_missing_fields(client):
    # Post to constraint solver without required fields
    response = client.post("/api/v1/requisitions/evaluate", json={})
    assert response.status_code == 422

def test_commodities_endpoint(client):
    response = client.get("/api/v1/commodities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert "Iron Ore" in data

def test_market_ticker_endpoint(client):
    mock_market = [{"symbol": "BDRY", "name": "Baltic Dry Index", "price": 1000, "change_pct": 1.2}]
    with patch("app.api.routers.market.get_market_ticker", new_callable=AsyncMock) as mock_get_market:
        mock_get_market.return_value = mock_market
        # We must actually patch asyncio.gather or _quote inside the module since the router directly accesses _market_cache
        # but for testing just hitting the endpoint
        pass

    with patch("app.api.routers.market._quote") as mock_quote:
        mock_quote.return_value = {"symbol": "BDRY", "name": "Baltic Dry Index", "price": 1000, "change_pct": 1.2}
        response = client.get("/api/v1/market/ticker")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
