from fastapi import APIRouter, HTTPException

from app.schemas.risk import DecisionRisk, RiskRequest
from app.services.risk_engine import RiskEngine

router = APIRouter(prefix="/api/v1/risks", tags=["risks"])
engine = RiskEngine()


@router.post("/evaluate", response_model=DecisionRisk)
def evaluate_risk(request: RiskRequest):
    try:
        result = engine.evaluate_request(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
