import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.tracks_engine import tracks_engine
from app.schemas.tracks import TrackActionRequest


def test_tracks_engine_structure():
    res = tracks_engine.get_all_tracks()
    assert res.total_tracks == 7
    track_ids = [t.id for t in res.tracks]
    expected_ids = ["urban", "health", "emergency", "grid", "labor", "transit", "policy"]
    for eid in expected_ids:
        assert eid in track_ids


def test_tracks_engine_action_dispatch():
    req = TrackActionRequest(
        action_name="Mandatory 15-Min Work/Rest Cycles",
        zone_name="Sector 7 - Industrial District",
    )
    res = tracks_engine.dispatch_action("labor", req)
    assert res.status == "DISPATCHED"
    assert res.track_id == "labor"
    assert "100%" in res.estimated_impact


@pytest.mark.asyncio
async def test_get_all_tracks_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/tracks/all")
        assert response.status_code == 200
        data = response.json()
        assert data["total_tracks"] == 7
        assert len(data["tracks"]) == 7


@pytest.mark.asyncio
async def test_get_single_track_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/tracks/labor")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "labor"
        assert data["status"] == "CRITICAL"
        assert len(data["active_protocols"]) > 0


@pytest.mark.asyncio
async def test_dispatch_track_action_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "action_name": "High-Albedo Surface Mapping",
            "zone_name": "Sector 7 - Downtown Core",
        }
        response = await client.post("/api/v1/tracks/urban/action", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "DISPATCHED"
        assert data["track_id"] == "urban"
        assert "estimated_impact" in data
