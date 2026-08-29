import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from app.core.config import settings
from app.core.security_headers import SecurityHeadersMiddleware
from app.core.rate_limiter import RateLimiterMiddleware
from app.api.routes import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# 1. Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# 2. Rate Limiter Middleware (300 requests/min per IP)
app.add_middleware(RateLimiterMiddleware, max_requests_per_minute=300)

# 3. CORS configuration
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if settings.ENVIRONMENT != "production" else [str(origin) for origin in settings.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

# Find frontend dist path
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")
if not os.path.exists(FRONTEND_DIST):
    FRONTEND_DIST = os.path.abspath(os.path.join(os.getcwd(), "frontend", "dist"))

# Mount assets if dist/assets exists
assets_dir = os.path.join(FRONTEND_DIST, "assets")
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


@app.get("/")
def root(request: Request):
    accept = request.headers.get("accept", "")
    index_path = os.path.join(FRONTEND_DIST, "index.html")
    if "text/html" in accept and os.path.exists(index_path):
        return FileResponse(index_path)
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} — {settings.PROJECT_DESCRIPTION}",
        "version": settings.VERSION,
        "docs": "/docs",
        "api_v1": settings.API_V1_STR,
        "health": f"{settings.API_V1_STR}/health",
    }


@app.get("/{full_path:path}")
async def serve_spa(full_path: str, request: Request):
    if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json"):
        return JSONResponse(status_code=404, content={"detail": "Not Found"})
    
    file_path = os.path.join(FRONTEND_DIST, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    
    index_path = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return JSONResponse(status_code=404, content={"detail": "Not Found"})

