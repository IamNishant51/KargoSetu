from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/commodities", tags=["commodities"])


@router.get("")
async def get_commodities():
    return ["Iron Ore", "Coal", "Grain", "Bauxite", "Limestone"]
