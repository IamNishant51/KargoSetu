from datetime import datetime, timezone

from app.schemas.risk import DecisionRisk, RiskFactor, RiskRequest


def get_risk_level(score: float) -> str:
    if score < 0.25:
        return "LOW"
    elif score < 0.5:
        return "MEDIUM"
    elif score < 0.75:
        return "HIGH"
    return "CRITICAL"


class RiskEngine:
    def __init__(self):
        pass

    def evaluate_market_risk(self, request: RiskRequest) -> RiskFactor:
        score = min(
            request.market_volatility / 0.5, 1.0
        )  # Assuming 0.5 volatility is max risk
        contributors = []
        if request.market_volatility > 0.3:
            contributors.append(
                f"High market volatility ({request.market_volatility:.2f})"
            )
        if request.contract_horizon_days > 60:
            score = min(score + 0.2, 1.0)
            contributors.append("Long contract horizon increases market exposure")

        explanation = (
            "Market risk is driven by current volatility and contract duration."
        )
        return RiskFactor(
            score=score,
            level=get_risk_level(score),
            explanation=explanation,
            contributors=contributors,
        )

    def evaluate_port_risk(self, request: RiskRequest) -> RiskFactor:
        max_congestion = max(
            request.port_congestion_origin, request.port_congestion_destination
        )
        score = min(max_congestion / 10.0, 1.0)  # 10 days delay is max risk
        contributors = []
        if request.port_congestion_origin > 3:
            contributors.append(
                f"Origin port congestion: {request.port_congestion_origin} days delay"
            )
        if request.port_congestion_destination > 3:
            contributors.append(
                f"Destination port congestion: {request.port_congestion_destination} days delay"
            )

        explanation = "Port risk based on expected delays and congestion at origin and destination."
        return RiskFactor(
            score=score,
            level=get_risk_level(score),
            explanation=explanation,
            contributors=contributors,
        )

    def evaluate_weather_risk(self, request: RiskRequest) -> RiskFactor:
        score = max(0.0, min(request.weather_hazard_score, 1.0))
        contributors = []
        if score > 0.5:
            contributors.append("Significant weather hazards detected on route")

        explanation = "Weather risk based on wave, wind, and storm hazard indicators."
        return RiskFactor(
            score=score,
            level=get_risk_level(score),
            explanation=explanation,
            contributors=contributors,
        )

    def evaluate_operational_risk(self, request: RiskRequest) -> RiskFactor:
        # Simplistic operational risk based on contract length and combined factors
        score = 0.1  # baseline
        contributors = []
        if request.contract_horizon_days > 45:
            score += 0.2
            contributors.append("Extended operational window")
        if (
            request.port_congestion_destination > 2
            and request.weather_hazard_score > 0.3
        ):
            score += 0.3
            contributors.append("Compounding delays from weather and port congestion")

        score = min(score, 1.0)
        explanation = (
            "Operational risk represents compounded friction from route execution."
        )
        return RiskFactor(
            score=score,
            level=get_risk_level(score),
            explanation=explanation,
            contributors=contributors,
        )

    def evaluate_data_quality_risk(self, request: RiskRequest) -> RiskFactor:
        score = 0.0
        contributors = []
        if request.provider_failure:
            score = 1.0
            contributors.append("External data provider failure")
        elif request.missing_data:
            score = 0.8
            contributors.append("Missing critical data fields")
        elif request.data_freshness_hours > 24:
            score = min(request.data_freshness_hours / 72.0, 1.0)
            contributors.append(
                f"Stale data (last updated {request.data_freshness_hours} hours ago)"
            )

        if not contributors:
            contributors.append("Data is fresh and complete")

        explanation = "Risk that the decision is based on stale or missing information."
        return RiskFactor(
            score=score,
            level=get_risk_level(score),
            explanation=explanation,
            contributors=contributors,
        )

    def evaluate_model_uncertainty_risk(self, request: RiskRequest) -> RiskFactor:
        score = max(0.0, min(1.0 - request.forecast_confidence, 1.0))
        contributors = []
        if request.forecast_confidence < 0.5:
            contributors.append(
                f"Low forecast confidence ({request.forecast_confidence:.2f})"
            )

        explanation = (
            "Risk driven by the predictive uncertainty of the underlying ML models."
        )
        return RiskFactor(
            score=score,
            level=get_risk_level(score),
            explanation=explanation,
            contributors=contributors,
        )

    def evaluate_request(self, request: RiskRequest) -> DecisionRisk:
        market_risk = self.evaluate_market_risk(request)
        port_risk = self.evaluate_port_risk(request)
        weather_risk = self.evaluate_weather_risk(request)
        op_risk = self.evaluate_operational_risk(request)
        data_risk = self.evaluate_data_quality_risk(request)
        model_risk = self.evaluate_model_uncertainty_risk(request)

        # Weighted aggregation
        overall_score = (
            market_risk.score * 0.25
            + port_risk.score * 0.20
            + weather_risk.score * 0.15
            + op_risk.score * 0.15
            + data_risk.score * 0.15
            + model_risk.score * 0.10
        )

        overall_score = min(overall_score, 1.0)

        if data_risk.level == "CRITICAL":
            overall_score = max(
                overall_score, 0.8
            )  # override if data is completely unreliable

        provenance = {
            "version": "risk-engine-v1",
            "evaluated_at": datetime.now(timezone.utc).isoformat(),
            "data_freshness_hours": str(request.data_freshness_hours),
        }

        return DecisionRisk(
            overall_score=overall_score,
            overall_level=get_risk_level(overall_score),
            market_risk=market_risk,
            port_risk=port_risk,
            weather_risk=weather_risk,
            operational_risk=op_risk,
            data_quality_risk=data_risk,
            model_uncertainty_risk=model_risk,
            provenance=provenance,
        )
