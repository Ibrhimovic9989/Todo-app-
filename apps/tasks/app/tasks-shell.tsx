"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  Command,
  Folder,
  Inbox,
  Layers,
  LogOut,
  Menu,
  Settings,
  Sun,
  Tag,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Todo, Project, Label } from "@/src/db/queries";
import { TodoList } from "@/components/todo-list";
import { CommandMenu } from "@/components/command-menu";
import { FocusMode } from "@/components/focus-mode";
import { ShortcutsDialog } from "@/components/shortcuts-dialog";
import {
  addTaskAction,
  toggleTaskAction,
  deleteTaskAction,
  editTaskAction,
  clearCompletedAction,
  reorderTaskAction,
} from "./actions";
import { signOut } from "next-auth/react";
import { useTaskStore } from "@/lib/use-task-store";

export function TasksShell({
  user,
  initialTasks,
  initialProjects,
  initialLabels,
  initialView,
}: {
  user: { id: string; name?: string | null; email?: string | null; image?: string | null };
  initialTasks: Todo[];
  initialProjects: Project[];
  initialLabels: Label[];
  initialView: { id: string; name: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<Todo[]>(initialTasks);
  const [projects] = useState<Project[]>(initialProjects);
  const [labels] = useState<Label[]>(initialLabels);
  const [view, setView] = useState<{ id: string; name: string }>(initialView);
  const [focusTask, setFocusTask] = useState<Todo | null>(null);
  const [focusOpen, setFocusOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const viewParam = searchParams.get("view");
  const projectParam = searchParams.get("project");
  const labelParam = searchParams.get("label");

  // Resolve current view from URL
  useEffect(() => {
    if (projectParam) {
      const p = projects.find((x) => x.id === projectParam);
      if (p) setView({ id: `project:${p.id}`, name: p.name });
    } else if (labelParam) {
      const l = labels.find((x) => x.id === labelParam);
      if (l) setView({ id: `label:${l.id}`, name: l.name });
    } else if (viewParam === "inbox") setView({ id: "inbox", name: "Inbox" });
    else if (viewParam === "upcoming") setView({ id: "upcoming", name: "Upcoming" });
    else if (viewParam === "completed") setView({ id: "completed", name: "Completed" });
    else setView({ id: "today", name: "Today" });
  }, [viewParam, projectParam, labelParam, projects, labels]);

  // Load tasks when view changes
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const params = new URLSearchParams();
      if (view.id === "inbox") params.set("view", "inbox");
      else if (view.id === "upcoming") params.set("view", "upcoming");
      else if (view.id === "completed") params.set("view", "completed");
      else if (view.id.startsWith("project:")) params.set("project", view.id.replace("project:", ""));
      else if (view.id.startsWith("label:")) params.set("label", view.id.replace("label:", ""));
      else params.set("view", "today");

      const res = await fetch(`/api/todos?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!cancelled) setTasks(data);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [view.id]);

  // Keyboard shortcuts
  useHotkeys("?", (e) => {
    e.preventDefault();
    setShortcutsOpen(true);
  });

  useHotkeys("f", (e) => {
    const target = e.target as HTMLElement;
    if (["INPUT", "TEXTAREA"].includes(target.tagName)) return;
    if (tasks.length > 0) {
      setFocusTask(tasks.find((t) => !t.completed) || tasks[0]);
      setFocusOpen(true);
    }
  });

  useHotkeys("esc", () => {
    setFocusOpen(false);
    setShortcutsOpen(false);
    setSidebarOpen(false);
  });

  const navigateTo = useCallback(
    (id: string, name: string) => {
      if (id === "today") router.push("/");
      else if (id === "inbox") router.push("/?view=inbox");
      else if (id === "upcoming") router.push("/?view=upcoming");
      else if (id === "completed") router.push("/?view=completed");
      else if (id.startsWith("project:")) router.push(`/?project=${id.replace("project:", "")}`);
      else if (id.startsWith("label:")) router.push(`/?label=${id.replace("label:", "")}`);
      setView({ id, name });
      setSidebarOpen(false);
    },
    [router]
  );

  async function handleAddTask(text: string) {
    const formData = new FormData();
    formData.set("text", text);
    await addTaskAction(formData);
    // Refresh list from server for accuracy
    await refreshTasks();
  }

  async function handleToggleTask(id: string, completed: boolean) {
    await toggleTaskAction(id, completed);
    await refreshTasks();
  }

  async function handleDeleteTask(id: string) {
    await deleteTaskAction(id);
    await refreshTasks();
  }

  async function handleEditTask(id: string, text: string) {
    await editTaskAction(id, { text });
    await refreshTasks();
  }

  async function handleReorder(activeId: string, overId: string) {
    await reorderTaskAction(activeId, overId);
  }

  async function handleClearCompleted() {
    await clearCompletedAction();
    await refreshTasks();
  }

  async function refreshTasks() {
    const params = new URLSearchParams();
    if (view.id === "inbox") params.set("view", "inbox");
    else if (view.id === "upcoming") params.set("view", "upcoming");
    else if (view.id === "completed") params.set("view", "completed");
    else if (view.id.startsWith("project:")) params.set("project", view.id.replace("project:", ""));
    else if (view.id.startsWith("label:")) params.set("label", view.id.replace("label:", ""));
    else params.set("view", "today");

    const res = await fetch(`/api/todos?${params.toString()}`);
    if (res.ok) setTasks(await res.json());
  }

  const baseItem =
    "group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";
  const activeItem =
    "bg-accent text-foreground";

  const mainViews = [
    { id: "inbox", name: "Inbox", icon: Inbox },
    { id: "today", name: "Today", icon: Sun },
    { id: "upcoming", name: "Upcoming", icon: Clock },
    { id: "completed", name: "Completed", icon: CheckCircle2 },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-card p-4 transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <span className="text-lg font-bold tracking-tight">Tasks</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden rounded-lg p-1 text-muted-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-1">
            {mainViews.map((v) => (
              <button
                key={v.id}
                onClick={() => navigateTo(v.id, v.name)}
                className={cn(baseItem, view.id === v.id && activeItem)}
              >
                <v.icon className="h-4 w-4" />
                {v.name}
              </button>
            ))}
          </div>

          {projects.length > 0 && (
            <div>
              <div className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Projects
              </div>
              <div className="space-y-1">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigateTo(`project:${p.id}`, p.name)}
                    className={cn(
                      baseItem,
                      view.id === `project:${p.id}` && activeItem
                    )}
                  >
                    <Folder className="h-4 w-4" />
                    <span className="truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {labels.length > 0 && (
            <div>
              <div className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Labels
              </div>
              <div className="space-y-1">
                {labels.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => navigateTo(`label:${l.id}`, l.name)}
                    className={cn(
                      baseItem,
                      view.id === `label:${l.id}` && activeItem
                    )}
                  >
                    <Tag className="h-4 w-4" />
                    <span className="truncate">{l.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-4 left-4 right-4 space-y-1">
          <button
            onClick={() => setShortcutsOpen(true)}
            className={cn(baseItem)}
          >
            <Command className="h-4 w-4" />
            Shortcuts
            <kbd className="ml-auto rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">?</kbd>
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={cn(baseItem)}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-accent lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold tracking-tight">{view.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFocusOpen(true)}
              className="hidden rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent sm:inline-flex"
            >
              Focus
            </button>
            <CommandMenu
              views={[
                ...mainViews,
                ...projects.map((p) => ({ id: `project:${p.id}`, name: p.name, href: `/?project=${p.id}` })),
                ...labels.map((l) => ({ id: `label:${l.id}`, name: l.name, href: `/?label=${l.id}` })),
              ]}
              onCreateTask={(text) => {
                handleAddTask(text).then(() => {
                  toast.success("Task created");
                });
              }}
              onToggleFocus={() => {
                setFocusTask(tasks.find((t) => !t.completed) || tasks[0] || null);
                setFocusOpen(true);
              }}
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-3xl">
            <TodoList
              initialTasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
              onReorder={handleReorder}
              onFocusTask={(task) => {
                setFocusTask(task);
                setFocusOpen(true);
              }}
              title={view.name}
              showClearCompleted={view.id === "completed"}
              onClearCompleted={handleClearCompleted}
            />
          </div>
        </div>
      </main>

      <FocusMode
        task={focusTask || tasks.find((t) => !t.completed) || tasks[0] || null}
        open={focusOpen}
        onClose={() => setFocusOpen(false)}
        onToggleTask={handleToggleTask}
      />

      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </div>
  );
}
