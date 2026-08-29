"""API Routes Module"""
from fastapi import APIRouter
from app.api.routes.health import router as health_router
from app.api.routes.fortyguard import router as fortyguard_router
from app.api.routes.heat_intelligence import router as heat_intelligence_router
from app.api.routes.ml import router as ml_router
from app.api.routes.agents import router as agents_router
from app.api.routes.tracks import router as tracks_router

api_router = APIRouter()
api_router.include_router(health_router, prefix="/health", tags=["Health"])
api_router.include_router(fortyguard_router, prefix="/fortyguard", tags=["FortyGuard Primary Data Source"])
api_router.include_router(heat_intelligence_router, prefix="/heat-intelligence", tags=["Heat Intelligence & GIS"])
api_router.include_router(ml_router, prefix="/ml", tags=["Predictive Machine Learning"])
api_router.include_router(agents_router, prefix="/agents", tags=["Agentic AI & Orchestration"])
api_router.include_router(tracks_router, prefix="/tracks", tags=["Seven-Track Domain Systems"])
