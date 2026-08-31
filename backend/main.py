from fastapi import FastAPI, APIRouter, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Any, Optional
from datetime import datetime, timezone

from services.maritime_math import evaluate_vessel_safety, calculate_cargo_split
from services.data_fetcher import fetch_bdry_freight_proxy, generate_forecast_curves

app = FastAPI(title="KargoSetu API", version="1.0.0", description="Intelligent Freight Forecasting & Port Constraint Solver")

# CORS Middleware for Next.js Frontend Integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
async def get_market_data(days: int = 90):
    """Fetches real-time or resilient BDRY proxy market data."""
    result = fetch_bdry_freight_proxy(days_history=days)
    if result["status"] == "success":
        return create_uniform_response(success=True, data=result)
    return create_uniform_response(success=False, error=result.get("message", "Data retrieval failed"))

@api_router.get("/forecast/rates")
async def get_forecast_rates(
    horizon: int = Query(default=90, ge=30, le=180),
    shock_factor: float = Query(default=1.0, ge=1.0, le=2.5)
):
    """Returns 30-, 60-, 90-day P10/P50/P90 projection curves with shock factor calculation."""
    market_data = fetch_bdry_freight_proxy(days_history=1)
    current_price = market_data.get("current_price", 18.50)
    forecast = generate_forecast_curves(current_price=current_price, shock_factor=shock_factor, horizon_days=horizon)
    return create_uniform_response(success=True, data=forecast)

class VesselEvaluationRequest(BaseModel):
    charted_depth: float = Field(..., description="Port charted depth in meters")
    tidal_height: float = Field(..., description="Current/Predicted tidal height in meters")
    draft_laden: float = Field(..., description="Vessel laden draft in meters")
    port_density: float = Field(1.025, description="Water density in g/cm3 (e.g., Haldia = 1.005, Ocean = 1.025)")
    block_coeff: float = Field(0.85, description="Vessel block coefficient")
    speed_knots: float = Field(12.0, description="Vessel approach speed in knots")

@api_router.post("/constraints/evaluate-ukc")
async def evaluate_ukc(req: VesselEvaluationRequest):
    """Evaluates dynamic UKC including Brackish Water Sinkage and Squat Effect."""
    result = evaluate_vessel_safety(
        req.charted_depth, 
        req.tidal_height, 
        req.draft_laden, 
        req.port_density, 
        req.block_coeff, 
        req.speed_knots
    )
    return create_uniform_response(success=True, data=result)

class CargoRequisitionRequest(BaseModel):
    volume_mt: float = Field(150000, description="Cargo volume in metric tons")
    dest_port_depth: float = Field(12.0, description="Destination port permissible depth in meters")
    tidal_height: float = Field(1.5, description="Expected tidal height in meters")
    port_density: float = Field(1.015, description="Port water density g/cm3")
    commodity: str = Field("Coking Coal", description="Bulk cargo commodity")

@api_router.post("/requisitions/evaluate")
async def evaluate_requisition(req: CargoRequisitionRequest):
    """Evaluates cargo volume against port bathymetry and determines vessel split strategy."""
    result = calculate_cargo_split(
        total_volume_mt=req.volume_mt,
        dest_port_depth=req.dest_port_depth,
        tidal_height=req.tidal_height,
        port_density=req.port_density
    )
    return create_uniform_response(success=True, data=result)

app.include_router(api_router, prefix="/api/v1")