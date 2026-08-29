from fastapi import APIRouter, Query
from app.services.ml_engine import ml_engine
from app.schemas.ml import (
    ForecastRequest,
    ForecastResponse,
    AnomalyDetectionResponse,
    MitigationSimulationRequest,
    MitigationSimulationResponse,
)

router = APIRouter()


@router.post("/forecast", response_model=ForecastResponse)
def get_microclimate_forecast(request: ForecastRequest) -> ForecastResponse:
    """
    Generate multi-horizon machine learning predictions for air, surface, and WBGT temperatures.
    """
    return ml_engine.generate_microclimate_forecast(request)


@router.get("/anomalies", response_model=AnomalyDetectionResponse)
def get_thermal_anomalies(zone_name: str = Query("Sector 7 - Downtown Core")) -> AnomalyDetectionResponse:
    """
    Detect statistical thermal anomalies and evaluate heatwave escalation probability.
    """
    return ml_engine.detect_anomalies(zone_name=zone_name)


@router.post("/simulate-mitigation", response_model=MitigationSimulationResponse)
def simulate_mitigation_actions(request: MitigationSimulationRequest) -> MitigationSimulationResponse:
    """
    Simulate expected temperature reductions (ΔT) and heat-stroke risk reductions
    from urban cooling interventions (cool roofs, shade canopy, misting, traffic limits).
    """
    return ml_engine.simulate_mitigation(request)
