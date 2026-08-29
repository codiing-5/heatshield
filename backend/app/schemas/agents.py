from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field


class AgentToolCall(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    output: Dict[str, Any]
    execution_time_ms: float
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AgentStepTrace(BaseModel):
    step_number: int
    thought: str
    action: Optional[str] = None
    tool_call: Optional[AgentToolCall] = None
    observation: str


class AgentExecutionResult(BaseModel):
    agent_id: str
    agent_name: str
    agent_role: str
    status: Literal["COMPLETED", "ALERT", "EXECUTING", "FAILED"]
    primary_action: str
    target_zone: str
    reasoning_steps: List[AgentStepTrace]
    evidence_data: Dict[str, Any]
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class OrchestrationResponse(BaseModel):
    orchestration_id: str
    status: Literal["SUCCESS", "PARTIAL", "FAILED"]
    active_threat_level: Literal["LOW", "MODERATE", "HIGH", "EXTREME", "CRITICAL"]
    primary_synthesized_strategy: str
    dispatched_actions_count: int
    agent_results: List[AgentExecutionResult]
    orchestrated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "model", "system"]
    text: str


class AgentChatRequest(BaseModel):
    user_message: str = Field(..., description="User question or operational command")
    history: Optional[List[ChatMessage]] = Field(default=[], description="Full conversation history for multi-turn chat")
    target_agent: Optional[str] = Field("orchestrator", description="Target agent id or orchestrator")
    active_zone: Optional[str] = Field("Sector 7 - Downtown Core", description="Context zone")
    model_name: Optional[str] = Field("gemini-1.5-flash", description="Underlying AI model")
    temperature: Optional[float] = Field(0.75, description="Sampling temperature")


class AgentChatResponse(BaseModel):
    agent_id: str
    agent_name: str
    reply_message: str
    recommended_tools: List[str]
    evidence_snippet: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AgentRosterItem(BaseModel):
    id: str
    name: str
    role: str
    status: Literal["ACTIVE", "MONITORING", "IDLE", "STANDBY"]
    color: str
    description: str
    tools: List[str]
