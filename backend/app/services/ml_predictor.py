import asyncio
import numpy as np
import pandas as pd
import yfinance as yf
import tensorflow as tf
from tensorflow.keras import mixed_precision
from sklearn.preprocessing import RobustScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv1D, LSTM, Dropout, Dense, BatchNormalization
from tensorflow.keras.regularizers import l2
from tensorflow.keras.losses import Huber
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from datetime import datetime, timedelta
import threading
import structlog
import os
import tempfile
import time as time_module
import onnxruntime as ort
import tf2onnx

from app.core.config import settings

logger = structlog.get_logger(__name__)

# Enable memory growth to prevent OOM
gpus = tf.config.experimental.list_physical_devices("GPU")
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    except RuntimeError as e:
        logger.error("gpu_memory_growth_error", error=str(e))

# Enable mixed precision
policy = mixed_precision.Policy("mixed_float16")
mixed_precision.set_global_policy(policy)

LOOKBACK_DAYS = settings.ml_lookback_days
OUTLOOK_DAYS = settings.ml_outlook_days

_BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class MLPredictor:
    def __init__(self):
        self.cached_model = None
        
        self.onnx_model_path = os.path.join(_BASE_DIR, "models", "model.onnx")
        os.makedirs(os.path.dirname(self.onnx_model_path), exist_ok=True)
        
        self.onnx_session = None
        self.latest_sequence = None
        self.historical_volatility = 0.0
        self.scalers = {}
        self.is_warming_up = True
        self._lock = threading.Lock()
        
        self._data_cache: pd.DataFrame | None = None
        self._data_cache_time: float = 0
        self.DATA_CACHE_TTL = 3600 * 6  # 6 hours
        
        self._forecast_cache: dict[float, tuple[list[dict], float]] = {}

    def _safe_close(self, df: pd.DataFrame, name: str) -> pd.Series:
        """Extract Close column handling both flat and MultiIndex."""
        if isinstance(df.columns, pd.MultiIndex):
            close_col = [c for c in df.columns if c[0] == "Close"]
            if close_col:
                return df[close_col[0]].rename(name)
        if "Close" in df.columns:
            return df["Close"].rename(name)
        raise ValueError(f"No Close column found for {name}")

    async def init_model(self):
        """Asynchronously initialize and train the model on startup."""
        self.is_warming_up = True
        try:
            logger.info("data_fetch_started", symbols=["BDRY", "^GSPC", "CL=F"])
            data = await asyncio.to_thread(self._fetch_and_prepare_data)

            if data is None:
                logger.error("ml_init_failed", error="Failed to prepare data.")
                self.is_warming_up = False
                return

            train_x, train_y, val_x, val_y = data

            logger.info("ml_training_started", epochs=settings.ml_training_epochs)
            model = await asyncio.to_thread(
                self._train_model, train_x, train_y, val_x, val_y
            )

            with self._lock:
                self.cached_model = model
                self._export_to_onnx(model)
                self.is_warming_up = False
                logger.info("ml_model_warmed_up")
        except Exception as e:
            logger.error("ml_init_failed", error=str(e))
            self.is_warming_up = False
    async def schedule_retraining(self, interval_hours: int = 6) -> None:
        """Periodically retrain the model with fresh data."""
        while True:
            await asyncio.sleep(interval_hours * 3600)
            try:
                logger.info("scheduled_retraining_started")
                data = await asyncio.to_thread(self._fetch_and_prepare_data)
                if data is None:
                    logger.warning("scheduled_retraining_skipped", reason="no_data")
                    continue

                train_x, train_y, val_x, val_y = data
                new_model = await asyncio.to_thread(
                    self._train_model, train_x, train_y, val_x, val_y
                )

                with self._lock:
                    self.cached_model = new_model
                    self._export_to_onnx(new_model)
                    self._forecast_cache.clear()

                logger.info("scheduled_retraining_completed")
            except Exception as exc:
                logger.error("scheduled_retraining_failed", error=str(exc))

    def _export_to_onnx(self, model):
        try:
            input_signature = [
                tf.TensorSpec([None, LOOKBACK_DAYS, 5], tf.float32, name="input")
            ]
            onnx_model, _ = tf2onnx.convert.from_keras(
                model, input_signature, opset=13
            )
            with open(self.onnx_model_path, "wb") as f:
                f.write(onnx_model.SerializeToString())
            logger.info("onnx_export_success")

            sess_options = ort.SessionOptions()
            sess_options.intra_op_num_threads = 2
            sess_options.inter_op_num_threads = 2
            sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            sess_options.enable_cpu_mem_arena = True

            self.onnx_session = ort.InferenceSession(
                self.onnx_model_path,
                sess_options,
                providers=["CPUExecutionProvider"],
            )
        except Exception as ex:
            logger.error("onnx_export_failed", error=str(ex))

    def _calculate_rsi(self, series: pd.Series, period: int = 14) -> pd.Series:
        delta = series.diff()
        gain = (delta.where(delta > 0, 0)).fillna(0)
        loss = (-delta.where(delta < 0, 0)).fillna(0)

        avg_gain = gain.rolling(window=period, min_periods=period).mean()
        avg_loss = loss.rolling(window=period, min_periods=period).mean()

        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        return rsi.fillna(50)

    def _fetch_and_prepare_data(self):
        now = time_module.time()
        if self._data_cache is not None and (now - self._data_cache_time) < self.DATA_CACHE_TTL:
            df = self._data_cache.copy()
        else:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=5 * 365)

            try:
                data_bdry = yf.download("BDRY", start=start_date, end=end_date, progress=False)
                data_sp500 = yf.download("^GSPC", start=start_date, end=end_date, progress=False)
                data_oil = yf.download("CL=F", start=start_date, end=end_date, progress=False)

                df_bdry = self._safe_close(data_bdry, "bdry")
                df_sp500 = self._safe_close(data_sp500, "sp500")
                df_oil = self._safe_close(data_oil, "oil")

                df = pd.DataFrame(df_bdry).join(df_sp500, how="inner").join(df_oil, how="inner")

            except Exception as e:
                logger.warning("yfinance_api_failed", error=str(e), fallback="synthetic_data")
                dates = pd.date_range(start=start_date, periods=1250, freq="B")
                df = pd.DataFrame(
                    {
                        "bdry": np.maximum(5, 15 + np.cumsum(np.random.randn(1250) * 1.5)),
                        "sp500": np.maximum(1000, 4000 + np.cumsum(np.random.randn(1250) * 10)),
                        "oil": np.maximum(20, 70 + np.cumsum(np.random.randn(1250) * 2)),
                    },
                    index=dates,
                )

            self._data_cache = df.copy()
            self._data_cache_time = now

        df = df.dropna()
        if df.empty:
            return None

        # Data Validation
        if len(df) < LOOKBACK_DAYS + OUTLOOK_DAYS + 50:
            logger.warning("insufficient_data", rows=len(df), minimum=LOOKBACK_DAYS + OUTLOOK_DAYS + 50)
            return None

        if (df["bdry"] <= 0).any():
            logger.warning("negative_bdry_values_detected", count=int((df["bdry"] <= 0).sum()))
            df = df[df["bdry"] > 0]

        for col in ["bdry", "sp500", "oil"]:
            mean_val = df[col].mean()
            std_val = df[col].std()
            outlier_mask = (df[col] - mean_val).abs() > 10 * std_val
            if outlier_mask.any():
                logger.warning("extreme_outlier_detected", column=col, count=int(outlier_mask.sum()))
                df.loc[outlier_mask, col] = df[col].clip(
                    lower=mean_val - 10 * std_val,
                    upper=mean_val + 10 * std_val,
                )

        bdry_series = df["bdry"].squeeze()

        df["sma14"] = bdry_series.rolling(window=14, min_periods=1).mean()
        df["rsi14"] = self._calculate_rsi(bdry_series, 14)

        df = df.dropna()

        features = ["bdry", "sp500", "oil", "sma14", "rsi14"]
        self.scalers = {}
        for f in features:
            scaler = RobustScaler()
            df[f] = scaler.fit_transform(df[[f]]).flatten()
            self.scalers[f] = scaler

        vol_window = 60
        if len(bdry_series) > vol_window:
            returns = np.log(bdry_series / bdry_series.shift(1)).dropna()
            self.historical_volatility = returns.tail(vol_window).std()
        else:
            self.historical_volatility = 0.05

        self.latest_sequence = df[features].tail(LOOKBACK_DAYS).values

        feature_data = df[features].values
        target_data = df["bdry"].values

        n_samples = len(df) - LOOKBACK_DAYS - OUTLOOK_DAYS + 1
        if n_samples <= 0:
            return None

        X = np.lib.stride_tricks.sliding_window_view(
            feature_data[:-OUTLOOK_DAYS], (LOOKBACK_DAYS, 5)
        ).reshape(-1, LOOKBACK_DAYS, 5)
        Y = np.lib.stride_tricks.sliding_window_view(
            target_data[LOOKBACK_DAYS:], (OUTLOOK_DAYS,)
        ).reshape(-1, OUTLOOK_DAYS)

        min_len = min(len(X), len(Y))
        X = X[:min_len]
        Y = Y[:min_len]

        split_idx = int(min_len * 0.85)

        train_x = X[:split_idx]
        train_y = Y[:split_idx]
        val_x = X[split_idx:]
        val_y = Y[split_idx:]

        return train_x, train_y, val_x, val_y

    def _train_model(self, train_x, train_y, val_x, val_y):
        model = Sequential([
            Conv1D(
                filters=64,
                kernel_size=3,
                activation="relu",
                input_shape=(LOOKBACK_DAYS, 5),
            ),
            BatchNormalization(),
            LSTM(64, return_sequences=False, recurrent_dropout=0.1),
            Dropout(0.3),
            Dense(128, activation="relu", kernel_regularizer=l2(0.001)),
            BatchNormalization(),
            Dropout(0.2),
            Dense(OUTLOOK_DAYS, activation="linear"),
        ])

        model.compile(optimizer=Adam(learning_rate=settings.ml_learning_rate), loss=Huber(delta=settings.ml_huber_delta))

        early_stopping = EarlyStopping(
            monitor="val_loss", patience=settings.ml_early_stopping_patience, restore_best_weights=True
        )

        lr_scheduler = ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=5,
            min_lr=1e-6,
            verbose=0,
        )

        checkpoint_path = os.path.join(
            tempfile.gettempdir(), "kargosetu_model_checkpoint.keras"
        )
        checkpoint = ModelCheckpoint(
            checkpoint_path,
            monitor="val_loss",
            save_best_only=True,
            verbose=0,
        )

        model.fit(
            train_x,
            train_y,
            epochs=settings.ml_training_epochs,
            batch_size=settings.ml_batch_size,
            validation_data=(val_x, val_y),
            callbacks=[early_stopping, lr_scheduler, checkpoint],
            verbose=0,
        )

        model.load_weights(checkpoint_path)
        return model

    def _denormalize_bdry(self, val):
        return float(self.scalers["bdry"].inverse_transform([[val]])[0][0])

    def predict_sync(self, shock_multiplier: float, origin: str = "Newcastle, Australia", destination: str = "Haldia"):
        shock_multiplier = max(0.1, min(5.0, shock_multiplier))
        cache_key = f"{round(shock_multiplier, 1)}_{origin}_{destination}"
        now = time_module.time()

        if cache_key in self._forecast_cache:
            cached_result, cached_time = self._forecast_cache[cache_key]
            if (now - cached_time) < settings.forecast_cache_ttl_seconds:
                return cached_result

        # Wait if the model is currently warming up
        wait_attempts = 0
        while self.is_warming_up and wait_attempts < 120: # Max wait 120 seconds
            time_module.sleep(1.0)
            wait_attempts += 1

        today = datetime.now()
        with self._lock:
            if self.cached_model is None:
                logger.error("ml_model_unavailable")
                raise RuntimeError("ML Forecast Model is currently unavailable or failed to initialize.")
                
            input_tensor = np.array([self.latest_sequence], dtype=np.float32)

            if self.onnx_session is not None:
                try:
                    input_name = self.onnx_session.get_inputs()[0].name
                    prediction = self.onnx_session.run(
                        None, {input_name: input_tensor}
                    )[0][0]
                except Exception as e:
                    logger.warning("onnx_inference_failed", error=str(e), fallback="tensorflow")
                    prediction = self.cached_model(
                        input_tensor, training=False
                    ).numpy()[0]
            else:
                prediction = self.cached_model(input_tensor, training=False).numpy()[0]

            p50_arr = (
                self.scalers["bdry"]
                .inverse_transform(prediction.reshape(-1, 1))
                .flatten()
            )
            
            # Apply a route-specific multiplier based on a deterministic hash of the origin and destination
            route_hash = sum(ord(c) for c in (origin + destination))
            route_multiplier = 0.7 + ((route_hash % 60) / 100.0)
            p50_arr = p50_arr * route_multiplier

            # Volatility is computed on raw log-returns.
            i_arr = np.arange(OUTLOOK_DAYS)
            time_scaled_volatility = self.historical_volatility * np.sqrt(i_arr + 1)
            variance_pct = time_scaled_volatility * shock_multiplier

            p10_arr = p50_arr * (1 - variance_pct * 1.28)
            p90_arr = p50_arr * (1 + variance_pct * 1.28)

            p10_arr = np.round(np.maximum(0, p10_arr), 2)
            p50_arr = np.round(p50_arr, 2)
            p90_arr = np.round(p90_arr, 2)

            p10_list = p10_arr.tolist()
            p50_list = p50_arr.tolist()
            p90_list = p90_arr.tolist()

            dates = [
                (today + timedelta(days=int(i) + 1)).strftime("%Y-%m-%d") for i in i_arr
            ]

            result = [
                {
                    "date": dates[i],
                    "p10": p10_list[i],
                    "p50": p50_list[i],
                    "p90": p90_list[i],
                }
                for i in range(OUTLOOK_DAYS)
            ]
            self._forecast_cache[cache_key] = (result, now)
            return result

predictor_instance = MLPredictor()

async def get_freight_forecast(shockMultiplier: float = 1.0, origin: str = "Newcastle, Australia", destination: str = "Haldia") -> list[dict]:
    return await asyncio.to_thread(predictor_instance.predict_sync, shockMultiplier, origin, destination)
