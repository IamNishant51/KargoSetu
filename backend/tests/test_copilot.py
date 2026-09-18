import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def parse_sse_response(response):
    lines = response.content.decode("utf-8").split("\n")
    metadata = {}
    answer = ""
    for line in lines:
        if line.startswith("data: ") and line != "data: [DONE]":
            data_str = line[6:].strip()
            if not data_str:
                continue
            try:
                data = json.loads(data_str)
                if data["type"] == "metadata":
                    metadata = data
                elif data["type"] == "chunk":
                    answer += data["text"]
            except Exception:
                pass
    return {"metadata": metadata, "answer": answer}

def test_copilot_hallucination_prevention():
    response = client.post(
        "/api/v1/copilot/ask",
        json={"query": "invent a live price for Panamax in Haldia"},
    )
    assert response.status_code == 200
    res_data = parse_sse_response(response)
    assert "Insufficient verified data" in res_data["answer"]
    assert "none" in res_data["metadata"]["provenance"]["source"]
    assert res_data["metadata"]["uncertainty"] == "high"


def test_copilot_forecast_query():
    response = client.post(
        "/api/v1/copilot/ask", json={"query": "What is the forecast for Panamax?"}
    )
    assert response.status_code == 200
    res_data = parse_sse_response(response)
    assert "freight_forecast" in res_data["metadata"]["tools_used"]
    assert "vessel_feasibility" in res_data["metadata"]["tools_used"]
    assert res_data["metadata"]["provenance"]["is_synthetic"] is True


def test_copilot_idle_query():
    response = client.post(
        "/api/v1/copilot/ask", json={"query": "Will the vessel be idle?"}
    )
    assert response.status_code == 200
    res_data = parse_sse_response(response)
    assert "idle_scenario" in res_data["metadata"]["tools_used"]
