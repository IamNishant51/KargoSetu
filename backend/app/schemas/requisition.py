from pydantic import BaseModel, Field


class RequisitionEvaluateRequest(BaseModel):
    """
    Schema for evaluating a freight requisition.
    Provides volume, destination port, and commodity details to determine market feasibility and cost metrics.
    """
    model_config = {"strict": True}
    volume_mt: float = Field(..., description="Volume of the cargo in metric tonnes", example=50000.0)
    dest_port_name: str = Field(..., description="Name of the destination port", example="Port of Rotterdam")
    commodity: str = Field(..., description="Type of commodity to be transported", example="Iron Ore")


class RequisitionCreateRequest(BaseModel):
    """
    Schema for creating a new freight requisition in the system.
    Contains origin, destination, volume, and commodity details.
    """
    model_config = {"strict": True}
    volume_mt: float = Field(..., description="Volume of the cargo in metric tonnes", example=75000.0)
    dest_port: str = Field(..., description="Name or UN/LOCODE of the destination port", example="Shanghai")
    commodity: str = Field(..., description="Type of commodity", example="Coal")
    origin: str = Field(..., description="Name or UN/LOCODE of the origin port", example="Newcastle")


class RequisitionUpdateRequest(BaseModel):
    """
    Schema for updating an existing freight requisition.
    All fields are optional — only provided fields are updated.
    """
    model_config = {"strict": True}
    volume_mt: float | None = Field(None, description="Volume of the cargo in metric tonnes", example=75000.0)
    dest_port: str | None = Field(None, description="Name or UN/LOCODE of the destination port", example="Shanghai")
    commodity: str | None = Field(None, description="Type of commodity", example="Coal")
    origin: str | None = Field(None, description="Name or UN/LOCODE of the origin port", example="Newcastle")
    status: str | None = Field(None, description="Requisition status", example="Approved")
