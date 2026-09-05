import asyncio
import aiohttp
import time
import statistics

URL = "http://localhost:8000/api/v1/forecast/rates"
NUM_REQUESTS = 1000

async def fetch(session, url):
    start_time = time.perf_counter()
    try:
        async with session.get(url) as response:
            await response.read()
            status = response.status
    except Exception:
        status = 500
    latency = time.perf_counter() - start_time
    return status, latency

async def main():
    print(f"Starting benchmark: {NUM_REQUESTS} concurrent requests to {URL}...")

    start_total = time.perf_counter()

    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, URL) for _ in range(NUM_REQUESTS)]
        results = await asyncio.gather(*tasks)

    total_time = time.perf_counter() - start_total

    latencies = [latency for _, latency in results]
    successes = sum(1 for status, _ in results if status == 200)

    avg_latency = statistics.mean(latencies)

    # Calculate p99
    latencies.sort()
    p99_idx = int(len(latencies) * 0.99)
    p99_latency = latencies[p99_idx] if latencies else 0

    success_rate = (successes / NUM_REQUESTS) * 100

    print("\n--- Benchmark Results ---")
    print(f"Total Requests: {NUM_REQUESTS}")
    print(f"Concurrency level: {NUM_REQUESTS}")
    print(f"Total Time Taken: {total_time:.2f}s")
    print(f"Success Rate:   {success_rate:.2f}%")
    print(f"Average Latency: {avg_latency * 1000:.2f} ms")
    print(f"p99 Latency:    {p99_latency * 1000:.2f} ms")

if __name__ == "__main__":
    asyncio.run(main())
