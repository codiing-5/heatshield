from datetime import datetime, timezone
from typing import List
from app.schemas.fortyguard import (
    SensorNode,
    UrbanHeatIslandIndex,
    DiurnalPoint,
    FortyGuardTelemetrySummary,
    ProvenanceMetadata,
    NodeCollectionResponse,
    DiurnalProfileResponse,
)

# Reference Base Coordinates (Abu Dhabi / Dubai Arid Urban Core)
BASE_LAT = 24.4539
BASE_LNG = 54.3773

SANDBOX_SENSOR_NODES: List[SensorNode] = [
    SensorNode(
        node_id="FG-772",
        zone_name="Sector 7 - Downtown Core",
        coordinates=(24.4539, 54.3773),
        surface_temp_c=48.2,
        ambient_temp_c=38.6,
        relative_humidity_pct=62.0,
        wet_bulb_temp_c=31.4,
        heat_index_c=45.2,
        uv_index=10.6,
        albedo_index=0.12,
        status="ONLINE",
    ),
    SensorNode(
        node_id="FG-773",
        zone_name="Sector 7 - Industrial District",
        coordinates=(24.4612, 54.3850),
        surface_temp_c=51.4,
        ambient_temp_c=39.8,
        relative_humidity_pct=58.0,
        wet_bulb_temp_c=32.2,
        heat_index_c=47.1,
        uv_index=11.0,
        albedo_index=0.10,
        status="ONLINE",
    ),
    SensorNode(
        node_id="FG-774",
        zone_name="Al Danah Residential Corridor",
        coordinates=(24.4480, 54.3690),
        surface_temp_c=43.5,
        ambient_temp_c=37.1,
        relative_humidity_pct=64.0,
        wet_bulb_temp_c=30.2,
        heat_index_c=42.8,
        uv_index=9.8,
        albedo_index=0.22,
        status="ONLINE",
    ),
    SensorNode(
        node_id="FG-775",
        zone_name="Central Public Transit Terminal",
        coordinates=(24.4570, 54.3720),
        surface_temp_c=49.1,
        ambient_temp_c=38.9,
        relative_humidity_pct=60.0,
        wet_bulb_temp_c=31.6,
        heat_index_c=45.8,
        uv_index=10.2,
        albedo_index=0.14,
        status="ONLINE",
    ),
    SensorNode(
        node_id="FG-776",
        zone_name="Corniche Coastal Waterfront",
        coordinates=(24.4710, 54.3580),
        surface_temp_c=36.8,
        ambient_temp_c=34.5,
        relative_humidity_pct=76.0,
        wet_bulb_temp_c=29.8,
        heat_index_c=39.5,
        uv_index=9.2,
        albedo_index=0.35,
        status="ONLINE",
    ),
    SensorNode(
        node_id="FG-777",
        zone_name="Government Administrative Complex",
        coordinates=(24.4390, 54.3910),
        surface_temp_c=41.2,
        ambient_temp_c=36.4,
        relative_humidity_pct=59.0,
        wet_bulb_temp_c=29.4,
        heat_index_c=41.0,
        uv_index=9.5,
        albedo_index=0.28,
        status="ONLINE",
    ),
    SensorNode(
        node_id="FG-778",
        zone_name="Al Reem Island Mixed Use",
        coordinates=(24.4920, 54.4060),
        surface_temp_c=45.6,
        ambient_temp_c=37.8,
        relative_humidity_pct=65.0,
        wet_bulb_temp_c=31.0,
        heat_index_c=44.1,
        uv_index=10.1,
        albedo_index=0.18,
        status="ONLINE",
    ),
    SensorNode(
        node_id="FG-779",
        zone_name="Zayed Sports City & Open Fields",
        coordinates=(24.4180, 54.4530),
        surface_temp_c=42.0,
        ambient_temp_c=36.9,
        relative_humidity_pct=55.0,
        wet_bulb_temp_c=28.7,
        heat_index_c=40.2,
        uv_index=10.4,
        albedo_index=0.30,
        status="ONLINE",
    ),
]

