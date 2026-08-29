import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  MapPin, 
  Clock, 
  RefreshCw,
  Flame
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const Topbar: React.FC = () => {
  const { telemetry, isBackendConnected, fortyguardStatus, activeZone, refetchFortyGuard } = useApp();
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0d1322]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Active Location & Thermal Risk Barometer */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <MapPin className="w-3.5 h-3.5 text-orange-400" />
          <span className="font-semibold text-slate-200">{activeZone}</span>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Heat Risk:</span>
          <Badge riskLevel={telemetry.riskLevel}>
            {telemetry.riskLevel} ALERT ({telemetry.ambientTemp}°C / WBGT {telemetry.wetBulbTemp}°C)
          </Badge>
        </div>
      </div>

      {/* Right: Telemetry Indicators, Live Clock, Backend Status */}
      <div className="flex items-center gap-3">
        {/* Active Agents Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
          <Bot className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>4 Agents Active</span>
        </div>

        {/* FortyGuard Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-slate-400 hidden lg:inline">FortyGuard:</span>
          <span className={fortyguardStatus === 'LIVE' ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
            {fortyguardStatus}
          </span>
        </div>

        {/* Backend Connectivity */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isBackendConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isBackendConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          </span>
          <span className="text-slate-300 hidden sm:inline">
            {isBackendConnected ? 'API Online' : 'API Offline'}
          </span>
        </div>

        {/* Live Clock */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeString}</span>
        </div>

        {/* Refresh Action */}
        <Button variant="outline" size="icon" title="Refresh Telemetry" onClick={() => refetchFortyGuard()}>
          <RefreshCw className="w-4 h-4 text-slate-300 hover:rotate-180 transition-transform duration-500" />
        </Button>
      </div>
    </header>
  );
};
