import React from 'react';
import { 
  MapPin, 
  RefreshCw,
  Flame,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../ui/Badge';

export const Topbar: React.FC = () => {
  const { version, setVersion, telemetry, isBackendConnected, fortyguardStatus, activeZone, refetchFortyGuard } = useApp();
  const isV2 = version === 'v2';

  return (
    <header
      className={`h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors ${
        isV2
          ? 'bg-white/95 border-b border-slate-200 backdrop-blur-md text-slate-800'
          : 'bg-[#0d1322]/90 border-b border-slate-800/80 backdrop-blur-md text-slate-200'
      }`}
    >
      {/* Left: Active Location & Risk */}
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs ${
            isV2 ? 'bg-slate-100 text-slate-800 border border-slate-200' : 'bg-slate-900/80 border border-slate-800 text-slate-200'
          }`}
        >
          <MapPin className={`w-3.5 h-3.5 ${isV2 ? 'text-blue-600' : 'text-orange-400'}`} />
          <span className="font-semibold">{activeZone}</span>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {isV2 ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold g-chip-critical flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              {telemetry.riskLevel} ALERT ({telemetry.ambientTemp}°C / WBGT {telemetry.wetBulbTemp}°C)
            </span>
          ) : (
            <Badge riskLevel={telemetry.riskLevel}>
              {telemetry.riskLevel} ALERT ({telemetry.ambientTemp}°C / WBGT {telemetry.wetBulbTemp}°C)
            </Badge>
          )}
        </div>
      </div>

      {/* Center/Right: Version Switcher & Telemetry Indicators */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Interactive Version Switcher Toggle */}
        <div
          className={`flex items-center p-1 rounded-full border text-xs font-semibold shadow-xs ${
            isV2 ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <button
            onClick={() => setVersion('v1')}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
              version === 'v1'
                ? 'bg-orange-600 text-white shadow-xs font-bold'
                : isV2 ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>V1 Stable</span>
          </button>
          <button
            onClick={() => setVersion('v2')}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
              version === 'v2'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : isV2 ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-blue-200" />
            <span>V2 Google AI</span>
          </button>
        </div>

        {/* FortyGuard Status */}
        <div
          className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono border ${
            isV2 ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900/80 border border-slate-800 text-slate-300'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span className="hidden lg:inline text-slate-500">FortyGuard:</span>
          <span className={fortyguardStatus === 'LIVE' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
            {fortyguardStatus}
          </span>
        </div>

        {/* Backend Online Indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono border ${
            isV2 ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900/80 border border-slate-800 text-slate-300'
          }`}
        >
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isBackendConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isBackendConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          </span>
          <span className="hidden sm:inline font-medium">
            {isBackendConnected ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Refresh Action */}
        <button
          onClick={() => refetchFortyGuard()}
          title="Refresh FortyGuard Telemetry"
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            isV2
              ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
          }`}
        >
          <RefreshCw className="w-4 h-4 hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>
    </header>
  );
};
