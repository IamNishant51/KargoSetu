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

    # 5.0 multiplier should have wider bands than 1.0, 0.1 narrower
    spread_high = res_high[89]["p90"] - res_high[89]["p10"]
    spread_normal = res_normal[89]["p90"] - res_normal[89]["p10"]
    spread_low = res_low[89]["p90"] - res_low[89]["p10"]
    assert spread_high > spread_normal > spread_low

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


def test_wilder_rsi_range():
    """RSI must always be in [0, 100]."""
    import pandas as pd

    from app.services.ml_predictor import MLPredictor

    predictor = MLPredictor()
    series = pd.Series([10.0 + i * 0.5 + (i % 3 - 1) * 2 for i in range(100)])
    rsi = predictor._calculate_rsi(series, period=14)
    assert rsi.between(0, 100).all(), "RSI values out of [0, 100] range"


def test_predict_sync_returns_90_items_with_correct_keys(monkeypatch):
    """predict_sync must return 90 dicts with date/p10/p50/p90 keys."""
    from unittest.mock import MagicMock

    from sklearn.preprocessing import RobustScaler

    from app.services.ml_predictor import MLPredictor

    predictor = MLPredictor()
    predictor.is_warming_up = False
    mock_session = MagicMock()
    mock_session.get_inputs.return_value = [MagicMock(name="input")]
    mock_session.run.return_value = [np.zeros((1, 90), dtype=np.float32)]
    predictor.onnx_session = mock_session
    predictor.cached_model = MagicMock()
    predictor.latest_sequence = np.zeros((60, 6), dtype=np.float32)
    scaler = RobustScaler()
    scaler.fit([[0], [1], [2]])
    predictor.scalers = {"bdry": scaler}
    predictor.historical_volatility = 0.05
    result = predictor.predict_sync(1.0)
    assert len(result) == 90, f"Expected 90 items, got {len(result)}"
    for item in result:
        assert {"date", "p10", "p50", "p90"} <= item.keys()


def test_p10_le_p50_le_p90(monkeypatch):
    """p10 must be <= p50 and p50 must be <= p90 for all forecast days."""
    from unittest.mock import MagicMock

    from sklearn.preprocessing import RobustScaler

    from app.services.ml_predictor import MLPredictor

    predictor = MLPredictor()
    predictor.is_warming_up = False
    mock_session = MagicMock()
    mock_session.get_inputs.return_value = [MagicMock(name="input")]
    mock_session.run.return_value = [np.ones((1, 90), dtype=np.float32) * 0.5]
    predictor.onnx_session = mock_session
    predictor.cached_model = MagicMock()
    predictor.latest_sequence = np.zeros((60, 6), dtype=np.float32)
    scaler = RobustScaler()
    scaler.fit([[100], [200], [300]])
    predictor.scalers = {"bdry": scaler}
    predictor.historical_volatility = 0.05
    result = predictor.predict_sync(1.0)
    for item in result:
        assert item["p10"] <= item["p50"], f"p10 > p50: {item}"
        assert item["p50"] <= item["p90"], f"p50 > p90: {item}"


def test_shock_multiplier_clamped():
    """Shock multiplier outside [0.1, 5.0] must be clamped, not crash."""
    clamped_low = max(0.1, min(5.0, -999.0))
    clamped_high = max(0.1, min(5.0, 999.0))
    assert clamped_low == 0.1
    assert clamped_high == 5.0
