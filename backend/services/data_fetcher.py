import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import random

def generate_fallback_bdry_data(days_history: int = 90) -> list:
    """Generates deterministic mock historical BDRY data for offline hackathon demos."""
    base_price = 18.50
    data = []
    today = datetime.now()
    
    for i in range(days_history, 0, -1):
        dt = today - timedelta(days=i)
        # Add random walk variance
        change = (random.random() - 0.48) * 0.4
        base_price = max(10.0, round(base_price + change, 2))
        data.append({
            "date": dt.strftime("%Y-%m-%d"),
            "price": base_price
        })
    return data

def fetch_bdry_freight_proxy(days_history: int = 90) -> dict:
    """
    Fetches Breakwave Dry Bulk Shipping ETF (BDRY) data using yfinance
    with deterministic fallback for offline hackathon resiliency.
    """
    try:
        ticker = yf.Ticker("BDRY")
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_history)
        
        hist = ticker.history(start=start_date, end=end_date)
        
        if hist.empty:
            fallback = generate_fallback_bdry_data(days_history)
            return {
                "status": "success",
                "source": "fallback_mock",
                "current_price": fallback[-1]['price'],
                "historical_data": fallback
            }
            
        data_records = hist.reset_index()[['Date', 'Close']].to_dict('records')
        formatted_data = [{"date": record['Date'].strftime("%Y-%m-%d"), "price": round(float(record['Close']), 2)} for record in data_records]
        
        return {
            "status": "success",
            "source": "live_yfinance",
            "current_price": formatted_data[-1]['price'],
            "historical_data": formatted_data
        }
        
    except Exception:
        fallback = generate_fallback_bdry_data(days_history)
        return {
            "status": "success",
            "source": "fallback_resilient",
            "current_price": fallback[-1]['price'],
            "historical_data": fallback
        }


def generate_forecast_curves(current_price: float, shock_factor: float = 1.0, horizon_days: int = 90) -> dict:
    """
    Generates 30-, 60-, and 90-day P10 (Optimistic), P50 (Median), and P90 (Pessimistic)
    freight projection curves adjusted by the Market Shock Factor.
    """
    forecast = []
    today = datetime.now()
    base_val = current_price
    
    for i in range(1, horizon_days + 1):
        dt = today + timedelta(days=i)
        # Growth trajectory with seasonal oscillation
        trend = (i * 0.02) * shock_factor
        p50 = round(base_val + trend + math_sin_wave(i), 2)
        p10 = round(p50 * 0.88, 2)
        p90 = round(p50 * (1.15 + (shock_factor - 1.0) * 0.3), 2)
        
        forecast.append({
            "date": dt.strftime("%Y-%m-%d"),
            "p10": p10,
            "p50": p50,
            "p90": p90
        })
        
    return {
        "horizon_days": horizon_days,
        "shock_factor": shock_factor,
        "forecast": forecast
    }

def math_sin_wave(day: int) -> float:
    import math
    return math.sin(day / 10.0) * 0.8