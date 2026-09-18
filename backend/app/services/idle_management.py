from app.schemas.idle_scenarios import (
    AlternateEmployment,
    ContributingFactor,
    IdleScenarioRequest,
    IdleScenarioResponse,
)


def calculate_idle_scenario(request: IdleScenarioRequest) -> IdleScenarioResponse:
    unknown_data = []
    if request.market_demand_proxy is None:
        unknown_data.append("market_demand_proxy")

    # Calculate days until next laycan if available
    days_to_next = None
    if request.next_cargo_laycan:
        days_to_next = (
            request.next_cargo_laycan - request.expected_discharge_completion
        ).days

    if days_to_next is not None and days_to_next < 0:
        days_to_next = 0

    # Heuristic based idle risk
    idle_days_min = 0.0
    idle_days_max = 5.0
    idle_risk = "LOW"
    economic_impact = 0.0
    factors = []

    if days_to_next is not None:
        if days_to_next > 10:
            idle_risk = "HIGH"
            idle_days_min = 5.0
            idle_days_max = float(days_to_next)
            factors.append(
                ContributingFactor(factor="Gap before next cargo window", impact="High")
            )
            economic_impact = idle_days_max * 15000.0  # Approx heuristic cost
        elif days_to_next > 3:
            idle_risk = "MODERATE"
            idle_days_min = 2.0
            idle_days_max = 5.0
            factors.append(
                ContributingFactor(
                    factor="Moderate gap before next cargo", impact="Medium"
                )
            )
            economic_impact = idle_days_max * 15000.0
    else:
        # If no next cargo is booked
        idle_risk = "HIGH"
        idle_days_min = 7.0
        idle_days_max = 14.0
        factors.append(ContributingFactor(factor="No next cargo booked", impact="High"))
        economic_impact = idle_days_max * 15000.0

    if request.market_demand_proxy is not None and request.market_demand_proxy < 0.4:
        idle_risk = "HIGH"
        idle_days_min = max(idle_days_min, 5.0)
        idle_days_max = max(idle_days_max, 10.0)
        factors.append(ContributingFactor(factor="Weak expected demand", impact="High"))
        economic_impact += 50000.0

    alternate_suggestions = []
    if idle_risk in ["MODERATE", "HIGH"]:
        alternate_suggestions = [
            AlternateEmployment(
                destination="Singapore",
                estimated_distance_nm=1200.0,
                expected_demand="High",
            ),
            AlternateEmployment(
                destination="Port Klang",
                estimated_distance_nm=800.0,
                expected_demand="Medium",
            ),
        ]

    return IdleScenarioResponse(
        estimated_idle_days_min=idle_days_min,
        estimated_idle_days_max=idle_days_max,
        idle_risk=idle_risk,
        contributing_factors=factors,
        alternate_employment_suggestions=alternate_suggestions,
        estimated_economic_impact=economic_impact,
        model_output=False,
        heuristic=True,
        unknown_data=unknown_data,
    )
