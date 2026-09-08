"""Freight rate forecast endpoint using LSTM predictions."""

import structlog
from fastapi import APIRouter, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.schemas.forecast import ForecastRateResponse
from app.services import ml_predictor

router = APIRouter(prefix="/api/v1/forecast", tags=["forecast"])
logger = structlog.get_logger(__name__)
limiter = Limiter(key_func=get_remote_address)


@router.get("/rates", response_model=list[ForecastRateResponse])
@limiter.limit("30/minute")
async def get_forecast_rates(
    request: Request,
    origin: str = Query(default="Newcastle, Australia", description="Origin Port"),
    destination: str = Query(default="Haldia", description="Destination Port"),
    shockMultiplier: float = Query(
        default=1.0,
        ge=0.1,
        le=5.0,
        description="Market volatility shock multiplier (0.1-5.0)",
    ),
):
    """
    Generate a 90-day freight rate forecast with confidence intervals.

    The P10/P50/P90 bands represent the 80% prediction interval,
    scaled by the shockMultiplier parameter to simulate market stress.
    Route specific scaling is applied based on the origin and destination.
    """
    result = await ml_predictor.get_freight_forecast(shockMultiplier, origin, destination)
    return result
