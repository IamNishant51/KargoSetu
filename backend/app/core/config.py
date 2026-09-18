"""
Centralized application configuration using Pydantic Settings.

All environment variables are loaded once at import time and validated
by Pydantic. Any missing required variables will cause a startup crash
with a clear error message, preventing silent misconfiguration.
"""

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # --- Application ---
    app_name: str = "KargoSetu API"
    app_version: str = "2.0.0"
    debug: bool = False

    # --- Database ---
    database_url: str
    direct_url: str = ""

    # --- Security ---
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080  # 7 days

    @field_validator("jwt_secret_key")
    @classmethod
    def jwt_secret_minimum_length(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError(
                "JWT_SECRET_KEY must be at least 32 characters for security. "
                'Generate one with: python -c "import secrets; print(secrets.token_hex(32))"'
            )
        return v

    # --- CORS ---
    frontend_url: str = "https://kargosetu.vercel.app"

    # --- External APIs ---
    google_client_id: str = ""
    nvidia_api_key: str = ""
    aisstream_api_key: str = ""
    firms_map_key: str = ""
    # MarineTraffic AIS API is commercial credit-based (no free tier) and
    # strictly opt-in: empty means disabled, AISStream/demo behavior unchanged.
    marinetraffic_api_key: str = ""

    # --- Upstream budget governors (safety ceilings per UTC day) ---
    firms_daily_budget: int = 200
    aisstream_daily_budget: int = 5000
    marinetraffic_daily_budget: int = 100

    # --- ML Configuration ---
    ml_lookback_days: int = 60
    ml_outlook_days: int = 90
    ml_training_epochs: int = 100
    ml_early_stopping_patience: int = 15
    ml_batch_size: int = 32
    ml_learning_rate: float = 0.001
    ml_huber_delta: float = 1.0
    ml_num_features: int = 6

    # --- Caching ---
    fleet_cache_ttl_seconds: int = 3600
    market_cache_ttl_seconds: int = 60
    forecast_cache_ttl_seconds: int = 1800

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "ignore",
    }


settings = Settings()
