import math
from typing import List, Dict, Any, Tuple
from app.services.fortyguard_sandbox import SANDBOX_SENSOR_NODES
from app.services.thermal_indices import thermal_engine
from app.schemas.heat_intelligence import (
    GeoJsonFeatureCollection,
    GeoJsonFeature,
    GeoJsonGeometry,
    ZoneRiskAssessment,
    RiskAssessmentSummary,
    ThermalCalculationRequest,
)


class GisSpatialEngine:
    """
    GIS Spatial Modeling & GeoJSON Interpolation Engine.
    Features:
      - Multi-zone GeoJSON polygon mesh generator for municipal sectors.
      - Inverse Distance Weighting (IDW) spatial interpolation between sensor points.
      - Thermal risk polygon classification and canopy shade deficit evaluation.
    """

    # Municipal Sector Bounding Polygons (centered around FortyGuard sensor clusters)
    ZONE_DEFINITIONS = [
        {
            "id": "zone-01",
            "name": "Sector 7 - Downtown Core",
            "center": [24.4539, 54.3773],
            "polygon": [
                [54.3700, 24.4500],
                [54.3850, 24.4500],
                [54.3850, 24.4600],
                [54.3700, 24.4600],
                [54.3700, 24.4500],
            ],
            "node_id": "FG-772",
            "canopy_deficit": 68.0,
            "vulnerability_score": 0.88,
            "threat": "Extreme asphalt thermal accumulation & pedestrian exposure",
            "action": "Activate atomized misting canons & deploy temporary high-albedo shading",
        },
        {
            "id": "zone-02",
            "name": "Sector 7 - Industrial District",
            "center": [24.4612, 54.3850],
            "polygon": [
                [54.3800, 24.4580],
                [54.3950, 24.4580],
                [54.3950, 24.4700],
                [54.3800, 24.4700],
                [54.3800, 24.4580],
            ],
            "node_id": "FG-773",
            "canopy_deficit": 82.0,
            "vulnerability_score": 0.94,
            "threat": "High metallic roof albedo deficit & outdoor construction labor stress",
            "action": "Enforce mandatory 15-min rest rotation per OSHA/ISO 7243 standards",
        },
        {
            "id": "zone-03",
            "name": "Al Danah Residential Corridor",
            "center": [24.4480, 54.3690],
            "polygon": [
                [54.3620, 24.4420],
                [54.3750, 24.4420],
                [54.3750, 24.4520],
                [54.3620, 24.4520],
                [54.3620, 24.4420],
            ],
            "node_id": "FG-774",
            "canopy_deficit": 42.0,
            "vulnerability_score": 0.72,
            "threat": "Elevated senior population residential heat entrapment",
            "action": "Dispatch automated community cooling center routing notices",
        },
        {
            "id": "zone-04",
            "name": "Central Public Transit Terminal",
            "center": [24.4570, 54.3720],
            "polygon": [
                [54.3680, 24.4530],
                [54.3780, 24.4530],
                [54.3780, 24.4620],
                [54.3680, 24.4620],
                [54.3680, 24.4530],
            ],
            "node_id": "FG-775",
            "canopy_deficit": 55.0,
            "vulnerability_score": 0.81,
            "threat": "Transit commuter heat stress & bus stop queue thermal loading",
            "action": "Route air-conditioned mobile cooling shuttles and activate shelter coolers",
        },
        {
            "id": "zone-05",
            "name": "Corniche Coastal Waterfront",
            "center": [24.4710, 54.3580],
            "polygon": [
                [54.3500, 24.4650],
                [54.3650, 24.4650],
                [54.3650, 24.4780],
                [54.3500, 24.4780],
                [54.3500, 24.4650],
            ],
            "node_id": "FG-776",
            "canopy_deficit": 25.0,
            "vulnerability_score": 0.45,
            "threat": "High relative humidity combined with maritime breeze",
            "action": "Maintain active public hydration stations and maritime breeze monitoring",
        },
        {
            "id": "zone-06",
            "name": "Government Administrative Complex",
            "center": [24.4390, 54.3910],
            "polygon": [
                [54.3850, 24.4320],
                [54.3980, 24.4320],
                [54.3980, 24.4440],
                [54.3850, 24.4440],
                [54.3850, 24.4320],
            ],
            "node_id": "FG-777",
            "canopy_deficit": 35.0,
            "vulnerability_score": 0.50,
            "threat": "HVAC peak power demand surge during early afternoon",
            "action": "Pre-cool municipal buildings to buffer electricity substation strain",
        },
    ]

    @staticmethod
    def calculate_idw(
        target_lat: float, 
        target_lng: float, 
        nodes=SANDBOX_SENSOR_NODES, 
        power: float = 2.0
    ) -> Dict[str, float]:
        """
        Inverse Distance Weighting (IDW) interpolation from sensor nodes to arbitrary GPS coordinate.
        """
        weights = []
        weighted_ambient = 0.0
        weighted_surface = 0.0
        weighted_wbgt = 0.0
        total_weight = 0.0

        for node in nodes:
            nlat, nlng = node.coordinates
            dist = math.sqrt((target_lat - nlat) ** 2 + (target_lng - nlng) ** 2)
            if dist < 1e-5:
                return {
                    "interpolated_ambient_c": node.ambient_temp_c,
                    "interpolated_surface_c": node.surface_temp_c,
                    "interpolated_wbgt_c": node.wet_bulb_temp_c,
                }
            w = 1.0 / (dist ** power)
            weights.append(w)
            total_weight += w
            weighted_ambient += node.ambient_temp_c * w
            weighted_surface += node.surface_temp_c * w
            weighted_wbgt += node.wet_bulb_temp_c * w

        return {
            "interpolated_ambient_c": round(weighted_ambient / total_weight, 2),
            "interpolated_surface_c": round(weighted_surface / total_weight, 2),
            "interpolated_wbgt_c": round(weighted_wbgt / total_weight, 2),
        }

    @classmethod
    def generate_thermal_geojson(cls) -> GeoJsonFeatureCollection:
        """
        Construct a valid RFC 7946 GeoJSON FeatureCollection of thermal zones.
        """
        features: List[GeoJsonFeature] = []

        # Find sensor node dictionary
        nodes_dict = {n.node_id: n for n in SANDBOX_SENSOR_NODES}

        for zone in cls.ZONE_DEFINITIONS:
            node = nodes_dict.get(zone["node_id"], SANDBOX_SENSOR_NODES[0])

            # Calculate indices
            calc_req = ThermalCalculationRequest(
                ambient_temp_c=node.ambient_temp_c,
                relative_humidity_pct=node.relative_humidity_pct,
                surface_temp_c=node.surface_temp_c,
                uv_index=node.uv_index,
            )
            eval_res = thermal_engine.evaluate(calc_req)

            # Color mapping for GIS rendering
            color_map = {
                "LOW": "#10b981",
                "MODERATE": "#f59e0b",
                "HIGH": "#f97316",
                "EXTREME": "#ef4444",
                "CRITICAL": "#b91c1c",
            }

            feature = GeoJsonFeature(
                id=zone["id"],
                geometry=GeoJsonGeometry(
                    type="Polygon",
                    coordinates=[zone["polygon"]],
                ),
                properties={
                    "zone_id": zone["id"],
                    "name": zone["name"],
                    "sensor_node": node.node_id,
                    "ambient_temp_c": node.ambient_temp_c,
                    "surface_temp_c": node.surface_temp_c,
                    "wbgt_c": eval_res.wbgt_c,
                    "heat_index_c": eval_res.heat_index_c,
                    "risk_level": eval_res.risk_level,
                    "fill_color": color_map.get(eval_res.risk_level, "#f97316"),
                    "fill_opacity": 0.45,
                    "vulnerability_score": zone["vulnerability_score"],
                    "canopy_deficit_pct": zone["canopy_deficit"],
                    "albedo_index": node.albedo_index,
                    "threat": zone["threat"],
                    "action": zone["action"],
                },
            )
            features.append(feature)

        return GeoJsonFeatureCollection(
            features=features,
            metadata={
                "provider": "FortyGuard GIS Interpolation Engine",
                "crs": "urn:ogc:def:crs:OGC:1.3:CRS84",
                "total_zones": len(features),
            },
        )

    @classmethod
    def get_risk_assessment_summary(cls) -> RiskAssessmentSummary:
        """
        Generate zone-by-zone multi-tier thermal risk summary.
        """
        nodes_dict = {n.node_id: n for n in SANDBOX_SENSOR_NODES}
        zones_summary: List[ZoneRiskAssessment] = []
        critical_count = 0
        extreme_count = 0
        total_wbgt = 0.0

        for zone in cls.ZONE_DEFINITIONS:
            node = nodes_dict.get(zone["node_id"], SANDBOX_SENSOR_NODES[0])
            calc_req = ThermalCalculationRequest(
                ambient_temp_c=node.ambient_temp_c,
                relative_humidity_pct=node.relative_humidity_pct,
                surface_temp_c=node.surface_temp_c,
            )
            eval_res = thermal_engine.evaluate(calc_req)
            total_wbgt += eval_res.wbgt_c

            if eval_res.risk_level == "CRITICAL":
                critical_count += 1
            elif eval_res.risk_level == "EXTREME":
                extreme_count += 1

            zones_summary.append(
                ZoneRiskAssessment(
                    zone_id=zone["id"],
                    zone_name=zone["name"],
                    ambient_temp_c=node.ambient_temp_c,
                    surface_temp_c=node.surface_temp_c,
                    wbgt_c=eval_res.wbgt_c,
                    heat_index_c=eval_res.heat_index_c,
                    risk_level=eval_res.risk_level,
                    vulnerability_score=zone["vulnerability_score"],
                    canopy_deficit_pct=zone["canopy_deficit"],
                    albedo_index=node.albedo_index,
                    primary_threat=zone["threat"],
                    recommended_action=zone["action"],
                )
            )

        mean_wbgt = round(total_wbgt / len(cls.ZONE_DEFINITIONS), 2) if cls.ZONE_DEFINITIONS else 0.0

        return RiskAssessmentSummary(
            total_zones_analyzed=len(cls.ZONE_DEFINITIONS),
            critical_zones_count=critical_count,
            extreme_zones_count=extreme_count,
            mean_wbgt_c=mean_wbgt,
            zones=zones_summary,
        )


gis_engine = GisSpatialEngine()
