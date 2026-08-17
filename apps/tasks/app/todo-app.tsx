"use client";

import { useState, useMemo, useRef, useCallback, useTransition } from "react";

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
};

type Filter = "all" | "active" | "completed";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function TodoApp({ initial }: { initial: Todo[] }) {
  const [tasks, setTasks] = useState<Todo[]>(initial);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case "active":
        return tasks.filter((t) => !t.completed);
      case "completed":
        return tasks.filter((t) => t.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  const stats = useMemo(() => {
    const active = tasks.filter((t) => !t.completed).length;
    const completed = tasks.length - active;
    return { active, completed, total: tasks.length };
  }, [tasks]);

  const addTask = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const text = input.trim();
      if (!text) return;

      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      const raw = await res.json();
      const todo: Todo = { ...raw, createdAt: new Date(raw.createdAt).toISOString() };

      startTransition(() => {
        setTasks((prev) => [todo, ...prev]);
        setInput("");
      });
    },
    [input]
  );

  const toggleTask = useCallback(async (id: string, completed: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed } : t))
    );
    await fetch("/api/todos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed }),
    });
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch("/api/todos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }, []);

  const clearCompleted = useCallback(async () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
    await fetch("/api/todos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clear-completed" }),
    });
  }, []);

  const progressPct = stats.total === 0 ? 0 : (stats.completed / stats.total) * 100;

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900">
            <svg
              className="h-4 w-4"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Tasks</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {stats.active === 0 && stats.total > 0
                ? "All done — great work."
                : `${stats.active} active task${stats.active !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        <div
          className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800 sm:block"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-zinc-900 transition-all duration-500 ease-out dark:bg-zinc-100"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <form onSubmit={addTask} className="relative mb-5">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 pr-14 text-base outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-950 dark:placeholder:text-zinc-500 dark:focus:border-zinc-100 dark:focus:bg-zinc-900 dark:focus:ring-zinc-100/10"
          aria-label="New task"
        />
        <button
          type="submit"
          disabled={!input.trim() || isPending}
          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-zinc-900 text-white transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          aria-label="Add task"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </button>
      </form>

      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900/50">
          {(["all", "active", "completed"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-sm font-medium capitalize transition-colors",
                filter === f
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {stats.completed > 0 && (
          <button
            onClick={clearCompleted}
            className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Clear completed
          </button>
        )}
      </div>

      <ul className="space-y-2" aria-label="Tasks">
        {filteredTasks.map((task) => (
          <li
            key={task.id}
            className={cn(
              "group flex items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/50 px-4 py-3 transition-all focus-within:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/30 dark:focus-within:border-zinc-700",
              task.completed && "opacity-60"
            )}
          >
            <button
              onClick={() => toggleTask(task.id, !task.completed)}
              className={cn(
                "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-colors",
                task.completed
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-300 bg-white hover:border-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-zinc-500"
              )}
              aria-label={task.completed ? "Mark active" : "Mark completed"}
            >
              {task.completed && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </button>
            <span
              className={cn(
                "flex-1 text-sm transition-all",
                task.completed
                  ? "text-zinc-400 line-through dark:text-zinc-500"
                  : "text-zinc-700 dark:text-zinc-200"
              )}
            >
              {task.text}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 opacity-0 transition-all hover:bg-zinc-200 hover:text-zinc-900 group-hover:opacity-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              aria-label="Delete task"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      {filteredTasks.length === 0 && (
        <div className="mt-6 text-center text-sm text-zinc-400 dark:text-zinc-600">
          {filter === "completed"
            ? "No completed tasks yet."
            : filter === "active"
              ? "No active tasks. Time to rest."
              : "No tasks. Add one above."}
        </div>
      )}
    </div>
  );
}
