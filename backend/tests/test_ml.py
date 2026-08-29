import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.ml_engine import ml_engine
from app.schemas.ml import ForecastRequest, MitigationSimulationRequest


def test_ml_forecast_engine():
    req = ForecastRequest(
        zone_name="Sector 7 - Downtown Core",
        current_ambient_c=38.6,
        current_surface_c=48.2,
        current_humidity_pct=60.0,
        horizons_hours=[1, 3, 6, 12, 24],
    )
    res = ml_engine.generate_microclimate_forecast(req)
    assert res.zone_name == "Sector 7 - Downtown Core"
    assert len(res.forecast_points) == 5
    first_pt = res.forecast_points[0]
    assert first_pt.predicted_surface_c > 25.0
    assert first_pt.confidence_lower_c < first_pt.predicted_ambient_c < first_pt.confidence_upper_c


def test_ml_mitigation_simulation():
    req = MitigationSimulationRequest(
        baseline_surface_c=50.0,
        baseline_ambient_c=40.0,
        cool_roof_albedo_delta=0.4,
        canopy_coverage_delta_pct=30.0,
        misting_arrays_active_pct=50.0,
        traffic_reduction_pct=25.0,
    )
    res = ml_engine.simulate_mitigation(req)
    assert res.surface_temp_reduction_c > 3.0
    assert res.ambient_temp_reduction_c > 2.0
    assert res.wbgt_reduction_c > 1.0
    assert res.post_intervention_surface_c < req.baseline_surface_c
    assert res.post_intervention_wbgt_c < 35.0
    assert res.heat_stroke_risk_mitigation_pct > 20.0


@pytest.mark.asyncio
async def test_forecast_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "zone_name": "Sector 7 - Industrial District",
            "current_ambient_c": 39.5,
            "current_surface_c": 51.0,
            "current_humidity_pct": 55.0,
            "horizons_hours": [1, 2, 4, 8],
        }
        response = await client.post("/api/v1/ml/forecast", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["model_name"] == "FortyGuard-NeuralMicroclimate-v2"
        assert len(data["forecast_points"]) == 4
        assert "predicted_wbgt_c" in data["forecast_points"][0]


@pytest.mark.asyncio
async def test_anomalies_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/ml/anomalies?zone_name=Sector+7")
        assert response.status_code == 200
        data = response.json()
        assert data["total_anomalies_detected"] > 0
        assert data["heatwave_escalation_probability_pct"] > 50.0
        assert len(data["anomalies"]) > 0


@pytest.mark.asyncio
async def test_simulate_mitigation_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "baseline_surface_c": 48.0,
            "baseline_ambient_c": 38.0,
            "cool_roof_albedo_delta": 0.35,
            "canopy_coverage_delta_pct": 20.0,
            "misting_arrays_active_pct": 40.0,
            "traffic_reduction_pct": 15.0,
        }
        response = await client.post("/api/v1/ml/simulate-mitigation", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["surface_temp_reduction_c"] > 0
        assert data["wbgt_reduction_c"] > 0
        assert "primary_recommendation" in data
