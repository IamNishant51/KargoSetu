from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_simulator_endpoint():
    response = client.post(
        "/api/v1/simulator",
        json={
            "freight_rate": 1.0,
            "bunker_price": 1.0,
            "port_draft": 1.0,
            "congestion": 1.0,
            "turnaround": 1.0,
            "cargo_volume": 1.0,
            "laycan": "7d",
            "contract_horizon": "1y",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "delta" in data
    assert "explanation" in data
