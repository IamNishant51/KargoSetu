import pytest
from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch, AsyncMock

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_forecast_rates():
    mock_response = [
        {"date": "2024-09-06", "p10": 1400.0, "p50": 1500.0, "p90": 1600.0},
        {"date": "2024-09-07", "p10": 1410.0, "p50": 1510.0, "p90": 1610.0}
    ]
    with patch("app.services.ml_predictor.get_freight_forecast", new_callable=AsyncMock) as mock_forecast:
        mock_forecast.return_value = mock_response

        response = client.get("/api/v1/forecast/rates?shockMultiplier=1.0")
        assert response.status_code == 200
        data = response.json()
        assert data[0]["date"] == "2024-09-06"
        assert data[0]["p50"] == 1500.0
