from datetime import datetime

from pydantic import BaseModel, Field


class Provenance(BaseModel):
    mode: str = Field(..., description="Whether data is 'live' or 'demo'")
    provider: str = Field(..., description="Source of the data")
    retrieved_at: datetime = Field(..., description="When the data was fetched")
    data_age_seconds: float = Field(..., description="Age of data in seconds")
    is_synthetic: bool = Field(..., description="Whether the data is synthetic/demo")
