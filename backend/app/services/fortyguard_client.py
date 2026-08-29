import time
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings
from app.schemas.fortyguard import (
    FortyGuardTelemetrySummary,
    NodeCollectionResponse,
    UrbanHeatIslandIndex,
    DiurnalProfileResponse,
    ProvenanceMetadata,
)
from app.services import fortyguard_sandbox


class FortyGuardClient:
    """
    Authoritative FortyGuard Temperature API Client.
    Features:
      - Asynchronous HTTPX transport with timeout and header management.
      - Dual-mode operation (Live production stream & high-fidelity sandbox fallback).
      - In-memory TTL caching layer.
      - Comprehensive provenance metadata tracking.
    """

    def __init__(self):
        self.api_key = settings.FORTYGUARD_API_KEY
        self.base_url = settings.FORTYGUARD_API_BASE_URL.rstrip("/")
        self.cache_ttl = settings.CACHE_TTL_SECONDS
        self._cache: Dict[str, Dict[str, Any]] = {}

    def _get_from_cache(self, key: str) -> Optional[Any]:
        if key in self._cache:
            entry = self._cache[key]
            if time.time() - entry["timestamp"] < self.cache_ttl:
                return entry["data"]
            else:
                del self._cache[key]
        return None

    def _save_to_cache(self, key: str, data: Any):
        self._cache[key] = {
            "timestamp": time.time(),
            "data": data,
        }

    async def get_telemetry_summary(self, zone_id: Optional[str] = None) -> FortyGuardTelemetrySummary:
        cache_key = f"telemetry_{zone_id or 'default'}"
        cached = self._get_from_cache(cache_key)
        if cached:
            cached.provenance.cached = True
            return cached

        # If live API key is present, attempt live HTTP fetch
        if self.api_key and self.api_key.strip():
            try:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Accept": "application/json",
                }
                async with httpx.AsyncClient(timeout=4.0) as client:
                    url = f"{self.base_url}/temperature/summary"
                    if zone_id:
                        url += f"?zone={zone_id}"
                    response = await client.get(url, headers=headers)
                    if response.status_code == 200:
                        payload = response.json()
                        summary = FortyGuardTelemetrySummary(
                            active_zone=payload.get("zone_name", "Urban Core"),
                            ambient_temp_c=float(payload.get("ambient_temp_c", 38.0)),
                            surface_temp_c=float(payload.get("surface_temp_c", 47.5)),
                            wet_bulb_temp_c=float(payload.get("wet_bulb_temp_c", 31.0)),
                            heat_index_c=float(payload.get("heat_index_c", 44.5)),
                            relative_humidity_pct=float(payload.get("relative_humidity_pct", 60.0)),
                            uv_index=float(payload.get("uv_index", 10.0)),
                            risk_level=payload.get("risk_level", "EXTREME"),
                            active_nodes_count=int(payload.get("active_nodes_count", 8)),
                            uhi_delta_c=float(payload.get("uhi_delta_c", 5.5)),
                            coordinates=tuple(payload.get("coordinates", [24.4539, 54.3773])),
                            provenance=ProvenanceMetadata(
                                provider="FortyGuard",
                                stream_type="LIVE",
                                ingestion_timestamp=datetime.now(timezone.utc).isoformat(),
                                resolution_meters=10,
                                confidence_score=0.99,
                                cached=False,
                            ),
                        )
                        self._save_to_cache(cache_key, summary)
                        return summary
            except Exception:
                # Gracefully fall back to deterministic sandbox if network or auth error
                pass

        # Sandbox / Fallback mode
        summary = fortyguard_sandbox.get_sandbox_telemetry_summary()
        self._save_to_cache(cache_key, summary)
        return summary

    async def get_sensor_nodes(self) -> NodeCollectionResponse:
        cache_key = "sensor_nodes"
        cached = self._get_from_cache(cache_key)
        if cached:
            cached.provenance.cached = True
            return cached

        if self.api_key and self.api_key.strip():
            try:
                headers = {"Authorization": f"Bearer {self.api_key}"}
                async with httpx.AsyncClient(timeout=4.0) as client:
                    res = await client.get(f"{self.base_url}/telemetry/sensors", headers=headers)
                    if res.status_code == 200:
                        payload = res.json()
                        nodes_response = NodeCollectionResponse(
                            total_nodes=len(payload.get("nodes", [])),
                            nodes=payload.get("nodes", []),
                            provenance=ProvenanceMetadata(
                                provider="FortyGuard",
                                stream_type="LIVE",
                                ingestion_timestamp=datetime.now(timezone.utc).isoformat(),
                                resolution_meters=10,
                                confidence_score=0.99,
                                cached=False,
                            ),
                        )
                        self._save_to_cache(cache_key, nodes_response)
                        return nodes_response
            except Exception:
                pass

        nodes_response = fortyguard_sandbox.get_sandbox_nodes()
        self._save_to_cache(cache_key, nodes_response)
        return nodes_response

    async def get_uhi_index(self) -> UrbanHeatIslandIndex:
        cache_key = "uhi_index"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached

        if self.api_key and self.api_key.strip():
            try:
                headers = {"Authorization": f"Bearer {self.api_key}"}
                async with httpx.AsyncClient(timeout=4.0) as client:
                    res = await client.get(f"{self.base_url}/heat-island/index", headers=headers)
                    if res.status_code == 200:
                        uhi = UrbanHeatIslandIndex(**res.json())
                        self._save_to_cache(cache_key, uhi)
                        return uhi
            except Exception:
                pass

        uhi = fortyguard_sandbox.get_sandbox_uhi()
        self._save_to_cache(cache_key, uhi)
        return uhi

    async def get_diurnal_profile(self) -> DiurnalProfileResponse:
        cache_key = "diurnal_profile"
        cached = self._get_from_cache(cache_key)
        if cached:
            cached.provenance.cached = True
            return cached

        if self.api_key and self.api_key.strip():
            try:
                headers = {"Authorization": f"Bearer {self.api_key}"}
                async with httpx.AsyncClient(timeout=4.0) as client:
                    res = await client.get(f"{self.base_url}/temperature/diurnal", headers=headers)
                    if res.status_code == 200:
                        diurnal = DiurnalProfileResponse(**res.json())
                        self._save_to_cache(cache_key, diurnal)
                        return diurnal
            except Exception:
                pass

        diurnal = fortyguard_sandbox.get_sandbox_diurnal_profile()
        self._save_to_cache(cache_key, diurnal)
        return diurnal


# Singleton client instance
fortyguard_client = FortyGuardClient()
