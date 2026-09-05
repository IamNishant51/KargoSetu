import asyncio
import numpy as np
import pandas as pd
import yfinance as yf
import tensorflow as tf
from tensorflow.keras import mixed_precision
from sklearn.preprocessing import RobustScaler


from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv1D, LSTM, Dropout, Dense
from tensorflow.keras.regularizers import l2
from tensorflow.keras.losses import Huber
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from datetime import datetime, timedelta
import threading
import logging

logger = logging.getLogger(__name__)


# Enable memory growth to prevent OOM
gpus = tf.config.experimental.list_physical_devices("GPU")
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    except RuntimeError as e:
        logger.error(f"Error setting memory growth: {e}")

# Enable mixed precision
policy = mixed_precision.Policy("mixed_float16")
mixed_precision.set_global_policy(policy)

LOOKBACK_DAYS = 60
OUTLOOK_DAYS = 90


class MLPredictor:
    def __init__(self):
        self.cached_model = None
        self.onnx_model_path = "model.onnx"
        self.onnx_session = None
        self.latest_sequence = None
        self.historical_volatility = 0.0
        self.scalers = {}
        self.is_warming_up = True
        self._lock = threading.Lock()

    async def init_model(self):
        """Asynchronously initialize and train the model on startup."""
        self.is_warming_up = True
        try:
            logger.info("Fetching real multivariate historical data...")
            data = await asyncio.to_thread(self._fetch_and_prepare_data)

            if data is None:
                logger.error("Failed to prepare data.")
                return

            train_x, train_y, val_x, val_y = data

            logger.info("Training Advanced CNN-LSTM Hybrid Model...")
            model = await asyncio.to_thread(
                self._train_model, train_x, train_y, val_x, val_y
            )

            with self._lock:
                self.cached_model = model

# Export to ONNX
                try:
                    import tf2onnx
                    import onnxruntime as ort

                    input_signature = [
                        tf.TensorSpec(
                            [None, LOOKBACK_DAYS, 5], tf.float32, name="input"
                        )
                    ]
                    onnx_model, _ = tf2onnx.convert.from_keras(
                        model, input_signature, opset=13
                    )
                    with open(self.onnx_model_path, "wb") as f:
                        f.write(onnx_model.SerializeToString())
                    logger.info("Successfully exported model to ONNX format.")

                    self.onnx_session = ort.InferenceSession(self.onnx_model_path)
                except Exception as ex:
                    logger.error(f"Failed to export to ONNX: {ex}")

                self.is_warming_up = False
                logger.info("Model warmed up and ready.")
        except Exception as e:
            logger.error(f"Error during ML initialization: {e}")

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
# 1. Fetch Data
        end_date = datetime.now()
        start_date = end_date - timedelta(days=5 * 365)

        try:
# yfinance returns pandas DataFrame
            data_bdry = yf.download(
                "BDRY", start=start_date, end=end_date, progress=False
            )
            data_sp500 = yf.download(
                "^GSPC", start=start_date, end=end_date, progress=False
            )
            data_oil = yf.download(
                "CL=F", start=start_date, end=end_date, progress=False
            )

            df_bdry = data_bdry[["Close"]].rename(columns={"Close": "bdry"})
            df_sp500 = data_sp500[["Close"]].rename(columns={"Close": "sp500"})
            df_oil = data_oil[["Close"]].rename(columns={"Close": "oil"})

            df = df_bdry.join(df_sp500, how="inner").join(df_oil, how="inner")

        except Exception as e:
            logger.warning(
                f"Yahoo Finance API Failed: {e}. Generating resilient synthetic baseline data..."
            )
# Fallback
            dates = pd.date_range(start=start_date, periods=1250, freq="B")
            df = pd.DataFrame(
                {
                    "bdry": np.maximum(5, 15 + np.cumsum(np.random.randn(1250) * 1.5)),
                    "sp500": np.maximum(
                        1000, 4000 + np.cumsum(np.random.randn(1250) * 10)
                    ),
                    "oil": np.maximum(20, 70 + np.cumsum(np.random.randn(1250) * 2)),
                },
                index=dates,
            )

        df = df.dropna()
        if df.empty:
            return None

# Flatten MultiIndex columns if present (yfinance sometimes does this)
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = [col[0] for col in df.columns]

# Ensure columns exist and are 1D series
        bdry_series = df["bdry"].squeeze()

# 2. Feature Engineering
        df["sma14"] = bdry_series.rolling(window=14, min_periods=1).mean()
        df["rsi14"] = self._calculate_rsi(bdry_series, 14)

        df = df.dropna()

# Robust Scaler
        features = ["bdry", "sp500", "oil", "sma14", "rsi14"]
        self.scalers = {}
        for f in features:
            scaler = RobustScaler()
            df[f] = scaler.fit_transform(df[[f]]).flatten()
            self.scalers[f] = scaler

