import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.agents.orchestrator import orchestrator
from app.agents.tools import agent_tools


@pytest.mark.asyncio
async def test_tool_registry():
    tools = agent_tools.get_registered_tools()
    assert len(tools) >= 5
    tool_names = [t["name"] for t in tools]
    assert "query_fortyguard_sensors" in tool_names
    assert "calculate_wbgt_stress" in tool_names
    assert "simulate_cooling_intervention" in tool_names

    # Test executing tool
    exec_res = await agent_tools.execute_tool("query_fortyguard_sensors", {"zone_name": "Sector 7 - Downtown Core"})
    assert "result" in exec_res
    assert "duration_ms" in exec_res
    assert exec_res["result"]["surface_temp_c"] > 40.0


@pytest.mark.asyncio
async def test_orchestrator_cycle():
    res = await orchestrator.orchestrate_cycle("Sector 7 - Downtown Core")
    assert res.status == "SUCCESS"
    assert len(res.agent_results) == 4
    assert res.active_threat_level in ["EXTREME", "CRITICAL", "HIGH"]
    assert res.dispatched_actions_count > 0


@pytest.mark.asyncio
async def test_agent_roster_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/agents/roster")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 4
        agent_ids = [a["id"] for a in data]
        assert "sentinel" in agent_ids
        assert "vulnerable" in agent_ids
        assert "mitigation" in agent_ids
        assert "grid" in agent_ids


@pytest.mark.asyncio
async def test_agent_orchestrate_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/agents/orchestrate?zone_name=Sector+7")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "SUCCESS"
        assert len(data["agent_results"]) == 4


@pytest.mark.asyncio
async def test_agent_chat_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "user_message": "What is the current WBGT stress and labor risk in Sector 7?",
            "active_zone": "Sector 7 - Downtown Core",
        }
        response = await client.post("/api/v1/agents/chat", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "reply_message" in data
        assert len(data["recommended_tools"]) > 0
        assert "evidence_snippet" in data
