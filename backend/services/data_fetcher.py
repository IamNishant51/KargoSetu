import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

def fetch_bdry_freight_proxy(days_history: int = 90) -> dict:
    """
    Fetches the Breakwave Dry Bulk Shipping ETF (BDRY) as a 100% free proxy 
    for the Baltic Dry Index using yfinance.
    """
    try:
        ticker = yf.Ticker("BDRY")
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_history)
        
        # Fetch historical data
        hist = ticker.history(start=start_date, end=end_date)
        
        if hist.empty:
            return {"status": "error", "message": "No data found for BDRY."}
            
        # Format the data for ML consumption
        data_records = hist.reset_index()[['Date', 'Close']].to_dict('records')
        formatted_data = [{"date": record['Date'].strftime("%Y-%m-%d"), "price": record['Close']} for record in data_records]
        
        return {
            "status": "success",
            "current_price": formatted_data[-1]['price'],
            "historical_data": formatted_data
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}