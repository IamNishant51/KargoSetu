from fastapi import APIRouter, Request
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(prefix="/api/v1/simulator", tags=["simulator"])
limiter = Limiter(key_func=get_remote_address)


class SimulatorRequest(BaseModel):
    freight_rate: float = 1.0
    bunker_price: float = 1.0
    port_draft: float = 1.0
    congestion: float = 1.0
    turnaround: float = 1.0
    cargo_volume: float = 1.0
    laycan: str = "7d"
    contract_horizon: str = "1y"


@router.post("")
@limiter.limit("10/minute")
async def simulate(request: Request, req: SimulatorRequest):
    # Dummy delta output as per requirements
    return {
        "base_case": {"cost": 100000, "recommended_vessel": "Panamax"},
        "scenario": {"cost": 120000, "recommended_vessel": "Supramax"},
        "delta": {"cost": 20000},
        "explanation": "Higher congestion and bunker price shifted recommendation to Supramax to minimize port wait costs.",
    }
