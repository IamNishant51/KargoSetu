from pydantic import BaseModel, Field


class ForecastRateResponse(BaseModel):
    """
    Schema for a single day's freight rate forecast.
    Provides the date and the 10th, 50th, and 90th percentile predictions for the freight rate.
    """
    model_config = {"strict": True}
    date: str = Field(..., description="Date of the forecast in YYYY-MM-DD format", example="2024-09-06")
    p10: float = Field(..., description="10th percentile freight rate prediction (lower bound)", example=1450.25)
    p50: float = Field(..., description="50th percentile freight rate prediction (median)", example=1500.0)
    p90: float = Field(..., description="90th percentile freight rate prediction (upper bound)", example=1550.75)
