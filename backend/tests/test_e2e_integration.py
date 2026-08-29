import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_full_platform_e2e_pipeline():
    """
    End-to-End Integration Test Pipeline:
    1. Verify Platform Health & FortyGuard Status
    2. Ingest FortyGuard Telemetry & Sensor Nodes
    3. Calculate Thermal Indices & Generate GeoJSON Spatial Mesh
    4. Generate ML Multi-Horizon Forecast & Simulate Mitigation
    5. Execute Autonomous Multi-Agent Orchestration Cycle & Conversational Chat
    6. Verify Seven-Track Hub & Dispatch Tactical Intervention Protocol
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Phase 1: Health & Primary Data Source
        health_res = await client.get("/api/v1/health")
        assert health_res.status_code == 200
        health_data = health_res.json()
        assert health_data["status"] == "healthy"
        assert health_data["primary_data_source"] == "FortyGuard Temperature API"

        fg_status_res = await client.get("/api/v1/fortyguard/status")
        assert fg_status_res.status_code == 200
        fg_status = fg_status_res.json()
        assert fg_status["provider"] == "FortyGuard Temperature API"

        # Phase 2: FortyGuard Telemetry Ingestion
        telemetry_res = await client.get("/api/v1/fortyguard/telemetry")
        assert telemetry_res.status_code == 200
        telemetry = telemetry_res.json()
        assert telemetry["ambient_temp_c"] > 25.0
        assert telemetry["surface_temp_c"] > telemetry["ambient_temp_c"]
        assert telemetry["provenance"]["provider"] == "FortyGuard"

        nodes_res = await client.get("/api/v1/fortyguard/nodes")
        assert nodes_res.status_code == 200
        nodes_data = nodes_res.json()
        assert nodes_data["total_nodes"] >= 6

        # Phase 3: Heat Intelligence & GIS Spatial Mesh
        calc_payload = {
            "ambient_temp_c": telemetry["ambient_temp_c"],
            "relative_humidity_pct": telemetry["relative_humidity_pct"],
            "surface_temp_c": telemetry["surface_temp_c"],
            "wind_speed_ms": 1.8,
            "solar_radiation_wm2": 850.0,
        }
        calc_res = await client.post("/api/v1/heat-intelligence/calculate", json=calc_payload)
        assert calc_res.status_code == 200
        calc_data = calc_res.json()
        assert "wbgt_c" in calc_data
        assert "utci_c" in calc_data
        assert calc_data["risk_level"] in ["HIGH", "EXTREME", "CRITICAL"]

        mesh_res = await client.get("/api/v1/heat-intelligence/spatial-mesh")
        assert mesh_res.status_code == 200
        mesh = mesh_res.json()
        assert mesh["type"] == "FeatureCollection"
        assert len(mesh["features"]) >= 6

        # Phase 4: Machine Learning Forecasting & Mitigation
        forecast_payload = {
            "zone_name": telemetry["active_zone"],
            "current_ambient_c": telemetry["ambient_temp_c"],
            "current_surface_c": telemetry["surface_temp_c"],
            "current_humidity_pct": telemetry["relative_humidity_pct"],
            "horizons_hours": [1, 3, 6, 12, 24],
        }
        forecast_res = await client.post("/api/v1/ml/forecast", json=forecast_payload)
        assert forecast_res.status_code == 200
        forecast_data = forecast_res.json()
        assert len(forecast_data["forecast_points"]) == 5

        sim_payload = {
            "baseline_surface_c": telemetry["surface_temp_c"],
            "baseline_ambient_c": telemetry["ambient_temp_c"],
            "cool_roof_albedo_delta": 0.40,
            "canopy_coverage_delta_pct": 30.0,
            "misting_arrays_active_pct": 50.0,
            "traffic_reduction_pct": 20.0,
        }
        sim_res = await client.post("/api/v1/ml/simulate-mitigation", json=sim_payload)
        assert sim_res.status_code == 200
        sim_data = sim_res.json()
        assert sim_data["surface_temp_reduction_c"] > 3.0
        assert sim_data["wbgt_reduction_c"] > 1.5

        # Phase 5: Autonomous Multi-Agent Orchestration & Chat
        orch_res = await client.post(f"/api/v1/agents/orchestrate?zone_name={telemetry['active_zone']}")
        assert orch_res.status_code == 200
        orch_data = orch_res.json()
        assert orch_data["status"] == "SUCCESS"
        assert len(orch_data["agent_results"]) == 4
        assert orch_data["dispatched_actions_count"] > 0

        chat_payload = {
            "user_message": "What is the recommended work rest rotation and cooling plan?",
            "active_zone": telemetry["active_zone"],
        }
        chat_res = await client.post("/api/v1/agents/chat", json=chat_payload)
        assert chat_res.status_code == 200
        chat_data = chat_res.json()
        assert len(chat_data["reply_message"]) > 0
        assert "evidence_snippet" in chat_data

        # Phase 6: Seven Domain Tracks & Action Dispatch
        tracks_res = await client.get("/api/v1/tracks/all")
        assert tracks_res.status_code == 200
        tracks_data = tracks_res.json()
        assert tracks_data["total_tracks"] == 7

        action_payload = {
            "action_name": "Mandatory 15-Min Work/Rest Cycles",
            "zone_name": telemetry["active_zone"],
        }
        action_res = await client.post("/api/v1/tracks/labor/action", json=action_payload)
        assert action_res.status_code == 200
        action_data = action_res.json()
        assert action_data["status"] == "DISPATCHED"
        assert action_data["track_id"] == "labor"
