from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.api.dependencies import prisma

router = APIRouter(prefix="/api/v1/settings", tags=["settings"])


class SettingUpdate(BaseModel):
    key: str = Field(..., min_length=1)
    value: str


@router.get("")
async def get_settings():
    settings = await prisma.usersetting.find_many()
    return settings


@router.post("")
async def update_settings(settings: list[SettingUpdate]):
    upserted_settings = []
    for setting in settings:
        upserted_settings.append(
            await prisma.usersetting.upsert(
                where={"key": setting.key},
                data={
                    "update": {"value": setting.value},
                    "create": {"key": setting.key, "value": setting.value},
                },
            )
        )
    return upserted_settings
