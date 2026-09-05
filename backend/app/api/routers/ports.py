from fastapi import APIRouter
from app.api.dependencies import prisma

router = APIRouter(prefix="/api/v1/ports", tags=["ports"])


@router.get("")
async def get_ports():
    ports = await prisma.port.find_many()
    return ports
