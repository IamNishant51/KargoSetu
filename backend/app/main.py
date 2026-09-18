"""
KargoSetu Backend - FastAPI Application Entry Point.

Manages application lifecycle, middleware stack, and router registration.
"""

import asyncio
import logging
from contextlib import asynccontextmanager

import httpx
import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

import app.services.maritime_math as maritime_math
from app.api.dependencies import prisma
from app.api.routers import (
    auth,
    commodities,
    context,
    forecast,
    hazards,
    health,
    market,
    notifications,
    ports,
    requisitions,
    vessels,
)
from app.api.routers import (
    settings as app_settings_router,
)
from app.core.config import settings as app_settings
from app.core.exceptions import register_exception_handlers

logger = structlog.get_logger(__name__)

# --- Rate Limiter ---
limiter = Limiter(key_func=get_remote_address)

# Background tasks that must survive for the life of the process.
_background_tasks: set = set()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Initialize and teardown application resources.

    Startup sequence:
    1. Configure structured logging
    2. Create global HTTP client pool
    3. Connect to PostgreSQL via Prisma
    4. Start ML model training in background

    Shutdown sequence:
    1. Close HTTP client pool
    2. Disconnect from PostgreSQL
    """
    # --- Startup ---
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.dev.ConsoleRenderer()
            if app_settings.debug
            else structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            logging.DEBUG if app_settings.debug else logging.INFO
        ),
    )

    # Initialize global HTTP client pool with connection limits
    http_client = httpx.AsyncClient(
        limits=httpx.Limits(
            max_keepalive_connections=50,
            max_connections=100,
        ),
        timeout=httpx.Timeout(10.0, connect=5.0),
    )
    maritime_math.http_client = http_client

    # Connect to database. Non-fatal: the vessel/hazard proxies and corridor
    # static data serve fine without it; DB-backed endpoints fail per-request
    # instead of taking the whole API down (SIH stage wifi is unreliable).
    # Bounded: a dead/unreachable DB must never hang boot (free-tier cold
    # starts, CI without Postgres). Prisma retries internally, so cap it.
    try:
        await asyncio.wait_for(prisma.connect(), timeout=15)
        logger.info("database_connected")
    except Exception as exc:
        logger.error("database_connection_failed_serving_degraded", error=str(exc))

    # Start ML model initialization in the background
    import sys

    from app.services.ml_predictor import predictor_instance

    if "pytest" not in sys.modules:
        try:
            # Held module-wide so the tasks are never garbage-collected mid-flight.
            _background_tasks.add(asyncio.create_task(predictor_instance.init_model()))
            logger.info(
                "ml_model_warmup_started",
                inference_only=app_settings.skip_ml_training,
            )

            if app_settings.ml_enable_retraining and not app_settings.skip_ml_training:
                _background_tasks.add(
                    asyncio.create_task(
                        predictor_instance.schedule_retraining(interval_hours=6)
                    )
                )
            else:
                logger.info("ml_retraining_disabled")
        except Exception as exc:
            logger.error("ml_model_warmup_failed", error=str(exc))
    else:
        logger.info("ml_model_warmup_skipped_for_testing")

    yield

    # --- Shutdown ---
    await http_client.aclose()
    logger.info("http_client_closed")
    try:
        await prisma.disconnect()
        logger.info("database_disconnected")
    except Exception as exc:
        logger.warning("database_disconnect_skipped", error=str(exc))


# --- Application Factory ---
app = FastAPI(
    title=app_settings.app_name,
    description=(
        "Enterprise API for KargoSetu Maritime Freight Management. "
        "Provides constraint solving, freight rate forecasting, "
        "market data, and vessel analytics."
    ),
    version=app_settings.app_version,
    lifespan=lifespan,
    default_response_class=JSONResponse,
)

# --- Middleware Stack (order matters: last added = first executed) ---
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Register custom exception handlers
register_exception_handlers(app)

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[app_settings.frontend_url],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# --- Router Registration ---
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(requisitions.router)
app.include_router(forecast.router)
app.include_router(market.router)
app.include_router(ports.router)
app.include_router(commodities.router)
app.include_router(app_settings_router.router)
app.include_router(notifications.router)
app.include_router(vessels.router)
app.include_router(hazards.router)
app.include_router(context.router)
