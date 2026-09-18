from datetime import datetime

from pydantic import BaseModel, Field


class IdleScenarioRequest(BaseModel):
    expected_discharge_completion: datetime
    next_cargo_laycan: datetime | None = None
    vessel_type: str
    destination: str
    market_demand_proxy: float | None = None
    positioning_assumptions: str | None = None


class ContributingFactor(BaseModel):
    factor: str
    impact: str


class AlternateEmployment(BaseModel):
    destination: str
    estimated_distance_nm: float
    expected_demand: str


class IdleScenarioResponse(BaseModel):
    estimated_idle_days_min: float
    estimated_idle_days_max: float
    idle_risk: str
    contributing_factors: list[ContributingFactor]
    alternate_employment_suggestions: list[AlternateEmployment]
    estimated_economic_impact: float
    model_output: bool = Field(
        description="True if derived from model, False if heuristic"
    )
    heuristic: bool = Field(description="True if derived from heuristics")
    unknown_data: list[str] = Field(
        default_factory=list, description="List of missing inputs treated as UNKNOWN"
    )
