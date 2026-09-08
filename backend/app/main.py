"""
KargoSetu Backend - FastAPI Application Entry Point.

Manages application lifecycle, middleware stack, and router registration.
"""

import asyncio
import logging
from contextlib import asynccontextmanager

import httpx
import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import ORJSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api.dependencies import prisma
from app.api.routers import (
    auth,
    commodities,
    forecast,
    health,
    market,
    notifications,
    ports,
    requisitions,
    settings as app_settings_router,
)
from app.core.config import settings as app_settings
from app.core.exceptions import register_exception_handlers
import app.services.maritime_math as maritime_math

logger = structlog.get_logger(__name__)

# --- Rate Limiter ---
limiter = Limiter(key_func=get_remote_address)


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

    # Connect to database
    try:
        await prisma.connect()
        logger.info("database_connected")
    except Exception as exc:
        logger.error("database_connection_failed", error=str(exc))
        raise

    # Start ML model initialization in the background
    from app.services.ml_predictor import predictor_instance

    asyncio.create_task(predictor_instance.init_model())
    logger.info("ml_model_warmup_started")
    
    asyncio.create_task(
        predictor_instance.schedule_retraining(interval_hours=6)
    )

    yield

    # --- Shutdown ---
    await http_client.aclose()
    logger.info("http_client_closed")
    await prisma.disconnect()
    logger.info("database_disconnected")


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
    default_response_class=ORJSONResponse,
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
