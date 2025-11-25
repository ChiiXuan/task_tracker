# TaskTracker Lite Flask API (File-based)

Lightweight Flask API that stores tasks in a local `tasks.txt` (JSON array). Endpoints:
- `GET /tasks` - list tasks (newest first)
- `POST /tasks` - create task with `{ "title": "..." }`
- `PATCH /tasks/<id>` - update `{ "title": "...", "completed": true }`
- `DELETE /tasks/<id>` - remove a task
- `GET /health` - health check

## Setup
1) From `funstuff/backend`, create/activate venv:
   - `py -m venv .venv && .venv\Scripts\activate`
2) Install deps:
   - `pip install -r requirements.txt`
3) Run locally (default http://localhost:5000):
   - `flask --app app run --debug`

Data persistence: tasks are stored in `backend/tasks.txt`. The file is created automatically on first write.
