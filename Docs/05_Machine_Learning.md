# MODULE 5: MACHINE LEARNING & PREDICTIVE FREIGHT MODELING

## 5.1 Pipeline & Feature Engineering
*   **Data Sources:** `yfinance` (BDRY, Macro indices), World Bank Pink Sheet API, Maritime bunker rates.
*   **Features:** Lag-7/14/30 returns, 14d rolling volatility, EMA(20, 50, 200).
*   **Algorithm:** XGBoost Regressor with `reg:quantileerror` (or `GradientBoostingRegressor(loss='quantile')`).

## 5.2 Python ML Blueprint
```python
import pandas as pd
import yfinance as yf
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import TimeSeriesSplit
import numpy as np

def fetch_and_engineer_features():
    df = yf.download("BDRY", period="5y")[['Close']]
    df['Return'] = df['Close'].pct_change()
    df['Vol_14d'] = df['Return'].rolling(14).std()
    df['EMA_20'] = df['Close'].ewm(span=20, adjust=False).mean()
    df['Lag_7'] = df['Close'].shift(7)
    return df.dropna()

def train_quantile_models(df):
    features = ['Vol_14d', 'EMA_20', 'Lag_7']
    X = df[features]
    y = df['Close']
    
    # Train P10, P50, P90
    models = {}
    for alpha in [0.1, 0.5, 0.9]:
        model = GradientBoostingRegressor(loss='quantile', alpha=alpha, n_estimators=200, random_state=42)
        model.fit(X, y)
        models[f'P{int(alpha*100)}'] = model
        
    return models, features

def generate_forecast(models, latest_features, horizons=[30, 60, 90]):
    # Simulated autoregressive multi-step inference
    predictions = {}
    for name, model in models.items():
        # simplified static feature projection for blueprint
        pred = model.predict(latest_features)
        predictions[name] = pred[0]
    return predictions

if __name__ == "__main__":
    data = fetch_and_engineer_features()
    models, f_cols = train_quantile_models(data)
    latest = data[f_cols].iloc[-1:]
    forecast = generate_forecast(models, latest)
    print("90-Day Outlook:", forecast)
```
