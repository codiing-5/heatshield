import React from 'react';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Map as MapIcon, 
  Bot, 
  LineChart, 
  Grid3X3, 
  Settings, 
  Flame,
  Radio,
  ChevronRight,
  Sparkles,
  Home,
  Thermometer,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ViewType } from '../../types/navigation';

interface NavItem {
  id: ViewType;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const v1NavItems: NavItem[] = [
  { id: 'command-center', label: 'Command Center', sublabel: 'Live Thermal Overview', icon: LayoutDashboard },
  { id: 'gis-map', label: 'GIS Heat Map', sublabel: 'MapLibre Spatial Layers', icon: MapIcon },
  { id: 'agent-studio', label: 'Agent Studio', sublabel: 'Multi-Agent Orchestrator', icon: Bot },
  { id: 'analytics', label: 'Thermal Analytics', sublabel: 'WBGT & Microclimate Trends', icon: LineChart },
  { id: 'seven-tracks', label: 'Seven-Track Hub', sublabel: 'Domain Action Systems', icon: Grid3X3 },
  { id: 'settings', label: 'System Settings', sublabel: 'FortyGuard & Config', icon: Settings },
];

const v2NavItems: NavItem[] = [
  { id: 'v2-home', label: 'Overview', sublabel: 'Heat Risk & AI Brief', icon: Home },
  { id: 'v2-chat', label: 'Thermora AI', sublabel: 'Conversational Assistant', icon: Sparkles },
  { id: 'v2-intelligence', label: 'Heat Intelligence', sublabel: 'Thermal Analytics & ML', icon: Thermometer },
  { id: 'v2-map', label: 'GIS Heat Map', sublabel: 'Interactive Risk Mesh', icon: MapIcon },
  { id: 'v2-agents', label: 'Agent Network', sublabel: 'Multi-Agent Orchestrator', icon: Bot },
  { id: 'v2-alerts', label: 'Alerts & Tracks', sublabel: 'Operational Workflows', icon: ShieldAlert },
  { id: 'settings', label: 'Settings', sublabel: 'API & Configuration', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { version, activeView, setActiveView, isMobileMenuOpen, setIsMobileMenuOpen } = useApp();
  const isV2 = version === 'v2';
  const navItems = isV2 ? v2NavItems : v1NavItems;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 md:z-30 w-64 md:w-72 flex flex-col justify-between h-screen select-none transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } ${
          isV2
            ? 'bg-white border-r border-slate-200 text-slate-900'
            : 'bg-[#0d1322]/95 border-r border-slate-800/80 text-slate-100 backdrop-blur-md'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div
            className={`p-4 sm:p-5 border-b flex items-center justify-between ${
              isV2 ? 'border-slate-200 bg-white' : 'border-slate-800/80 bg-[#0d1322]/90'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`p-2.5 rounded-2xl text-white shadow-sm flex items-center justify-center ${
                  isV2
                    ? 'bg-blue-600'
                    : 'bg-gradient-to-br from-orange-500 to-red-600 shadow-orange-500/25'
                }`}
              >
                {isV2 ? <Sparkles className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5 animate-pulse" />}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className={`text-lg font-bold tracking-tight ${isV2 ? 'text-slate-900' : 'text-white'}`}>
                    {isV2 ? 'THERMORA' : 'HEATSHIELD'}
                  </h1>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isV2 ? 'g-chip-info' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    }`}
                  >
                    {isV2 ? 'v2.0' : 'v1.0'}
                  </span>
                </div>
                <p className={`text-[11px] ${isV2 ? 'text-slate-500' : 'text-slate-400 font-mono'}`}>
                  {isV2 ? 'Thermora AI Intelligence' : 'Tactical Command Center'}
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-xl md:hidden text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        {/* Navigation Menu */}
        <div className="p-3 space-y-1">
          <div
            className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${
              isV2 ? 'text-slate-400' : 'text-slate-500 font-mono'
            }`}
          >
            {isV2 ? 'Platform Workspace' : 'Tactical Systems'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-150 group text-left cursor-pointer ${
                  isActive
                    ? isV2
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent text-white border-l-4 border-orange-500 shadow-sm'
                    : isV2
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-xl transition-colors ${
                      isActive
                        ? isV2
                          ? 'bg-blue-600 text-white'
                          : 'bg-orange-500/20 text-orange-400'
                        : isV2
                        ? 'text-slate-400 group-hover:text-slate-700'
                        : 'bg-slate-800/60 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-xs font-semibold ${isActive ? (isV2 ? 'text-blue-950' : 'text-white') : (isV2 ? 'text-slate-700' : 'text-slate-300')}`}>
                      {item.label}
                    </div>
                    <div className={`text-[10px] ${isV2 ? 'text-slate-400' : 'text-slate-500 font-mono'}`}>
                      {item.sublabel}
                    </div>
                  </div>
                </div>
                {isActive && (
                  <ChevronRight
                    className={`w-4 h-4 ${isV2 ? 'text-blue-600' : 'text-orange-400 animate-pulse'}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer Widget */}
      <div className={`p-4 border-t ${isV2 ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800/80 bg-slate-950/40'}`}>
        <div
          className={`p-3 rounded-2xl border flex flex-col gap-2 ${
            isV2 ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <div className={`flex items-center gap-1.5 font-medium ${isV2 ? 'text-slate-700' : 'text-slate-300'}`}>
              <Flame className={`w-3.5 h-3.5 ${isV2 ? 'text-blue-600' : 'text-orange-400'}`} />
              <span>FortyGuard Ingestion</span>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isV2 ? 'bg-blue-400' : 'bg-orange-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isV2 ? 'bg-blue-600' : 'bg-orange-500'}`} />
            </span>
          </div>
          <div className={`text-[11px] flex items-center justify-between ${isV2 ? 'text-slate-500' : 'text-slate-400 font-mono'}`}>
            <span>Resolution:</span>
            <span className="font-semibold text-slate-700">10m Spatial Micro</span>
          </div>
          <div className={`text-[10px] flex items-center gap-1 ${isV2 ? 'text-emerald-700 font-medium' : 'text-slate-400 font-mono'}`}>
            <Radio className="w-3 h-3 text-emerald-500" />
            <span>Telemetry Live Synced</span>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
};
