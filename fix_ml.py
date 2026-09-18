import re

with open("backend/app/services/ml_predictor.py", "r") as f:
    code = f.read()

# 1. Add timeouts to yfinance and track live vs synthetic
code = code.replace(
    '''data_bdry = f_bdry.result()
                    data_sp500 = f_sp500.result()
                    data_oil = f_oil.result()''',
    '''data_bdry = f_bdry.result(timeout=15)
                    data_sp500 = f_sp500.result(timeout=15)
                    data_oil = f_oil.result(timeout=15)'''
)

code = code.replace(
    '''df = (
                    pd.DataFrame(df_bdry)''',
    '''self._data_cache_is_live = True
                df = (
                    pd.DataFrame(df_bdry)'''
)

code = code.replace(
    '''df = pd.DataFrame(
                    {''',
    '''self._data_cache_is_live = False
                df = pd.DataFrame(
                    {'''
)

# 2. Fix fake deterministic data in heuristic forecast
code = re.sub(
    r'# Deterministic route scaling bounded in \[0\.70, 1\.30\]\..*?p50 = round\(base \* route_multiplier, 2\)',
    'p50 = round(base, 2)',
    code,
    flags=re.DOTALL
)

# 3. Fix fake deterministic data in predict_sync
code = re.sub(
    r'# Apply a route-specific multiplier based on a deterministic hash of the origin and destination\s*# Deterministic route scaling bounded in \[0\.70, 1\.30\]\.\s*import hashlib\s*route_str = \(\s*f"\{origin\.lower\(\)\.strip\(\)\}\|\{destination\.lower\(\)\.strip\(\)\}"\.encode\(\)\s*\)\s*route_hash = int\(hashlib\.md5\(route_str\)\.hexdigest\(\)\[:8\], 16\) % 1000\s*route_multiplier = 0\.70 \+ \(route_hash / 1000\.0\) \* 0\.60\s*p50_arr = p50_arr \* route_multiplier',
    '# Removed fake deterministic data scaling',
    code
)

# 4. Modify return shape of _heuristic_forecast
code = re.sub(
    r'self\._forecast_cache\[cache_key\] = \(result, now\)\s*return result',
    '''forecast_payload = {
            "forecast": result,
            "provenance": {
                "mode": "live" if getattr(self, "_data_cache_is_live", False) else "demo",
                "provider": "KargoSetu heuristic baseline",
                "retrieved_at": datetime.fromtimestamp(self._data_cache_time if self._data_cache_time else now).isoformat() + "Z",
                "data_age_seconds": now - (self._data_cache_time if self._data_cache_time else now),
                "is_synthetic": not getattr(self, "_data_cache_is_live", False)
            },
            "uncertainty": float(self.historical_volatility),
            "units": "USD/MT",
            "model_version": "v0.1.0-heuristic",
        }
        self._forecast_cache[cache_key] = (forecast_payload, now)
        return forecast_payload''',
    code
)

# 5. Modify return shape of predict_sync
code = re.sub(
    r'result = \[\s*\{\s*"date": dates\[i\],\s*"p10": p10_list\[i\],\s*"p50": p50_list\[i\],\s*"p90": p90_list\[i\],\s*\}\s*for i in range\(OUTLOOK_DAYS\)\s*\]\s*self\._forecast_cache\[cache_key\] = \(result, now\)\s*return result',
    '''result = [
                {
                    "date": dates[i],
                    "p10": p10_list[i],
                    "p50": p50_list[i],
                    "p90": p90_list[i],
                }
                for i in range(OUTLOOK_DAYS)
            ]
            forecast_payload = {
                "forecast": result,
                "provenance": {
                    "mode": "live" if getattr(self, "_data_cache_is_live", False) else "demo",
                    "provider": "yfinance/KargoSetu LSTM",
                    "retrieved_at": datetime.fromtimestamp(self._data_cache_time if self._data_cache_time else now).isoformat() + "Z",
                    "data_age_seconds": now - (self._data_cache_time if self._data_cache_time else now),
                    "is_synthetic": not getattr(self, "_data_cache_is_live", False)
                },
                "uncertainty": float(self.historical_volatility),
                "units": "USD/MT",
                "model_version": "v1.0.0-lstm",
            }
            self._forecast_cache[cache_key] = (forecast_payload, now)
            return forecast_payload''',
    code
)

with open("backend/app/services/ml_predictor.py", "w") as f:
    f.write(code)
