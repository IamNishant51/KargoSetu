from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from datetime import datetime, timedelta
from app.schemas.requisition import RequisitionEvaluateRequest, RequisitionCreateRequest, RequisitionUpdateRequest
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


@router.get("/{req_id}")
async def get_requisition(req_id: str):
    req = await prisma.requisition.find_unique(where={"id": req_id})
    if not req:
        raise HTTPException(status_code=404, detail="Requisition not found")
    return req


@router.patch("/{req_id}")
async def update_requisition(req_id: str, body: RequisitionUpdateRequest):
    existing = await prisma.requisition.find_unique(where={"id": req_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Requisition not found")

    update_data: dict = {}
    if body.volume_mt is not None:
        update_data["volume_mt"] = body.volume_mt
    if body.dest_port is not None:
        update_data["destPortName"] = body.dest_port
    if body.commodity is not None:
        update_data["commodity"] = body.commodity
    if body.origin is not None:
        update_data["origin"] = body.origin
    if body.status is not None:
        update_data["status"] = body.status

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    updated = await prisma.requisition.update(where={"id": req_id}, data=update_data)
    return updated


@router.delete("/{req_id}")
async def delete_requisition(req_id: str):
    existing = await prisma.requisition.find_unique(where={"id": req_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Requisition not found")
    await prisma.requisition.delete(where={"id": req_id})
    return {"detail": "Requisition deleted successfully"}
