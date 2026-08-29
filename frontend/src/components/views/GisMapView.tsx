import React, { useState, useEffect } from 'react';
import { 
  Map as MapIcon, 
  Layers, 
  Eye, 
  EyeOff, 
  Flame, 
  Compass, 
  Info, 
  Maximize2, 
  Filter, 
  ThermometerSnowflake, 
  Trees,
  Radio
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { heatIntelligenceApi, GeoJsonSpatialMesh, GeoJsonZoneFeature } from '../../services/heatIntelligenceApi';
import { useFortyGuard } from '../../hooks/useFortyGuard';
import { MapLibreContainer } from '../map/MapLibreContainer';

export const GisMapView: React.FC = () => {
  const { activeZone, setActiveZone } = useApp();
  const { nodes: sensorNodes } = useFortyGuard();
  const [spatialMesh, setSpatialMesh] = useState<GeoJsonSpatialMesh | null>(null);
  const [selectedZoneFeature, setSelectedZoneFeature] = useState<GeoJsonZoneFeature | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeLayers, setActiveLayers] = useState<string[]>([
    'surface-temp',
    'sensor-nodes',
    'cooling-shelters',
  ]);

  useEffect(() => {
    async function loadMesh() {
      try {
        const data = await heatIntelligenceApi.getSpatialThermalMesh();
        setSpatialMesh(data);
        if (data.features.length > 0) {
          const match = data.features.find((f) => f.properties.name === activeZone) || data.features[0];
          setSelectedZoneFeature(match);
        }
      } catch (err) {
        console.error('Failed to load spatial mesh:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMesh();
  }, [activeZone]);

  const toggleLayer = (id: string) => {
    setActiveLayers((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const layersList = [
    { id: 'surface-temp', name: 'FortyGuard Surface Thermal Mesh', icon: Flame, color: 'text-red-400' },
    { id: 'sensor-nodes', name: 'FortyGuard IoT Sensor Pins', icon: Compass, color: 'text-blue-400' },
    { id: 'cooling-shelters', name: 'Emergency Cooling Centers & Misters', icon: ThermometerSnowflake, color: 'text-cyan-400' },
    { id: 'canopy-cover', name: 'Urban Canopy & Shade Density', icon: Trees, color: 'text-emerald-400' },
    { id: 'vulnerability-index', name: 'Social Vulnerability Heat Index', icon: Filter, color: 'text-amber-400' },
  ];

  const handleZoneSelect = (feature: GeoJsonZoneFeature) => {
    setSelectedZoneFeature(feature);
    setActiveZone(feature.properties.name);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <MapIcon className="w-6 h-6 text-orange-400" />
            GIS Geospatial Heat Intelligence Map
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            MapLibre GL Vector Engine • GeoJSON Thermal Mesh • Real-Time Sensor Pins
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="thermal" className="font-mono text-xs">
            {spatialMesh?.features.length || 6} Municipal Sectors • {sensorNodes.length} Sensor Nodes
          </Badge>
          <Button variant="outline" size="sm">
            <Maximize2 className="w-3.5 h-3.5" /> Fullscreen GIS
          </Button>
        </div>
      </div>

      {/* Main Layout: Map Canvas + Spatial Inspector Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Canvas Container (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative h-[600px] rounded-3xl overflow-hidden glass-panel border border-slate-800 flex flex-col justify-between p-4">
            {/* Embedded MapLibre GL Map */}
            <div className="absolute inset-0">
              <MapLibreContainer
                spatialMesh={spatialMesh}
                sensorNodes={sensorNodes}
                selectedZone={activeZone}
                onSelectZone={handleZoneSelect}
                activeLayers={activeLayers}
              />
            </div>

            {/* Top Overlay inside Map */}
            <div className="relative z-20 flex items-center justify-between pointer-events-auto">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md text-xs font-mono text-slate-200">
                Active Zone: <strong className="text-orange-400">{activeZone}</strong>
              </div>
              <div className="flex items-center gap-2">
                <Badge riskLevel={selectedZoneFeature?.properties.risk_level || 'EXTREME'}>
                  {selectedZoneFeature?.properties.risk_level || 'EXTREME'} RISK
                </Badge>
              </div>
            </div>

            {/* Bottom Legend Overlay */}
            <div className="relative z-20 bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-400">Thermal Scale:</span>
                <div className="flex items-center gap-1">
                  <span className="w-5 h-3 rounded bg-emerald-500 inline-block" title="< 28°C Optimal" />
                  <span className="w-5 h-3 rounded bg-amber-500 inline-block" title="28°C - 35°C Moderate" />
                  <span className="w-5 h-3 rounded bg-orange-500 inline-block" title="35°C - 42°C High" />
                  <span className="w-5 h-3 rounded bg-red-500 inline-block" title="42°C - 48°C Extreme" />
                  <span className="w-5 h-3 rounded bg-rose-700 inline-block" title="> 48°C Critical" />
                </div>
                <span className="text-slate-400 ml-2">25°C ➔ 50°C+</span>
              </div>

              <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                {activeLayers.length} Layers Enabled • {loading ? 'Loading...' : 'MapLibre GL Vector Active'}
              </span>
            </div>
          </div>
        </div>

        {/* GIS Layer Selector & Zone Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-400" />
                <CardTitle className="text-base">Spatial GIS Layers</CardTitle>
              </div>
              <CardDescription>Toggle raster heat meshes & sensor nodes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {layersList.map((layer) => {
                const Icon = layer.icon;
                const isEnabled = activeLayers.includes(layer.id);
                return (
                  <button
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                      isEnabled
                        ? 'bg-slate-900/90 border-orange-500/30 text-white'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isEnabled ? layer.color : 'text-slate-600'}`} />
                      <span className="font-medium text-left">{layer.name}</span>
                    </div>
                    {isEnabled ? (
                      <Eye className="w-4 h-4 text-orange-400" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Microclimate Zone Telemetry Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                <CardTitle className="text-base">Zone Inspector</CardTitle>
              </div>
              <CardDescription>
                {selectedZoneFeature ? selectedZoneFeature.properties.name : 'Selected Polygon Telemetry'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 font-mono text-xs">
              {selectedZoneFeature ? (
                <>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Sensor Node:</span>
                    <span className="text-orange-400 font-semibold">{selectedZoneFeature.properties.sensor_node}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Surface Temp (FortyGuard):</span>
                    <span className="text-red-400 font-bold">{selectedZoneFeature.properties.surface_temp_c}°C</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Calculated WBGT:</span>
                    <span className="text-orange-300 font-bold">{selectedZoneFeature.properties.wbgt_c}°C</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Canopy Deficit:</span>
                    <span className="text-amber-400 font-semibold">-{selectedZoneFeature.properties.canopy_deficit_pct}%</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Albedo Factor:</span>
                    <span className="text-slate-300 font-semibold">{selectedZoneFeature.properties.albedo_index}</span>
                  </div>
                  <div className="pt-2">
                    <div className="text-[11px] text-slate-400">Identified Threat:</div>
                    <div className="text-slate-200 mt-0.5 text-[11px] leading-tight font-sans">
                      {selectedZoneFeature.properties.threat}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 font-sans text-[11px] text-orange-300">
                    💡 <strong>Action: </strong>{selectedZoneFeature.properties.action}
                  </div>
                </>
              ) : (
                <p className="text-slate-400">Select a zone polygon to view telemetry.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
