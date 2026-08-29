from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field


class TrackActionRequest(BaseModel):
    action_name: str = Field(..., description="Name of tactical protocol to trigger")
    zone_name: str = Field(default="Sector 7 - Downtown Core", description="Target municipal zone")
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Action parameters")


class TrackActionResponse(BaseModel):
    action_id: str
    track_id: str
    action_name: str
    target_zone: str
    status: Literal["DISPATCHED", "ACTIVE", "COMPLETED", "FAILED"]
    details: str
    estimated_impact: str
    dispatched_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class TrackDetailResponse(BaseModel):
    id: str
    title: str
    category: str
    color: str
    status: Literal["OPTIMAL", "ELEVATED", "CRITICAL"]
    description: str
    kpi_label: str
    kpi_value: str
    telemetry_provenance: str
    active_protocols: List[str]
    recent_actions: List[Dict[str, Any]]


class AllTracksResponse(BaseModel):
    total_tracks: int
    critical_tracks_count: int
    elevated_tracks_count: int
    optimal_tracks_count: int
    tracks: List[TrackDetailResponse]
    synced_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
