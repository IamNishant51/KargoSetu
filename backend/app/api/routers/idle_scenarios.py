from fastapi import APIRouter

from app.schemas.idle_scenarios import IdleScenarioRequest, IdleScenarioResponse
from app.services.idle_management import calculate_idle_scenario

router = APIRouter()


@router.post("/estimate", response_model=IdleScenarioResponse)
def estimate_idle_scenario(request: IdleScenarioRequest):
    """
    Estimate vessel idle exposure after a voyage/contract.
    """
    return calculate_idle_scenario(request)
