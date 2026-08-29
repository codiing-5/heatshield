@echo off
echo ========================================================
echo Starting HEATSHIELD Backend (FastAPI + Uvicorn)
echo ========================================================
cd backend
if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
    python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
) else (
    python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
)
pause
