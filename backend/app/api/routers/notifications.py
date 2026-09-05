from fastapi import APIRouter
from app.api.dependencies import prisma
from datetime import datetime

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])


@router.get("")
async def get_notifications():
    notifications = []

# Latest 2 Requisitions
    requisitions = await prisma.requisition.find_many(
        order={"createdAt": "desc"}, take=2
    )
    for req in requisitions:
        notifications.append(
            {
                "id": f"req_{req.id}",
                "title": "New Requisition",
                "desc": f"{req.volume_mt:,.0f} MT {req.commodity}",
                "time": req.createdAt.isoformat(),
                "unread": True,
            }
        )

# 1 Port where permissibleDraft < 10
    port = await prisma.port.find_first(where={"permissibleDraft": {"lt": 10.0}})
    if port:
        notifications.append(
            {
                "id": f"port_{port.id}",
                "title": "Draft Alert",
                "desc": f"Port {port.name} restricted draft ({port.permissibleDraft}m)",
                "time": datetime.utcnow().isoformat() + "Z",
                "unread": True,
            }
        )

# Latest 1 MLModel
    ml_model = await prisma.mlmodel.find_first(order={"trainedAt": "desc"})
    if ml_model:
        notifications.append(
            {
                "id": f"ml_{ml_model.id}",
                "title": "New forecast model",
                "desc": f"Version {ml_model.version} (MAPE: {ml_model.mape:.2f}%)",
                "time": ml_model.trainedAt.isoformat(),
                "unread": True,
            }
        )

# Sort by time descending
    notifications.sort(key=lambda x: x["time"], reverse=True)
    return notifications
