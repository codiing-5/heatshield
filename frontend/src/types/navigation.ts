export type ViewType = 
  | 'command-center'
  | 'gis-map'
  | 'agent-studio'
  | 'analytics'
  | 'seven-tracks'
  | 'settings';

export type ThermalRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' | 'CRITICAL';

export interface ThermalTelemetry {
  ambientTemp: number; // °C
  surfaceTemp: number; // °C
  wetBulbTemp: number; // °C
  heatIndex: number;   // °C
  relativeHumidity: number; // %
  uvIndex: number;
  riskLevel: ThermalRiskLevel;
  locationName: string;
  coordinates: [number, number]; // [lat, lng]
  timestamp: string;
  source: 'FortyGuard Live' | 'FortyGuard Sandbox' | 'Simulated';
}

export interface AgentActivity {
  id: string;
  agentName: string;
  agentRole: string;
  action: string;
  targetZone: string;
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'ALERT';
  timestamp: string;
  reasoningSnippet: string;
}

export interface HeatAlert {
  id: string;
  level: ThermalRiskLevel;
  title: string;
  zone: string;
  affectedPopulation: string;
  recommendation: string;
  timestamp: string;
}

export interface SevenTrackItem {
  id: string;
  title: string;
  iconName: string;
  description: string;
  kpiLabel: string;
  kpiValue: string;
  riskScore: number;
  status: 'OPTIMAL' | 'ELEVATED' | 'CRITICAL';
}
