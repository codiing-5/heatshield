import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Legend
} from 'recharts';
import { 
  LineChart as LineChartIcon, 
  TrendingUp, 
  Cpu, 
  Sparkles,
  Zap,
  Droplets,
  Trees,
  Sliders
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { mlApi, ForecastResponse, MitigationResult } from '../../services/mlApi';
import { useApp } from '../../context/AppContext';

export const AnalyticsView: React.FC = () => {
  const { telemetry, activeZone } = useApp();
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);

  // Simulation Sliders
  const [albedoDelta, setAlbedoDelta] = useState<number>(0.35);
  const [canopyDelta, setCanopyDelta] = useState<number>(25);
  const [mistingCoverage, setMistingCoverage] = useState<number>(40);
  const [trafficReduction, setTrafficReduction] = useState<number>(20);
  const [simResult, setSimResult] = useState<MitigationResult | null>(null);

  useEffect(() => {
    async function loadForecast() {
      try {
        const data = await mlApi.getForecast(
          activeZone,
          telemetry.ambientTemp,
          telemetry.surfaceTemp,
          telemetry.relativeHumidity
        );
        setForecast(data);
      } catch (err) {
        console.error('Forecast error:', err);
      }
    }
    loadForecast();
  }, [activeZone, telemetry]);

  const runSimulation = useCallback(async () => {
    try {
      const res = await mlApi.simulateMitigation({
        baseline_surface_c: telemetry.surfaceTemp,
        baseline_ambient_c: telemetry.ambientTemp,
        cool_roof_albedo_delta: albedoDelta,
        canopy_coverage_delta_pct: canopyDelta,
        misting_arrays_active_pct: mistingCoverage,
        traffic_reduction_pct: trafficReduction,
      });
      setSimResult(res);
    } catch (err) {
      console.error('Simulation error:', err);
    }
  }, [albedoDelta, canopyDelta, mistingCoverage, trafficReduction, telemetry]);

  useEffect(() => {
    runSimulation();
  }, [runSimulation]);

  const forecastChartData = forecast?.forecast_points.map((pt) => ({
    time: pt.timestamp_offset,
    surface: pt.predicted_surface_c,
    ambient: pt.predicted_ambient_c,
    wbgt: pt.predicted_wbgt_c,
    lower: pt.confidence_lower_c,
    upper: pt.confidence_upper_c,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <LineChartIcon className="w-6 h-6 text-orange-400" />
            Predictive ML Analytics & Thermal Mitigation Studio
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            FortyGuard Neural Microclimate Forecaster • Multi-Horizon Prediction • Physics-Guided Intervention Sandbox
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="thermal" className="font-mono text-xs">
            Model: FortyGuard-NeuralMicroclimate-v2 (R² = 0.94)
          </Badge>
        </div>
      </div>

      {/* Main Chart 1: ML Multi-Horizon Forecast Curves */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-orange-400" />
                ML Microclimate Multi-Horizon Forecast (Next 24 Hours)
              </CardTitle>
              <CardDescription>
                Forecast for {activeZone} with confidence intervals and critical WBGT thresholds
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="danger" className="font-mono text-[10px]">
                Trend: {forecast?.trend_direction || 'CALCULATING'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={forecastChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="°C" domain={[24, 55]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                <ReferenceLine 
                  y={31.0} 
                  label={{ value: 'Critical WBGT (31°C)', fill: '#ef4444', fontSize: 10, position: 'top' }} 
                  stroke="#ef4444" 
                  strokeDasharray="4 4" 
                />
                <Line 
                  type="monotone" 
                  dataKey="surface" 
                  name="Predicted FortyGuard Surface" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#ef4444' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="ambient" 
                  name="Predicted Ambient Air" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#f97316' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="wbgt" 
                  name="Predicted WBGT" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#06b6d4' }} 
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Urban Cooling Mitigation Simulation Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 cols: Interactive Mitigation Control Sliders */}
        <div className="lg:col-span-6 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-orange-400" />
                <CardTitle className="text-base">Microclimate Intervention Controls</CardTitle>
              </div>
              <CardDescription>Adjust mitigation levers to simulate cooling impact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Slider 1: Cool Roof Albedo */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Cool Roof / Pavement Albedo
                  </span>
                  <span className="text-orange-400 font-bold">+{albedoDelta} Albedo</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.6"
                  step="0.05"
                  value={albedoDelta}
                  onChange={(e) => setAlbedoDelta(parseFloat(e.target.value))}
                  className="w-full accent-orange-500 bg-slate-800 rounded-lg h-2"
                />
              </div>

              {/* Slider 2: Tree Canopy */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Trees className="w-3.5 h-3.5 text-emerald-400" /> Urban Tree Canopy Expansion
                  </span>
                  <span className="text-emerald-400 font-bold">+{canopyDelta}% Shade</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={canopyDelta}
                  onChange={(e) => setCanopyDelta(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2"
                />
              </div>

              {/* Slider 3: Misting Arrays */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Public Transit Misting Cannons
                  </span>
                  <span className="text-cyan-400 font-bold">{mistingCoverage}% Coverage</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={mistingCoverage}
                  onChange={(e) => setMistingCoverage(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 rounded-lg h-2"
                />
              </div>

              {/* Slider 4: Traffic Diversion */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Peak Hour Traffic Restriction
                  </span>
                  <span className="text-amber-400 font-bold">{trafficReduction}% Diversion</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={trafficReduction}
                  onChange={(e) => setTrafficReduction(parseInt(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 rounded-lg h-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 6 cols: ML Quantified Impact Results */}
        <div className="lg:col-span-6 space-y-4">
          <Card glow>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <CardTitle className="text-base">ML Simulated Cooling Impact</CardTitle>
                </div>
                <Badge variant="success">Feasibility: {simResult ? `${Math.round(simResult.intervention_feasibility_score * 100)}%` : '92%'}</Badge>
              </div>
              <CardDescription>Predicted physiological & municipal relief deltas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {simResult ? (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 font-mono">Surface ΔT</div>
                      <div className="text-xl font-extrabold text-red-400 mt-1">-{simResult.surface_temp_reduction_c}°C</div>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5">{simResult.post_intervention_surface_c}°C Post</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 font-mono">Ambient Air ΔT</div>
                      <div className="text-xl font-extrabold text-orange-400 mt-1">-{simResult.ambient_temp_reduction_c}°C</div>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5">{simResult.post_intervention_ambient_c}°C Post</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 font-mono">WBGT Relief ΔT</div>
                      <div className="text-xl font-extrabold text-emerald-400 mt-1">-{simResult.wbgt_reduction_c}°C</div>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5">{simResult.post_intervention_wbgt_c}°C Post</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 font-mono text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Heat-Stroke Risk Mitigation:</span>
                      <span className="text-emerald-400 font-bold">+{simResult.heat_stroke_risk_mitigation_pct}% Safer</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Municipal HVAC Load Reduction:</span>
                      <span className="text-amber-400 font-bold">~{simResult.estimated_hvac_energy_savings_pct}% Power Saved</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-300 leading-relaxed font-sans">
                    💡 <strong>AI Recommendation: </strong>
                    {simResult.primary_recommendation}
                  </div>
                </>
              ) : (
                <p className="text-slate-400">Simulating intervention...</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
