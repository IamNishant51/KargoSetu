"""Live market data endpoint via Yahoo Finance."""

import asyncio
import time as time_module
import yfinance as yf
from fastapi import APIRouter
import structlog

router = APIRouter(prefix="/api/v1/market", tags=["market"])
logger = structlog.get_logger(__name__)

SYMBOLS = {
    "BDRY": "Baltic Dry Index",
    "^GSPC": "S&P 500",
    "CL=F": "Crude Oil",
}

_market_cache: list | None = None
_market_cache_time: float = 0
MARKET_CACHE_TTL = 60  # seconds

def _quote(symbol: str) -> dict:
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="5d")
        if hist.empty:
            return {"symbol": symbol, "price": 0.0, "change_pct": 0.0}

        closes = hist["Close"].tolist()
        if len(closes) >= 2:
            current = closes[-1]
            prev = closes[-2]
            change = ((current - prev) / prev) * 100
        else:
            current = closes[0]
            change = 0.0

        return {
            "symbol": symbol,
            "name": SYMBOLS.get(symbol, symbol),
            "price": round(current, 2),
            "change_pct": round(change, 2),
        }
    except Exception as e:
        logger.warning("market_quote_failed", symbol=symbol, error=str(e))
        return {"symbol": symbol, "name": SYMBOLS.get(symbol, symbol), "price": 0.0, "change_pct": 0.0}

@router.get("/ticker")
async def get_market_ticker():
    global _market_cache, _market_cache_time
    now = time_module.time()
    if (
        _market_cache is not None
        and (now - _market_cache_time) < MARKET_CACHE_TTL
    ):
        return _market_cache

    result = await asyncio.gather(
        *(asyncio.to_thread(_quote, symbol) for symbol in SYMBOLS)
    )
    _market_cache = list(result)
    _market_cache_time = now
    return _market_cache
