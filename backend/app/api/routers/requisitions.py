from fastapi import APIRouter
from app.schemas.requisition import RequisitionEvaluateRequest
from app.services import maritime_math

router = APIRouter(prefix="/api/v1/requisitions", tags=["requisitions"])

@router.post("/evaluate")
async def evaluate_requisition(req: RequisitionEvaluateRequest):
    result = await maritime_math.evaluate_requisition(req.model_dump())
    return result
