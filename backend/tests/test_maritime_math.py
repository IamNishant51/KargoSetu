import pytest
from app.services.maritime_math import (
    calculate_brackish_sinkage,
    calculate_hydrodynamic_squat,
    calculate_dynamic_ukc,
)

def test_calculate_brackish_sinkage_standard_seawater():
    assert calculate_brackish_sinkage(14.0, 1.025) == 0.0

def test_calculate_brackish_sinkage_fresh_water():
    result = calculate_brackish_sinkage(14.0, 1.000)
    assert result > 0.0
    assert abs(result - 0.35) < 0.01

def test_calculate_brackish_sinkage_haldia():
    # 1.010 density
    result = calculate_brackish_sinkage(14.0, 1.010)
    assert abs(result - 0.2079) < 0.001

def test_calculate_hydrodynamic_squat_zero_speed():
    assert calculate_hydrodynamic_squat(0.85, 0.0) == 0.0

def test_calculate_hydrodynamic_squat_standard():
    # Cb=0.85, V=14.5
    result = calculate_hydrodynamic_squat(0.85, 14.5)
    expected = (2 * 0.85 * (14.5 ** 2)) / 100
    assert abs(result - expected) < 0.001

def test_calculate_dynamic_ukc_positive():
    result = calculate_dynamic_ukc(
        charted_depth=20.0,
        tidal_height=1.5,
        draft_laden=14.0,
        delta_draft=0.2,
        squat=1.5,
    )
    # (20 + 1.5) - (14 + 0.2 + 1.5) = 21.5 - 15.7 = 5.8
    assert abs(result - 5.8) < 0.001

def test_calculate_dynamic_ukc_negative():
    result = calculate_dynamic_ukc(
        charted_depth=10.0,
        tidal_height=1.0,
        draft_laden=14.0,
        delta_draft=0.2,
        squat=1.5,
    )
    # 11 - 15.7 = -4.7
    assert result < 0.0

def test_calculate_dynamic_ukc_zero():
    result = calculate_dynamic_ukc(
        charted_depth=14.0,
        tidal_height=0.0,
        draft_laden=14.0,
        delta_draft=0.0,
        squat=0.0,
    )
    assert result == 0.0
