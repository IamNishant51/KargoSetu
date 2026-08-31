from fastapi import FastAPI, APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime, timezone
import time

from services.maritime_math import evaluate_vessel_safety
from services.data_fetcher import fetch_bdry_freight_proxy

app = FastAPI(title="KargoSetu API", version="1.0.0")

class UniformResponseModel(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    timestamp: str

def create_uniform_response(success: bool, data: Any = None, error: str = None) -> JSONResponse:
    content = {
        "success": success,
        "data": data,
        "error": error,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    return JSONResponse(content=content, status_code=200 if success else 400)

api_router = APIRouter()

@api_router.get("/health")
async def health_check():
    return create_uniform_response(success=True, data={"status": "Operational", "service": "KargoSetu Constraint Solver"})

@api_router.get("/freight/market-data")
async def get_market_data(days: int = 30):
    """Fetches real-time BDRY proxy data from yfinance"""
    result = fetch_bdry_freight_proxy(days_history=days)
    if result["status"] == "success":
        return create_uniform_response(success=True, data=result)
    return create_uniform_response(success=False, error=result["message"])

class VesselEvaluationRequest(BaseModel):
    charted_depth: float
    tidal_height: float
    draft_laden: float
    port_density: float
    block_coeff: float = 0.85
    speed_knots: float = 12.0
    
@api_router.post("/constraints/evaluate-ukc")
async def evaluate_ukc(req: VesselEvaluationRequest):
    """Evaluates dynamic UKC including Brackish Sinkage and Squat"""
    result = evaluate_vessel_safety(
        req.charted_depth, 
        req.tidal_height, 
        req.draft_laden, 
        req.port_density, 
        req.block_coeff, 
        req.speed_knots
    )
    return create_uniform_response(success=True, data=result)

app.include_router(api_router, prefix="/api/v1")