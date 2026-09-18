from app.services.constraint_engine import ConstraintEngine, VesselRecommendationService


def test_constraint_engine_pass():
    engine = ConstraintEngine()
    vessel = {
        "capacity": 50000,
        "laden_draft": 10.0,
        "loa": 200,
        "beam": 30,
        "speed_knots": 12.0,
        "type": "Panamax",
    }
    load_port = {
        "permissibleDraft": 12.0,
        "max_loa": 250,
        "max_beam": 40,
        "handling_rate": 10000,
        "turnaround_time": 2,
        "maxVesselClass": "Capesize",
    }
    discharge_port = {
        "permissibleDraft": 11.0,
        "max_loa": 220,
        "max_beam": 35,
        "handling_rate": 8000,
        "turnaround_time": 3,
        "maxVesselClass": "Panamax",
    }
    voyage_data = {
        "required_handling_rate": 5000,
        "max_turnaround_time": 5,
        "distance": 1200,
        "max_duration": 10,
    }

    result = engine.evaluate(vessel, load_port, discharge_port, 45000, voyage_data)
    assert result["feasible"] is True
    assert result["status"] == "PASS"
    assert len(result["reasons"]) == 0


def test_constraint_engine_fail_handling_rate():
    engine = ConstraintEngine()
    vessel = {
        "capacity": 50000,
        "laden_draft": 10.0,
        "loa": 200,
        "beam": 30,
        "speed_knots": 12.0,
        "type": "Panamax",
    }
    load_port = {
        "permissibleDraft": 12.0,
        "max_loa": 250,
        "max_beam": 40,
        "handling_rate": 10000,
        "turnaround_time": 2,
        "maxVesselClass": "Capesize",
    }
    discharge_port = {
        "permissibleDraft": 11.0,
        "max_loa": 220,
        "max_beam": 35,
        "handling_rate": 4000,
        "turnaround_time": 3,
        "maxVesselClass": "Panamax",
    }
    voyage_data = {
        "required_handling_rate": 5000,
        "max_turnaround_time": 5,
        "distance": 1200,
        "max_duration": 10,
    }

    result = engine.evaluate(vessel, load_port, discharge_port, 45000, voyage_data)
    assert result["feasible"] is False
    assert result["status"] == "FAIL"
    assert any(
        r["constraint"] == "discharge_port_handling_rate" for r in result["reasons"]
    )


def test_constraint_engine_fail_voyage_duration():
    engine = ConstraintEngine()
    vessel = {
        "capacity": 50000,
        "laden_draft": 10.0,
        "loa": 200,
        "beam": 30,
        "speed_knots": 10.0,
        "type": "Panamax",
    }  # 10 knots = 240 nm/day. 1200 nm = 5 days
    load_port = {
        "permissibleDraft": 12.0,
        "max_loa": 250,
        "max_beam": 40,
        "handling_rate": 10000,
        "turnaround_time": 2,
        "maxVesselClass": "Capesize",
    }
    discharge_port = {
        "permissibleDraft": 11.0,
        "max_loa": 220,
        "max_beam": 35,
        "handling_rate": 8000,
        "turnaround_time": 3,
        "maxVesselClass": "Panamax",
    }
    voyage_data = {
        "required_handling_rate": 5000,
        "max_turnaround_time": 5,
        "distance": 1200,
        "max_duration": 4,
    }  # Fails max duration

    result = engine.evaluate(vessel, load_port, discharge_port, 45000, voyage_data)
    assert result["feasible"] is False
    assert result["status"] == "FAIL"
    assert any(r["constraint"] == "voyage_duration" for r in result["reasons"])


def test_constraint_engine_unknown():
    engine = ConstraintEngine()
    vessel = {"capacity": 50000, "laden_draft": 10.0, "loa": 200, "beam": 30}
    load_port = {"permissibleDraft": None, "max_loa": 250, "max_beam": 40}
    discharge_port = {"permissibleDraft": 11.0, "max_loa": 220, "max_beam": 35}

    result = engine.evaluate(vessel, load_port, discharge_port, 45000)
    assert result["feasible"] is False
    assert result["status"] == "UNKNOWN"


def test_recommendation_service():
    engine = ConstraintEngine()
    service = VesselRecommendationService(engine)

    vessels = [
        {
            "name": "V1",
            "capacity": 40000,
            "laden_draft": 10.0,
            "loa": 200,
            "beam": 30,
            "type": "Panamax",
            "speed_knots": 12.0,
        },  # Fail capacity
        {
            "name": "V2",
            "capacity": 60000,
            "laden_draft": 10.0,
            "loa": 200,
            "beam": 30,
            "type": "Panamax",
            "speed_knots": 12.0,
        },  # Pass
        {
            "name": "V3",
            "capacity": 50000,
            "laden_draft": 10.0,
            "loa": 200,
            "beam": 30,
            "type": "Panamax",
            "speed_knots": 12.0,
        },  # Pass, better fit
        {
            "name": "V4",
            "capacity": 50000,
            "laden_draft": 15.0,
            "loa": 200,
            "beam": 30,
            "type": "Panamax",
            "speed_knots": 12.0,
        },  # Fail draft
    ]
    load_port = {
        "permissibleDraft": 12.0,
        "max_loa": 250,
        "max_beam": 40,
        "maxVesselClass": "Capesize",
        "handling_rate": 10000,
        "turnaround_time": 2,
    }
    discharge_port = {
        "permissibleDraft": 11.0,
        "max_loa": 220,
        "max_beam": 35,
        "maxVesselClass": "Panamax",
        "handling_rate": 10000,
        "turnaround_time": 2,
    }
    voyage_data = {
        "required_handling_rate": 5000,
        "max_turnaround_time": 5,
        "distance": 1200,
        "max_duration": 10,
    }

    recommendations = service.recommend(
        vessels, load_port, discharge_port, 45000, voyage_data
    )

    assert len(recommendations) == 2
    assert recommendations[0]["vessel"]["name"] == "V3"
    assert recommendations[1]["vessel"]["name"] == "V2"
