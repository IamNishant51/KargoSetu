import asyncio
import logging

import yfinance as yf
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/market", tags=["market"])

logger = logging.getLogger(__name__)

SYMBOLS = {
	"BDRY": "Baltic Dry Index",
	"^GSPC": "S&P 500",
	"CL=F": "Crude Oil",
}

FALLBACK_TICKER = {
	"BDRY": (14.25, 0.82),
	"^GSPC": (5320.0, 0.35),
	"CL=F": (76.4, -0.64),
}


def _quote(symbol: str) -> dict:
	value, delta_num = FALLBACK_TICKER[symbol]
	try:
		history = yf.Ticker(symbol).history(period="5d", auto_adjust=False)
		if len(history) >= 2:
			value = float(history["Close"].iloc[-1])
			previous = float(history["Close"].iloc[-2])
			if previous:
				delta_num = ((value - previous) / previous) * 100
	except Exception as exc:
		logger.warning("Market quote unavailable for %s: %s", symbol, exc)

	is_positive = delta_num >= 0
	return {
		"symbol": symbol,
		"name": SYMBOLS[symbol],
		"value": f"{value:.2f}",
		"delta": f"{'+' if is_positive else ''}{delta_num:.2f}%",
		"isPositive": is_positive,
		"isSpecial": symbol == "BDRY",
	}


@router.get("/ticker")
async def get_market_ticker():
	return await asyncio.gather(
		*(asyncio.to_thread(_quote, symbol) for symbol in SYMBOLS)
	)
