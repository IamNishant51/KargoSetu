from datetime import datetime

from app.schemas.idle_scenarios import IdleScenarioRequest
from app.services.idle_management import calculate_idle_scenario


def test_idle_scenario_no_next_cargo():
    req = IdleScenarioRequest(
        expected_discharge_completion=datetime(2026, 10, 1),
        next_cargo_laycan=None,
        vessel_type="Panamax",
        destination="Singapore",
        market_demand_proxy=0.6,
        positioning_assumptions="None",
    )
    res = calculate_idle_scenario(req)
    assert res.idle_risk == "HIGH"
    assert res.estimated_idle_days_min == 7.0
    assert res.estimated_idle_days_max == 14.0
    assert res.heuristic is True
    assert res.model_output is False
    assert len(res.contributing_factors) > 0


def test_idle_scenario_short_gap():
    req = IdleScenarioRequest(
        expected_discharge_completion=datetime(2026, 10, 1),
        next_cargo_laycan=datetime(2026, 10, 5),  # 4 days gap
        vessel_type="Supramax",
        destination="Dhamra",
        market_demand_proxy=0.8,
        positioning_assumptions="None",
    )
    res = calculate_idle_scenario(req)
    assert res.idle_risk == "MODERATE"
    assert res.estimated_idle_days_min == 2.0
    assert res.estimated_idle_days_max == 5.0
    assert len(res.alternate_employment_suggestions) > 0


def test_idle_scenario_long_gap():
    req = IdleScenarioRequest(
        expected_discharge_completion=datetime(2026, 10, 1),
        next_cargo_laycan=datetime(2026, 10, 15),  # 14 days gap
        vessel_type="Capesize",
        destination="Paradip",
        market_demand_proxy=0.8,
        positioning_assumptions="None",
    )
    res = calculate_idle_scenario(req)
    assert res.idle_risk == "HIGH"
    assert res.estimated_idle_days_min == 5.0
    assert res.estimated_idle_days_max == 14.0


def test_idle_scenario_weak_demand():
    req = IdleScenarioRequest(
        expected_discharge_completion=datetime(2026, 10, 1),
        next_cargo_laycan=datetime(2026, 10, 3),  # 2 days gap
        vessel_type="Handysize",
        destination="Chennai",
        market_demand_proxy=0.2,  # weak demand
        positioning_assumptions="None",
    )
    res = calculate_idle_scenario(req)
    # Even though gap is 2 days, weak demand overrides and bumps risk to HIGH
    assert res.idle_risk == "HIGH"
    assert res.estimated_idle_days_min >= 5.0
    assert res.estimated_idle_days_max >= 10.0


def test_idle_scenario_missing_market_proxy():
    req = IdleScenarioRequest(
        expected_discharge_completion=datetime(2026, 10, 1),
        next_cargo_laycan=datetime(2026, 10, 3),
        vessel_type="Handysize",
        destination="Chennai",
        # no market proxy
    )
    res = calculate_idle_scenario(req)
    assert "market_demand_proxy" in res.unknown_data
