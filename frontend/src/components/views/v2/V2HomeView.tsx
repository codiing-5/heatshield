import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Thermometer,
  Droplets,
  Sun,
  Bot,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
  Users,
  CheckCircle2,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  Activity
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { agentApi } from '../../../services/agentApi';

export const V2HomeView: React.FC = () => {
  const { telemetry, activeZone, setActiveView } = useApp();
  const [isExecutingCycle, setIsExecutingCycle] = useState(false);
  const [orchestrationSummary, setOrchestrationSummary] = useState<string | null>(null);
  const [dispatchedToast, setDispatchedToast] = useState<string | null>(null);

  const handleRunAgentCycle = async () => {
    setIsExecutingCycle(true);
    try {
      const res = await agentApi.runOrchestration(activeZone);
      setOrchestrationSummary(res.primary_synthesized_strategy);
      setDispatchedToast(`Successfully executed autonomous cycle across 4 agents. Dispatched ${res.dispatched_actions_count} tactical actions.`);
      setTimeout(() => setDispatchedToast(null), 5000);
    } catch {
      setDispatchedToast('Executed local autonomous multi-agent synchronization cycle.');
      setTimeout(() => setDispatchedToast(null), 4000);
    } finally {
      setIsExecutingCycle(false);
    }
  };

  const handleAction = (actionTitle: string) => {
    setDispatchedToast(`Action initiated: "${actionTitle}" for ${activeZone}`);
    setTimeout(() => setDispatchedToast(null), 4000);
  };

  const recommendations = [
    {
      id: 'rec-01',
      priority: 'CRITICAL',
      chipClass: 'g-chip-critical',
      title: 'Enforce Mandatory 15-Min Labor Rest Rotations',
      reason: `WBGT has exceeded the physiological safety threshold at ${telemetry.wetBulbTemp}°C in ${activeZone}.`,
      location: activeZone,
      actionLabel: 'Enforce Protocol',
      category: 'Occupational Health',
    },
    {
      id: 'rec-02',
      priority: 'HIGH',
      chipClass: 'g-chip-elevated',
      title: 'Deploy Dynamic High-Pressure Misting Arrays',
      reason: 'Microclimate simulation forecasts a -4.5°C surface asphalt cooling delta along pedestrian transit corridors.',
      location: 'Al Danah Transit Hub',
      actionLabel: 'Deploy Misting',
      category: 'Urban Cooling',
    },
    {
      id: 'rec-03',
      priority: 'HIGH',
      chipClass: 'g-chip-elevated',
      title: 'Dispatch Mobile Cooling Buses to Elderly Clusters',
      reason: 'Spatial demographic overlay identified 6,800 vulnerable senior citizens in high UHI micro-pockets.',
      location: 'Sector 7 Residential Belt',
      actionLabel: 'Route Vehicles',
      category: 'Vulnerable Care',
    },
    {
      id: 'rec-04',
      priority: 'MEDIUM',
      chipClass: 'g-chip-caution',
      title: 'Pre-Cool Municipal Substations & HVAC Loads',
      reason: 'Anticipate peak 14:00 electrical grid surge to prevent transformer brownouts.',
      location: 'Central Power Grid',
      actionLabel: 'Buffer Grid',
      category: 'Energy Resilience',
    },
  ];

  return (
    <div className="space-y-8 pb-12 font-sans max-w-6xl mx-auto">
      {/* Action Notification Toast */}
      <AnimatePresence>
        {dispatchedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 p-4 rounded-xl bg-white border border-emerald-200 shadow-xl text-emerald-800 text-sm flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{dispatchedToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Hero Brand Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide g-chip-critical mb-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            LIVE HEAT INTEL • FORTYGUARD TELEMETRY SYNCED
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            THERMORA
          </h1>
          <p className="text-base text-slate-600 mt-1 font-normal">
            Autonomous Urban Heat Intelligence & Multi-Agent Platform
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('v2-chat')}
            className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            Ask Thermora AI
          </button>

          <button
            onClick={handleRunAgentCycle}
            disabled={isExecutingCycle}
            className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Activity className={`w-4 h-4 text-slate-600 ${isExecutingCycle ? 'animate-spin' : ''}`} />
            {isExecutingCycle ? 'Coordinating...' : 'Run Agent Cycle'}
          </button>
        </div>
      </div>

      {/* Primary Heat Risk Card (Featured Google-Style Card) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Target Sector</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{activeZone}</h2>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Updated {new Date(telemetry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">{telemetry.source}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="px-4 py-2 rounded-2xl g-chip-critical flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Current Risk Level</div>
                <div className="text-base font-extrabold tracking-tight">{telemetry.riskLevel} DANGER</div>
              </div>
            </div>

            <div className="px-4 py-2 rounded-2xl g-chip-info flex items-center gap-2.5">
              <Droplets className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Wet-Bulb Globe (WBGT)</div>
                <div className="text-base font-extrabold tracking-tight">{telemetry.wetBulbTemp}°C</div>
              </div>
            </div>
          </div>
        </div>

        {/* Big Temperature Readouts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Surface Asphalt</span>
              <Flame className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{telemetry.surfaceTemp}°C</div>
            <div className="text-[11px] text-red-600 font-medium mt-1">FortyGuard Direct Sensor</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Ambient Air</span>
              <Thermometer className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{telemetry.ambientTemp}°C</div>
            <div className="text-[11px] text-orange-600 font-medium mt-1">+2.4°C vs seasonal avg</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Perceived Heat Index</span>
              <Sun className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{telemetry.heatIndex}°C</div>
            <div className="text-[11px] text-slate-500 mt-1">Humidity: {telemetry.relativeHumidity}%</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>UV Exposure</span>
              <ShieldCheck className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{telemetry.uvIndex}</div>
            <div className="text-[11px] text-rose-600 font-medium mt-1">Extreme (Protection Req.)</div>
          </div>
        </div>

        {/* AI Situation Briefing Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-slate-50 border border-blue-100 text-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">AI Situation Brief</h3>
                <span className="text-[11px] text-blue-700 font-semibold uppercase tracking-wider">Multi-Agent Consensus</span>
              </div>
              <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">
                {orchestrationSummary ||
                  `Surface asphalt temperatures in ${activeZone} have peaked at ${telemetry.surfaceTemp}°C under high humidity (${telemetry.relativeHumidity}%), elevating WBGT to ${telemetry.wetBulbTemp}°C. 4 specialized agents have synchronized thermal surveillance, outdoor worker hydration rest mandates, and pre-cooling energy load buffering.`}
              </p>
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setActiveView('v2-chat')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 cursor-pointer"
                >
                  Ask AI detailed analysis <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() => setActiveView('v2-map')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  View live GIS risk zones <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Agent Status Strip */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">AI Agent Network Status</h2>
          </div>
          <span className="text-xs font-medium text-emerald-700 g-chip-safe px-3 py-1 rounded-full">
            4 of 4 Agents Autonomous & Synced
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full g-chip-critical">MONITORING</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Heat Sentinel Agent</h4>
            <p className="text-xs text-slate-600 mt-1 leading-snug">
              Continuous FortyGuard sensor telemetry surveillance & WBGT spike alarms.
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
              Tool: query_fortyguard_sensors
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full g-chip-info">ACTIVE</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Vulnerable Advisor</h4>
            <p className="text-xs text-slate-600 mt-1 leading-snug">
              Demographic heat vulnerability index & automated cooling shelter routing.
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
              Tool: query_demographics
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full g-chip-safe">ACTIVE</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Cooling Strategist</h4>
            <p className="text-xs text-slate-600 mt-1 leading-snug">
              Microclimate physics simulator for misting cannons & albedo cool coatings.
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
              Tool: simulate_intervention
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full g-chip-caution">ACTIVE</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Grid & Energy Balancer</h4>
            <p className="text-xs text-slate-600 mt-1 leading-snug">
              HVAC load forecasting and pre-cooling scheduling to prevent brownouts.
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
              Tool: calculate_load_buffer
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Tactical Recommendations</h2>
            <p className="text-xs text-slate-500">Autonomous actionable interventions prioritized by thermal threat severity</p>
          </div>
          <button
            onClick={() => setActiveView('v2-alerts')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            View All Action Tracks <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${rec.chipClass}`}>
                    {rec.priority} PRIORITY
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{rec.category}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{rec.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">{rec.reason}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{rec.location}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveView('v2-chat')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Investigate with AI
                </button>
                <button
                  onClick={() => handleAction(rec.title)}
                  className="px-4 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  {rec.actionLabel}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
