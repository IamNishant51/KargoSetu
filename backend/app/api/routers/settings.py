from fastapi import APIRouter
from app.api.dependencies import prisma

router = APIRouter(prefix="/api/v1/settings", tags=["settings"])


@router.get("")
async def get_settings():
    settings = await prisma.usersetting.find_many()
    return settings
