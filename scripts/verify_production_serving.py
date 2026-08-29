import asyncio
import os
import glob
from httpx import AsyncClient, ASGITransport
import sys

# Ensure backend path is in sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
from app.main import app, FRONTEND_DIST

async def run_verification():
    print("=" * 60)
    print("  HEATSHIELD Production Static & SPA Serving Verification")
    print("=" * 60)
    print(f"[*] Resolved FRONTEND_DIST: {FRONTEND_DIST}")
    print(f"[*] FRONTEND_DIST exists: {os.path.exists(FRONTEND_DIST)}")
    index_file = os.path.join(FRONTEND_DIST, "index.html")
    print(f"[*] index.html exists: {os.path.exists(index_file)}")

    # Find an asset file for testing
    asset_files = glob.glob(os.path.join(FRONTEND_DIST, "assets", "*.*"))
    asset_name = os.path.basename(asset_files[0]) if asset_files else None
    print(f"[*] Test asset found: {asset_name}")
    print("-" * 60)

    all_passed = True
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Test 1: Browser GET /
        res = await client.get("/", headers={"Accept": "text/html,application/xhtml+xml"})
        if res.status_code == 200 and "<!doctype html>" in res.text.lower():
            print("[PASS] 1. Browser GET / -> 200 OK (Served index.html SPA)")
        else:
            print(f"[FAIL] 1. Browser GET / -> {res.status_code}")
            all_passed = False

        # Test 2: API Client GET /
        res = await client.get("/", headers={"Accept": "application/json"})
        if res.status_code == 200 and "HEATSHIELD" in res.text and "health" in res.text:
            print("[PASS] 2. API Client GET / -> 200 OK (Served API Health JSON)")
        else:
            print(f"[FAIL] 2. API Client GET / -> {res.status_code}")
            all_passed = False

        # Test 3: Static Asset Serving
        if asset_name:
            res = await client.get(f"/assets/{asset_name}")
            if res.status_code == 200:
                print(f"[PASS] 3. GET /assets/{asset_name} -> 200 OK (Static Asset Served)")
            else:
                print(f"[FAIL] 3. GET /assets/{asset_name} -> {res.status_code}")
                all_passed = False

        # Test 4: API Endpoint Protection
        res = await client.get("/api/v1/health")
        if res.status_code == 200 and res.json().get("status") == "healthy":
            print("[PASS] 4. GET /api/v1/health -> 200 OK (API router active)")
        else:
            print(f"[FAIL] 4. GET /api/v1/health -> {res.status_code}")
            all_passed = False

        # Test 5: SPA Client-side Route Fallback (/dashboard)
        res = await client.get("/dashboard", headers={"Accept": "text/html"})
        if res.status_code == 200 and "<!doctype html>" in res.text.lower():
            print("[PASS] 5. GET /dashboard -> 200 OK (SPA Fallback to index.html)")
        else:
            print(f"[FAIL] 5. GET /dashboard -> {res.status_code}")
            all_passed = False

        # Test 6: SPA Client-side Route Fallback (/map)
        res = await client.get("/map", headers={"Accept": "text/html"})
        if res.status_code == 200 and "<!doctype html>" in res.text.lower():
            print("[PASS] 6. GET /map -> 200 OK (SPA Fallback to index.html)")
        else:
            print(f"[FAIL] 6. GET /map -> {res.status_code}")
            all_passed = False

        # Test 7: SPA Client-side Route Fallback (/v2-chat)
        res = await client.get("/v2-chat", headers={"Accept": "text/html"})
        if res.status_code == 200 and "<!doctype html>" in res.text.lower():
            print("[PASS] 7. GET /v2-chat -> 200 OK (SPA Fallback to index.html)")
        else:
            print(f"[FAIL] 7. GET /v2-chat -> {res.status_code}")
            all_passed = False

        # Test 8: Non-existent API route does NOT return index.html (Protected from SPA)
        res = await client.get("/api/v1/unknown-endpoint")
        if res.status_code == 404 and "<!doctype html>" not in res.text.lower():
            print("[PASS] 8. GET /api/v1/unknown-endpoint -> 404 JSON (Protected from SPA fallback)")
        else:
            print(f"[FAIL] 8. GET /api/v1/unknown-endpoint -> Returned {res.status_code}")
            all_passed = False

    print("-" * 60)
    if all_passed:
        print("[SUCCESS] All 8 production static & SPA serving checks passed!")
    else:
        print("[ERROR] Some checks failed.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run_verification())
