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
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ViewType } from '../../types/navigation';

interface NavItem {
  id: ViewType;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { id: 'command-center', label: 'Command Center', sublabel: 'Live Thermal Overview', icon: LayoutDashboard },
  { id: 'gis-map', label: 'GIS Heat Map', sublabel: 'MapLibre Spatial Layers', icon: MapIcon },
  { id: 'agent-studio', label: 'Agent Studio', sublabel: 'Multi-Agent Orchestrator', icon: Bot },
  { id: 'analytics', label: 'Thermal Analytics', sublabel: 'WBGT & Microclimate Trends', icon: LineChart },
  { id: 'seven-tracks', label: 'Seven-Track Hub', sublabel: 'Domain Action Systems', icon: Grid3X3 },
  { id: 'settings', label: 'System Settings', sublabel: 'FortyGuard & Config', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView } = useApp();

  return (
    <aside className="w-72 bg-[#0d1322]/90 border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-orange-400 bg-clip-text text-transparent">
                HEATSHIELD
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-orange-500/20 text-orange-400 border border-orange-500/30">
                v0.1
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight">Agentic Heat Intelligence</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="p-3 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Navigation Architecture
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 group text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent text-white border-l-4 border-orange-500 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-slate-800/60 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.sublabel}</div>
                  </div>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-orange-400 animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer / FortyGuard Status Widget */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>FortyGuard Stream</span>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Data Engine:</span>
            <span className="text-orange-400 font-semibold">Primary Hackathon</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400" />
            <span>Ready for Stage 2 Stream</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
