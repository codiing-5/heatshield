from fastapi import APIRouter, HTTPException, Path
from app.services.tracks_engine import tracks_engine
from app.schemas.tracks import (
    AllTracksResponse,
    TrackDetailResponse,
    TrackActionRequest,
    TrackActionResponse,
)

router = APIRouter()


@router.get("/all", response_model=AllTracksResponse)
def get_all_tracks() -> AllTracksResponse:
    """Retrieve full status, KPIs, and protocols across all 7 operational domain tracks."""
    return tracks_engine.get_all_tracks()


@router.get("/{track_id}", response_model=TrackDetailResponse)
def get_track_detail(track_id: str = Path(..., description="Track identifier e.g. urban, health, labor")) -> TrackDetailResponse:
    """Retrieve detailed telemetry, active protocols, and recent actions for specific track."""
    track = tracks_engine.get_track_detail(track_id)
    if not track:
        raise HTTPException(status_code=404, detail=f"Track '{track_id}' not found")
    return track


@router.post("/{track_id}/action", response_model=TrackActionResponse)
def dispatch_track_action(
    track_id: str = Path(..., description="Track identifier"),
    request: TrackActionRequest = ...
) -> TrackActionResponse:
    """Dispatch automated intervention protocol under designated track."""
    try:
        return tracks_engine.dispatch_action(track_id, request)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
