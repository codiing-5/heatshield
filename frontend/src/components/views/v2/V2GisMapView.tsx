import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Layers
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useFortyGuard } from '../../../hooks/useFortyGuard';
import { MapLibreContainer } from '../../map/MapLibreContainer';
import { heatIntelligenceApi, GeoJsonSpatialMesh, GeoJsonZoneFeature } from '../../../services/heatIntelligenceApi';

export const V2GisMapView: React.FC = () => {
  const { activeZone, setActiveZone, telemetry } = useApp();
  const { nodes: sensorNodes } = useFortyGuard();
  const [spatialMesh, setSpatialMesh] = useState<GeoJsonSpatialMesh | null>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>([
    'surface-temp',
    'sensor-nodes',
    'cooling-shelters',
  ]);

  useEffect(() => {
    heatIntelligenceApi
      .getSpatialThermalMesh()
      .then((mesh) => {
        setSpatialMesh(mesh);
      })
      .catch(() => {});
  }, [activeZone]);

  const toggleLayer = (layerId: string) => {
    setActiveLayers((prev) =>
      prev.includes(layerId) ? prev.filter((id) => id !== layerId) : [...prev, layerId]
    );
  };

  const zonesList = [
    'Sector 7 - Downtown Core',
    'Al Danah Residential Corridor',
    'Industrial Zone 4',
    'Corniche Coastal Belt',
    'Central Public Transit Terminal',
  ];

  return (
    <div className="space-y-6 pb-12 font-sans max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4" />
            <span>High-Resolution GIS Microclimate Mesh</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Geospatial Heat Risk Map</h1>
          <p className="text-sm text-slate-600 mt-1">
            Spatial thermal interpolation (IDW) grounded in FortyGuard sensor fleet coordinates
          </p>
        </div>

        {/* Target Zone Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Focus Sector:</span>
          <select
            value={activeZone}
            onChange={(e) => setActiveZone(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
          >
            {zonesList.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Card Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
        {/* Floating Layer Controls */}
        <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-md flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-700 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-600" /> Layers:
          </span>
          <button
            onClick={() => toggleLayer('surface-temp')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              activeLayers.includes('surface-temp')
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Thermal Mesh
          </button>
          <button
            onClick={() => toggleLayer('sensor-nodes')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              activeLayers.includes('sensor-nodes')
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            FortyGuard Nodes
          </button>
          <button
            onClick={() => toggleLayer('cooling-shelters')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              activeLayers.includes('cooling-shelters')
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Cooling Shelters
          </button>
        </div>

        {/* Map View Canvas */}
        <div className="h-[520px] w-full">
          <MapLibreContainer
            spatialMesh={spatialMesh}
            sensorNodes={sensorNodes}
            selectedZone={activeZone}
            onSelectZone={(f: GeoJsonZoneFeature) => setActiveZone(f.properties.name)}
            activeLayers={activeLayers}
          />
        </div>

        {/* Bottom Floating Zone Inspector Card */}
        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{activeZone}</h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full g-chip-critical">
                  EXTREME UHI
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Surface Asphalt: <strong>{telemetry.surfaceTemp}°C</strong> • Ambient Air: <strong>{telemetry.ambientTemp}°C</strong> • WBGT:{' '}
                <strong>{telemetry.wetBulbTemp}°C</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right text-xs">
                <span className="text-slate-500">Vegetative Canopy Deficit:</span>{' '}
                <strong className="text-rose-600">42%</strong>
              </div>
              <span className="text-slate-300">|</span>
              <div className="text-right text-xs">
                <span className="text-slate-500">Surface Albedo Index:</span>{' '}
                <strong className="text-slate-700">0.14</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
