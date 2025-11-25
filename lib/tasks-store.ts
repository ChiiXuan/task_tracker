import { promises as fs } from "fs";
import path from "path";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  created_at?: string;
};

const preferredDataDir =
  process.env.DATA_DIR ||
  (process.env.VERCEL ? "/tmp/tasktracker" : path.join(process.cwd(), "data"));

let dataDir = preferredDataDir;
let dataFile = path.join(dataDir, "tasks.json");

async function ensureDataFile() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.access(dataFile).catch(async () => {
      await fs.writeFile(dataFile, "[]", "utf-8");
    });
  } catch (err: any) {
    // Fall back to /tmp when running on read-only filesystems (e.g., Vercel)
    const isReadOnly =
      err?.code === "EROFS" || err?.code === "EACCES" || err?.code === "EPERM";
    if (isReadOnly && dataDir !== "/tmp/tasktracker") {
      dataDir = "/tmp/tasktracker";
      dataFile = path.join(dataDir, "tasks.json");
      await fs.mkdir(dataDir, { recursive: true });
      await fs.access(dataFile).catch(async () => {
        await fs.writeFile(dataFile, "[]", "utf-8");
      });
      return;
    }
    throw err;
  }
}

export async function readTasks(): Promise<Task[]> {
  await ensureDataFile();
  try {
    const raw = await fs.readFile(dataFile, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Task[]) : [];
  } catch {
    return [];
  }
}

export async function writeTasks(tasks: Task[]) {
  await ensureDataFile();
  await fs.writeFile(dataFile, JSON.stringify(tasks, null, 2), "utf-8");
}

export { dataFile as tasksFilePath };
