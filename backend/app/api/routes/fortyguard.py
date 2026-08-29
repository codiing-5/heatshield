from typing import Optional
from fastapi import APIRouter, Query
from app.services.fortyguard_client import fortyguard_client
from app.schemas.fortyguard import (
    FortyGuardTelemetrySummary,
    NodeCollectionResponse,
    UrbanHeatIslandIndex,
    DiurnalProfileResponse,
)

router = APIRouter()


@router.get("/telemetry", response_model=FortyGuardTelemetrySummary)
async def get_telemetry(zone_id: Optional[str] = Query(None, description="Optional zone identifier")) -> FortyGuardTelemetrySummary:
    """Retrieve normalized FortyGuard microclimate telemetry summary."""
    return await fortyguard_client.get_telemetry_summary(zone_id=zone_id)


@router.get("/nodes", response_model=NodeCollectionResponse)
async def get_sensor_nodes() -> NodeCollectionResponse:
    """Retrieve active FortyGuard IoT sensor node array with GPS coordinates."""
    return await fortyguard_client.get_sensor_nodes()


@router.get("/uhi", response_model=UrbanHeatIslandIndex)
async def get_uhi_index() -> UrbanHeatIslandIndex:
    """Retrieve Urban Heat Island index and delta comparison against rural baseline."""
    return await fortyguard_client.get_uhi_index()


@router.get("/diurnal", response_model=DiurnalProfileResponse)
async def get_diurnal_profile() -> DiurnalProfileResponse:
    """Retrieve 24-hour diurnal surface vs ambient vs WBGT curves."""
    return await fortyguard_client.get_diurnal_profile()


@router.get("/status")
async def get_fortyguard_status():
    """Retrieve FortyGuard API connection status and metadata."""
    is_live = bool(fortyguard_client.api_key and fortyguard_client.api_key.strip())
    return {
        "provider": "FortyGuard Temperature API",
        "role": "Primary Hackathon Data Source",
        "stream_mode": "LIVE" if is_live else "SANDBOX",
        "api_key_configured": is_live,
        "base_url": fortyguard_client.base_url,
        "cache_ttl_seconds": fortyguard_client.cache_ttl,
        "cached_keys_count": len(fortyguard_client._cache),
    }
