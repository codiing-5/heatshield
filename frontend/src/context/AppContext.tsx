import React, { createContext, useContext, useState, useEffect } from 'react';
import { ViewType, ThermalTelemetry, AgentActivity, HeatAlert } from '../types/navigation';
import { useFortyGuard } from '../hooks/useFortyGuard';

interface AppContextType {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  telemetry: ThermalTelemetry;
  setTelemetry: React.Dispatch<React.SetStateAction<ThermalTelemetry>>;
  agentActivities: AgentActivity[];
  alerts: HeatAlert[];
  isBackendConnected: boolean;
  fortyguardStatus: 'LIVE' | 'SANDBOX' | 'DISCONNECTED';
  activeZone: string;
  setActiveZone: (zone: string) => void;
  refetchFortyGuard: () => void;
}

const defaultTelemetry: ThermalTelemetry = {
  ambientTemp: 38.6,
  surfaceTemp: 48.2,
  wetBulbTemp: 31.4,
  heatIndex: 45.2,
  relativeHumidity: 62,
  uvIndex: 10.6,
  riskLevel: 'EXTREME',
  locationName: 'Sector 7 - Downtown Core',
  coordinates: [24.4539, 54.3773],
  timestamp: new Date().toISOString(),
  source: 'FortyGuard Sandbox',
};

const initialAgentActivities: AgentActivity[] = [
  {
    id: 'act-01',
    agentName: 'Sentinel Agent (Risk Radar)',
    agentRole: 'Real-time thermal anomaly detector',
    action: 'Triggered WBGT threshold alert (>31°C) in high-density residential zone',
    targetZone: 'Sector 7 - Downtown Core',
    status: 'ALERT',
    timestamp: '2 mins ago',
    reasoningSnippet: 'FortyGuard sensor node FG-772 registered asphalt surface temp of 48.2°C with rising humidity.',
  },
  {
    id: 'act-02',
    agentName: 'Vulnerable Population Advisor',
    agentRole: 'Elderly & outdoor worker safety agent',
    action: 'Dispatched automated hydration & cooling center routing notices',
    targetZone: 'Al Danah Residential Corridor',
    status: 'COMPLETED',
    timestamp: '5 mins ago',
    reasoningSnippet: 'High concentration of outdoor construction workforce within 800m of peak thermal hotspot.',
  },
  {
    id: 'act-03',
    agentName: 'Urban Cooling Strategist',
    agentRole: 'Microclimate intervention optimizer',
    action: 'Generated misting canon activation schedule for public transit hubs',
    targetZone: 'Central Public Transit Terminal',
    status: 'EXECUTING',
    timestamp: '11 mins ago',
    reasoningSnippet: 'Calculated 3.2°C perceived temperature reduction potential with intermittent aerosol cooling.',
  },
  {
    id: 'act-04',
    agentName: 'Energy & Grid Balancer',
    agentRole: 'HVAC load and brownout prevention agent',
    action: 'Pre-cooled municipal facilities ahead of 14:00 peak thermal surge',
    targetZone: 'Government Administrative Complex',
    status: 'COMPLETED',
    timestamp: '25 mins ago',
    reasoningSnippet: 'Simulated 18% peak electricity load reduction by staggered thermal buffering.',
  },
];

const initialAlerts: HeatAlert[] = [
  {
    id: 'alt-01',
    level: 'EXTREME',
    title: 'Dangerous Wet-Bulb Heat Stress Warning',
    zone: 'Sector 7 - Industrial District',
    affectedPopulation: '14,200 Outdoor Workers & Commuters',
    recommendation: 'Mandatory 15-minute rest rotations and shaded hydration break enforcement.',
    timestamp: '13:45 Local Time',
  },
  {
    id: 'alt-02',
    level: 'HIGH',
    title: 'Urban Heat Island Micro-Pocket Surge',
    zone: 'Al Danah Residential Corridor',
    affectedPopulation: '6,800 Senior Residents',
    recommendation: 'Mobilize mobile cooling buses and verify air conditioning backup power.',
    timestamp: '13:20 Local Time',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ViewType>('command-center');
  const [telemetry, setTelemetry] = useState<ThermalTelemetry>(defaultTelemetry);
  const [agentActivities] = useState<AgentActivity[]>(initialAgentActivities);
  const [alerts] = useState<HeatAlert[]>(initialAlerts);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [fortyguardStatus, setFortyguardStatus] = useState<'LIVE' | 'SANDBOX' | 'DISCONNECTED'>('SANDBOX');
  const [activeZone, setActiveZone] = useState<string>('Sector 7 - Downtown Core');

  const { telemetry: streamTelemetry, provenance, refetch } = useFortyGuard(10000);

  useEffect(() => {
    if (streamTelemetry) {
      setTelemetry(streamTelemetry);
      setActiveZone(streamTelemetry.locationName);
      setIsBackendConnected(true);
      if (provenance) {
        setFortyguardStatus(provenance.stream_type);
      }
    }
  }, [streamTelemetry, provenance]);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/v1/fortyguard/status');
        if (res.ok) {
          const data = await res.json();
          setIsBackendConnected(true);
          setFortyguardStatus(data.stream_mode);
        } else {
          setIsBackendConnected(false);
          setFortyguardStatus('DISCONNECTED');
        }
      } catch {
        setIsBackendConnected(false);
        setFortyguardStatus('DISCONNECTED');
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        telemetry,
        setTelemetry,
        agentActivities,
        alerts,
        isBackendConnected,
        fortyguardStatus,
        activeZone,
        setActiveZone,
        refetchFortyGuard: refetch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