# Historical Volatility (60-day rolling window)
        vol_window = 60
        if len(bdry_series) > vol_window:
            returns = np.log(bdry_series / bdry_series.shift(1)).dropna()
            self.historical_volatility = returns.tail(vol_window).std()
        else:
            self.historical_volatility = 0.05

# Save latest sequence
        self.latest_sequence = df[features].tail(LOOKBACK_DAYS).values

# Sliding Window Construction
        feature_data = df[features].values
        target_data = df["bdry"].values

        n_samples = len(df) - LOOKBACK_DAYS - OUTLOOK_DAYS + 1
        if n_samples <= 0:
            return None

# Using numpy stride_tricks
        X = np.lib.stride_tricks.sliding_window_view(
            feature_data[:-OUTLOOK_DAYS], (LOOKBACK_DAYS, 5)
        ).reshape(-1, LOOKBACK_DAYS, 5)
        Y = np.lib.stride_tricks.sliding_window_view(
            target_data[LOOKBACK_DAYS:], (OUTLOOK_DAYS,)
        ).reshape(-1, OUTLOOK_DAYS)

# Ensure sizes match
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
        model = Sequential(
            [
                Conv1D(
                    filters=64,
                    kernel_size=3,
                    activation="relu",
                    input_shape=(LOOKBACK_DAYS, 5),
                ),
                LSTM(64, return_sequences=False),
                Dropout(0.3),
                Dense(128, activation="relu", kernel_regularizer=l2(0.001)),
                Dropout(0.2),
                Dense(OUTLOOK_DAYS, activation="linear"),
            ]
        )

        model.compile(optimizer=Adam(learning_rate=0.001), loss=Huber(delta=0.1))

        early_stopping = EarlyStopping(
            monitor="val_loss", patience=10, restore_best_weights=True
        )

        model.fit(
            train_x,
            train_y,
            epochs=50,
            batch_size=32,
            validation_data=(val_x, val_y),
            callbacks=[early_stopping],
            verbose=0,
        )
        return model

    def _denormalize_bdry(self, val):
        return float(self.scalers["bdry"].inverse_transform([[val]])[0][0])

    def predict_sync(self, shock_multiplier: float):
        shock_multiplier = max(0.1, min(5.0, shock_multiplier))
        today = datetime.now()
        with self._lock:
            if self.is_warming_up or self.cached_model is None:
                logger.info(
                    "[ML] Model still warming up. Returning fast heuristic forecast."
                )

                i_arr = np.arange(OUTLOOK_DAYS)
                pseudo_random = np.sin(i_arr * 1234.5678) * 10000
                deterministic_random = pseudo_random - np.floor(pseudo_random)
                deltas = (deterministic_random - 0.45) * 5

                cumulative_deltas = np.cumsum(deltas)
                p50_arr = 1500.0 + np.concatenate(([0.0], cumulative_deltas[:-1]))

                variance_pct = 0.02 * np.sqrt(i_arr + 1) * shock_multiplier

                p10_arr = p50_arr * (1 - variance_pct * 1.28)
                p90_arr = p50_arr * (1 + variance_pct * 1.28)

                p10_arr = np.round(np.maximum(0, p10_arr), 2)
                p50_arr = np.round(p50_arr, 2)
                p90_arr = np.round(p90_arr, 2)

                p10_list = p10_arr.tolist()
                p50_list = p50_arr.tolist()
                p90_list = p90_arr.tolist()

                dates = [
                    (today + timedelta(days=int(i) + 1)).strftime("%Y-%m-%d")
                    for i in i_arr
                ]

                return [
                    {
                        "date": dates[i],
                        "p10": p10_list[i],
                        "p50": p50_list[i],
                        "p90": p90_list[i],
                    }
                    for i in range(OUTLOOK_DAYS)
                ]

            input_tensor = np.array([self.latest_sequence], dtype=np.float32)

            if self.onnx_session is not None:
                try:
                    input_name = self.onnx_session.get_inputs()[0].name
                    prediction = self.onnx_session.run(
                        None, {input_name: input_tensor}
                    )[0][0]
                except Exception as e:
                    logger.warning(f"ONNX inference failed, falling back to TF: {e}")
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

            return [
                {
                    "date": dates[i],
                    "p10": p10_list[i],
                    "p50": p50_list[i],
                    "p90": p90_list[i],
                }
                for i in range(OUTLOOK_DAYS)
            ]


predictor_instance = MLPredictor()

# Call this asynchronously from your application startup
# asyncio.create_task(predictor_instance.init_model())


async def get_freight_forecast(shockMultiplier: float = 1.0) -> list[dict]:
    return await asyncio.to_thread(predictor_instance.predict_sync, shockMultiplier)
