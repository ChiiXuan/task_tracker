import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { readTasks, writeTasks, Task } from "@/lib/tasks-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

const error = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

export async function GET() {
  try {
    const tasks = await readTasks();
    const sorted = [...tasks].sort((a, b) =>
      (b.created_at ?? "").localeCompare(a.created_at ?? ""),
    );
    return NextResponse.json(sorted);
  } catch (err) {
    console.error("GET /api/tasks failed", err);
    return error("failed to load tasks", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const title = (body?.title ?? "").trim();
    if (!title) return error("title is required", 422);

    const completed = Boolean(body?.completed ?? false);
    const newTask: Task = {
      id: randomUUID(),
      title,
      completed,
      created_at: new Date().toISOString(),
    };

    const tasks = await readTasks();
    tasks.push(newTask);
    await writeTasks(tasks);

    return NextResponse.json(newTask, { status: 201 });
  } catch (err) {
    console.error("POST /api/tasks failed", err);
    return error("failed to create task", 500);
  }
}
