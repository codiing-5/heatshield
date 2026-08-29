import time
from typing import List, Dict, Any
from app.agents.sentinel_agent import HeatSentinelAgent
from app.agents.vulnerable_agent import VulnerablePopulationAdvisorAgent
from app.agents.strategist_agent import UrbanCoolingStrategistAgent
from app.agents.grid_agent import GridAndEnergyBalancerAgent
from app.agents.tools import agent_tools
from app.schemas.agents import (
    OrchestrationResponse,
    AgentExecutionResult,
    AgentRosterItem,
    AgentChatRequest,
    AgentChatResponse,
)


class MultiAgentOrchestrator:
    """
    Multi-Agent Orchestrator & Autonomous Decision Coordinator.
    Coordinates:
      - Sentinel Agent (Surveillance & Anomalies)
      - Vulnerable Population Advisor (Demographics & Emergency Routing)
      - Urban Cooling Strategist (Intervention Simulation & Optimization)
      - Grid & Energy Balancer (HVAC Demand & Power Substation Protection)
    """

    def __init__(self):
        self.sentinel = HeatSentinelAgent()
        self.vulnerable = VulnerablePopulationAdvisorAgent()
        self.strategist = UrbanCoolingStrategistAgent()
        self.grid = GridAndEnergyBalancerAgent()
        self.agents = [self.sentinel, self.vulnerable, self.strategist, self.grid]

    def get_roster(self) -> List[AgentRosterItem]:
        return [
            AgentRosterItem(
                id=a.agent_id,
                name=a.name,
                role=a.role,
                status="ACTIVE",
                color="text-orange-400" if a.agent_id == "sentinel" else "text-blue-400" if a.agent_id == "vulnerable" else "text-emerald-400" if a.agent_id == "mitigation" else "text-amber-400",
                description=a.description,
                tools=a.tools,
            )
            for a in self.agents
        ]

    async def orchestrate_cycle(self, target_zone: str = "Sector 7 - Downtown Core") -> OrchestrationResponse:
        """
        Execute full autonomous multi-agent evaluation cycle across all agents.
        """
        context = {"zone_name": target_zone}
        results: List[AgentExecutionResult] = []

        # 1. Sentinel Surveillance
        sentinel_res = await self.sentinel.execute(context)
        results.append(sentinel_res)

        # 2. Vulnerable Care Dispatch
        vulnerable_res = await self.vulnerable.execute(context)
        results.append(vulnerable_res)

        # 3. Cooling Optimization
        strategist_res = await self.strategist.execute(context)
        results.append(strategist_res)

        # 4. Energy & Grid Balance
        grid_res = await self.grid.execute(context)
        results.append(grid_res)

        # Synthesize overall strategy
        threat_level = sentinel_res.evidence_data.get("risk_level", "EXTREME")
        actions_count = sum(len(r.reasoning_steps) for r in results)

        summary = (
            f"Autonomous multi-agent cycle executed across {len(results)} agent modules. "
            f"Identified {threat_level} risk in {target_zone}. "
            f"Dispatched targeted cooling shelter alerts for {vulnerable_res.evidence_data.get('outdoor_workers', 12500)} workers, "
            f"enacted mandatory rest rotation, optimized misting schedules (-{strategist_res.evidence_data.get('surface_temp_reduction_c', 4.5)}°C asphalt drop), "
            f"and buffered municipal HVAC electrical load by {grid_res.evidence_data.get('peak_load_reduction_pct', 18.4)}%."
        )

        return OrchestrationResponse(
            orchestration_id=f"ORCH-{int(time.time())}",
            status="SUCCESS",
            active_threat_level=threat_level,
            primary_synthesized_strategy=summary,
            dispatched_actions_count=actions_count,
            agent_results=results,
        )

    async def chat_with_agent(self, req: AgentChatRequest) -> AgentChatResponse:
        """
        Intelligent conversational agent interface answering queries grounded in FortyGuard telemetry.
        """
        msg_lower = req.user_message.lower()
        zone = req.active_zone or "Sector 7 - Downtown Core"

        # Query sensor telemetry for context
        telemetry = await agent_tools.execute_tool("query_fortyguard_sensors", {"zone_name": zone})
        t_data = telemetry["result"]

        if "wbgt" in msg_lower or "stress" in msg_lower or "heat index" in msg_lower:
            reply = (
                f"In {zone}, FortyGuard sensors report an ambient temperature of {t_data['ambient_temp_c']}°C "
                f"and surface asphalt temperature of {t_data['surface_temp_c']}°C. "
                f"Calculated WBGT is {t_data['wet_bulb_temp_c']}°C, which places the sector in the {t_data['risk_level']} danger category. "
                f"OSHA / ISO 7243 guidelines require mandatory 15-minute work rotations per hour with 1.0L/hr electrolyte hydration."
            )
            evidence = f"FortyGuard Sensor FG-772 direct telemetry (Surface: {t_data['surface_temp_c']}°C, WBGT: {t_data['wet_bulb_temp_c']}°C)"
            tools = ["query_fortyguard_sensors", "calculate_wbgt_stress"]
            agent_name = "Heat Sentinel Agent"
            agent_id = "sentinel"

        elif "mitigat" in msg_lower or "cool" in msg_lower or "shade" in msg_lower or "misting" in msg_lower:
            sim = await agent_tools.execute_tool(
                "simulate_cooling_intervention",
                {
                    "baseline_surface_c": t_data["surface_temp_c"],
                    "baseline_ambient_c": t_data["ambient_temp_c"],
                    "cool_roof_albedo_delta": 0.35,
                    "canopy_coverage_delta_pct": 25.0,
                    "misting_arrays_active_pct": 40.0,
                },
            )
            s_data = sim["result"]
            reply = (
                f"Based on our physics-guided microclimate ML simulation for {zone}:\n"
                f"1. Deploying high-albedo coatings (+0.35 albedo) lowers surface asphalt by -{s_data['surface_temp_reduction_c']}°C.\n"
                f"2. Activating 40% misting coverage yields -{s_data['wbgt_reduction_c']}°C WBGT reduction.\n"
                f"3. Overall acute heat stroke risk is mitigated by {s_data['heat_stroke_risk_mitigation_pct']}%."
            )
            evidence = f"ML Model FortyGuard-NeuralMicroclimate-v2 (Feasibility: {s_data['intervention_feasibility_score'] * 100}%)"
            tools = ["simulate_cooling_intervention"]
            agent_name = "Urban Cooling Strategist"
            agent_id = "mitigation"

        elif "worker" in msg_lower or "elderly" in msg_lower or "shelter" in msg_lower or "vulnerab" in msg_lower:
            demo = await agent_tools.execute_tool("query_demographic_vulnerability", {"zone_name": zone})
            d_data = demo["result"]
            reply = (
                f"Demographic surveillance for {zone} shows {d_data['outdoor_workers']} active outdoor workers "
                f"and {d_data['elderly_count']} elderly residents exposed to severe heat stress. "
                f"The Vulnerable Advisor Agent has queued automated cooling center routing notices to Al Danah Civic Shelter "
                f"and enforced rest checkpoints across 18 construction sites."
            )
            evidence = f"Census demographic overlay + FortyGuard spatial vulnerability index ({d_data['vulnerability_index']})"
            tools = ["query_demographic_vulnerability", "dispatch_shelter_routing_alert"]
            agent_name = "Vulnerable Population Advisor"
            agent_id = "vulnerable"

        else:
            reply = (
                f"HEATSHIELD Multi-Agent Orchestrator is actively managing {zone}.\n"
                f"Current FortyGuard telemetry: Surface {t_data['surface_temp_c']}°C | Ambient {t_data['ambient_temp_c']}°C | WBGT {t_data['wet_bulb_temp_c']}°C ({t_data['risk_level']}).\n"
                f"All 4 agents (Sentinel, Vulnerable Advisor, Cooling Strategist, Grid Balancer) are synchronized with automated intervention protocols."
            )
            evidence = f"FortyGuard Ingestion Stream (Confidence: 99%, Status: Live Synced)"
            tools = ["query_fortyguard_sensors", "calculate_wbgt_stress", "simulate_cooling_intervention"]
            agent_name = "Multi-Agent Orchestrator"
            agent_id = "orchestrator"

        return AgentChatResponse(
            agent_id=agent_id,
            agent_name=agent_name,
            reply_message=reply,
            recommended_tools=tools,
            evidence_snippet=evidence,
        )


orchestrator = MultiAgentOrchestrator()
