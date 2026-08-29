#!/usr/bin/env python3
"""
HEATSHIELD Post-Deployment Smoke Test Script
Validates that backend and frontend services are responsive, healthy, and operational.
"""
import sys
import time
import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

ENDPOINTS = [
    ("/health", "Health & Primary Data Provider"),
    ("/fortyguard/status", "FortyGuard API Status"),
    ("/fortyguard/telemetry", "FortyGuard Microclimate Telemetry"),
    ("/fortyguard/nodes", "FortyGuard IoT Sensor Fleet"),
    ("/heat-intelligence/spatial-mesh", "GIS GeoJSON Spatial Mesh"),
    ("/agents/roster", "Multi-Agent AI Roster"),
    ("/tracks/all", "Seven-Track Operational Hub"),
]

def check_endpoint(path, name):
    url = f"{BASE_URL}{path}"
    print(f"[*] Checking [{name}] -> {url} ... ", end="", flush=True)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "HEATSHIELD-SmokeTest/1.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            status = resp.status
            data = json.loads(resp.read().decode("utf-8"))
            if status == 200:
                print(f"[OK] (HTTP 200)")
                return True
            else:
                print(f"[FAILED] HTTP {status}")
                return False
    except Exception as e:
        print(f"[ERROR] {e}")
        return False

def main():
    print("==================================================")
    print("   HEATSHIELD Post-Deployment Verification Suite   ")
    print("==================================================")
    
    passed = 0
    total = len(ENDPOINTS)
    
    for path, name in ENDPOINTS:
        if check_endpoint(path, name):
            passed += 1
        time.sleep(0.1)

    print("--------------------------------------------------")
    print(f"Result: {passed}/{total} endpoints healthy ({int(passed/total*100)}%)")
    
    if passed == total:
        print("[SUCCESS] All deployed services are fully operational!")
        sys.exit(0)
    else:
        print("[WARNING] Some endpoints failed smoke test verification.")
        sys.exit(1)

if __name__ == "__main__":
    main()
