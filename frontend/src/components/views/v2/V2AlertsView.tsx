import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Heart,
  HardHat,
  Building,
  Trees,
  Zap,
  Bus,
  Compass
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { tracksApi, TrackDetail } from '../../../services/tracksApi';

export const V2AlertsView: React.FC = () => {
  const { alerts, activeZone } = useApp();
  const [tracks, setTracks] = useState<TrackDetail[]>([]);
  const [dispatchedToast, setDispatchedToast] = useState<string | null>(null);

  useEffect(() => {
    tracksApi
      .getAllTracks()
      .then((data) => {
        if (data.tracks) {
          setTracks(data.tracks);
        }
      })
      .catch(() => {});
  }, []);

  const handleTriggerAction = async (trackId: string, trackTitle: string) => {
    setDispatchedToast(`Triggering automated operational workflow for: ${trackTitle}`);
    try {
      await tracksApi.dispatchAction(trackId, 'EMERGENCY_DISPATCH', activeZone);
      setTimeout(() => setDispatchedToast(null), 4000);
    } catch {
      setTimeout(() => setDispatchedToast(null), 3000);
    }
  };

  const getTrackIcon = (id: string) => {
    switch (id) {
      case 'labor':
        return HardHat;
      case 'health':
        return Heart;
      case 'infrastructure':
        return Building;
      case 'forestry':
        return Trees;
      case 'energy':
        return Zap;
      case 'transit':
        return Bus;
      default:
        return Compass;
    }
  };

  return (
    <div className="space-y-8 pb-12 font-sans max-w-6xl mx-auto">
      {/* Toast */}
      {dispatchedToast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-xl bg-white border border-emerald-200 shadow-xl text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{dispatchedToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <ShieldAlert className="w-4 h-4" />
          <span>Municipal Heat Defense System</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Active Alerts & Seven Domain Tracks</h1>
        <p className="text-sm text-slate-600 mt-1">
          Operational mitigation workflows across labor, public health, energy, transport, and infrastructure
        </p>
      </div>

      {/* Active Heat Alerts Section */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Active Thermal Hazard Alerts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alt) => (
            <div
              key={alt.id}
              className="p-5 rounded-2xl bg-white border border-red-200 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full g-chip-critical">
                  {alt.level} SEVERITY
                </span>
                <span className="text-xs text-slate-400">{alt.timestamp}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">{alt.title}</h3>
              <p className="text-xs text-slate-600 mb-2">Target Zone: <strong>{alt.zone}</strong></p>
              <p className="text-xs text-slate-600 mb-3">Affected Population: <strong>{alt.affectedPopulation}</strong></p>
              <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 text-xs text-red-900">
                <strong>Mandate:</strong> {alt.recommendation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seven Domain Tracks Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Seven Operational Mitigation Tracks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tracks.map((track) => {
            const Icon = getTrackIcon(track.id);
            const isCritical = track.status === 'CRITICAL';
            return (
              <div
                key={track.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCritical ? 'g-chip-critical' : 'g-chip-caution'
                      }`}
                    >
                      {track.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">{track.title}</h3>
                  <p className="text-xs text-slate-600 mb-3">{track.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {track.kpi_label}: <strong>{track.kpi_value}</strong>
                  </span>
                  <button
                    onClick={() => handleTriggerAction(track.id, track.title)}
                    className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Dispatch Action
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
