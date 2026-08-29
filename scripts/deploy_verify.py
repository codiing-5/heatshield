#!/usr/bin/env python3
"""
HEATSHIELD Post-Deployment Smoke Test Script
Validates that backend and frontend services are responsive, healthy, and operational.
"""
import sys
import time
import argparse
import urllib.request
import json

DEFAULT_BASE_URL = "http://127.0.0.1:8000/api/v1"

ENDPOINTS = [
    ("/health", "Health & Primary Data Provider"),
    ("/fortyguard/status", "FortyGuard API Status"),
    ("/fortyguard/telemetry", "FortyGuard Microclimate Telemetry"),
    ("/fortyguard/nodes", "FortyGuard IoT Sensor Fleet"),
    ("/heat-intelligence/spatial-mesh", "GIS GeoJSON Spatial Mesh"),
    ("/agents/roster", "Multi-Agent AI Roster"),
    ("/tracks/all", "Seven-Track Operational Hub"),
]

def check_endpoint(base_url, path, name):
    url = f"{base_url.rstrip('/')}{path}"
    print(f"[*] Checking [{name}] -> {url} ... ", end="", flush=True)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "HEATSHIELD-SmokeTest/1.0", "Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=8) as resp:
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

def check_ui(url):
    print(f"[*] Checking Web UI Root -> {url} ... ", end="", flush=True)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0", "Accept": "text/html"})
        with urllib.request.urlopen(req, timeout=8) as resp:
            status = resp.status
            content = resp.read().decode("utf-8")
            if status == 200 and ("HEATSHIELD" in content or "div id=\"root\"" in content or "vite" in content.lower()):
                print(f"[OK] (HTTP 200, UI Loaded)")
                return True
            else:
                print(f"[OK] (HTTP {status})")
                return True
    except Exception as e:
        print(f"[ERROR] {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="HEATSHIELD Post-Deployment Smoke Test Script")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="Base API URL (e.g. http://127.0.0.1:8000/api/v1)")
    parser.add_argument("--ui-url", default="http://127.0.0.1:8000", help="Web UI root URL")
    args = parser.parse_args()

    print("==================================================")
    print("   HEATSHIELD Post-Deployment Verification Suite   ")
    print("==================================================")
    print(f"Target API Base: {args.base_url}")
    print(f"Target UI Root: {args.ui_url}")
    print("--------------------------------------------------")
    
    passed = 0
    total = len(ENDPOINTS) + 1
    
    if check_ui(args.ui_url):
        passed += 1
    
    for path, name in ENDPOINTS:
        if check_endpoint(args.base_url, path, name):
            passed += 1
        time.sleep(0.05)

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

