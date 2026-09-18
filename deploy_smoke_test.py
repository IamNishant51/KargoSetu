import os
import sys
import time
import requests

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

def run_smoke_test():
    print("Starting Deployment Smoke Test...")
    errors = []

    # 1. Frontend is reachable
    print(f"Checking frontend at {FRONTEND_URL}...")
    try:
        r = requests.get(FRONTEND_URL, timeout=10)
        if r.status_code != 200:
            errors.append(f"Frontend returned status {r.status_code}")
    except Exception as e:
        errors.append(f"Frontend unreachable: {e}")

    # 2. Backend health is OK
    # 5. Database connectivity works (checked in health)
    # 6. Model loads (checked in health)
    print(f"Checking backend health at {BACKEND_URL}/api/health/...")
    health_data = {}
    try:
        r = requests.get(f"{BACKEND_URL}/api/health/", timeout=10)
        if r.status_code != 200:
            errors.append(f"Backend health returned {r.status_code}")
        else:
            health_data = r.json()
            if health_data.get("status") != "ok":
                errors.append(f"Backend health status is not OK: {health_data.get('status')}")
            if health_data.get("database") != "connected":
                errors.append(f"Database connectivity failed: {health_data.get('database')}")
            if health_data.get("ml_model") != "ready":
                errors.append(f"Model not loaded: {health_data.get('ml_model')}")
            
            # 10. Demo fallback works
            # Check feeds
            feeds = health_data.get("feeds", {})
            vessel_feed = feeds.get("vessels", {})
            if vessel_feed.get("mode") not in ["live", "demo"]:
                errors.append("Demo fallback for vessels not configured properly.")
    except Exception as e:
        errors.append(f"Backend health unreachable: {e}")

    # 3. Backend readiness is OK
    print(f"Checking backend readiness at {BACKEND_URL}/api/health/ready...")
    try:
        r = requests.get(f"{BACKEND_URL}/api/health/ready", timeout=10)
        if r.status_code != 200:
            errors.append(f"Backend readiness returned {r.status_code}")
    except Exception as e:
        errors.append(f"Backend readiness unreachable: {e}")

    # 4. API response schema is valid
    # 7. Forecast endpoint responds
    print(f"Checking forecast endpoint...")
    try:
        r = requests.get(f"{BACKEND_URL}/api/forecast/route/C3?horizon_days=7", timeout=10)
        if r.status_code != 200:
            errors.append(f"Forecast endpoint returned {r.status_code}")
        else:
            data = r.json()
            if "forecasts" not in data or not isinstance(data["forecasts"], list):
                errors.append("Forecast endpoint response schema is invalid")
    except Exception as e:
        errors.append(f"Forecast endpoint failed: {e}")

    # 8. Vessel/port endpoint responds
    print(f"Checking vessels endpoint...")
    try:
        # Provide a bbox for vessels
        r = requests.get(f"{BACKEND_URL}/api/vessels/?minLon=0&minLat=0&maxLon=10&maxLat=10", timeout=10)
        if r.status_code != 200:
            errors.append(f"Vessels endpoint returned {r.status_code}: {r.text}")
    except Exception as e:
        errors.append(f"Vessels endpoint failed: {e}")

    print(f"Checking ports endpoint...")
    try:
        r = requests.get(f"{BACKEND_URL}/api/ports/", timeout=10)
        if r.status_code != 200:
            errors.append(f"Ports endpoint returned {r.status_code}: {r.text}")
    except Exception as e:
        errors.append(f"Ports endpoint failed: {e}")

    # 9. Globe data endpoint responds (Hazards)
    print(f"Checking hazards endpoint (Globe Data)...")
    try:
        r = requests.get(f"{BACKEND_URL}/api/hazards/?minLon=0&minLat=0&maxLon=10&maxLat=10", timeout=10)
        if r.status_code != 200:
            errors.append(f"Hazards endpoint returned {r.status_code}: {r.text}")
    except Exception as e:
        errors.append(f"Hazards endpoint failed: {e}")

    if errors:
        print("\nSmoke Test FAILED with the following errors:")
        for err in errors:
            print(f" - {err}")
        sys.exit(1)
    else:
        print("\nAll Smoke Tests PASSED!")
        sys.exit(0)

if __name__ == "__main__":
    run_smoke_test()
