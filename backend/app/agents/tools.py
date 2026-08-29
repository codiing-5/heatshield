import time
from typing import Dict, Any, List, Callable
from app.services.fortyguard_client import fortyguard_client
from app.services.thermal_indices import thermal_engine
from app.services.ml_engine import ml_engine
from app.schemas.heat_intelligence import ThermalCalculationRequest
from app.schemas.ml import MitigationSimulationRequest


class ToolRegistry:
    """
    Central Agent Tool Execution Registry.
    Registers and executes tools with input validation and execution timing.
    """

    def __init__(self):
        self._tools: Dict[str, Callable] = {}
        self._descriptions: Dict[str, str] = {}
        self._register_default_tools()

    def register(self, name: str, description: str, func: Callable):
        self._tools[name] = func
        self._descriptions[name] = description

    def get_registered_tools(self) -> List[Dict[str, str]]:
        return [{"name": k, "description": v} for k, v in self._descriptions.items()]

    async def execute_tool(self, name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        if name not in self._tools:
            raise ValueError(f"Tool '{name}' not found in registry")
        
        start_time = time.time()
        func = self._tools[name]
        
        if callable(func):
            import inspect
            if inspect.iscoroutinefunction(func):
                result = await func(**arguments)
            else:
                result = func(**arguments)
        else:
            raise TypeError(f"Tool {name} is not callable")

        duration_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "result": result,
            "duration_ms": duration_ms,
        }

    def _register_default_tools(self):
        # Tool 1: Query FortyGuard Sensors
        async def query_fortyguard_sensors(zone_name: str = "Sector 7 - Downtown Core"):
            summary = await fortyguard_client.get_telemetry_summary(zone_name)
            nodes = await fortyguard_client.get_sensor_nodes()
            return {
                "active_zone": summary.active_zone,
                "ambient_temp_c": summary.ambient_temp_c,
                "surface_temp_c": summary.surface_temp_c,
                "wet_bulb_temp_c": summary.wet_bulb_temp_c,
                "heat_index_c": summary.heat_index_c,
                "risk_level": summary.risk_level,
                "total_nodes": nodes.total_nodes,
                "provenance": summary.provenance.model_dump(),
            }
        self.register("query_fortyguard_sensors", "Query live/sandbox FortyGuard sensor telemetry for target zone", query_fortyguard_sensors)

        # Tool 2: Calculate WBGT Stress
        def calculate_wbgt_stress(ambient_temp_c: float, relative_humidity_pct: float, surface_temp_c: float = 48.0):
            req = ThermalCalculationRequest(
                ambient_temp_c=ambient_temp_c,
                relative_humidity_pct=relative_humidity_pct,
                surface_temp_c=surface_temp_c,
            )
            res = thermal_engine.evaluate(req)
            return res.model_dump()
        self.register("calculate_wbgt_stress", "Calculate scientific ISO 7243 WBGT, UTCI, and OSHA labor limits", calculate_wbgt_stress)

        # Tool 3: Query Demographic Vulnerability
        def query_demographic_vulnerability(zone_name: str = "Sector 7 - Downtown Core"):
            demographics = {
                "Sector 7 - Downtown Core": {"elderly_count": 4200, "outdoor_workers": 12500, "unhoused_count": 350, "vulnerability_index": 0.88},
                "Sector 7 - Industrial District": {"elderly_count": 800, "outdoor_workers": 18200, "unhoused_count": 120, "vulnerability_index": 0.94},
                "Al Danah Residential Corridor": {"elderly_count": 6800, "outdoor_workers": 1100, "unhoused_count": 80, "vulnerability_index": 0.72},
                "Central Public Transit Terminal": {"elderly_count": 2100, "outdoor_workers": 4500, "unhoused_count": 600, "vulnerability_index": 0.81},
            }
            data = demographics.get(zone_name, {"elderly_count": 2000, "outdoor_workers": 3000, "unhoused_count": 150, "vulnerability_index": 0.65})
            return {"zone_name": zone_name, **data}
        self.register("query_demographic_vulnerability", "Retrieve demographic exposure and vulnerable citizen counts", query_demographic_vulnerability)

        # Tool 4: Simulate Cooling Intervention
        def simulate_cooling_intervention(
            baseline_surface_c: float,
            baseline_ambient_c: float,
            cool_roof_albedo_delta: float = 0.35,
            canopy_coverage_delta_pct: float = 25.0,
            misting_arrays_active_pct: float = 40.0,
            traffic_reduction_pct: float = 20.0
        ):
            req = MitigationSimulationRequest(
                baseline_surface_c=baseline_surface_c,
                baseline_ambient_c=baseline_ambient_c,
                cool_roof_albedo_delta=cool_roof_albedo_delta,
                canopy_coverage_delta_pct=canopy_coverage_delta_pct,
                misting_arrays_active_pct=misting_arrays_active_pct,
                traffic_reduction_pct=traffic_reduction_pct,
            )
            res = ml_engine.simulate_mitigation(req)
            return res.model_dump()
        self.register("simulate_cooling_intervention", "Run ML simulation of temperature reduction from urban cooling actions", simulate_cooling_intervention)

        # Tool 5: Dispatch Shelter Routing Alert
        def dispatch_shelter_routing_alert(zone_name: str, priority: str = "HIGH"):
            return {
                "dispatch_id": f"SHELTER-{int(time.time())}",
                "target_zone": zone_name,
                "priority": priority,
                "cooling_shelters_allocated": ["Al Danah Civic Shelter", "Downtown Transit Hall 3"],
                "sms_notifications_queued": 14200,
                "status": "DISPATCHED",
            }
        self.register("dispatch_shelter_routing_alert", "Dispatch automated cooling center routing and public SMS advisories", dispatch_shelter_routing_alert)

        # Tool 6: Enforce Labor Rest Mandate
        def enforce_labor_rest_mandate(zone_name: str, work_rest_ratio: str = "15 min Work / 45 min Rest"):
            return {
                "mandate_id": f"OSHA-REST-{int(time.time())}",
                "zone_name": zone_name,
                "mandate": work_rest_ratio,
                "compliance_checkpoints_active": 18,
                "status": "ENFORCED",
            }
        self.register("enforce_labor_rest_mandate", "Enforce mandatory work-rest cycles for outdoor construction sites", enforce_labor_rest_mandate)


agent_tools = ToolRegistry()
