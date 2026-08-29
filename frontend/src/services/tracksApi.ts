import { API_BASE_URL } from './apiConfig';

export interface TrackDetail {
  id: string;
  title: string;
  category: string;
  color: string;
  status: 'OPTIMAL' | 'ELEVATED' | 'CRITICAL';
  description: string;
  kpi_label: string;
  kpi_value: string;
  telemetry_provenance: string;
  active_protocols: string[];
  recent_actions: { action: string; time: string }[];
}

export interface AllTracksResponse {
  total_tracks: number;
  critical_tracks_count: number;
  elevated_tracks_count: number;
  optimal_tracks_count: number;
  tracks: TrackDetail[];
  synced_at: string;
}

export interface TrackActionResponse {
  action_id: string;
  track_id: string;
  action_name: string;
  target_zone: string;
  status: 'DISPATCHED' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  details: string;
  estimated_impact: string;
  dispatched_at: string;
}

export const tracksApi = {
  async getAllTracks(): Promise<AllTracksResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/tracks/all`);
    if (!res.ok) {
      throw new Error(`Tracks API error: ${res.status}`);
    }
    return res.json();
  },

  async dispatchAction(trackId: string, actionName: string, zoneName: string): Promise<TrackActionResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/tracks/${trackId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action_name: actionName,
        zone_name: zoneName,
      }),
    });
    if (!res.ok) {
      throw new Error(`Dispatch action error: ${res.status}`);
    }
    return res.json();
  },
};

