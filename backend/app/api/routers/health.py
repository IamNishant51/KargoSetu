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

    return {
        "status": status,
        "database": "connected" if db_healthy else "disconnected",
        "ml_model": "ready" if ml_ready else "warming_up",
        "version": "2.0.0",
    }
