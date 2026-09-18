from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_copilot_hallucination_prevention():
    response = client.post(
        "/api/v1/copilot/ask",
        json={"query": "invent a live price for Panamax in Haldia"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "Insufficient verified data" in data["answer"]
    assert "none" in data["provenance"]["source"]
    assert data["uncertainty"] == "high"


def test_copilot_forecast_query():
    response = client.post(
        "/api/v1/copilot/ask", json={"query": "What is the forecast for Panamax?"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "freight_forecast" in data["tools_used"]
    assert "vessel_feasibility" in data["tools_used"]
    assert data["provenance"]["is_synthetic"] is True


def test_copilot_idle_query():
    response = client.post(
        "/api/v1/copilot/ask", json={"query": "Will the vessel be idle?"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "idle_scenario" in data["tools_used"]
