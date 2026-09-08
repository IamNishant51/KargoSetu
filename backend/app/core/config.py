"""
Centralized application configuration using Pydantic Settings.

All environment variables are loaded once at import time and validated
by Pydantic. Any missing required variables will cause a startup crash
with a clear error message, preventing silent misconfiguration.
"""

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

    # --- CORS ---
    frontend_url: str = "http://localhost:3000"

    # --- External APIs ---
    google_client_id: str = ""
    nvidia_api_key: str = ""

    # --- ML Configuration ---
    ml_lookback_days: int = 60
    ml_outlook_days: int = 90
    ml_training_epochs: int = 100
    ml_early_stopping_patience: int = 15
    ml_batch_size: int = 32
    ml_learning_rate: float = 0.001
    ml_huber_delta: float = 0.1

    # --- Caching ---
    fleet_cache_ttl_seconds: int = 3600
    market_cache_ttl_seconds: int = 60
    forecast_cache_ttl_seconds: int = 1800

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }


settings = Settings()
