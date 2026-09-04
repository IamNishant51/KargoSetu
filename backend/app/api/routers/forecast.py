from fastapi import APIRouter, Query
from app.services import ml_predictor

router = APIRouter(prefix="/api/v1/forecast", tags=["forecast"])

@router.get("/rates")
async def get_forecast_rates(shockMultiplier: float = Query(1.0, alias="shockMultiplier")):
    result = await ml_predictor.get_freight_forecast(shockMultiplier)
    return result
