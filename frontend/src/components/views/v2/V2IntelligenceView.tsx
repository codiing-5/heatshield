import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  Calculator,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { heatIntelligenceApi, ThermalCalculationResult } from '../../../services/heatIntelligenceApi';
import { mlApi, ForecastResponse } from '../../../services/mlApi';
import { API_BASE_URL } from '../../../services/apiConfig';

const DEFAULT_DIURNAL_POINTS = [
  { time: '00:00', ambient_c: 30.5, surface_c: 31.2, wbgt_c: 25.2 },
  { time: '02:00', ambient_c: 29.8, surface_c: 29.5, wbgt_c: 24.6 },
  { time: '04:00', ambient_c: 28.9, surface_c: 28.1, wbgt_c: 23.8 },
  { time: '06:00', ambient_c: 29.4, surface_c: 28.9, wbgt_c: 24.3 },
  { time: '08:00', ambient_c: 33.1, surface_c: 35.6, wbgt_c: 26.9 },
  { time: '10:00', ambient_c: 36.8, surface_c: 42.4, wbgt_c: 29.5 },
  { time: '12:00', ambient_c: 39.8, surface_c: 49.2, wbgt_c: 32.2 },
  { time: '14:00', ambient_c: 41.6, surface_c: 52.1, wbgt_c: 33.5 },
  { time: '16:00', ambient_c: 40.2, surface_c: 49.8, wbgt_c: 32.7 },
  { time: '18:00', ambient_c: 37.1, surface_c: 42.8, wbgt_c: 30.1 },
  { time: '20:00', ambient_c: 34.3, surface_c: 37.9, wbgt_c: 28.4 },
  { time: '22:00', ambient_c: 32.2, surface_c: 34.8, wbgt_c: 26.9 },
];

const mapDiurnalPoints = (points: any[]) => {
  if (!Array.isArray(points) || points.length === 0) return DEFAULT_DIURNAL_POINTS;
  return points.map((p, idx) => ({
    time: p.time || (p.hour !== undefined ? `${String(p.hour).padStart(2, '0')}:00` : `+${idx * 2}h`),
    surface_c: Number(p.surface_c ?? p.surface_temp_c ?? p.surfaceTemp ?? 35),
    ambient_c: Number(p.ambient_c ?? p.ambient_temp_c ?? p.ambientTemp ?? 30),
    wbgt_c: Number(p.wbgt_c ?? p.wet_bulb_temp_c ?? p.wetBulbTemp ?? 26),
  }));
};

