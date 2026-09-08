import requests
import time

res = requests.post("http://localhost:8000/api/v1/requisitions", json={
    "volume_mt": 50000,
    "dest_port": "Haldia",
    "commodity": "Coal",
    "origin": "Newcastle"
})
req_id = res.json()["id"]
print("Created:", req_id, "Status:", res.json()["status"])

for i in range(8):
    time.sleep(1)
    res2 = requests.get(f"http://localhost:8000/api/v1/requisitions/{req_id}")
    print(f"Second {i+1} status:", res2.json()["status"])
