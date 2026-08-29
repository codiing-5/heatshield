from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent
from app.schemas.agents import AgentStepTrace, AgentExecutionResult


class UrbanCoolingStrategistAgent(BaseAgent):
    """
    Urban Cooling Strategist Agent.
    Runs ML simulations to optimize dynamic intervention assets (misting arrays, high-albedo coatings, shade).
    """

    def __init__(self):
        super().__init__(
            agent_id="mitigation",
            name="Urban Cooling Strategist",
            role="Microclimate Intervention Optimizer",
            description="Utilizes physics-guided ML models to compute optimal deployment schedules for aerosol misting cannons, cool reflective coatings, and mobile shade assets.",
            tools=["simulate_cooling_intervention", "query_fortyguard_sensors"],
        )

    async def execute(self, context: Dict[str, Any]) -> AgentExecutionResult:
        zone_name = context.get("zone_name", "Sector 7 - Downtown Core")
        steps: List[AgentStepTrace] = []

        # Step 1: Read current baseline thermal metrics
        step1_tool = await self.call_tool("query_fortyguard_sensors", {"zone_name": zone_name})
        telemetry = step1_tool.output
        steps.append(
            AgentStepTrace(
                step_number=1,
                thought=f"Analyzing FortyGuard baseline thermal profile for intervention sizing in {zone_name}.",
                action="call_tool(query_fortyguard_sensors)",
                tool_call=step1_tool,
                observation=f"Baseline Asphalt Temp: {telemetry['surface_temp_c']}°C, Ambient: {telemetry['ambient_temp_c']}°C.",
            )
        )

        # Step 2: Simulate physical cooling intervention package
        step2_tool = await self.call_tool(
            "simulate_cooling_intervention",
            {
                "baseline_surface_c": telemetry["surface_temp_c"],
                "baseline_ambient_c": telemetry["ambient_temp_c"],
                "cool_roof_albedo_delta": 0.35,
                "canopy_coverage_delta_pct": 25.0,
                "misting_arrays_active_pct": 40.0,
                "traffic_reduction_pct": 20.0,
            },
        )
        sim = step2_tool.output
        steps.append(
            AgentStepTrace(
                step_number=2,
                thought="Running multi-variable ML cooling simulation for high-albedo coatings (+0.35 albedo) and atomized misting.",
                action="call_tool(simulate_cooling_intervention)",
                tool_call=step2_tool,
                observation=f"Simulated Surface Temp Drop: -{sim['surface_temp_reduction_c']}°C, Ambient: -{sim['ambient_temp_reduction_c']}°C, WBGT Relief: -{sim['wbgt_reduction_c']}°C.",
            )
        )

        primary_action = (
            f"Generated optimized cooling intervention plan for {zone_name}. "
            f"Achieved estimated -{sim['surface_temp_reduction_c']}°C asphalt surface cooling and -{sim['wbgt_reduction_c']}°C WBGT reduction, "
            f"mitigating acute heat-stroke risk by {sim['heat_stroke_risk_mitigation_pct']}%."
        )

        return AgentExecutionResult(
            agent_id=self.agent_id,
            agent_name=self.name,
            agent_role=self.role,
            status="COMPLETED",
            primary_action=primary_action,
            target_zone=zone_name,
            reasoning_steps=steps,
            evidence_data={
                "surface_temp_reduction_c": sim["surface_temp_reduction_c"],
                "wbgt_reduction_c": sim["wbgt_reduction_c"],
                "post_intervention_wbgt_c": sim["post_intervention_wbgt_c"],
                "risk_mitigation_pct": sim["heat_stroke_risk_mitigation_pct"],
            },
        )
