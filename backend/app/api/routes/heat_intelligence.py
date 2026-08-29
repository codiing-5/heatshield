from typing import Optional
from fastapi import APIRouter, Query
from app.services.thermal_indices import thermal_engine
from app.services.gis_engine import gis_engine
from app.schemas.heat_intelligence import (
    ThermalCalculationRequest,
    ThermalCalculationResponse,
    GeoJsonFeatureCollection,
    RiskAssessmentSummary,
)

router = APIRouter()


@router.post("/calculate", response_model=ThermalCalculationResponse)
def calculate_thermal_indices(request: ThermalCalculationRequest) -> ThermalCalculationResponse:
    """
    Calculate scientific heat stress indices (WBGT, UTCI, NOAA Heat Index, Humidex)
    and determine physiological risk level and OSHA labor work-rest quotas.
    """
    return thermal_engine.evaluate(request)


@router.get("/spatial-mesh", response_model=GeoJsonFeatureCollection)
def get_spatial_thermal_mesh() -> GeoJsonFeatureCollection:
    """
    Retrieve RFC 7946 GeoJSON polygon FeatureCollection of thermal risk zones,
    albedo parameters, and canopy shade deficits.
    """
    return gis_engine.generate_thermal_geojson()


@router.get("/risk-assessment", response_model=RiskAssessmentSummary)
def get_risk_assessment_summary() -> RiskAssessmentSummary:
    """
    Retrieve zone-by-zone multi-tier heat risk assessments, mean WBGT, and action items.
    """
    return gis_engine.get_risk_assessment_summary()


@router.get("/interpolate")
def interpolate_coordinate(
    lat: float = Query(..., ge=-90.0, le=90.0, description="Latitude"),
    lng: float = Query(..., ge=-180.0, le=180.0, description="Longitude"),
):
    """
    Perform Inverse Distance Weighting (IDW) interpolation from sensor nodes to specified GPS coordinates.
    """
    return {
        "target_coordinates": [lat, lng],
        **gis_engine.calculate_idw(lat, lng),
    }
