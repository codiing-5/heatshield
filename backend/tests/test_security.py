import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_security_headers():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/health")
        assert response.status_code == 200
        assert response.headers.get("X-Content-Type-Options") == "nosniff"
        assert response.headers.get("X-Frame-Options") == "DENY"
        assert response.headers.get("Strict-Transport-Security") is not None
        assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"


@pytest.mark.asyncio
async def test_input_boundary_validation_extreme_temperature():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Temperature 120°C exceeds realistic maximum of 70°C -> Should return 422 Unprocessable Entity
        payload = {
            "ambient_temp_c": 120.0,
            "relative_humidity_pct": 50.0,
        }
        response = await client.post("/api/v1/heat-intelligence/calculate", json=payload)
        assert response.status_code == 422


@pytest.mark.asyncio
async def test_input_boundary_validation_negative_humidity():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Negative humidity is physically invalid -> Should return 422
        payload = {
            "ambient_temp_c": 35.0,
            "relative_humidity_pct": -15.0,
        }
        response = await client.post("/api/v1/heat-intelligence/calculate", json=payload)
        assert response.status_code == 422


@pytest.mark.asyncio
async def test_input_boundary_validation_invalid_coordinate():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Latitude 145.0 is invalid (must be between -90 and 90) -> Should return 422
        response = await client.get("/api/v1/heat-intelligence/interpolate?lat=145.0&lng=54.0")
        assert response.status_code == 422


@pytest.mark.asyncio
async def test_error_handling_nonexistent_track():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/tracks/unknown_track_id")
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
