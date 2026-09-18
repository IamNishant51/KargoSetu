from typing import Any


class OptimizationEngine:
    def __init__(self, constraint_engine):
        self.constraint_engine = constraint_engine

    def optimize(
        self,
        cargo_quantity: float,
        origin_port: dict[str, Any],
        destination_port: dict[str, Any],
        laycan: dict[str, Any],
        number_of_voyages: int,
        contract_horizon_days: int,
        vessels: list[dict[str, Any]],
        freight_forecast: dict[str, Any],
        bunker_assumptions: dict[str, Any],
        expected_idle_assumptions: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Compare:
        1. independent spot voyages
        2. short-term multi-voyage contract
        3. medium-term multi-voyage contract
        """
        feasible_vessels = []
        reasons = []
        for v in vessels:
            evaluation = self.constraint_engine.evaluate(
                v,
                origin_port,
                destination_port,
                cargo_quantity,
                {
                    "max_duration": 100,
                    "distance": 500,
                    "max_turnaround_time": 5,
                    "required_handling_rate": 10000,
                },
            )
            if evaluation["feasible"]:
                feasible_vessels.append(v)
            else:
                reasons.append(evaluation["reasons"])

        if not feasible_vessels:
            return {
                "feasible": False,
                "error": "No feasible vessels found based on constraints. "
                + str(reasons),
            }

        # Contract strategies and their typical rate discounts
        # (Mocking standard discount models for longer horizons)
        discount_map = {
            "spot": 1.0,
            "short_term_coa": 0.95,
            "medium_term_coa": 0.90,
        }

        best_strategy = None
        best_vessel = None
        min_expected_cost = float("inf")
        best_details = {}

        p10_freight_rate = freight_forecast.get("p10", 12)
        p50_freight_rate = freight_forecast.get("p50", 15)
        p90_freight_rate = freight_forecast.get("p90", 18)

        bunker_price = bunker_assumptions.get("price_per_mt", 600)
        idle_days = expected_idle_assumptions.get("expected_idle_days", 2)
        voyage_days = 20  # Mocked distance / speed

        strategies_costs = {}

        for v in feasible_vessels:
            # Fixed vessel costs
            bunker_cost = (
                voyage_days * v.get("daily_bunker_consumption", 30) * bunker_price
            )
            demurrage_cost = 5000
            idle_cost = idle_days * v.get("daily_cost", 10000)
            risk_penalty = 2000

            fixed_cost_per_voyage = (
                bunker_cost + demurrage_cost + idle_cost + risk_penalty
            )

            for strat, discount in discount_map.items():
                p50_freight = cargo_quantity * (p50_freight_rate * discount)
                p10_freight = cargo_quantity * (p10_freight_rate * discount)
                p90_freight = cargo_quantity * (p90_freight_rate * discount)

                expected_cost_per_voyage = p50_freight + fixed_cost_per_voyage
                total_expected_cost = expected_cost_per_voyage * number_of_voyages

                if (
                    strat not in strategies_costs
                    or total_expected_cost < strategies_costs[strat]
                ):
                    strategies_costs[strat] = total_expected_cost

                if total_expected_cost < min_expected_cost:
                    min_expected_cost = total_expected_cost
                    best_strategy = strat
                    best_vessel = v
                    best_details = {
                        "p10": (p10_freight + fixed_cost_per_voyage)
                        * number_of_voyages,
                        "p50": total_expected_cost,
                        "p90": (p90_freight + fixed_cost_per_voyage)
                        * number_of_voyages,
                        "bunker_cost": bunker_cost,
                        "idle_cost": idle_cost,
                    }

        return {
            "feasible": True,
            "expected_cost": min_expected_cost,
            "p10": best_details["p10"],
            "p50": best_details["p50"],
            "p90": best_details["p90"],
            "selected_vessels": [best_vessel],
            "voyage_allocation": number_of_voyages,
            "feasible_ports": [origin_port.get("name"), destination_port.get("name")],
            "risk_summary": {
                "level": "moderate",
                "details": "Calculated based on demurrage and idle exposure",
            },
            "assumptions": {
                "bunker_price": bunker_price,
                "idle_days": idle_days,
                "horizon_days": contract_horizon_days,
            },
            "strategies": strategies_costs,
            "recommendation_explanation": f"The '{best_strategy}' strategy using {best_vessel['name']} is the most cost-effective over {number_of_voyages} voyages.",
        }
