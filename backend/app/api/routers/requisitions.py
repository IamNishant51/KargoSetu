from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime, timedelta
from app.schemas.requisition import RequisitionEvaluateRequest, RequisitionCreateRequest
from app.services import maritime_math
from app.api.dependencies import prisma
import math

router = APIRouter(prefix="/api/v1/requisitions", tags=["requisitions"])


@router.get("")
async def get_requisitions(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status"),
    commodity: Optional[str] = Query(None, description="Filter by commodity"),
    origin: Optional[str] = Query(None, description="Filter by origin"),
    search: Optional[str] = Query(None, description="Search term"),
    dateRange: Optional[str] = Query(None, description="Date range"),
):
    skip = (page - 1) * limit
    where = {}

    if status and status != "All Statuses":
        where["status"] = status
    if commodity and commodity != "All Commodities":
        where["commodity"] = commodity
    if origin and origin != "All Origins":
        where["origin"] = origin

    if search:
        where["OR"] = [
            {"id": {"contains": search, "mode": "insensitive"}},
            {"destPortName": {"contains": search, "mode": "insensitive"}},
            {"commodity": {"contains": search, "mode": "insensitive"}},
            {"origin": {"contains": search, "mode": "insensitive"}},
        ]

    if dateRange:
        if dateRange == "Last 7 Days":
            where["createdAt"] = {"gte": datetime.utcnow() - timedelta(days=7)}
        elif dateRange == "Last 30 Days":
            where["createdAt"] = {"gte": datetime.utcnow() - timedelta(days=30)}

    total_count = await prisma.requisition.count(where=where)
    requisitions = await prisma.requisition.find_many(
        skip=skip, take=limit, where=where, order={"createdAt": "desc"}
    )

    total_pages = math.ceil(total_count / limit) if limit > 0 else 0

    return {
        "data": requisitions,
        "meta": {
            "page": page,
            "limit": limit,
            "total": total_count,
            "totalPages": total_pages,
        },
    }


@router.post("/evaluate")
async def evaluate_requisition(req: RequisitionEvaluateRequest):
    result = await maritime_math.evaluate_requisition(req)
    return result


@router.post("")
async def create_requisition(req: RequisitionCreateRequest):
    new_req = await prisma.requisition.create(
        data={
            "volume_mt": req.volume_mt,
            "destPortName": req.dest_port,
            "commodity": req.commodity,
            "origin": req.origin,
            "status": "Pending Evaluation",
        }
    )
    return new_req
