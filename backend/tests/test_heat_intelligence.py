import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.thermal_indices import thermal_engine
from app.services.gis_engine import gis_engine


def test_stull_wet_bulb_formula():
    # Benchmark: 30°C at 50% RH yields ~21.7°C - 22.2°C
    tw = thermal_engine.calculate_wet_bulb_temp(30.0, 50.0)
    assert 21.0 <= tw <= 23.0

    # Benchmark: Extreme heat 40°C at 60% RH yields ~32.0°C - 33.5°C
    tw_extreme = thermal_engine.calculate_wet_bulb_temp(40.0, 60.0)
    assert 32.0 <= tw_extreme <= 34.5


def test_heat_index_formula():
    # Benchmark: 35°C (95°F) at 70% RH produces dangerous Heat Index > 48°C
    hi = thermal_engine.calculate_heat_index(35.0, 70.0)
    assert hi > 45.0


def test_idw_spatial_interpolation():
    # Interpolating directly at FG-772 coordinates should return node's exact or near values
    interpolated = gis_engine.calculate_idw(24.4539, 54.3773)
    assert "interpolated_ambient_c" in interpolated
    assert "interpolated_surface_c" in interpolated
    assert "interpolated_wbgt_c" in interpolated
    assert 35.0 <= interpolated["interpolated_ambient_c"] <= 45.0


@pytest.mark.asyncio
async def test_calculate_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "ambient_temp_c": 38.0,
            "relative_humidity_pct": 60.0,
            "surface_temp_c": 48.0,
            "wind_speed_ms": 1.5,
            "solar_radiation_wm2": 800.0,
        }
        response = await client.post("/api/v1/heat-intelligence/calculate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "wbgt_c" in data
        assert "utci_c" in data
        assert "heat_index_c" in data
        assert data["risk_level"] in ["HIGH", "EXTREME", "CRITICAL"]
        assert "labor_work_rest_ratio" in data
        assert data["recommended_hydration_l_hr"] >= 0.8


@pytest.mark.asyncio
async def test_spatial_mesh_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/heat-intelligence/spatial-mesh")
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "FeatureCollection"
        assert len(data["features"]) > 0
        first_feature = data["features"][0]
        assert first_feature["type"] == "Feature"
        assert first_feature["geometry"]["type"] == "Polygon"
        assert "properties" in first_feature
        assert "wbgt_c" in first_feature["properties"]
        assert "fill_color" in first_feature["properties"]


@pytest.mark.asyncio
async def test_risk_assessment_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/heat-intelligence/risk-assessment")
        assert response.status_code == 200
        data = response.json()
        assert data["total_zones_analyzed"] > 0
        assert "mean_wbgt_c" in data
        assert len(data["zones"]) == data["total_zones_analyzed"]


@pytest.mark.asyncio
async def test_interpolate_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/heat-intelligence/interpolate?lat=24.4539&lng=54.3773")
        assert response.status_code == 200
        data = response.json()
        assert "target_coordinates" in data
        assert "interpolated_ambient_c" in data
