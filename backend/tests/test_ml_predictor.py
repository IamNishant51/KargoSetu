import pytest
import numpy as np
from app.services.ml_predictor import predictor_instance

def test_heuristic_forecast_during_warmup():
    # Warmup is True by default for tests since we don't call init_model()
    predictor_instance.is_warming_up = True
    result = predictor_instance.predict_sync(1.0)
    assert len(result) == 90
    assert "p50" in result[0]

def test_heuristic_forecast_correct_length():
    result = predictor_instance.predict_sync(1.0)
    assert len(result) == 90

def test_heuristic_forecast_date_sequence():
    result = predictor_instance.predict_sync(1.0)
    dates = [r["date"] for r in result]
    assert len(set(dates)) == 90 # all unique
    # check format YYYY-MM-DD
    assert len(dates[0].split("-")) == 3

def test_shock_multiplier_clamping():
    res_low = predictor_instance.predict_sync(0.01) # clamped to 0.1
    res_high = predictor_instance.predict_sync(10.0) # clamped to 5.0
    res_normal = predictor_instance.predict_sync(1.0)
    
    # 5.0 multiplier should have wider bands than 1.0
    spread_high = res_high[89]["p90"] - res_high[89]["p10"]
    spread_normal = res_normal[89]["p90"] - res_normal[89]["p10"]
    assert spread_high > spread_normal

def test_p10_less_than_p50_less_than_p90():
    result = predictor_instance.predict_sync(1.0)
    for r in result:
        assert r["p10"] <= r["p50"] <= r["p90"]

def test_normalize_and_denormalize_roundtrip():
    # Set up dummy scaler
    from sklearn.preprocessing import RobustScaler
    scaler = RobustScaler()
    dummy_data = np.array([1000, 1500, 2000]).reshape(-1, 1)
    scaler.fit(dummy_data)
    predictor_instance.scalers["bdry"] = scaler
    
    original = 1200.0
    normalized = scaler.transform([[original]])[0][0]
    denormalized = predictor_instance._denormalize_bdry(normalized)
    
    assert abs(original - denormalized) < 0.001