SANDBOX_DIURNAL_POINTS: List[DiurnalPoint] = [
    DiurnalPoint(time="00:00", ambient_c=30.5, surface_c=31.2, wbgt_c=25.2),
    DiurnalPoint(time="02:00", ambient_c=29.8, surface_c=29.5, wbgt_c=24.6),
    DiurnalPoint(time="04:00", ambient_c=28.9, surface_c=28.1, wbgt_c=23.8),
    DiurnalPoint(time="06:00", ambient_c=29.4, surface_c=28.9, wbgt_c=24.3),
    DiurnalPoint(time="08:00", ambient_c=33.1, surface_c=35.6, wbgt_c=26.9),
    DiurnalPoint(time="10:00", ambient_c=36.8, surface_c=42.4, wbgt_c=29.5),
    DiurnalPoint(time="12:00", ambient_c=39.8, surface_c=49.2, wbgt_c=32.2),
    DiurnalPoint(time="14:00", ambient_c=41.6, surface_c=52.1, wbgt_c=33.5),
    DiurnalPoint(time="16:00", ambient_c=40.2, surface_c=49.8, wbgt_c=32.7),
    DiurnalPoint(time="18:00", ambient_c=37.1, surface_c=42.8, wbgt_c=30.1),
    DiurnalPoint(time="20:00", ambient_c=34.3, surface_c=37.9, wbgt_c=28.4),
    DiurnalPoint(time="22:00", ambient_c=32.2, surface_c=34.8, wbgt_c=26.9),
]


def get_sandbox_telemetry_summary() -> FortyGuardTelemetrySummary:
    primary_node = SANDBOX_SENSOR_NODES[0]
    return FortyGuardTelemetrySummary(
        active_zone=primary_node.zone_name,
        ambient_temp_c=primary_node.ambient_temp_c,
        surface_temp_c=primary_node.surface_temp_c,
        wet_bulb_temp_c=primary_node.wet_bulb_temp_c,
        heat_index_c=primary_node.heat_index_c,
        relative_humidity_pct=primary_node.relative_humidity_pct,
        uv_index=primary_node.uv_index,
        risk_level="EXTREME",
        active_nodes_count=len(SANDBOX_SENSOR_NODES),
        uhi_delta_c=5.8,
        coordinates=primary_node.coordinates,
        provenance=ProvenanceMetadata(
            provider="FortyGuard",
            stream_type="SANDBOX",
            ingestion_timestamp=datetime.now(timezone.utc).isoformat(),
            resolution_meters=10,
            confidence_score=0.99,
            cached=False,
        ),
    )


def get_sandbox_nodes() -> NodeCollectionResponse:
    return NodeCollectionResponse(
        total_nodes=len(SANDBOX_SENSOR_NODES),
        nodes=SANDBOX_SENSOR_NODES,
        provenance=ProvenanceMetadata(
            provider="FortyGuard",
            stream_type="SANDBOX",
            ingestion_timestamp=datetime.now(timezone.utc).isoformat(),
            resolution_meters=10,
            confidence_score=0.99,
            cached=False,
        ),
    )


def get_sandbox_uhi() -> UrbanHeatIslandIndex:
    return UrbanHeatIslandIndex(
        zone_name="Sector 7 - Downtown Core",
        urban_surface_temp_c=48.2,
        rural_baseline_temp_c=42.4,
        uhi_delta_c=5.8,
        nocturnal_retention_pct=78.4,
        canopy_coverage_pct=6.8,
        albedo_optimization_potential_c=3.4,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


def get_sandbox_diurnal_profile() -> DiurnalProfileResponse:
    return DiurnalProfileResponse(
        zone_name="Sector 7 - Downtown Core",
        points=SANDBOX_DIURNAL_POINTS,
        peak_surface_temp_c=52.1,
        peak_wbgt_c=33.5,
        hours_exceeding_threshold=7.0,
        provenance=ProvenanceMetadata(
            provider="FortyGuard",
            stream_type="SANDBOX",
            ingestion_timestamp=datetime.now(timezone.utc).isoformat(),
            resolution_meters=10,
            confidence_score=0.99,
            cached=False,
        ),
    )
