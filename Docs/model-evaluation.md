# Model Evaluation Protocol

## Rolling-Origin Evaluation

Rather than static holdout sets, KargoSetu models should be evaluated using rolling-origin backtesting. This ensures the model's predictive capability is robust across different market regimes and avoids lookahead bias.

## Metrics

Models are evaluated on:
- **MAE** and **RMSE** for point forecasts (P50).
- **Pinball Loss** for quantile forecasts (P10 and P90).
- **Interval Coverage**: Ensuring the P10-P90 range captures ~80% of actual values over time.

## Feature Importance and Leakage

We maintain strict separation of training features and future targets. Categorical and rolling features are designed to avoid target leakage, and external datasets (like S&P 500 or Oil) are aligned to the exact day of prediction to simulate realistic data availability constraints.
