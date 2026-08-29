from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field


class ThermalCalculationRequest(BaseModel):
    ambient_temp_c: float = Field(..., ge=-20.0, le=70.0, description="Ambient dry-bulb air temperature in °C")
    relative_humidity_pct: float = Field(..., ge=0.0, le=100.0, description="Relative humidity percentage (0-100)")
    surface_temp_c: Optional[float] = Field(None, description="Optional surface / road temperature from FortyGuard sensor")
    wind_speed_ms: float = Field(default=1.5, ge=0.0, le=50.0, description="Wind speed at 2m height in m/s")
    solar_radiation_wm2: float = Field(default=800.0, ge=0.0, le=1400.0, description="Direct solar irradiance in W/m²")


class ThermalCalculationResponse(BaseModel):
    ambient_temp_c: float
    relative_humidity_pct: float
    wet_bulb_temp_c: float
    globe_temp_c: float
    wbgt_c: float
    heat_index_c: float
    utci_c: float
    humidex: float
    vapor_pressure_kpa: float
    risk_level: Literal["LOW", "MODERATE", "HIGH", "EXTREME", "CRITICAL"]
    labor_work_rest_ratio: str
    recommended_hydration_l_hr: float
    max_continuous_exposure_mins: int
    physiological_advisory: str
    calculation_timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class GeoJsonGeometry(BaseModel):
    type: Literal["Polygon", "Point", "MultiPolygon"]
    coordinates: Any


class GeoJsonFeature(BaseModel):
    type: Literal["Feature"] = "Feature"
    id: str
    geometry: GeoJsonGeometry
    properties: Dict[str, Any]


class GeoJsonFeatureCollection(BaseModel):
    type: Literal["FeatureCollection"] = "FeatureCollection"
    features: List[GeoJsonFeature]
    metadata: Dict[str, Any]


class ZoneRiskAssessment(BaseModel):
    zone_id: str
    zone_name: str
    ambient_temp_c: float
    surface_temp_c: float
    wbgt_c: float
    heat_index_c: float
    risk_level: Literal["LOW", "MODERATE", "HIGH", "EXTREME", "CRITICAL"]
    vulnerability_score: float = Field(..., ge=0.0, le=1.0)
    canopy_deficit_pct: float
    albedo_index: float
    primary_threat: str
    recommended_action: str


class RiskAssessmentSummary(BaseModel):
    total_zones_analyzed: int
    critical_zones_count: int
    extreme_zones_count: int
    mean_wbgt_c: float
    zones: List[ZoneRiskAssessment]
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
