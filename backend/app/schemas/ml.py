from datetime import datetime, timezone
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class ForecastRequest(BaseModel):
    zone_name: str = Field(default="Sector 7 - Downtown Core", description="Target microclimate sector")
    current_ambient_c: float = Field(default=38.6, description="Current dry-bulb ambient temperature")
    current_surface_c: float = Field(default=48.2, description="Current surface/road temperature from FortyGuard")
    current_humidity_pct: float = Field(default=62.0, description="Current relative humidity")
    horizons_hours: List[int] = Field(default=[1, 2, 3, 6, 12, 24], description="Prediction horizons in hours")


class ForecastPoint(BaseModel):
    horizon_hours: int
    timestamp_offset: str
    predicted_ambient_c: float
    predicted_surface_c: float
    predicted_wbgt_c: float
    confidence_lower_c: float
    confidence_upper_c: float
    risk_level: Literal["LOW", "MODERATE", "HIGH", "EXTREME", "CRITICAL"]


class ForecastResponse(BaseModel):
    zone_name: str
    model_name: str = "FortyGuard-NeuralMicroclimate-v2"
    model_r2_score: float = 0.94
    trend_direction: Literal["RISING", "PEAKING", "COOLING", "STABLE"]
    peak_expected_time: str
    forecast_points: List[ForecastPoint]
    generated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AnomalyItem(BaseModel):
    metric_name: str
    observed_value: float
    baseline_expected: float
    z_score: float
    severity: Literal["LOW", "MODERATE", "HIGH", "SEVERE"]
    is_anomaly: bool
    explanation: str


class AnomalyDetectionResponse(BaseModel):
    zone_name: str
    total_anomalies_detected: int
    heatwave_escalation_probability_pct: float
    anomalies: List[AnomalyItem]
    evaluated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class MitigationSimulationRequest(BaseModel):
    baseline_surface_c: float = Field(default=48.2, description="Current FortyGuard asphalt surface temp")
    baseline_ambient_c: float = Field(default=38.6, description="Current ambient air temperature")
    cool_roof_albedo_delta: float = Field(default=0.35, ge=0.0, le=0.7, description="Albedo increase (+0.0 to +0.7)")
    canopy_coverage_delta_pct: float = Field(default=25.0, ge=0.0, le=80.0, description="Additional tree canopy shade (+0% to +80%)")
    misting_arrays_active_pct: float = Field(default=40.0, ge=0.0, le=100.0, description="Atomized misting coverage (% of public hubs)")
    traffic_reduction_pct: float = Field(default=20.0, ge=0.0, le=75.0, description="Vehicular traffic restriction (%)")


class MitigationSimulationResponse(BaseModel):
    surface_temp_reduction_c: float
    ambient_temp_reduction_c: float
    wbgt_reduction_c: float
    post_intervention_surface_c: float
    post_intervention_ambient_c: float
    post_intervention_wbgt_c: float
    heat_stroke_risk_mitigation_pct: float
    estimated_hvac_energy_savings_pct: float
    intervention_feasibility_score: float
    primary_recommendation: str
