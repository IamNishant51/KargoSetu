"""Health check endpoint for container orchestration and monitoring."""

import structlog
from fastapi import APIRouter

from app.api.dependencies import prisma
from app.services.ml_predictor import predictor_instance

router = APIRouter(prefix="/api/health", tags=["health"])
logger = structlog.get_logger(__name__)


@router.get("/")
async def health_check():
    """
    Comprehensive health check.

    Returns status of all subsystems:
    - database: PostgreSQL connectivity
    - ml_model: Whether the ML model is loaded and ready
    - status: "ok" if all systems nominal, "degraded" if ML warming up
    """
    db_healthy = False
    try:
        await prisma.execute_raw("SELECT 1")
        db_healthy = True
    except Exception as exc:
        logger.error("health_check_db_failed", error=str(exc))

    ml_ready = not predictor_instance.is_warming_up

    status = "ok" if (db_healthy and ml_ready) else "degraded"

    # Live-feed snapshot: per-source modes plus upstream budget usage, so the
    # desk footer and globe source panel report real system state.
    feeds: dict = {}
    try:
        from app.api.routers.hazards import get_hazard_feed_status

        feeds["hazards"] = get_hazard_feed_status()
    except Exception as exc:
        logger.error("health_feeds_hazards_failed", error=str(exc))
    try:
        from app.services.ais_proxy import get_vessel_feed_status

        feeds["vessels"] = get_vessel_feed_status()
    except Exception as exc:
        logger.error("health_feeds_vessels_failed", error=str(exc))

    return {
        "status": status,
        "database": "connected" if db_healthy else "disconnected",
        "ml_model": "ready" if ml_ready else "warming_up",
        "version": "2.0.0",
        "feeds": feeds,
    }


@router.get("/ready")
async def readiness_check():
    """
    Readiness check endpoint.
    Returns 200 OK only if the system is fully ready to serve traffic.
    """
    try:
        await prisma.execute_raw("SELECT 1")
    except Exception as exc:
        logger.error("readiness_check_db_failed", error=str(exc))
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Database not ready") from exc

    if predictor_instance.is_warming_up:
        from fastapi import HTTPException

        raise HTTPException(status_code=503, detail="ML model not ready")

    return {"status": "ok", "message": "Service is ready"}
