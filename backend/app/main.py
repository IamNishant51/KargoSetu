import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prisma import Prisma

from app.api.routers import health, requisitions, forecast, market, ports, commodities

# Initialize global Prisma client
prisma = Prisma()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to the database on startup
    await prisma.connect()
    # Start ML model initialization in the background
    from app.services.ml_predictor import predictor_instance
    import asyncio
    asyncio.create_task(predictor_instance.init_model())
    yield
    # Disconnect from the database on shutdown
    await prisma.disconnect()

app = FastAPI(
    title="KargoSetu API",
    description="Python/FastAPI Backend for KargoSetu",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")

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
