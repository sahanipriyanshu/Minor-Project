@echo off
echo Starting AI Fitness Coach Services...

echo Starting FastAPI Backend...
start cmd /k "cd backend && call venv\Scripts\activate && uvicorn main:app --reload --port 8000"

echo Starting React Frontend...
start cmd /k "cd frontend && npm run dev"

echo Services started!
