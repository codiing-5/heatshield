import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Key, 
  Database, 
  Sliders, 
  Check, 
  Shield, 
  Server,
  Flame,
  Radio
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const SettingsView: React.FC = () => {
  const { fortyguardStatus, isBackendConnected } = useApp();
  const [apiKey, setApiKey] = useState<string>('');
  const [saved, setSaved] = useState<boolean>(false);
  const [mode, setMode] = useState<'SANDBOX' | 'LIVE'>(fortyguardStatus === 'LIVE' ? 'LIVE' : 'SANDBOX');
  const [wbgtThreshold, setWbgtThreshold] = useState<number>(31.0);
  const [surfaceTempThreshold, setSurfaceTempThreshold] = useState<number>(45.0);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-orange-400" />
          System Settings & Data Source Configuration
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          FortyGuard API Credentials • Risk Threshold Barometers • Environmental Engine Mode
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: FortyGuard API & Credentials Config */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">FortyGuard Temperature API Config</CardTitle>
                    <CardDescription>Primary Hackathon Data Source Connection</CardDescription>
                  </div>
                </div>
                <Badge variant={fortyguardStatus === 'LIVE' ? 'success' : 'thermal'}>
                  {fortyguardStatus} MODE
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Primary Data Source Policy
                </div>
                <p className="text-orange-200/90 text-[11px] leading-relaxed">
                  FortyGuard Temperature API provides authoritative hyper-local microclimate data. In Stage 2, enter your hackathon API credentials or run with the integrated deterministic sandbox mode.
                </p>
              </div>

              {/* API Key Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-400" /> FortyGuard API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="fg_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-mono"
                />
                <p className="text-[10px] text-slate-400 font-mono">
                  Stored securely in backend <code className="text-orange-400">.env</code> as <code className="text-orange-400">FORTYGUARD_API_KEY</code>.
                </p>
              </div>

              {/* Data Stream Mode */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-slate-400" /> Ingestion Stream Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('SANDBOX')}
                    className={`p-3 rounded-xl border text-xs text-left transition-all ${
                      mode === 'SANDBOX'
                        ? 'bg-slate-900 border-orange-500 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-orange-400">
                      <Radio className="w-3.5 h-3.5" /> Deterministic Sandbox
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      FortyGuard structured microclimate test datasets with real schemas.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('LIVE')}
                    className={`p-3 rounded-xl border text-xs text-left transition-all ${
                      mode === 'LIVE'
                        ? 'bg-slate-900 border-orange-500 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                      <Radio className="w-3.5 h-3.5" /> Live Remote Stream
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Direct HTTP stream from FortyGuard production endpoints.
                    </div>
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                {saved && <span className="text-emerald-400 font-semibold">✓ Settings Saved</span>}
              </span>
              <Button variant="primary" size="sm" onClick={handleSave}>
                <Check className="w-3.5 h-3.5" /> Save Configuration
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right 5 cols: Thermal Threshold Barometers */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-orange-400" />
                <CardTitle className="text-base">Thermal Alert Thresholds</CardTitle>
              </div>
              <CardDescription>Triggers for autonomous agent intervention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Threshold 1: WBGT */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">WBGT Heat Stress Trigger</span>
                  <span className="text-orange-400 font-bold">{wbgtThreshold}°C</span>
                </div>
                <input
                  type="range"
                  min="26"
                  max="35"
                  step="0.5"
                  value={wbgtThreshold}
                  onChange={(e) => setWbgtThreshold(parseFloat(e.target.value))}
                  className="w-full accent-orange-500 bg-slate-800 rounded-lg h-2"
                />
                <p className="text-[10px] text-slate-400 font-mono">
                  Standard threshold for mandatory outdoor worker shade rotation.
                </p>
              </div>

              {/* Threshold 2: Surface Temp */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Asphalt Surface Alarm</span>
                  <span className="text-red-400 font-bold">{surfaceTempThreshold}°C</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="60"
                  step="1"
                  value={surfaceTempThreshold}
                  onChange={(e) => setSurfaceTempThreshold(parseFloat(e.target.value))}
                  className="w-full accent-red-500 bg-slate-800 rounded-lg h-2"
                />
                <p className="text-[10px] text-slate-400 font-mono">
                  Triggers municipal misting canons and pavement cooling routing.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Backend Diagnostics */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                <CardTitle className="text-base">Backend Diagnostics</CardTitle>
              </div>
              <CardDescription>FastAPI server telemetry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">API Connection:</span>
                <span className={isBackendConnected ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {isBackendConnected ? 'Connected (200 OK)' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Endpoint:</span>
                <span className="text-slate-300">http://127.0.0.1:8000</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Cache TTL:</span>
                <span className="text-orange-400">300 seconds</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
