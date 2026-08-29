from typing import List
from fastapi import APIRouter, Query
from app.agents.orchestrator import orchestrator
from app.agents.tools import agent_tools
from app.schemas.agents import (
    AgentRosterItem,
    OrchestrationResponse,
    AgentChatRequest,
    AgentChatResponse,
)

router = APIRouter()


@router.get("/roster", response_model=List[AgentRosterItem])
def get_agent_roster() -> List[AgentRosterItem]:
    """Retrieve list of active specialized heat intelligence agents."""
    return orchestrator.get_roster()


@router.post("/orchestrate", response_model=OrchestrationResponse)
async def run_orchestration_cycle(
    zone_name: str = Query("Sector 7 - Downtown Core", description="Target municipal sector")
) -> OrchestrationResponse:
    """Execute full autonomous multi-agent evaluation and action dispatch cycle."""
    return await orchestrator.orchestrate_cycle(target_zone=zone_name)


@router.post("/chat", response_model=AgentChatResponse)
async def chat_with_agent(request: AgentChatRequest) -> AgentChatResponse:
    """Query autonomous agent with natural language commands grounded in FortyGuard telemetry."""
    return await orchestrator.chat_with_agent(request)


@router.get("/tools")
def get_registered_tools():
    """Retrieve list of all tools registered in the agent execution framework."""
    return agent_tools.get_registered_tools()
