import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.fortyguard_client import fortyguard_client


@pytest.mark.asyncio
async def test_fortyguard_status_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/fortyguard/status")
        assert response.status_code == 200
        data = response.json()
        assert data["provider"] == "FortyGuard Temperature API"
        assert data["role"] == "Primary Hackathon Data Source"
        assert data["stream_mode"] in ["LIVE", "SANDBOX"]


@pytest.mark.asyncio
async def test_fortyguard_telemetry_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/fortyguard/telemetry")
        assert response.status_code == 200
        data = response.json()
        assert "ambient_temp_c" in data
        assert "surface_temp_c" in data
        assert "wet_bulb_temp_c" in data
        assert "provenance" in data
        assert data["provenance"]["provider"] == "FortyGuard"
        assert data["surface_temp_c"] > data["ambient_temp_c"]  # Asphalt hotter than air in UHI


@pytest.mark.asyncio
async def test_fortyguard_nodes_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/fortyguard/nodes")
        assert response.status_code == 200
        data = response.json()
        assert data["total_nodes"] > 0
        assert len(data["nodes"]) == data["total_nodes"]
        first_node = data["nodes"][0]
        assert "node_id" in first_node
        assert "coordinates" in first_node
        assert len(first_node["coordinates"]) == 2


@pytest.mark.asyncio
async def test_fortyguard_uhi_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/fortyguard/uhi")
        assert response.status_code == 200
        data = response.json()
        assert data["uhi_delta_c"] > 0
        assert "nocturnal_retention_pct" in data


@pytest.mark.asyncio
async def test_fortyguard_diurnal_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/fortyguard/diurnal")
        assert response.status_code == 200
        data = response.json()
        assert len(data["points"]) > 0
        assert data["peak_surface_temp_c"] > 45.0


@pytest.mark.asyncio
async def test_fortyguard_cache_layer():
    # Calling telemetry twice should hit cache
    res1 = await fortyguard_client.get_telemetry_summary()
    res2 = await fortyguard_client.get_telemetry_summary()
    assert res2.provenance.cached is True
