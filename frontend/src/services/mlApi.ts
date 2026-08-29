import { API_BASE_URL } from './apiConfig';

export interface ForecastPoint {
  horizon_hours: number;
  timestamp_offset: string;
  predicted_ambient_c: number;
  predicted_surface_c: number;
  predicted_wbgt_c: number;
  confidence_lower_c: number;
  confidence_upper_c: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' | 'CRITICAL';
}

export interface ForecastResponse {
  zone_name: string;
  model_name: string;
  model_r2_score: number;
  trend_direction: 'RISING' | 'PEAKING' | 'COOLING' | 'STABLE';
  peak_expected_time: string;
  forecast_points: ForecastPoint[];
}

export interface AnomalyItem {
  metric_name: string;
  observed_value: number;
  baseline_expected: number;
  z_score: number;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  is_anomaly: boolean;
  explanation: string;
}

export interface AnomalyDetectionResponse {
  zone_name: string;
  total_anomalies_detected: number;
  heatwave_escalation_probability_pct: number;
  anomalies: AnomalyItem[];
}

export interface MitigationParams {
  baseline_surface_c: number;
  baseline_ambient_c: number;
  cool_roof_albedo_delta: number;
  canopy_coverage_delta_pct: number;
  misting_arrays_active_pct: number;
  traffic_reduction_pct: number;
}

export interface MitigationResult {
  surface_temp_reduction_c: number;
  ambient_temp_reduction_c: number;
  wbgt_reduction_c: number;
  post_intervention_surface_c: number;
  post_intervention_ambient_c: number;
  post_intervention_wbgt_c: number;
  heat_stroke_risk_mitigation_pct: number;
  estimated_hvac_energy_savings_pct: number;
  intervention_feasibility_score: number;
  primary_recommendation: string;
}

export const mlApi = {
  async getForecast(zoneName: string, ambient: number, surface: number, humidity: number): Promise<ForecastResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/ml/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zone_name: zoneName,
        current_ambient_c: ambient,
        current_surface_c: surface,
        current_humidity_pct: humidity,
        horizons_hours: [1, 2, 3, 6, 12, 24],
      }),
    });
    if (!res.ok) {
      throw new Error(`Forecast API error: ${res.status}`);
    }
    return res.json();
  },

  async getAnomalies(zoneName: string = 'Sector 7 - Downtown Core'): Promise<AnomalyDetectionResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/ml/anomalies?zone_name=${encodeURIComponent(zoneName)}`);
    if (!res.ok) {
      throw new Error(`Anomalies API error: ${res.status}`);
    }
    return res.json();
  },

  async simulateMitigation(params: MitigationParams): Promise<MitigationResult> {
    const res = await fetch(`${API_BASE_URL}/api/v1/ml/simulate-mitigation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      throw new Error(`Mitigation simulation error: ${res.status}`);
    }
    return res.json();
  },
};

