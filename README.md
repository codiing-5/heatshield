# HEATSHIELD — Agentic AI Heat Intelligence Platform

An intelligent, multi-agent urban heat resilience platform leveraging the **FortyGuard Temperature API**, GIS spatial modeling, predictive Machine Learning, and automated domain intervention workflows.

---

## 🔒 Locked Technology Stack

- **Frontend:** React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui utils, Radix UI primitives, Lucide React, Framer Motion, Recharts, MapLibre GL JS (`maplibre-gl`).
- **Backend:** Python 3.10+, FastAPI, Pydantic v2, Uvicorn, HTTPX.
- **Primary Hackathon Data Source:** **FortyGuard Temperature API** (High-resolution surface and air microclimate telemetry).
- **Core Platform:** Heat Intelligence & Thermal Stress Engine (ISO 7243 WBGT, UTCI, NOAA Heat Index, Humidex), GIS Engine (IDW Spatial Interpolation & GeoJSON), Predictive ML Models, Multi-Agent Orchestrator (Sentinel, Vulnerable Advisor, Cooling Strategist, Grid Balancer), Seven Domain Action Tracks.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│ FortyGuard Temperature API (Primary Hackathon Data Source)             │
│ • Surface Temperature & Asphalt Readings • Microclimate IoT Sensors   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Backend Services Layer (FastAPI + Python 3.11)                        │
│ • FortyGuard Dual-Mode Client & High-Fidelity Sandbox                  │
│ • Scientific Thermal Indices (Stull WBGT, UTCI, NOAA Heat Index)      │
│ • GIS Engine: Inverse Distance Weighting & GeoJSON FeatureCollection   │
│ • Predictive ML Engine: Multi-Horizon Forecaster & Cooling Simulator   │
│ • Autonomous Multi-Agent Orchestrator & Tool Execution Registry       │
│ • Seven Domain Tracks Engine (Infrastructure, Health, Labor, etc.)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Frontend Command Center (React 18 + TypeScript + Vite)                 │
│ • MapLibre GL Interactive Dark Vector Geospatial Map                   │
│ • Recharts 24-Hour Diurnal Curves & Multi-Horizon Predictions          │
│ • Agent Studio with Step-by-Step Reasoning & Conversational AI Chat   │
│ • Seven-Track Action Hub & Immediate Tactical Dispatchers              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart Guide

### 1. Backend Setup
```bash
cd backend
# Create virtual environment & install locked dependencies
uv venv .venv --python 3.11
uv pip install -r requirements.txt

# Run server with hot-reload
python -m uvicorn app.main:app --reload --port 8000
```
- API Documentation is live at: `http://127.0.0.1:8000/docs`
- Interactive OpenAPI ReDoc: `http://127.0.0.1:8000/redoc`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Dashboard will be live at: `http://localhost:5173`

### 3. Windows 1-Click Launchers
- Start Backend: double-click `run_backend.bat`
- Start Frontend: double-click `run_frontend.bat`

---

## 📡 REST API Catalog

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/api/v1/health` | System health check & data source status |
| **FortyGuard** | `GET` | `/api/v1/fortyguard/telemetry` | Normalized microclimate summary |
| **FortyGuard** | `GET` | `/api/v1/fortyguard/nodes` | IoT sensor fleet coordinates & readings |
| **FortyGuard** | `GET` | `/api/v1/fortyguard/uhi` | Urban Heat Island baseline deltas |
| **FortyGuard** | `GET` | `/api/v1/fortyguard/diurnal` | 24-hour diurnal thermal profile |
| **Heat Intelligence** | `POST` | `/api/v1/heat-intelligence/calculate` | WBGT, UTCI, Heat Index, & OSHA labor limits |
| **Heat Intelligence** | `GET` | `/api/v1/heat-intelligence/spatial-mesh` | RFC 7946 GeoJSON polygon risk layer |
| **Heat Intelligence** | `GET` | `/api/v1/heat-intelligence/risk-assessment`| Multi-zone risk summary |
| **ML Engine** | `POST` | `/api/v1/ml/forecast` | Multi-horizon microclimate predictions |
| **ML Engine** | `GET` | `/api/v1/ml/anomalies` | Statistical Z-score anomaly detector |
| **ML Engine** | `POST` | `/api/v1/ml/simulate-mitigation` | Urban cooling intervention sandbox |
| **Agentic AI** | `GET` | `/api/v1/agents/roster` | Active agent team roster |
| **Agentic AI** | `POST` | `/api/v1/agents/orchestrate` | Autonomous multi-agent cycle |
| **Agentic AI** | `POST` | `/api/v1/agents/chat` | Conversational agent assistant |
| **Seven-Tracks** | `GET` | `/api/v1/tracks/all` | Status across all 7 operational tracks |
| **Seven-Tracks** | `POST` | `/api/v1/tracks/{id}/action` | Tactical workflow dispatching |

---

## 📋 11-Stage Master Workflow
- [x] **Stage 0: Audit & Foundation**
- [x] **Stage 1: Product + UX Architecture**
- [x] **Stage 2: FortyGuard Integration**
- [x] **Stage 3: Data + Heat Intelligence**
- [x] **Stage 4: ML Engine**
- [x] **Stage 5: Agentic AI**
- [x] **Stage 6: Premium UI/UX Implementation**
- [x] **Stage 7: Seven-Track Capabilities**
- [x] **Stage 8: End-to-End Integration**
- [ ] **Stage 9: Security + Testing**
- [ ] **Stage 10: Deployment**
- [ ] **Stage 11: Hackathon Finalization**
