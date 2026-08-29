import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Thermometer, 
  Droplets, 
  Sun, 
  AlertTriangle, 
  Bot, 
  Layers, 
  ShieldCheck, 
  ArrowUpRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Radio,
  Siren
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const CommandCenterView: React.FC = () => {
  const { telemetry, agentActivities, alerts, setActiveView, activeZone } = useApp();
  const [dispatchedAction, setDispatchedAction] = useState<string | null>(null);

  const triggerQuickAction = (actionName: string) => {
    setDispatchedAction(actionName);
    setTimeout(() => setDispatchedAction(null), 3500);
  };

  const metrics = [
    {
      label: 'Ambient Air Temp',
      value: `${telemetry.ambientTemp}°C`,
      delta: '+2.4°C vs seasonal avg',
      icon: Thermometer,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20',
      status: 'Dangerous Range',
    },
    {
      label: 'Surface Asphalt Temp',
      value: `${telemetry.surfaceTemp}°C`,
      delta: 'Peak Urban Heat Island',
      icon: Flame,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
      status: 'FortyGuard Direct Sensor',
    },
    {
      label: 'Wet-Bulb Temp (WBGT)',
      value: `${telemetry.wetBulbTemp}°C`,
      delta: 'Severe Physiological Strain',
      icon: Droplets,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
      status: 'Threshold >31°C Exceeded',
    },
    {
      label: 'Perceived Heat Index',
      value: `${telemetry.heatIndex}°C`,
      delta: 'Extreme Caution Zone',
      icon: Sun,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      status: `Humidity: ${telemetry.relativeHumidity}%`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Action Notification Banner */}
      <AnimatePresence>
        {dispatchedAction && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-lg backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>
                <strong>Action Dispatched: </strong>{dispatchedAction} in <strong>{activeZone}</strong>
              </span>
            </div>
            <span className="text-[10px] text-emerald-400/80">Synchronized across 4 Agents</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner / Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel-glow rounded-3xl p-8 relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> FortyGuard Intelligence Feed Active • {telemetry.source}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Real-Time Urban Heat Command Center
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Monitoring high-risk thermal microclimates across municipal sectors. Multi-agent sentinel workflows 
              are dynamically orchestrating shade deployment, cooling shelter routing, and outdoor labor safety protocols.
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col gap-3 min-w-[220px]">
            <Button 
              variant="primary" 
              className="w-full justify-between"
              onClick={() => setActiveView('agent-studio')}
            >
              <span>Dispatch Agent Workflows</span>
              <ArrowUpRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => setActiveView('gis-map')}
            >
              <span>Explore GIS Heat Map</span>
              <Layers className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 4 Primary Microclimate Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
            >
              <Card className="p-5 h-full flex flex-col justify-between hover:border-orange-500/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl border ${m.bg} ${m.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {m.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">{m.label}</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-mono tracking-tight">
                    {m.value}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-orange-400/90 font-mono">
                  {m.delta}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Tactical Action Triggers */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-orange-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Immediate Tactical Intervention Dispatchers
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Target: {activeZone}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => triggerQuickAction('Atomized Transit Misting Cannons')}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-left transition-all text-xs flex flex-col justify-between h-20"
          >
            <div className="flex items-center justify-between">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span className="text-[9px] font-mono text-slate-500">MIST-01</span>
            </div>
            <span className="font-semibold text-slate-200">Deploy Misting Cannons</span>
          </button>

          <button
            type="button"
            onClick={() => triggerQuickAction('Targeted Senior & Worker SMS Broadcast')}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-red-500/40 text-left transition-all text-xs flex flex-col justify-between h-20"
          >
            <div className="flex items-center justify-between">
              <Siren className="w-4 h-4 text-red-400" />
              <span className="text-[9px] font-mono text-slate-500">SMS-ALERT</span>
            </div>
            <span className="font-semibold text-slate-200">Broadcast Shelter SMS</span>
          </button>

          <button
            type="button"
            onClick={() => triggerQuickAction('Mandatory 15/45 Labor Rest Rotation')}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/40 text-left transition-all text-xs flex flex-col justify-between h-20"
          >
            <div className="flex items-center justify-between">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              <span className="text-[9px] font-mono text-slate-500">OSHA-REST</span>
            </div>
            <span className="font-semibold text-slate-200">Enforce Rest Mandate</span>
          </button>

          <button
            type="button"
            onClick={() => triggerQuickAction('Municipal Building HVAC Pre-Cooling')}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition-all text-xs flex flex-col justify-between h-20"
          >
            <div className="flex items-center justify-between">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-[9px] font-mono text-slate-500">GRID-SHED</span>
            </div>
            <span className="font-semibold text-slate-200">Pre-Cool Power Grid</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Live Heat Alerts & Active Agent Interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Real-time Heat Alerts */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle>Active Heat Stress Advisories</CardTitle>
                    <CardDescription>Generated from FortyGuard microclimate anomaly triggers</CardDescription>
                  </div>
                </div>
                <Badge variant="danger">{alerts.length} Critical Alerts</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/90 flex flex-col gap-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge riskLevel={alert.level}>{alert.level}</Badge>
                      <span className="text-sm font-bold text-white">{alert.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{alert.timestamp}</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    <strong className="text-slate-400 font-normal">Zone: </strong>
                    <span className="text-slate-200 font-semibold">{alert.zone}</span> •{' '}
                    <span className="text-orange-400">{alert.affectedPopulation}</span>
                  </div>
                  <div className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 font-mono">
                    💡 <strong className="text-orange-300 font-semibold">Recommended Intervention: </strong>
                    {alert.recommendation}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right 5 cols: Multi-Agent Dispatch Activity */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle>Autonomous Agent Feed</CardTitle>
                    <CardDescription>Live multi-agent decision reasoning</CardDescription>
                  </div>
                </div>
                <Badge variant="success">All Agents Synced</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {agentActivities.slice(0, 3).map((activity) => (
                <div
                  key={activity.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{activity.agentName}</span>
                    <span className="text-[10px] font-mono text-slate-400">{activity.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300">{activity.action}</p>
                  <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Target: {activity.targetZone}</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
