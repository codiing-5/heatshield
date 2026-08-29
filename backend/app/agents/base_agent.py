from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from app.schemas.agents import AgentStepTrace, AgentToolCall, AgentExecutionResult
from app.agents.tools import agent_tools


class BaseAgent:
    """
    Base Agent Abstraction for Autonomous Heat Intelligence Agents.
    Supports:
      - Step-by-step thought-action-observation reasoning loops.
      - Registered tool invocation with execution timing.
      - Structured execution result reporting with evidence logs.
    """

    def __init__(self, agent_id: str, name: str, role: str, description: str, tools: List[str]):
        self.agent_id = agent_id
        self.name = name
        self.role = role
        self.description = description
        self.tools = tools
        self.memory: List[Dict[str, Any]] = []

    async def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> AgentToolCall:
        if tool_name not in self.tools:
            raise PermissionError(f"Agent '{self.name}' is not authorized to call tool '{tool_name}'")
        
        tool_output = await agent_tools.execute_tool(tool_name, arguments)
        return AgentToolCall(
            tool_name=tool_name,
            arguments=arguments,
            output=tool_output["result"],
            execution_time_ms=tool_output["duration_ms"],
        )

    async def execute(self, context: Dict[str, Any]) -> AgentExecutionResult:
        """To be overridden by specialized agent implementations."""
        raise NotImplementedError
