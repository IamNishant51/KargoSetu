from fastapi import APIRouter, Query, Response
from app.api.dependencies import prisma
from datetime import datetime, timezone
import structlog

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])
logger = structlog.get_logger(__name__)



def _norm_time(value) -> str:
    """Return an ISO string with an explicit offset so sorting is stable."""
    if value is None:
        return datetime.now(timezone.utc).isoformat()
    if isinstance(value, datetime):
        dt = value if value.tzinfo else value.replace(tzinfo=timezone.utc)
        return dt.isoformat()
    text = str(value)
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    return text


@router.get("")
async def get_notifications(response: Response, limit: int = Query(default=20, ge=1, le=50)):
    """Live desk feed: latest requisitions, draft alerts, newest ML model.

    Each source is isolated — one empty/broken table can never 500 the feed.
    Clients track read state locally by notification id.
    """
    response.headers["Cache-Control"] = "no-cache"
    notifications = []

    try:
        requisitions = await prisma.requisition.find_many(
            order={"createdAt": "desc"}, take=2
        )
        for req in requisitions:
            notifications.append(
                {
                    "id": f"req_{req.id}",
                    "kind": "requisition",
                    "title": "New Requisition",
                    "desc": f"{req.volume_mt:,.0f} MT {req.commodity}",
                    "time": _norm_time(req.createdAt),
                    "unread": True,
                }
            )
    except Exception as e:
        logger.warning("notification_source_failed", source="requisitions", error=str(e))

    try:
        port = await prisma.port.find_first(where={"permissibleDraft": {"lt": 10.0}})
        if port:
            notifications.append(
                {
                    "id": f"port_{port.id}",
                    "kind": "draft_alert",
                    "title": "Draft Alert",
                    "desc": f"Port {port.name} restricted draft ({port.permissibleDraft}m)",
                    "time": _norm_time(datetime.now(timezone.utc)),
                    "unread": True,
                }
            )
    except Exception as e:
        logger.warning("notification_source_failed", source="draft_alert", error=str(e))

    try:
        ml_model = await prisma.mlmodel.find_first(order={"trainedAt": "desc"})
        if ml_model:
            notifications.append(
                {
                    "id": f"ml_{ml_model.id}",
                    "kind": "model",
                    "title": "New forecast model",
                    "desc": f"Version {ml_model.version} (MAPE: {ml_model.mape:.2f}%)",
                    "time": _norm_time(ml_model.trainedAt),
                    "unread": True,
                }
            )
    except Exception as e:
        logger.warning("notification_source_failed", source="ml_model", error=str(e))

    notifications.sort(key=lambda x: x["time"], reverse=True)
    return notifications[:limit]
