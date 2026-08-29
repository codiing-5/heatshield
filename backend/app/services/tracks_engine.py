import time
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.schemas.tracks import (
    TrackDetailResponse,
    AllTracksResponse,
    TrackActionRequest,
    TrackActionResponse,
)


class SevenTracksEngine:
    """
    Specialized Domain Action Engine for HEATSHIELD's Seven Operational Tracks.
    """

    def __init__(self):
        self._tracks_data: Dict[str, Dict[str, Any]] = {
            "urban": {
                "id": "urban",
                "title": "Urban Planning & Cool Infrastructure",
                "category": "Track 1: Infrastructure",
                "color": "text-emerald-400",
                "status": "OPTIMAL",
                "description": "Dynamic simulation of cool roofs, reflective pavement coatings, and urban canopy shading interventions.",
                "kpi_label": "Cool Pavement Coverage",
                "kpi_value": "34.2% of Arterial Roads",
                "telemetry_provenance": "FortyGuard Surface Albedo Mesh",
                "active_protocols": [
                    "High-Albedo Surface Mapping",
                    "Green Corridor Shading Simulation",
                    "Canopy Deficit Prioritization",
                ],
                "recent_actions": [
                    {"action": "Coated 4.2km of downtown avenue with 0.45 albedo sealant", "time": "1h ago"},
                    {"action": "Simulated microclimate cooling delta for 250 new shade trees", "time": "3h ago"},
                ],
            },
            "health": {
                "id": "health",
                "title": "Public Health & Vulnerable Care",
                "category": "Track 2: Healthcare",
                "color": "text-rose-400",
                "status": "CRITICAL",
                "description": "Microclimate demographic correlation targeting high-risk elderly, pediatric, and unhoused populations.",
                "kpi_label": "Monitored Vulnerable Citizens",
                "kpi_value": "18,450 Residents",
                "telemetry_provenance": "FortyGuard WBGT Exposure Overlay",
                "active_protocols": [
                    "Senior Living Direct Thermal Warnings",
                    "Hydration Station Routing SMS",
                    "Heat Stroke Symptom AI Check",
                ],
                "recent_actions": [
                    {"action": "Sent 6,800 automated hydration alerts to senior communities", "time": "25 mins ago"},
                    {"action": "Allocated 4 community cooling center halls with AC backup", "time": "1h ago"},
                ],
            },
            "emergency": {
                "id": "emergency",
                "title": "Emergency Response & Cooling Shelters",
                "category": "Track 3: Emergency Dispatch",
                "color": "text-red-400",
                "status": "ELEVATED",
                "description": "Automated dispatching of emergency mobile cooling buses, hydration kiosks, and paramedic staging.",
                "kpi_label": "Cooling Shelter Capacity",
                "kpi_value": "4,200 beds (82% Available)",
                "telemetry_provenance": "FortyGuard Real-time Thermal Hotspot Feed",
                "active_protocols": [
                    "Mobile Mist Bus Routing",
                    "Hospital Heat Influx Forecasting",
                    "Paramedic Stage Positioning",
                ],
                "recent_actions": [
                    {"action": "Routed 3 mobile air-conditioned cooling buses to Sector 7 transit hub", "time": "12 mins ago"},
                    {"action": "Alerted regional trauma emergency department for heat exhaustion surge", "time": "45 mins ago"},
                ],
            },
            "grid": {
                "id": "grid",
                "title": "Energy Grid & Substation Resilience",
                "category": "Track 4: Utilities",
                "color": "text-amber-400",
                "status": "ELEVATED",
                "description": "Transformer overheating prevention and predictive HVAC load shifting to avert blackout cascades.",
                "kpi_label": "Peak Demand Buffer",
                "kpi_value": "12.4% Reserve Margin",
                "telemetry_provenance": "FortyGuard Substation Microclimate Grid",
                "active_protocols": [
                    "Substation Ambient Overheating Alarm",
                    "Pre-Cooling Municipal Load Shed",
                    "Rooftop Solar Efficiency Drop Tracking",
                ],
                "recent_actions": [
                    {"action": "Pre-cooled 14 municipal buildings lowering 14:00 demand by 18.4%", "time": "20 mins ago"},
                    {"action": "Flagged transformer oil temperature alert at Downtown Substation 4", "time": "1h ago"},
                ],
            },
            "labor": {
                "id": "labor",
                "title": "Outdoor Worker & Labor Safety",
                "category": "Track 5: Occupational Health",
                "color": "text-orange-400",
                "status": "CRITICAL",
                "description": "Wet-Bulb Globe Temperature (WBGT) OSHA/international compliance engine with mandatory rest enforcement.",
                "kpi_label": "Active Worksite Sites",
                "kpi_value": "48 Monitored Zones",
                "telemetry_provenance": "FortyGuard Direct Asphalt & WBGT Sensors",
                "active_protocols": [
                    "Mandatory 15-Min Work/Rest Cycles",
                    "Wearable Heat Sensor Integration",
                    "Hydration Quota Verification",
                ],
                "recent_actions": [
                    {"action": "Enforced mandatory 15 min work / 45 min rest rotation at 18 construction sites", "time": "5 mins ago"},
                    {"action": "Delivered 2,400 liters of electrolyte water to high-risk outdoor workers", "time": "35 mins ago"},
                ],
            },
            "transit": {
                "id": "transit",
                "title": "Transportation & Asphalt Integrity",
                "category": "Track 6: Mobility",
                "color": "text-blue-400",
                "status": "OPTIMAL",
                "description": "Transit stop shade optimization and asphalt thermal rutting prevention on major transport arteries.",
                "kpi_label": "Bus Stop Shade Coverage",
                "kpi_value": "76% of Active Routes",
                "telemetry_provenance": "FortyGuard Road Surface Temperature Stream",
                "active_protocols": [
                    "Asphalt Softening Risk Warning",
                    "Transit Stop Atomizer Misting",
                    "Air-Conditioned Waiting Hall Routing",
                ],
                "recent_actions": [
                    {"action": "Activated atomized misting canons across 24 public bus stop terminals", "time": "15 mins ago"},
                    {"action": "Monitored asphalt rutting risk on Airport Highway (surface at 49.2°C)", "time": "2h ago"},
                ],
            },
            "policy": {
                "id": "policy",
                "title": "Climate Policy & Municipal Heat Action",
                "category": "Track 7: Governance",
                "color": "text-purple-400",
                "status": "ELEVATED",
                "description": "Automated municipal Heat Action Plan (HAP) trigger verification, carbon reduction offsets, and audit reporting.",
                "kpi_label": "Municipal HAP Level",
                "kpi_value": "Level 3 (Red Alert Active)",
                "telemetry_provenance": "FortyGuard Verified Provenance Log",
                "active_protocols": [
                    "Statutory Heat Emergency Declarations",
                    "ESG Climate Disclosure Logging",
                    "Inter-Agency Resource Synchronization",
                ],
                "recent_actions": [
                    {"action": "Published official municipal Heat Action Plan Level 3 advisory notice", "time": "1h ago"},
                    {"action": "Logged verifiable ESG heat risk resilience report for city council audit", "time": "4h ago"},
                ],
            },
        }

    def get_all_tracks(self) -> AllTracksResponse:
        tracks_list = [TrackDetailResponse(**v) for v in self._tracks_data.values()]
        critical = sum(1 for t in tracks_list if t.status == "CRITICAL")
        elevated = sum(1 for t in tracks_list if t.status == "ELEVATED")
        optimal = sum(1 for t in tracks_list if t.status == "OPTIMAL")

        return AllTracksResponse(
            total_tracks=len(tracks_list),
            critical_tracks_count=critical,
            elevated_tracks_count=elevated,
            optimal_tracks_count=optimal,
            tracks=tracks_list,
        )

    def get_track_detail(self, track_id: str) -> Optional[TrackDetailResponse]:
        data = self._tracks_data.get(track_id)
        if not data:
            return None
        return TrackDetailResponse(**data)

    def dispatch_action(self, track_id: str, req: TrackActionRequest) -> TrackActionResponse:
        track = self._tracks_data.get(track_id)
        if not track:
            raise ValueError(f"Track '{track_id}' not found")

        action_id = f"ACT-{track_id.upper()}-{int(time.time())}"
        
        impact_map = {
            "urban": "-4.2°C surface asphalt cooling & +18% albedo reflectance across target corridor",
            "health": "Protected 6,800 senior residents with zero heat stroke hospital admissions reported",
            "emergency": "Reduced transit hub ambulance wait times by 42% via mobile misting stage units",
            "grid": "Buffered 18.4% peak municipal HVAC load avoiding localized transformer brownouts",
            "labor": "100% OSHA/ISO 7243 compliance across 48 monitored outdoor construction sites",
            "transit": "-3.1°C commuter perceived temperature reduction at 24 public transit hubs",
            "policy": "Verifiable municipal Heat Action Plan Level 3 compliance report generated",
        }

        impact = impact_map.get(track_id, "Automated tactical intervention active")

        # Record action in track history
        track["recent_actions"].insert(0, {
            "action": f"Executed [{req.action_name}] in {req.zone_name}",
            "time": "Just now",
        })

        return TrackActionResponse(
            action_id=action_id,
            track_id=track_id,
            action_name=req.action_name,
            target_zone=req.zone_name,
            status="DISPATCHED",
            details=f"Tactical protocol '{req.action_name}' dispatched for {req.zone_name} under {track['title']}.",
            estimated_impact=impact,
        )


tracks_engine = SevenTracksEngine()
