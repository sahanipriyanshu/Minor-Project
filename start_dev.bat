@echo off
echo Starting Athletica AI Services...

echo Starting FastAPI Backend...
start "Backend" cmd.exe /k "cd backend && call venv\Scripts\activate && uvicorn main:app --reload --port 8000"

echo Starting React Frontend...
start "Frontend" cmd.exe /k "cd frontend && npm run dev"

echo Services started!
