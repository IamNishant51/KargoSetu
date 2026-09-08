from fastapi import APIRouter
from app.api.dependencies import prisma

router = APIRouter(prefix="/api/v1/ports", tags=["ports"])


@router.get("")
async def get_ports():
    ports = await prisma.port.find_many()
    return ports

CORRIDOR_STATIC_DATA = {
    "Haldia": {"n": "01", "sub": "Hooghly river · tide-bound", "draft": "7.5 m", "tide": "+2.8 – 4.2 m", "ship": "Supramax direct", "note": "Heavy siltation. The reason splits exist.", "flag": "Watch"},
    "Paradip": {"n": "02", "sub": "Bay of Bengal · all-weather", "draft": "14.5 m", "tide": "+1.2 – 2.4 m", "ship": "Panamax / baby Cape", "note": "Mechanised coal berths. Laycan discipline matters.", "flag": "Open"},
    "Dhamra": {"n": "03", "sub": "Deep-sea fairway", "draft": "16.0 m", "tide": "+1.5 – 2.8 m", "ship": "Full Capesize 180k", "note": "Coking-coal front door when Haldia chokes.", "flag": "Open"},
    "Sandheads": {"n": "04", "sub": "Offshore roads · lighterage", "draft": "22 m+", "tide": "Open ocean", "ship": "All classes", "note": "Where big ships break bulk into shuttles.", "flag": "Hub"}
}

@router.get("/corridor")
async def get_port_corridor():
    ports_db = await prisma.port.find_many()
    db_map = {p.name: p for p in ports_db}
    
    results = []
    for name, static_info in CORRIDOR_STATIC_DATA.items():
        draft = f"{db_map[name].permissibleDraft} m" if name in db_map else static_info["draft"]
        
        merged = {
            "name": name,
            **static_info,
            "draft": draft
        }
        results.append(merged)
        
    return results
