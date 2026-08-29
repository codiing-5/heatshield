import { API_BASE_URL } from './apiConfig';

export interface ThermalCalculationParams {
  ambient_temp_c: number;
  relative_humidity_pct: number;
  surface_temp_c?: number;
  wind_speed_ms?: number;
  solar_radiation_wm2?: number;
}

export interface ThermalCalculationResult {
  ambient_temp_c: number;
  relative_humidity_pct: number;
  wet_bulb_temp_c: number;
  globe_temp_c: number;
  wbgt_c: number;
  heat_index_c: number;
  utci_c: number;
  humidex: number;
  vapor_pressure_kpa: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' | 'CRITICAL';
  labor_work_rest_ratio: string;
  recommended_hydration_l_hr: number;
  max_continuous_exposure_mins: number;
  physiological_advisory: string;
  calculation_timestamp: string;
}

export interface GeoJsonZoneProperties {
  zone_id: string;
  name: string;
  sensor_node: string;
  ambient_temp_c: number;
  surface_temp_c: number;
  wbgt_c: number;
  heat_index_c: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' | 'CRITICAL';
  fill_color: string;
  fill_opacity: number;
  vulnerability_score: number;
  canopy_deficit_pct: number;
  albedo_index: number;
  threat: string;
  action: string;
}

export interface GeoJsonZoneFeature {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: GeoJsonZoneProperties;
}

export interface GeoJsonSpatialMesh {
  type: 'FeatureCollection';
  features: GeoJsonZoneFeature[];
  metadata: {
    provider: string;
    crs: string;
    total_zones: number;
  };
}

export interface ZoneRiskAssessment {
  zone_id: string;
  zone_name: string;
  ambient_temp_c: number;
  surface_temp_c: number;
  wbgt_c: number;
  heat_index_c: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' | 'CRITICAL';
  vulnerability_score: number;
  canopy_deficit_pct: number;
  albedo_index: number;
  primary_threat: string;
  recommended_action: string;
}

export interface RiskAssessmentSummary {
  total_zones_analyzed: number;
  critical_zones_count: number;
  extreme_zones_count: number;
  mean_wbgt_c: number;
  zones: ZoneRiskAssessment[];
  timestamp: string;
}

export const heatIntelligenceApi = {
  async calculateThermalIndices(params: ThermalCalculationParams): Promise<ThermalCalculationResult> {
    const res = await fetch(`${API_BASE_URL}/api/v1/heat-intelligence/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      throw new Error(`Thermal calculation error: ${res.status}`);
    }
    return res.json();
  },

  async getSpatialThermalMesh(): Promise<GeoJsonSpatialMesh> {
    const res = await fetch(`${API_BASE_URL}/api/v1/heat-intelligence/spatial-mesh`);
    if (!res.ok) {
      throw new Error(`Spatial mesh error: ${res.status}`);
    }
    return res.json();
  },

  async getRiskAssessment(): Promise<RiskAssessmentSummary> {
    const res = await fetch(`${API_BASE_URL}/api/v1/heat-intelligence/risk-assessment`);
    if (!res.ok) {
      throw new Error(`Risk assessment error: ${res.status}`);
    }
    return res.json();
  },

  async interpolateCoordinate(lat: number, lng: number) {
    const res = await fetch(`${API_BASE_URL}/api/v1/heat-intelligence/interpolate?lat=${lat}&lng=${lng}`);
    if (!res.ok) {
      throw new Error(`Interpolation error: ${res.status}`);
    }
    return res.json();
  },
};

