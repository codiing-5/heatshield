import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { GeoJsonSpatialMesh, GeoJsonZoneFeature } from '../../services/heatIntelligenceApi';
import { FortyGuardNode } from '../../hooks/useFortyGuard';

interface MapLibreContainerProps {
  spatialMesh: GeoJsonSpatialMesh | null;
  sensorNodes: FortyGuardNode[];
  selectedZone: string;
  onSelectZone: (feature: GeoJsonZoneFeature) => void;
  activeLayers: string[];
}

export const MapLibreContainer: React.FC<MapLibreContainerProps> = ({
  spatialMesh,
  sensorNodes,
  selectedZone,
  onSelectZone,
  activeLayers,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize MapLibre GL map with Dark Matter style
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [54.3773, 24.4539], // Centered on Abu Dhabi urban core
      zoom: 12.5,
      pitch: 45,
      bearing: -15,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', () => {
      mapRef.current = map;

      // Add GeoJSON source for thermal risk zones
      if (spatialMesh) {
        map.addSource('thermal-zones', {
          type: 'geojson',
          data: spatialMesh as unknown as GeoJSON.GeoJSON,
        });

        // Layer 1: Thermal Polygon Fill
        map.addLayer({
          id: 'thermal-zones-fill',
          type: 'fill',
          source: 'thermal-zones',
          paint: {
            'fill-color': ['get', 'fill_color'],
            'fill-opacity': [
              'case',
              ['==', ['get', 'name'], selectedZone],
              0.65,
              0.40,
            ],
          },
        });

        // Layer 2: Thermal Polygon Borders
        map.addLayer({
          id: 'thermal-zones-line',
          type: 'line',
          source: 'thermal-zones',
          paint: {
            'line-color': '#f97316',
            'line-width': [
              'case',
              ['==', ['get', 'name'], selectedZone],
              3,
              1.5,
            ],
          },
        });

        // Interactive Click on Zones
        map.on('click', 'thermal-zones-fill', (e) => {
          if (e.features && e.features.length > 0) {
            const feat = e.features[0] as unknown as GeoJsonZoneFeature;
            onSelectZone(feat);
          }
        });

        map.on('mouseenter', 'thermal-zones-fill', () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'thermal-zones-fill', () => {
          map.getCanvas().style.cursor = '';
        });
      }
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
    };
  }, []);

  // Update source data when spatialMesh changes
  useEffect(() => {
    const map = mapRef.current;
    if (map && map.isStyleLoaded() && map.getSource('thermal-zones') && spatialMesh) {
      (map.getSource('thermal-zones') as maplibregl.GeoJSONSource).setData(
        spatialMesh as unknown as GeoJSON.GeoJSON
      );
    }
  }, [spatialMesh]);

  // Update selected zone highlight & camera fly-to
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer('thermal-zones-fill')) {
      map.setPaintProperty('thermal-zones-fill', 'fill-opacity', [
        'case',
        ['==', ['get', 'name'], selectedZone],
        0.7,
        0.35,
      ]);
    }

    if (map.getLayer('thermal-zones-line')) {
      map.setPaintProperty('thermal-zones-line', 'line-width', [
        'case',
        ['==', ['get', 'name'], selectedZone],
        3,
        1.2,
      ]);
    }

    if (spatialMesh) {
      const match = spatialMesh.features.find((f) => f.properties.name === selectedZone);
      if (match && match.geometry.coordinates[0][0]) {
        const coords = match.geometry.coordinates[0][0];
        map.flyTo({
          center: [coords[0], coords[1]],
          zoom: 13,
          duration: 1200,
          essential: true,
        });
      }
    }
  }, [selectedZone, spatialMesh]);

  // Render Sensor Node Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (activeLayers.includes('sensor-nodes')) {
      sensorNodes.forEach((node) => {
        const el = document.createElement('div');
        el.className = 'group relative flex items-center justify-center cursor-pointer';
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-red-400 opacity-75"></span>
            <div class="relative w-4 h-4 rounded-full bg-gradient-to-br from-orange-500 to-red-600 border-2 border-white shadow-lg flex items-center justify-center text-[8px] font-bold text-white">
              •
            </div>
            <div class="absolute bottom-6 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
              <div class="bg-slate-900 border border-slate-700 text-slate-100 text-[10px] font-mono px-2 py-1 rounded shadow-xl whitespace-nowrap">
                <strong>${node.node_id}</strong>: ${node.surface_temp_c}°C
              </div>
            </div>
          </div>
        `;

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([node.coordinates[1], node.coordinates[0]])
          .addTo(map);

        markersRef.current.push(marker);
      });
    }
  }, [sensorNodes, activeLayers]);

  // Toggle Layer Visibilities
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const showSurface = activeLayers.includes('surface-temp');
    if (map.getLayer('thermal-zones-fill')) {
      map.setLayoutProperty('thermal-zones-fill', 'visibility', showSurface ? 'visible' : 'none');
    }
    if (map.getLayer('thermal-zones-line')) {
      map.setLayoutProperty('thermal-zones-line', 'visibility', showSurface ? 'visible' : 'none');
    }
  }, [activeLayers]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full min-h-[520px]" />
    </div>
  );
};
