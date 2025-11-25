import { NextRequest, NextResponse } from "next/server";

import { readTasks, writeTasks } from "@/lib/tasks-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

const error = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

type RouteParams =
  | { params: { id: string } }
  | { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await Promise.resolve((params as any));
  const taskId = decodeURIComponent(id ?? "");
  if (!taskId) return error("task id is required", 400);

  try {
    const body = await request.json().catch(() => ({}));
    const updates: Record<string, unknown> = {};

    if ("title" in body) {
      const title = (body?.title ?? "").trim();
      if (!title) return error("title cannot be empty", 422);
      updates.title = title;
    }

    if ("completed" in body) {
      updates.completed = Boolean(body?.completed);
    }

    if (Object.keys(updates).length === 0) {
      return error("no valid fields to update", 422);
    }

    const tasks = await readTasks();
    const task = tasks.find((item) => item.id === taskId);

    if (task) {
      Object.assign(task, updates);
      await writeTasks(tasks);
      return NextResponse.json(task);
    }

    // Idempotent: if missing, return 200 with notFound flag to avoid UI failures.
    return NextResponse.json({ notFound: true }, { status: 200 });
  } catch (err) {
    console.error(`PATCH /api/tasks/${taskId} failed`, err);
    return error("failed to update task", 500);
  }
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  const { id } = await Promise.resolve((params as any));
  const taskId = decodeURIComponent(id ?? "");
  if (!taskId) return error("task id is required", 400);

  try {
    const tasks = await readTasks();
    const remaining = tasks.filter((task) => task.id !== taskId);

    if (remaining.length !== tasks.length) {
      await writeTasks(remaining);
    }

    // Delete is idempotent; return success even if the task was already gone.
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error(`DELETE /api/tasks/${taskId} failed`, err);
    return error("failed to delete task", 500);
  }
}
