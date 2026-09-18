# Machine Learning Architecture

## Models & Baselines

KargoSetu implements a multi-model forecasting pipeline for freight rates:

1. **Heuristic/Naive Baseline**: Predicts future values using the last known value, establishing a confidence band using historical volatility.
2. **LSTM Model**: A deep learning model incorporating 60 days of lookback with features like BDRY index, S&P 500, Oil prices, RSI, and SMA. It predicts 90 days out.
3. **Seasonal Baselines**: Future iterations will include naive seasonal models based on historical cycle patterns.

## Provenance and Reliability

All data entering the forecasting engine tracks its **Provenance**:
- `mode`: Whether it is "live" or "demo".
- `provider`: The source of data (e.g. yfinance, KargoSetu).
- `retrieved_at`: When the data was last fetched.
- `data_age_seconds`: Age of the cached data.
- `is_synthetic`: Boolean indicating if data is real or simulated.

## Output Contract

The API `/api/v1/forecast/rates` returns a `ForecastResponse` wrapping the forecast bands, provenance metadata, uncertainty metrics, and model versions.
