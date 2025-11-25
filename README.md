# TaskTracker Lite - Next.js + Node API (Vercel-ready)

The backend now runs on Node using Next.js API routes (no more Flask). Tasks are stored in a local JSON file (`data/tasks.json`) for development convenience.

## Run locally
1) Install deps at the project root:
   ```powershell
   npm install
   ```
2) Start the dev server (frontend + API):
   ```powershell
   npm run dev
   ```
3) Open http://localhost:3000. Tasks are read/written to `data/tasks.json`.

## Deploy to Vercel
- Push this repo and import it in Vercel. No extra backend is needed.
- The file-based storage works for local dev; Vercel’s serverless file system is ephemeral, so plug in a database if you need persistent cloud data. Update `lib/tasks-store.ts` to swap storage.

## API (Node via Next.js)
- `GET /api/health` – health check
- `GET /api/tasks` – list tasks (newest first)
- `POST /api/tasks` – create `{ "title": "...", "completed": false? }`
- `PATCH /api/tasks/:id` – update `{ "title"?: "...", "completed"?: true }`
- `DELETE /api/tasks/:id` – delete task

## Configuration
- `NEXT_PUBLIC_API_BASE` (optional): point the UI to a different backend. By default, requests go to the same origin (e.g., `/api/tasks`).
- Data file: `data/tasks.json` is created automatically on first write.

## Legacy note
The old Flask backend in `backend/` is no longer used. You can delete that folder if you don’t need it.
