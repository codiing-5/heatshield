from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent
from app.schemas.agents import AgentStepTrace, AgentExecutionResult


class VulnerablePopulationAdvisorAgent(BaseAgent):
    """
    Vulnerable Population Advisor Agent.
    Correlates thermal risk with demographic density and dispatches shelter routing notices.
    """

    def __init__(self):
        super().__init__(
            agent_id="vulnerable",
            name="Vulnerable Population Advisor",
            role="Demographic Risk Analyst & Emergency Cooling Dispatcher",
            description="Correlates microclimate thermal risk polygons with vulnerable demographic census data (elderly, outdoor workforce, unhoused) to direct targeted relief.",
            tools=["query_demographic_vulnerability", "dispatch_shelter_routing_alert", "enforce_labor_rest_mandate"],
        )

    async def execute(self, context: Dict[str, Any]) -> AgentExecutionResult:
        zone_name = context.get("zone_name", "Sector 7 - Downtown Core")
        steps: List[AgentStepTrace] = []

        # Step 1: Query demographic exposure
        step1_tool = await self.call_tool("query_demographic_vulnerability", {"zone_name": zone_name})
        demo = step1_tool.output
        steps.append(
            AgentStepTrace(
                step_number=1,
                thought=f"Evaluating vulnerable population density within 1km radius of {zone_name}.",
                action="call_tool(query_demographic_vulnerability)",
                tool_call=step1_tool,
                observation=f"Identified {demo['outdoor_workers']} outdoor laborers, {demo['elderly_count']} senior residents, and {demo['unhoused_count']} unhoused individuals.",
            )
        )

        # Step 2: Dispatch Cooling Shelter & Hydration Notices
        step2_tool = await self.call_tool("dispatch_shelter_routing_alert", {"zone_name": zone_name, "priority": "HIGH"})
        shelter_res = step2_tool.output
        steps.append(
            AgentStepTrace(
                step_number=2,
                thought="Triggering automated SMS alerts and routing instructions to air-conditioned municipal cooling centers.",
                action="call_tool(dispatch_shelter_routing_alert)",
                tool_call=step2_tool,
                observation=f"Allocated cooling shelters ({', '.join(shelter_res['cooling_shelters_allocated'])}) and queued {shelter_res['sms_notifications_queued']} priority alerts.",
            )
        )

        # Step 3: Enforce labor rest mandate
        step3_tool = await self.call_tool("enforce_labor_rest_mandate", {"zone_name": zone_name, "work_rest_ratio": "15 min Work / 45 min Rest"})
        steps.append(
            AgentStepTrace(
                step_number=3,
                thought="Deploying OSHA/ISO 7243 compliance mandate to 18 active commercial construction checkpoints.",
                action="call_tool(enforce_labor_rest_mandate)",
                tool_call=step3_tool,
                observation="Mandatory work-rest rotation active with shaded hydration verification.",
            )
        )

        primary_action = (
            f"Dispatched automated cooling shelter routing for {demo['elderly_count']} seniors & {demo['outdoor_workers']} laborers in {zone_name}. "
            f"Enforced 15/45 work-rest safety mandate."
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
                "outdoor_workers": demo["outdoor_workers"],
                "elderly_count": demo["elderly_count"],
                "shelters_allocated": shelter_res["cooling_shelters_allocated"],
            },
        )
