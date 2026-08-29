import { useState, useEffect, useCallback } from 'react';
import { ThermalTelemetry } from '../types/navigation';
import { API_BASE_URL } from '../services/apiConfig';

export interface FortyGuardProvenance {
  provider: string;
  stream_type: 'LIVE' | 'SANDBOX';
  ingestion_timestamp: string;
  resolution_meters: number;
  confidence_score: number;
  cached: boolean;
}

export interface FortyGuardNode {
  node_id: string;
  zone_name: string;
  coordinates: [number, number];
  surface_temp_c: number;
  ambient_temp_c: number;
  relative_humidity_pct: number;
  wet_bulb_temp_c: number;
  heat_index_c: number;
  uv_index: number;
  albedo_index: number;
  status: 'ONLINE' | 'MAINTENANCE' | 'DEGRADED';
}

export interface FortyGuardTelemetryPayload {
  active_zone: string;
  ambient_temp_c: number;
  surface_temp_c: number;
  wet_bulb_temp_c: number;
  heat_index_c: number;
  relative_humidity_pct: number;
  uv_index: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' | 'CRITICAL';
  active_nodes_count: number;
  uhi_delta_c: number;
  coordinates: [number, number];
  provenance: FortyGuardProvenance;
}

export function useFortyGuard(pollingIntervalMs: number = 10000) {
  const [telemetry, setTelemetry] = useState<ThermalTelemetry | null>(null);
  const [nodes, setNodes] = useState<FortyGuardNode[]>([]);
  const [provenance, setProvenance] = useState<FortyGuardProvenance | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTelemetry = useCallback(async () => {
    try {
      const [telemetryRes, nodesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/fortyguard/telemetry`),
        fetch(`${API_BASE_URL}/api/v1/fortyguard/nodes`),
      ]);


      if (!telemetryRes.ok) {
        throw new Error(`Telemetry HTTP error: ${telemetryRes.status}`);
      }

      const telData: FortyGuardTelemetryPayload = await telemetryRes.json();
      setTelemetry({
        ambientTemp: telData.ambient_temp_c,
        surfaceTemp: telData.surface_temp_c,
        wetBulbTemp: telData.wet_bulb_temp_c,
        heatIndex: telData.heat_index_c,
        relativeHumidity: telData.relative_humidity_pct,
        uvIndex: telData.uv_index,
        riskLevel: telData.risk_level,
        locationName: telData.active_zone,
        coordinates: telData.coordinates,
        timestamp: telData.provenance.ingestion_timestamp,
        source: telData.provenance.stream_type === 'LIVE' ? 'FortyGuard Live' : 'FortyGuard Sandbox',
      });
      setProvenance(telData.provenance);

      if (nodesRes.ok) {
        const nodesData = await nodesRes.json();
        setNodes(nodesData.nodes || []);
      }

      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error fetching FortyGuard stream');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, pollingIntervalMs);
    return () => clearInterval(interval);
  }, [fetchTelemetry, pollingIntervalMs]);

  return {
    telemetry,
    nodes,
    provenance,
    loading,
    error,
    refetch: fetchTelemetry,
  };
}
