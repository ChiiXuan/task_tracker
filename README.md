# TaskTracker Lite - How to Launch

This app has a Next.js frontend and a Flask backend that stores tasks in `backend/tasks.txt` (JSON).

## Backend (Flask)
1) Open PowerShell and go to the backend folder:
   ```powershell
   cd funstuff/backend
   ```
2) Create and activate a venv:
   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
3) Install deps:
   ```powershell
   pip install -r requirements.txt
   ```
4) Run the API (default http://localhost:5000):
   ```powershell
   flask --app app run --debug
   ```
   Tasks will be saved to `backend/tasks.txt` automatically.

## Frontend (Next.js)
1) In another terminal, go to the project root:
   ```powershell
   cd funstuff
   ```
2) Start the dev server (expects the backend on port 5000):
   ```powershell
   npm run dev
   ```
3) Open http://localhost:3000 to use the app.

If your API runs elsewhere, set `NEXT_PUBLIC_API_BASE` before `npm run dev`, e.g.:
```powershell
$env:NEXT_PUBLIC_API_BASE = "http://localhost:5000"
npm run dev
```
