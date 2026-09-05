import pytest
import math
from app.services.maritime_math import (
    calculate_brackish_sinkage,
    calculate_hydrodynamic_squat,
    calculate_dynamic_ukc,
)

def test_calculate_brackish_sinkage():
    draft_laden = 14.0
    port_density = 1.015
    expected = draft_laden * ((1.025 - port_density) / port_density)
    assert math.isclose(calculate_brackish_sinkage(draft_laden, port_density), expected, rel_tol=1e-5)

def test_calculate_hydrodynamic_squat():
    block_coeff = 0.85
    speed_knots = 12.0
    expected = (2 * block_coeff * math.pow(speed_knots, 2)) / 100
    assert math.isclose(calculate_hydrodynamic_squat(block_coeff, speed_knots), expected, rel_tol=1e-5)

def test_calculate_dynamic_ukc():
    charted_depth = 15.0
    tidal_height = 2.0
    draft_laden = 14.0
    delta_draft = 0.2
    squat = 1.5
    expected = (charted_depth + tidal_height) - (draft_laden + delta_draft + squat)
    assert math.isclose(calculate_dynamic_ukc(charted_depth, tidal_height, draft_laden, delta_draft, squat), expected, rel_tol=1e-5)
