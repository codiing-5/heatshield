# HEATSHIELD Deployment Guide

This guide covers deploying **HEATSHIELD** to free-tier cloud platforms and running production services.

---

## 1. Single-Service Unified Deployment (Recommended)

HEATSHIELD's FastAPI backend serves both the REST API (`/api/v1`) and the compiled React SPA (`frontend/dist/index.html`) from a single container or server process.

### Deploy to Render (Free Tier)
1. Push this repository to GitHub.
2. Log into [Render.com](https://render.com) and click **New +** -> **Blueprint**.
3. Select your `heatshield` repository (Render will automatically detect `render.yaml`).
4. Set environment variables (optional):
   - `FORTYGUARD_API_KEY`: *(Your FortyGuard API key, or leave blank to use high-fidelity sandbox)*
   - `ENVIRONMENT`: `production`
5. Click **Apply**. Your app will build and go live on `https://<your-app>.onrender.com`.

### Deploy to Railway
1. Create a new project on [Railway.app](https://railway.app).
2. Connect your GitHub repository.
3. Set root directory or build command:
   - Build: `pip install -r backend/requirements.txt && cd frontend && npm install && npm run build`
   - Start: `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## 2. Decoupled Deployment (Frontend on Vercel + Backend on Render)

- **Frontend (Vercel)**: Import repo, select `frontend` root, Vite framework preset. Add `VITE_API_URL` pointing to the deployed backend.
- **Backend (Render / Fly.io)**: Deploy the `backend/` directory using Python 3.11 and Uvicorn.

---

## 3. Docker Compose Production Deployment

```bash
docker-compose up --build -d
```
Access the application at `http://localhost:80` (or `http://localhost:8000` for backend directly).

---

## 4. Post-Deployment Verification

After deploying, run the automated verification script:
```bash
python scripts/deploy_verify.py --base-url https://<your-deployment-url>/api/v1
```
