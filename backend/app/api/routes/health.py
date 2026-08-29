from datetime import datetime, timezone
from fastapi import APIRouter
from pydantic import BaseModel
from app.core.config import settings

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    project: str
    version: str
    environment: str
    timestamp: str
    primary_data_source: str
    fortyguard_configured: bool


@router.get("", response_model=HealthResponse)
def get_health() -> HealthResponse:
    """Check health and platform status."""
    return HealthResponse(
        status="healthy",
        project=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now(timezone.utc).isoformat(),
        primary_data_source="FortyGuard Temperature API",
        fortyguard_configured=bool(settings.FORTYGUARD_API_KEY),
    )
