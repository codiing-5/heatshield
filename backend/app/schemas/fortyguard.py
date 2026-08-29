from datetime import datetime, timezone
from typing import List, Optional, Tuple, Literal
from pydantic import BaseModel, Field


class ProvenanceMetadata(BaseModel):
    provider: str = Field(default="FortyGuard", description="Primary data source provider")
    stream_type: Literal["LIVE", "SANDBOX"] = Field(default="SANDBOX", description="Live API or high-fidelity sandbox stream")
    ingestion_timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    resolution_meters: int = Field(default=10, description="Spatial microclimate resolution in meters")
    confidence_score: float = Field(default=0.98, ge=0.0, le=1.0, description="Sensor calibration confidence score")
    cached: bool = Field(default=False, description="Whether data was served from high-speed cache")


class SensorNode(BaseModel):
    node_id: str = Field(..., description="Unique FortyGuard node identifier e.g. FG-772")
    zone_name: str = Field(..., description="Municipal sector name")
    coordinates: Tuple[float, float] = Field(..., description="GPS coordinates [lat, lng]")
    surface_temp_c: float = Field(..., description="Road/asphalt surface temperature in Celsius")
    ambient_temp_c: float = Field(..., description="Air temperature at 2m height in Celsius")
    relative_humidity_pct: float = Field(..., description="Relative humidity percentage")
    wet_bulb_temp_c: float = Field(..., description="Wet-bulb globe temperature (WBGT) in Celsius")
    heat_index_c: float = Field(..., description="Calculated perceived heat index in Celsius")
    uv_index: float = Field(..., description="UV radiation index")
    albedo_index: float = Field(default=0.15, description="Surface reflectance factor (0 to 1)")
    status: Literal["ONLINE", "MAINTENANCE", "DEGRADED"] = Field(default="ONLINE")
    last_ping: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class UrbanHeatIslandIndex(BaseModel):
    zone_name: str
    urban_surface_temp_c: float
    rural_baseline_temp_c: float
    uhi_delta_c: float = Field(..., description="Surface temperature elevation above rural baseline")
    nocturnal_retention_pct: float
    canopy_coverage_pct: float
    albedo_optimization_potential_c: float
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class DiurnalPoint(BaseModel):
    time: str
    ambient_c: float
    surface_c: float
    wbgt_c: float
    threshold_c: float = 31.0


class FortyGuardTelemetrySummary(BaseModel):
    active_zone: str
    ambient_temp_c: float
    surface_temp_c: float
    wet_bulb_temp_c: float
    heat_index_c: float
    relative_humidity_pct: float
    uv_index: float
    risk_level: Literal["LOW", "MODERATE", "HIGH", "EXTREME", "CRITICAL"]
    active_nodes_count: int
    uhi_delta_c: float
    coordinates: Tuple[float, float]
    provenance: ProvenanceMetadata


class NodeCollectionResponse(BaseModel):
    total_nodes: int
    nodes: List[SensorNode]
    provenance: ProvenanceMetadata


class DiurnalProfileResponse(BaseModel):
    zone_name: str
    points: List[DiurnalPoint]
    peak_surface_temp_c: float
    peak_wbgt_c: float
    hours_exceeding_threshold: float
    provenance: ProvenanceMetadata
