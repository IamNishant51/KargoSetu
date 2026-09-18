import pytest

from app.services.constraint_engine import ConstraintEngine
from app.services.optimization_engine import OptimizationEngine


@pytest.fixture
def optimization_engine():
    constraint_engine = ConstraintEngine()
    return OptimizationEngine(constraint_engine)


@pytest.fixture
def default_args():
    return {
        "cargo_quantity": 50000,
        "origin_port": {
            "name": "Paradip",
            "max_draft": 18.0,
            "max_loa": 300,
            "max_beam": 50,
            "maxVesselClass": "Capesize",
            "handling_rate": 20000,
            "turnaround_time": 2,
        },
        "destination_port": {
            "name": "Haldia",
            "max_draft": 12.0,
            "max_loa": 230,
            "max_beam": 40,
            "maxVesselClass": "Panamax",
            "handling_rate": 15000,
            "turnaround_time": 3,
        },
        "laycan": {},
        "number_of_voyages": 5,
        "contract_horizon_days": 180,
        "vessels": [
            {
                "name": "Supramax A",
                "type": "Supramax",
                "capacity": 55000,
                "laden_draft": 11.5,
                "loa": 190,
                "beam": 32,
                "speed_knots": 14,
                "daily_cost": 12000,
                "daily_bunker_consumption": 25,
            },
            {
                "name": "Panamax A",
                "type": "Panamax",
                "capacity": 75000,
                "laden_draft": 13.5,
                "loa": 225,
                "beam": 32,
                "speed_knots": 14,
                "daily_cost": 15000,
                "daily_bunker_consumption": 30,
            },
        ],
        "freight_forecast": {"p10": 10, "p50": 15, "p90": 20},
        "bunker_assumptions": {"price_per_mt": 600},
        "expected_idle_assumptions": {"expected_idle_days": 2},
    }


def test_multiple_feasible_vessels_and_cost_tradeoffs(
    optimization_engine, default_args
):
    # Haldia draft is 12.0. Panamax A draft is 13.5 (infeasible).
    # Supramax A draft is 11.5 (feasible).
    # Wait, if we want multiple feasible vessels, let's bump Haldia draft.
    default_args["destination_port"]["max_draft"] = 14.0
    res = optimization_engine.optimize(**default_args)
    assert res["feasible"] is True, res.get("error")
    # Cheapest is Supramax A
    assert res["selected_vessels"][0]["name"] == "Supramax A"
    assert "strategies" in res
    assert (
        res["strategies"]["medium_term_coa"]
        < res["strategies"]["short_term_coa"]
        < res["strategies"]["spot"]
    )


def test_no_feasible_vessel_due_to_impossible_port_constraints(
    optimization_engine, default_args
):
    # Haldia draft is 12.0
    default_args["destination_port"]["max_draft"] = 10.0
    res = optimization_engine.optimize(**default_args)
    assert res["feasible"] is False
    assert "No feasible vessels found" in res["error"]


def test_insufficient_capacity(optimization_engine, default_args):
    default_args["cargo_quantity"] = 100000
    res = optimization_engine.optimize(**default_args)
    assert res["feasible"] is False
    assert "No feasible vessels found" in res["error"]


def test_contract_horizon_changes(optimization_engine, default_args):
    default_args["destination_port"]["max_draft"] = 14.0
    default_args["contract_horizon_days"] = 365
    res = optimization_engine.optimize(**default_args)
    assert res["feasible"] is True, res.get("error")
    assert res["assumptions"]["horizon_days"] == 365
