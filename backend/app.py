import json
import os
import uuid
from pathlib import Path
from typing import Any, Dict, List

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

DATA_FILE = Path(__file__).resolve().parent / "tasks.txt"


def error_response(message: str, status: int = 400):
  return jsonify({"error": message}), status


def load_tasks() -> List[Dict[str, Any]]:
  if not DATA_FILE.exists():
    return []
  try:
    return json.loads(DATA_FILE.read_text(encoding="utf-8"))
  except json.JSONDecodeError:
    return []


def save_tasks(tasks: List[Dict[str, Any]]):
  DATA_FILE.write_text(json.dumps(tasks, indent=2), encoding="utf-8")


@app.get("/health")
def health():
  return jsonify({"status": "ok"})


@app.get("/tasks")
def list_tasks():
  tasks = sorted(load_tasks(), key=lambda t: t.get("created_at", ""), reverse=True)
  return jsonify(tasks)


@app.post("/tasks")
def create_task():
  body = request.get_json(silent=True) or {}
  title = (body.get("title") or "").strip()
  if not title:
    return error_response("title is required", 422)

  completed = bool(body.get("completed", False))
  new_task = {
    "id": str(uuid.uuid4()),
    "title": title,
    "completed": completed,
    "created_at": request.headers.get("Date") or "",
  }
  tasks = load_tasks()
  tasks.append(new_task)
  save_tasks(tasks)  # Persist the new task to disk
  return jsonify(new_task), 201


@app.patch("/tasks/<task_id>")
def update_task(task_id: str):
  body = request.get_json(silent=True) or {}

  updates: Dict[str, Any] = {}
  if "title" in body:
    title = (body.get("title") or "").strip()
    if not title:
      return error_response("title cannot be empty", 422)
    updates["title"] = title
  if "completed" in body:
    updates["completed"] = bool(body["completed"])

  if not updates:
    return error_response("no valid fields to update", 422)

  tasks = load_tasks()
  updated_task = None
  for task in tasks:
    if task["id"] == task_id:
      task.update(updates)
      updated_task = task
      break

  if not updated_task:
    return error_response("task not found", 404)

  save_tasks(tasks)  # Store the partial update on disk
  return jsonify(updated_task)


@app.delete("/tasks/<task_id>")
def delete_task(task_id: str):
  tasks = load_tasks()
  new_tasks = [task for task in tasks if task["id"] != task_id]
  if len(new_tasks) == len(tasks):
    return error_response("task not found", 404)
  save_tasks(new_tasks)  # Remove the task from disk
  return jsonify({"deleted": True})


if __name__ == "__main__":
  port = int(os.getenv("PORT", "5000"))
  app.run(host="0.0.0.0", port=port)
