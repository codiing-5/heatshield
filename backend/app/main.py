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

# 4. Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)

# 5. Robust Frontend Dist Resolution
APP_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(APP_DIR)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)

CANDIDATES = [
    os.path.join(PROJECT_ROOT, "frontend", "dist"),
    os.path.abspath(os.path.join(os.getcwd(), "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "frontend", "dist")),
    os.path.join(BACKEND_DIR, "frontend", "dist"),
]

FRONTEND_DIST = CANDIDATES[0]
for candidate in CANDIDATES:
    if os.path.exists(candidate) and os.path.exists(os.path.join(candidate, "index.html")):
        FRONTEND_DIST = candidate
        break

# 6. Mount Static Assets
assets_dir = os.path.join(FRONTEND_DIST, "assets")
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


@app.get("/")
def root(request: Request):
    index_path = os.path.join(FRONTEND_DIST, "index.html")
    accept = request.headers.get("accept", "")
    sec_fetch_dest = request.headers.get("sec-fetch-dest", "")
    
    # If the request comes from a browser or explicitly asks for HTML, serve the frontend SPA
    if ("text/html" in accept or sec_fetch_dest == "document") and os.path.exists(index_path):
        return FileResponse(index_path)

    # If index.html doesn't exist or client is an API client / test
    if not os.path.exists(index_path) or "application/json" in accept or accept == "*/*" or not accept:
        return {
            "message": f"Welcome to {settings.PROJECT_NAME} — {settings.PROJECT_DESCRIPTION}",
            "version": settings.VERSION,
            "docs": "/docs",
            "api_v1": settings.API_V1_STR,
            "health": f"{settings.API_V1_STR}/health",
        }

    return FileResponse(index_path)


@app.get("/{full_path:path}")
async def serve_spa(full_path: str, request: Request):
    # Protect API, documentation, and OpenAPI endpoints from SPA fallback
    if (
        full_path.startswith("api")
        or full_path.startswith("docs")
        or full_path.startswith("redoc")
        or full_path.startswith("openapi.json")
    ):
        return JSONResponse(status_code=404, content={"detail": "Not Found"})

    # Check for direct static file in frontend/dist (e.g. /vite.svg, /favicon.ico)
    file_path = os.path.join(FRONTEND_DIST, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)

    # SPA client-side route fallback to index.html
    index_path = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)

    return JSONResponse(status_code=404, content={"detail": "Not Found"})
