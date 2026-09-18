from datetime import datetime

from pydantic import BaseModel, Field


class RiskFactor(BaseModel):
    score: float = Field(..., ge=0, le=1, description="Risk score from 0 to 1")
    level: str = Field(..., description="Risk level: LOW, MEDIUM, HIGH, CRITICAL")
    explanation: str = Field(
        ..., description="Human-readable explanation of what drives this risk"
    )
    contributors: list[str] = Field(
        default_factory=list, description="Specific factors contributing to the score"
    )


class DecisionRisk(BaseModel):
    overall_score: float = Field(..., ge=0, le=1)
    overall_level: str = Field(..., description="Overall risk level")
    market_risk: RiskFactor
    port_risk: RiskFactor
    weather_risk: RiskFactor
    operational_risk: RiskFactor
    data_quality_risk: RiskFactor
    model_uncertainty_risk: RiskFactor
    provenance: dict[str, str] = Field(
        ..., description="Data provenance and freshness info"
    )
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class RiskRequest(BaseModel):
    route_id: str | None = None
    origin_port: str
    destination_port: str
    vessel_class: str
    laycan_start: datetime
    laycan_end: datetime
    contract_horizon_days: int = 30
    forecast_confidence: float = 0.8
    market_volatility: float = 0.2
    port_congestion_origin: float = 0.0  # delay days
    port_congestion_destination: float = 0.0  # delay days
    weather_hazard_score: float = 0.0  # 0 to 1
    data_freshness_hours: float = 1.0
    provider_failure: bool = False
    missing_data: bool = False
