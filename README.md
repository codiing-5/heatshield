# HEATSHIELD — Agentic AI Heat Intelligence Platform

[![Build & Tests](https://img.shields.io/badge/Backend%20Tests-36%2F36%20Passed-emerald.svg)](backend/tests)
[![Primary Data Source](https://img.shields.io/badge/Primary%20Data-FortyGuard%20Temperature%20API-blue.svg)](https://api.fortyguard.com)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript%20%2B%20Vite-orange.svg)](frontend/)
[![License](https://img.shields.io/badge/License-MIT-slate.svg)](LICENSE)

An intelligent, autonomous multi-agent urban heat resilience platform leveraging the **FortyGuard Temperature API**, GIS spatial modeling, predictive Machine Learning, and automated domain intervention workflows.

---

## 🌐 Live Public Deployments

| Version | Description | Verified Public URL |
|---|---|---|
| **Version 1 (Stable)** | Tactical Dark Mode Command Center for municipal incident coordinators | [https://32ef0d9b94e41e1b-111-92-126-156.serveousercontent.com](https://32ef0d9b94e41e1b-111-92-126-156.serveousercontent.com) |
| **Version 2 (AI Experience)** | Google-inspired clean conversational heat intelligence assistant & agent studio | [https://2c057dc2e02890c7-111-92-126-156.serveousercontent.com](https://2c057dc2e02890c7-111-92-126-156.serveousercontent.com) |


> **Note:** Both Version 1 and Version 2 are simultaneously live and accessible. You can also switch between versions in real-time via the **Version Switcher Pill** in the top navigation bar.

---

## 🎯 The Problem

Urban Heat Islands (UHI) and extreme heatwaves present critical threats to public health, outdoor laborers, municipal infrastructure, and electrical grid stability. Traditional weather forecasts only measure regional air temperatures in the shade, completely missing **hyperlocal asphalt surface heat spikes (exceeding 50°C)** and complex **Wet-Bulb Globe Temperature (WBGT)** physiological stress.

## 💡 The Solution: HEATSHIELD

HEATSHIELD ingests authoritative high-resolution microclimate telemetry from the **FortyGuard Temperature API**, computes scientific physiological heat stress indices (ISO 7243 WBGT, UTCI, NOAA Heat Index), simulates cooling interventions with predictive ML, and coordinates 4 autonomous specialized AI agents to execute immediate tactical mitigation workflows.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│ FortyGuard Temperature API (Primary Hackathon Data Source)             │
│ • High-Resolution Surface & Asphalt Telemetry • IoT Sensor Fleet Nodes │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Backend Services Layer (FastAPI + Python 3.11)                        │
│ • FortyGuard Dual-Mode Client & Deterministic High-Fidelity Sandbox   │
│ • Scientific Thermal Indices Engine (Stull WBGT, UTCI, NOAA Index)     │
│ • GIS Engine: Inverse Distance Weighting (IDW) & GeoJSON Polygons     │
│ • Predictive ML Engine: Multi-Horizon Forecaster & Mitigation Physics  │
│ • Multi-Agent Orchestrator: Sentinel, Vulnerable, Cooling, Grid       │
│ • Seven Domain Tracks Engine (Labor, Health, Transit, Energy, etc.)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Frontend Experiences (React 18 + TypeScript + Vite)                    │
│                                                                        │
│ ┌──────────────────────────────────┐ ┌───────────────────────────────┐ │
│ │ VERSION 1 — STABLE               │ │ VERSION 2 — AI EXPERIENCE     │ │
│ │ • Tactical Dark Command Center   │ │ • Google-Inspired Clean UI    │ │
│ │ • 24-Hour Diurnal Curves         │ │ • ChatGPT-Style Assistant     │ │
│ │ • MapLibre GL Vector Map         │ │ • Live AI Agent Status Cards  │ │
│ │ • Multi-Agent Reason Trace       │ │ • Instant AI Situation Brief  │ │
│ └──────────────────────────────────┘ └───────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Specialized AI Agents & Multi-Agent Orchestration

HEATSHIELD coordinates 4 specialized autonomous agents with dedicated tool execution registries:

1. **Heat Sentinel Agent (`sentinel`)**: Continuously monitors FortyGuard telemetry for thermal anomaly spikes and dangerous WBGT thresholds (>31°C).
   - *Tools:* `query_fortyguard_sensors`, `calculate_wbgt_stress`
2. **Vulnerable Population Advisor (`vulnerable`)**: Cross-references thermal risk polygons with demographic rasters (outdoor laborers, seniors, schools) to automate cooling shelter routing.
   - *Tools:* `query_demographic_vulnerability`, `dispatch_shelter_routing_alert`, `enforce_labor_rest_mandate`
3. **Urban Cooling Strategist (`mitigation`)**: Physics-guided ML simulation testing high-albedo coatings, misting arrays, and canopy shading to optimize surface asphalt cooling deltas.
   - *Tools:* `simulate_cooling_intervention`, `query_fortyguard_sensors`
4. **Grid & Energy Balancer (`grid`)**: Forecasts electrical grid HVAC surge demand and schedules pre-cooling cycles across municipal substations to prevent brownouts.
   - *Tools:* `calculate_hvac_load_buffer`, `query_fortyguard_sensors`

---

## 🌡️ FortyGuard Temperature API Integration

HEATSHIELD natively connects to FortyGuard microclimate endpoints:
- `GET /temperature/summary`: High-resolution ambient, surface, and relative humidity telemetry.
- `GET /telemetry/sensors`: IoT sensor fleet coordinates and status across municipal zones.
- `GET /heat-island/index`: Urban Heat Island baseline differential calculation.
- `GET /temperature/diurnal`: 24-hour diurnal microclimate curve data.

*Dual-Mode Operation:* If `FORTYGUARD_API_KEY` is provided, live HTTP requests are streamed with in-memory TTL caching; if unconfigured or during offline testing, the system seamlessly uses deterministic high-fidelity sandbox telemetry with complete provenance metadata.

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

## 🚀 How to Run Locally

### Prerequisites
- Python 3.10+ (Recommended: Python 3.11)
- Node.js 18+ and npm

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger API Docs: `http://127.0.0.1:8000/docs`
- Redoc API Catalog: `http://127.0.0.1:8000/redoc`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Access Frontend at: `http://localhost:5173`

### 3. Quick Windows Launchers
- Start Backend: double-click `run_backend.bat`
- Start Frontend: double-click `run_frontend.bat`

---

## 🧪 Testing & Verification

Run the comprehensive test suite:
```bash
# Run 36/36 Backend Unit & Integration Tests
pytest backend/tests -v

# Run Automated Post-Deployment Smoke Test
python scripts/deploy_verify.py --base-url http://127.0.0.1:8000/api/v1 --ui-url http://127.0.0.1:8000
```

---

## ☁️ Deployment Guide

Detailed deployment instructions for free-tier platforms (**Render**, **Railway**, **Vercel**, and **Docker**) are available in [`docs/deployment.md`](docs/deployment.md).
- **Render**: Blueprint ready with `render.yaml`
- **Vercel**: Configured with `vercel.json`
- **Docker**: `docker-compose up --build`
