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

export const Shell: React.FC = () => {
  const { activeView } = useApp();

  const renderActiveView = () => {
    switch (activeView) {
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
        return <CommandCenterView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex selection:bg-orange-500/30 selection:text-orange-200">
      {/* Background ambient thermal lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[10%] w-[45vw] h-[45vw] bg-orange-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-red-600/10 rounded-full blur-[160px]" />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <Topbar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};
