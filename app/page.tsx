"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  created_at?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000";

export default function Home() {
  const [taskTitle, setTaskTitle] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`${API_BASE}/tasks`);
        if (!response.ok) throw new Error("Failed to load tasks");
        const data: Task[] = await response.json();
        setTasks(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Could not load tasks from the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    return { total, completed, remaining: total - completed };
  }, [tasks]);

  const addTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;
    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) throw new Error("Failed to add task");
      const created: Task = await response.json();
      setTasks((prev) => [created, ...prev]);
      setTaskTitle("");
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Could not add the task.");
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      if (!response.ok) throw new Error("Failed to update task");
      const updated: Task = await response.json();
      setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Could not update the task.");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete task");
      setTasks((prev) => prev.filter((task) => task.id !== id));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Could not delete the task.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-50">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-12 sm:px-10 lg:px-16">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/70">
              TaskTracker Lite
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-emerald-50 sm:text-5xl">
              Stay on top of your day
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
              Capture quick tasks, mark them done, and keep a pulse on what is
              left. Built with React hooks, controlled inputs, and local
              storage.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-emerald-100 shadow-lg shadow-emerald-900/40 backdrop-blur">
            <p className="font-medium text-emerald-200">Session saved</p>
            <p className="text-xs text-emerald-100/80">
              Tasks persist locally until you clear them.
            </p>
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total"
            value={stats.total}
            accent="from-emerald-400 to-cyan-400"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            accent="from-emerald-300 to-lime-300"
          />
          <StatCard
            label="Remaining"
            value={stats.remaining}
            accent="from-orange-300 to-pink-300"
          />
        </section>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur-lg">
          <form
            onSubmit={addTask}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <label className="sr-only" htmlFor="task-input">
              Task name
            </label>
            <input
              id="task-input"
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              placeholder="Add a quick task..."
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white placeholder:text-slate-400 outline-none transition focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-400/40"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-900/30 transition hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
            >
              Add Task
            </button>
          </form>

          <div className="mt-8 space-y-3">
            {loading ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-5 py-6 text-sm text-slate-300">
                Loading tasks...
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-dashed border-red-300/40 bg-red-900/40 px-5 py-6 text-sm text-red-100">
                {error}
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex items-center justify-between rounded-2xl border border-dashed border-white/15 bg-white/5 px-5 py-6 text-sm text-slate-300">
                <div>
                  <p className="font-medium text-emerald-100">No tasks yet</p>
                  <p className="text-slate-400">
                    Add your first task to get moving.
                  </p>
                </div>
                <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                  Fresh start
                </span>
              </div>
            ) : (
              tasks.map((task) => (
                <article
                  key={task.id}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-md shadow-black/30 transition hover:border-emerald-200/40"
                >
                  <input
                    id={`task-${task.id}`}
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id, !task.completed)}
                    className="h-5 w-5 rounded-md border-2 border-emerald-300/70 bg-slate-900/80 text-emerald-400 accent-emerald-400 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
                  />
                  <label
                    htmlFor={`task-${task.id}`}
                    className={`flex-1 text-base ${
                      task.completed
                        ? "text-slate-400 line-through decoration-emerald-300/70"
                        : "text-white"
                    }`}
                  >
                    {task.title}
                  </label>
                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
                    aria-label={`Delete ${task.title}`}
                  >
                    Delete
                  </button>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  accent: string;
};

function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30">
      <div
        className={`pointer-events-none absolute inset-0 opacity-60 blur-3xl`}
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(52, 211, 153, 0.4), transparent 45%), radial-gradient(circle at 80% 10%, rgba(165, 243, 252, 0.4), transparent 35%)",
        }}
      />
      <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
        {value}
      </p>
      <div className={`mt-3 h-1.5 w-16 rounded-full bg-gradient-to-r ${accent}`} />
      <div
        className={`absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-gradient-to-r ${accent}`}
      />
    </div>
  );
}
