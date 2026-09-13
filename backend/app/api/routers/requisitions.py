import math
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException, Query

from app.api.dependencies import prisma
from app.schemas.requisition import (
    RequisitionCreateRequest,
    RequisitionEvaluateRequest,
    RequisitionUpdateRequest,
)
from app.services import maritime_math

router = APIRouter(prefix="/api/v1/requisitions", tags=["requisitions"])


@router.get("")
async def get_requisitions(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    status: str | None = Query(None, description="Filter by status"),
    commodity: str | None = Query(None, description="Filter by commodity"),
    origin: str | None = Query(None, description="Filter by origin"),
    search: str | None = Query(None, description="Search term"),
    dateRange: str | None = Query(None, description="Date range"),
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

    # Calculate stats based on the same where clause (or global)
    # Usually stats reflect the current filter
    status_counts = await prisma.requisition.group_by(
        by=["status"],
        count={"id": True},
        where=where
    )
    
    stats = {
        "Pending Evaluation": 0,
        "Feasible": 0,
        "Infeasible": 0,
        "Converted": 0,
    }
    for item in status_counts:
        s = item.get("status")
        c = item.get("_count", {}).get("id", 0)
        if s in stats:
            stats[s] = c

    return {
        "data": requisitions,
        "meta": {
            "page": page,
            "limit": limit,
            "total": total_count,
            "totalPages": total_pages,
            "stats": stats,
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

    eval_req = RequisitionEvaluateRequest(
        volume_mt=req.volume_mt,
        dest_port_name=req.dest_port,
        commodity=req.commodity
    )

    try:
        import structlog
        logger = structlog.get_logger(__name__)
        result = await maritime_math.evaluate_requisition(eval_req)
        new_status = "Feasible" if result.get("feasible") else "Infeasible"

        updated_req = await prisma.requisition.update(
            where={"id": new_req.id},
            data={"status": new_status}
        )
        return updated_req
    except Exception as e:
        import structlog
        logger = structlog.get_logger(__name__)
        logger.error("evaluation_failed_during_create", error=str(e))
        # Fallback to Infeasible if evaluation crashes
        updated_req = await prisma.requisition.update(
            where={"id": new_req.id},
            data={"status": "Infeasible"}
        )
        return updated_req

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