export const V2IntelligenceView: React.FC = () => {
  const { telemetry, activeZone } = useApp();
  const [diurnalData, setDiurnalData] = useState<any[]>(DEFAULT_DIURNAL_POINTS);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);

  // Calculator State
  const [calcAmbient, setCalcAmbient] = useState<number>(39.5);
  const [calcHumidity, setCalcHumidity] = useState<number>(60);
  const [calcSurface, setCalcSurface] = useState<number>(49.0);
  const [calcResult, setCalcResult] = useState<ThermalCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  useEffect(() => {
    // Fetch 24-hour diurnal profile from fortyguard
    fetch(`${API_BASE_URL}/api/v1/fortyguard/diurnal`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.points) && data.points.length > 0) {
          setDiurnalData(mapDiurnalPoints(data.points));
        } else if (data && Array.isArray(data.profile) && data.profile.length > 0) {
          setDiurnalData(mapDiurnalPoints(data.profile));
        }
      })
      .catch((err) => {
        console.warn('Using default diurnal data:', err);
        setDiurnalData(DEFAULT_DIURNAL_POINTS);
      });

    // Fetch ML Forecast
    mlApi
      .getForecast(activeZone, telemetry.ambientTemp, telemetry.surfaceTemp, telemetry.relativeHumidity)
      .then((data) => setForecast(data))
      .catch(() => {});

    // Initial calculation
    handleCalculate();
  }, [activeZone]);

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const res = await heatIntelligenceApi.calculateThermalIndices({
        ambient_temp_c: calcAmbient,
        relative_humidity_pct: calcHumidity,
        surface_temp_c: calcSurface,
      });
      setCalcResult(res);
    } catch {
      setCalcResult({
        ambient_temp_c: calcAmbient,
        relative_humidity_pct: calcHumidity,
        wet_bulb_temp_c: 31.8,
        globe_temp_c: 42.1,
        wbgt_c: 32.2,
        heat_index_c: 46.8,
        utci_c: 43.5,
        humidex: 48.0,
        vapor_pressure_kpa: 4.2,
        risk_level: 'EXTREME',
        labor_work_rest_ratio: '15 min work / 45 min rest per hour',
        recommended_hydration_l_hr: 1.0,
        max_continuous_exposure_mins: 15,
        physiological_advisory: 'Severe thermal load: high risk of heat exhaustion and heat stroke.',
        calculation_timestamp: new Date().toISOString(),
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 font-sans max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 sm:pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <TrendingUp className="w-4 h-4" />
          <span>Scientific Thermal Modeling & Telemetry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Heat Intelligence & Analytics</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          ISO 7243 WBGT, NOAA Heat Index, 24-hour diurnal profiling, and multi-horizon predictive ML in {activeZone}
        </p>
      </div>

      {/* 24-Hour Diurnal Profile Chart Card */}
      <div className="p-4 sm:p-6 md:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">24-Hour Diurnal Thermal Curves</h3>
            <p className="text-xs text-slate-500 mt-0.5">Surface asphalt vs Ambient air vs WBGT heat stress thresholds</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-medium select-none">
            <span className="flex items-center gap-1.5 text-red-600 bg-red-50/80 px-2.5 py-1 rounded-full border border-red-100">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Surface Temp (°C)
            </span>
            <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-full border border-blue-100">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Ambient Air (°C)
            </span>
            <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-full border border-amber-100">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> WBGT Stress (°C)
            </span>
          </div>
        </div>

        <div className="w-full h-[300px] sm:h-[340px] min-h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={diurnalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSurface" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EA4335" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#EA4335" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorAmbient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A73E8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1A73E8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorWbgt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FBBC04" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#FBBC04" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F4" vertical={false} />
              <XAxis dataKey="time" stroke="#9AA0A6" fontSize={11} />
              <YAxis domain={['auto', 'auto']} stroke="#9AA0A6" fontSize={11} unit="°C" />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E8EAED', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                labelFormatter={(label) => `Time: ${label} Local`}
                formatter={(value: any) => [`${value}°C`]}
              />
              <Area type="monotone" dataKey="surface_c" name="Surface Asphalt" stroke="#EA4335" strokeWidth={2.5} fill="url(#colorSurface)" />
              <Area type="monotone" dataKey="ambient_c" name="Ambient Air" stroke="#1A73E8" strokeWidth={2} fill="url(#colorAmbient)" />
              <Area type="monotone" dataKey="wbgt_c" name="WBGT Stress" stroke="#FBBC04" strokeWidth={2} fill="url(#colorWbgt)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Multi-Horizon Predictive Forecast */}
      {forecast && forecast.forecast_points && (
        <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Predictive ML Multi-Horizon Forecast</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Neural microclimate forecast trained on fortyguard telemetry</p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Model: {forecast.model_name || 'FortyGuard-NeuralMicroclimate-v2'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {forecast.forecast_points.map((p, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center hover:bg-blue-50/50 transition-colors">
                <span className="text-xs font-bold text-slate-500 uppercase">+{p.horizon_hours} Hour{p.horizon_hours > 1 ? 's' : ''}</span>
                <div className="text-2xl font-extrabold text-slate-900 my-1">{p.predicted_ambient_c}°C</div>
                <div className="text-[11px] text-slate-500">Surface: {p.predicted_surface_c}°C</div>
                <div className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full g-chip-elevated">
                  WBGT: {p.predicted_wbgt_c}°C
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Thermal Stress Calculator */}
      <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Interactive ISO 7243 Thermal Stress Simulator</h3>
            <p className="text-xs text-slate-500">Simulate ambient, humidity, and surface parameters to derive OSHA work-rest ratios</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Ambient Air Temperature</span>
                <span className="font-bold text-blue-600">{calcAmbient}°C</span>
              </div>
              <input
                type="range"
                min="20"
                max="55"
                step="0.5"
                value={calcAmbient}
                onChange={(e) => setCalcAmbient(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Relative Humidity</span>
                <span className="font-bold text-blue-600">{calcHumidity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={calcHumidity}
                onChange={(e) => setCalcHumidity(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Surface Asphalt Temperature</span>
                <span className="font-bold text-red-600">{calcSurface}°C</span>
              </div>
              <input
                type="range"
                min="25"
                max="75"
                step="0.5"
                value={calcSurface}
                onChange={(e) => setCalcSurface(parseFloat(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>

            <button
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              {isCalculating ? 'Computing Physiological Load...' : 'Recalculate Indices'}
            </button>
          </div>

          {/* Results Display */}
          {calcResult && (
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Wet-Bulb Globe (WBGT)</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">{calcResult.wbgt_c}°C</div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full g-chip-critical mt-1 inline-block">
                  {calcResult.risk_level} RISK
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">NOAA Heat Index</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">{calcResult.heat_index_c}°C</div>
                <span className="text-[10px] text-slate-500">Perceived stress</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Universal Thermal (UTCI)</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">{calcResult.utci_c}°C</div>
                <span className="text-[10px] text-slate-500">Equivalent temp</span>
              </div>

              <div className="col-span-2 sm:col-span-3 p-3.5 bg-white rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-900 mb-1">
                  OSHA / ISO 7243 Recommended Work-Rest Ratio
                </div>
                <div className="text-sm font-semibold text-red-600 mb-1">
                  {calcResult.labor_work_rest_ratio}
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  {calcResult.physiological_advisory} • Recommended Electrolyte Hydration:{' '}
                  <strong>{calcResult.recommended_hydration_l_hr} L/hour</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
