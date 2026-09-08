"""Commodity reference data endpoint."""

from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/commodities", tags=["commodities"])

COMMODITIES = [
    "Iron Ore", "Coal", "Bauxite", "Thermal Coal", "Coking Coal", "Metallurgical Coal", "Grain", "Fertilizer", "Limestone"
]


@router.get("")
async def get_commodities():
    """Return the list of supported commodity types."""
    return COMMODITIES
