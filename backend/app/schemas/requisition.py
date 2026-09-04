from pydantic import BaseModel

class RequisitionEvaluateRequest(BaseModel):
    volume_mt: float
    dest_port_name: str
    commodity: str
