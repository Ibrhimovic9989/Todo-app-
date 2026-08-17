"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Task = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

type Filter = "all" | "active" | "completed";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [isReady, setIsReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("tasks") : null;
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch {
        setTasks([]);
      }
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks, isReady]);

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

  const addTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    const newTask: Task = {
      id: generateId(),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setInput("");
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  const progress = stats.total === 0 ? 0 : (stats.completed / stats.total) * 100;

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-zinc-200 bg-white/80 px-6 py-5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900">
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

          <div className="flex items-center gap-4">
            <div
              className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800 sm:block"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-zinc-900 transition-all duration-500 ease-out dark:bg-zinc-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-6 py-10">
        <div className="mx-auto w-full max-w-2xl">
          <form onSubmit={addTask} className="relative mb-8">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-4 pr-14 text-base shadow-sm outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
              aria-label="New task"
            />
            <button
              type="submit"
              disabled={!input.trim()}
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

          <div className="mb-6 flex items-center justify-between gap-4">
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
                className="text-sm font-medium text-zinc-500 transition-colors hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
              >
                Clear completed
              </button>
            )}
          </div>

          <section aria-label="Tasks">
            {!isReady ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 w-full animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900"
                  />
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900/30">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-zinc-400 dark:text-zinc-500"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                  {filter === "completed"
                    ? "No completed tasks yet"
                    : filter === "active"
                      ? "No active tasks"
                      : "You're all caught up"}
                </h3>
                <p className="mt-1 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
                  {filter === "completed"
                    ? "Finish a task to see it here."
                    : filter === "active"
                      ? "Switch to 'All' or add something new."
                      : "Add a task above and start your day with focus."}
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredTasks.map((task) => (
                  <li
                    key={task.id}
                    className="group flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm transition-all hover:border-zinc-200 hover:shadow dark:border-zinc-800/60 dark:bg-zinc-900/50 dark:hover:border-zinc-700"
                  >
                    <label className="flex flex-1 cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="peer sr-only"
                        aria-label={`Mark ${task.text} as ${task.completed ? "active" : "completed"}`}
                      />
                      <div
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          task.completed
                            ? "border-zinc-900 bg-zinc-900 dark:border-zinc-100 dark:bg-zinc-100"
                            : "border-zinc-300 peer-focus-visible:ring-2 peer-focus-visible:ring-zinc-900/20 dark:border-zinc-600 dark:peer-focus-visible:ring-zinc-100/20"
                        )}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={cn(
                            "checkbox-check",
                            task.completed
                              ? "text-white dark:text-zinc-900"
                              : "text-transparent"
                          )}
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </div>
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
                    </label>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 focus:opacity-100 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                      aria-label={`Delete ${task.text}`}
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
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
