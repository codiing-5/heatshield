import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useApp } from '../../context/AppContext';
import { CommandCenterView } from '../views/CommandCenterView';
import { GisMapView } from '../views/GisMapView';
import { AgentStudioView } from '../views/AgentStudioView';
import { AnalyticsView } from '../views/AnalyticsView';
import { SevenTrackView } from '../views/SevenTrackView';
import { SettingsView } from '../views/SettingsView';

// Version 2 Google-Inspired Views
import { V2HomeView } from '../views/v2/V2HomeView';
import { V2ChatView } from '../views/v2/V2ChatView';
import { V2IntelligenceView } from '../views/v2/V2IntelligenceView';
import { V2GisMapView } from '../views/v2/V2GisMapView';
import { V2AgentsView } from '../views/v2/V2AgentsView';
import { V2AlertsView } from '../views/v2/V2AlertsView';

export const Shell: React.FC = () => {
  const { activeView, version } = useApp();
  const isV2 = version === 'v2';

  const renderActiveView = () => {
    switch (activeView) {
      // Version 2 Views
      case 'v2-home':
        return <V2HomeView />;
      case 'v2-chat':
        return <V2ChatView />;
      case 'v2-intelligence':
        return <V2IntelligenceView />;
      case 'v2-map':
        return <V2GisMapView />;
      case 'v2-agents':
        return <V2AgentsView />;
      case 'v2-alerts':
        return <V2AlertsView />;

      // Version 1 Stable Views
      case 'command-center':
        return <CommandCenterView />;
      case 'gis-map':
        return <GisMapView />;
      case 'agent-studio':
        return <AgentStudioView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'seven-tracks':
        return <SevenTrackView />;
      case 'settings':
        return <SettingsView />;

      default:
        return isV2 ? <V2HomeView /> : <CommandCenterView />;
    }
  };

  return (
    <div
      className={`min-h-screen flex transition-colors overflow-x-hidden ${
        isV2
          ? 'bg-[#F8F9FA] text-slate-900'
          : 'bg-[#0b0f19] text-slate-100'
      }`}
    >
      {/* Background ambient lighting for V1 mode only */}
      {!isV2 && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[10%] w-[45vw] h-[45vw] bg-orange-600/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-red-600/10 rounded-full blur-[160px]" />
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 p-3 sm:p-5 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto overflow-x-hidden">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};
