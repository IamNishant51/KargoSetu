import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import ORJSONResponse
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.cors import CORSMiddleware
from app.api.dependencies import prisma

from app.api.routers import (
    health,
    requisitions,
    forecast,
    market,
    ports,
    commodities,
    settings,
    notifications,
    auth,
)
import httpx
import app.services.maritime_math as maritime_math


@asynccontextmanager
async def lifespan(app: FastAPI):
# Initialize global HTTP client pool
    http_client = httpx.AsyncClient(
        limits=httpx.Limits(max_keepalive_connections=50, max_connections=100)
    )
    maritime_math.http_client = http_client

# Connect to the database on startup
    await prisma.connect()
# Start ML model initialization in the background
    from app.services.ml_predictor import predictor_instance
    import asyncio

    asyncio.create_task(predictor_instance.init_model())
    yield
# Disconnect from the database and close HTTP client on shutdown
    await http_client.aclose()
    await prisma.disconnect()


app = FastAPI(
    title="KargoSetu API",
    description="Enterprise API for KargoSetu Maritime Freight Management, offering endpoints for requisitions, forecasting, market rates, and vessel analytics.",
    version="1.0.0",
    contact={
        "name": "KargoSetu Support",
        "url": "https://www.kargosetu.com/support",
        "email": "support@kargosetu.com",
    },
    license_info={
        "name": "Proprietary",
        "url": "https://www.kargosetu.com/license",
    },
    lifespan=lifespan,
    default_response_class=ORJSONResponse,
)

# CORS Configuration
frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(health.router)
app.include_router(requisitions.router)
app.include_router(forecast.router)
app.include_router(market.router)
app.include_router(ports.router)
app.include_router(commodities.router)
app.include_router(settings.router)
app.include_router(notifications.router)
app.include_router(auth.router)
