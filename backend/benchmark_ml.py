import asyncio
import os
import sys
import time

# Add backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.ml_predictor import get_freight_forecast, predictor_instance


async def run_benchmark():
    print("Initializing model (warming up)...")
    start = time.perf_counter()
    await predictor_instance.init_model()
    end = time.perf_counter()
    print(f"Warmup took {end - start:.4f} seconds")

    print("Running inference benchmark...")

    # Run a single prediction
    start = time.perf_counter()
    res = await get_freight_forecast(1.0, "Origin", "Destination")
    end = time.perf_counter()
    print(f"Single inference took {end - start:.4f} seconds (len: {len(res)})")

    # Run batched predictions
    predictor_instance._forecast_cache.clear()
    start = time.perf_counter()
    tasks = [get_freight_forecast(1.0, f"O{i}", f"D{i}") for i in range(100)]
    await asyncio.gather(*tasks)
    end = time.perf_counter()
    print(f"100 inferences took {end - start:.4f} seconds")


if __name__ == "__main__":
    asyncio.run(run_benchmark())
