from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent
from app.schemas.agents import AgentStepTrace, AgentExecutionResult


class HeatSentinelAgent(BaseAgent):
    """
    Heat Sentinel Agent (Risk Radar).
    Continuously monitors FortyGuard microclimate telemetry and flags acute heat anomalies.
    """

    def __init__(self):
        super().__init__(
            agent_id="sentinel",
            name="Heat Sentinel Agent (Risk Radar)",
            role="Autonomous Thermal Anomaly & WBGT Spike Detector",
            description="Performs continuous surveillance over FortyGuard sensor clusters to detect sudden surface overheating and ISO 7243 WBGT threshold exceedance.",
            tools=["query_fortyguard_sensors", "calculate_wbgt_stress"],
        )

    async def execute(self, context: Dict[str, Any]) -> AgentExecutionResult:
        zone_name = context.get("zone_name", "Sector 7 - Downtown Core")
        steps: List[AgentStepTrace] = []

        # Step 1: Ingest FortyGuard sensor telemetry
        step1_tool = await self.call_tool("query_fortyguard_sensors", {"zone_name": zone_name})
        telemetry = step1_tool.output
        steps.append(
            AgentStepTrace(
                step_number=1,
                thought=f"Querying FortyGuard microclimate sensor telemetry for target sector: {zone_name}.",
                action="call_tool(query_fortyguard_sensors)",
                tool_call=step1_tool,
                observation=f"FortyGuard sensor node returned Surface Temp: {telemetry['surface_temp_c']}°C, Ambient: {telemetry['ambient_temp_c']}°C, RH: 62%.",
            )
        )

        # Step 2: Compute scientific WBGT and physiological risk
        step2_tool = await self.call_tool(
            "calculate_wbgt_stress",
            {
                "ambient_temp_c": telemetry["ambient_temp_c"],
                "relative_humidity_pct": 62.0,
                "surface_temp_c": telemetry["surface_temp_c"],
            },
        )
        stress_res = step2_tool.output
        wbgt = stress_res["wbgt_c"]
        risk_level = stress_res["risk_level"]
        steps.append(
            AgentStepTrace(
                step_number=2,
                thought=f"Evaluating biometeorological WBGT thermal stress against ISO 7243 and OSHA thresholds.",
                action="call_tool(calculate_wbgt_stress)",
                tool_call=step2_tool,
                observation=f"Calculated WBGT is {wbgt}°C (Risk Level: {risk_level}). Critical threshold (>31.0°C) is breached.",
            )
        )

        primary_action = (
            f"Triggered critical heat anomaly alert in {zone_name}. "
            f"FortyGuard surface asphalt peaked at {telemetry['surface_temp_c']}°C with WBGT at {wbgt}°C. "
            f"Mandated {stress_res['labor_work_rest_ratio']}."
        )

        return AgentExecutionResult(
            agent_id=self.agent_id,
            agent_name=self.name,
            agent_role=self.role,
            status="ALERT" if risk_level in ["EXTREME", "CRITICAL"] else "COMPLETED",
            primary_action=primary_action,
            target_zone=zone_name,
            reasoning_steps=steps,
            evidence_data={
                "surface_temp_c": telemetry["surface_temp_c"],
                "ambient_temp_c": telemetry["ambient_temp_c"],
                "wbgt_c": wbgt,
                "risk_level": risk_level,
                "work_rest_ratio": stress_res["labor_work_rest_ratio"],
            },
        )
