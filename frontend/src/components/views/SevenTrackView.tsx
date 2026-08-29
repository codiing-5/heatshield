import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  HeartPulse, 
  Siren, 
  Zap, 
  HardHat, 
  Bus, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Clock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { tracksApi, TrackDetail, TrackActionResponse } from '../../services/tracksApi';
import { useApp } from '../../context/AppContext';

export const SevenTrackView: React.FC = () => {
  const { activeZone } = useApp();
  const [tracks, setTracks] = useState<TrackDetail[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string>('labor');
  const [dispatchedResult, setDispatchedResult] = useState<TrackActionResponse | null>(null);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    urban: Building2,
    health: HeartPulse,
    emergency: Siren,
    grid: Zap,
    labor: HardHat,
    transit: Bus,
    policy: FileText,
  };

  const loadTracks = async () => {
    try {
      const data = await tracksApi.getAllTracks();
      setTracks(data.tracks || []);
    } catch (err) {
      console.error('Failed to load tracks:', err);
    }
  };

  useEffect(() => {
    loadTracks();
  }, []);

  const handleTriggerProtocol = async (trackId: string, protocolName: string) => {
    setIsDispatching(true);
    try {
      const res = await tracksApi.dispatchAction(trackId, protocolName, activeZone);
      setDispatchedResult(res);
      await loadTracks();
      setTimeout(() => setDispatchedResult(null), 4500);
    } catch (err) {
      console.error('Action dispatch error:', err);
    } finally {
      setIsDispatching(false);
    }
  };

  const currentTrack = tracks.find((t) => t.id === selectedTrackId) || tracks[0];
  const CurrentIcon = currentTrack ? (iconMap[currentTrack.id] || Sparkles) : Sparkles;

  return (
    <div className="space-y-6">
      {/* Action Notification Banner */}
      <AnimatePresence>
        {dispatchedResult && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-lg backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div>
                <strong>Protocol Dispatched: </strong>{dispatchedResult.action_name} in <strong>{dispatchedResult.target_zone}</strong>
                <div className="text-[10px] text-emerald-400/90 mt-0.5">{dispatchedResult.estimated_impact}</div>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase">{dispatchedResult.status}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          Seven-Track Domain Capabilities Hub
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Specialized Multi-Domain Intervention Modules • Powered by FortyGuard Microclimate Telemetry
        </p>
      </div>

      {/* 7 Track Horizontal Card Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {tracks.map((t) => {
          const Icon = iconMap[t.id] || Sparkles;
          const isSelected = selectedTrackId === t.id;
          return (
            <motion.button
              key={t.id}
              onClick={() => setSelectedTrackId(t.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-36 ${
                isSelected
                  ? 'bg-slate-900/90 border-orange-500 shadow-md shadow-orange-500/10 ring-1 ring-orange-500/30'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl border bg-slate-900 ${t.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`w-2 h-2 rounded-full ${
                  t.status === 'CRITICAL' ? 'bg-red-500 animate-ping' : t.status === 'ELEVATED' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-mono">{t.category.split(':')[0]}</div>
                <div className="text-xs font-bold text-white leading-snug line-clamp-2 mt-0.5">{t.title}</div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Track Detailed Command Matrix */}
      {currentTrack && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl border bg-slate-900/90 ${currentTrack.color}`}>
                  <CurrentIcon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono text-orange-400 font-semibold uppercase">{currentTrack.category}</span>
                  <CardTitle className="text-xl">{currentTrack.title}</CardTitle>
                </div>
              </div>
              <Badge riskLevel={currentTrack.status === 'CRITICAL' ? 'CRITICAL' : currentTrack.status === 'ELEVATED' ? 'HIGH' : 'LOW'}>
                Status: {currentTrack.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
              {currentTrack.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* KPI 1 */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs text-slate-400 font-mono">{currentTrack.kpi_label}</span>
                <div className="text-xl font-bold text-white mt-1">{currentTrack.kpi_value}</div>
              </div>

              {/* KPI 2: FortyGuard Data Provenance */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs text-slate-400 font-mono">Telemetry Pipeline</span>
                <div className="text-xl font-bold text-orange-400 mt-1">{currentTrack.telemetry_provenance}</div>
              </div>

              {/* KPI 3: Autonomous Response State */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs text-slate-400 font-mono">Agent Readiness</span>
                <div className="text-xl font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5" /> Active Protocol
                </div>
              </div>
            </div>

            {/* Active Tactical Protocols with Direct Trigger Action Buttons */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
                Immediate Tactical Intervention Workflows
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {currentTrack.active_protocols.map((protocol, idx) => (
                  <button
                    key={protocol}
                    onClick={() => handleTriggerProtocol(currentTrack.id, protocol)}
                    disabled={isDispatching}
                    className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/40 flex items-center justify-between text-xs text-slate-200 transition-all text-left group"
                  >
                    <span className="font-semibold">{idx + 1}. {protocol}</span>
                    <ArrowRight className="w-4 h-4 text-orange-400 group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Track Actions Audit Log */}
            {currentTrack.recent_actions && currentTrack.recent_actions.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> Recent Tactical Dispatch History
                </h4>
                <div className="space-y-1.5 font-mono text-xs text-slate-300">
                  {currentTrack.recent_actions.map((act, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
                      <span>{act.action}</span>
                      <span className="text-[10px] text-slate-500">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
