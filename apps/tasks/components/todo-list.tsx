"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import {
  DndContext,
  type DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { Todo } from "@/src/db/queries";
import { TodoItem } from "./todo-item";
import { QuickCapture } from "./quick-capture";
import { useHotkeys } from "react-hotkeys-hook";
import { cn } from "@/lib/utils";

export type TaskFilters = {
  projectId?: string;
  labelId?: string;
  completedOnly?: boolean;
};

export function TodoList({
  initialTasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onReorder,
  onFocusTask,
  title = "Tasks",
  showClearCompleted = false,
  onClearCompleted,
}: {
  initialTasks: Todo[];
  onAddTask: (text: string) => Promise<void>;
  onToggleTask: (id: string, completed: boolean) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onEditTask: (id: string, text: string) => Promise<void>;
  onReorder?: (activeId: string, overId: string) => Promise<void>;
  onFocusTask: (task: Todo) => void;
  title?: string;
  showClearCompleted?: boolean;
  onClearCompleted?: () => Promise<void>;
}) {
  const [tasks, setTasks] = useState<Todo[]>(initialTasks);
  const [optimisticTasks, addOptimistic] = useOptimistic<Todo[], OptimisticAction>(
    tasks,
    reducer
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const listRef = useRef<HTMLUListElement>(null);

  // Sync external updates when initialTasks changes (e.g. view switch)
  if (JSON.stringify(initialTasks.map((t) => t.id)) !== JSON.stringify(tasks.map((t) => t.id))) {
    setTasks(initialTasks);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useHotkeys(
    "c",
    (e) => {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      const input = listRef.current?.parentElement?.querySelector("input[type=text]") as HTMLInputElement | undefined;
      input?.focus();
    },
    [listRef]
  );

  useHotkeys(
    "j",
    () => {
      const ids = visibleIds();
      if (!ids.length) return;
      const idx = selectedId ? ids.indexOf(selectedId) : -1;
      setSelectedId(ids[Math.min(idx + 1, ids.length - 1)]);
    },
    [selectedId, optimisticTasks]
  );

  useHotkeys(
    "k",
    () => {
      const ids = visibleIds();
      if (!ids.length) return;
      const idx = selectedId ? ids.indexOf(selectedId) : ids.length;
      setSelectedId(ids[Math.max(idx - 1, 0)]);
    },
    [selectedId, optimisticTasks]
  );

  useHotkeys(
    "space",
    (e) => {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (selectedId) {
        const task = optimisticTasks.find((t) => t.id === selectedId);
        if (task) handleToggle(task.id, !task.completed);
      }
    },
    [selectedId, optimisticTasks]
  );

  useHotkeys(
    "e",
    (e) => {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      const el = listRef.current?.querySelector(`[data-task-id="${selectedId}"] button[aria-label="Edit task"]`) as HTMLButtonElement | undefined;
      el?.click();
    },
    [selectedId]
  );

  function visibleIds() {
    return optimisticTasks.map((t) => t.id);
  }

  type OptimisticAction =
    | { type: "add"; task: Todo }
    | { type: "toggle"; id: string; completed: boolean }
    | { type: "delete"; id: string }
    | { type: "edit"; id: string; text: string }
    | { type: "reorder"; from: number; to: number };

  function reducer(state: Todo[], action: OptimisticAction): Todo[] {
    switch (action.type) {
      case "add":
        return [action.task, ...state];
      case "toggle":
        return state.map((t) =>
          t.id === action.id
            ? { ...t, completed: action.completed, completedAt: action.completed ? Date.now() : null }
            : t
        );
      case "delete":
        return state.filter((t) => t.id !== action.id);
      case "edit":
        return state.map((t) =>
          t.id === action.id ? { ...t, text: action.text } : t
        );
      case "reorder":
        return arrayMove(state, action.from, action.to);
      default:
        return state;
    }
  }

  async function handleAdd(text: string) {
    const tempId = `temp-${Date.now()}`;
    const optimistic: Todo = {
      id: tempId,
      userId: "",
      projectId: null,
      parentId: null,
      text,
      description: null,
      completed: false,
      priority: 0,
      dueDate: null,
      startDate: null,
      position: "a",
      recurrenceRule: null,
      completedAt: null,
      createdAt: Date.now(),
    };
    startTransition(() => {
      addOptimistic({ type: "add", task: optimistic });
    });
    try {
      await onAddTask(text);
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
    }
  }

  async function handleToggle(id: string, completed: boolean) {
    startTransition(() => {
      addOptimistic({ type: "toggle", id, completed });
    });
    try {
      await onToggleTask(id, completed);
    } catch {
      // rollback
      addOptimistic({ type: "toggle", id, completed: !completed });
    }
  }

  async function handleDelete(id: string) {
    startTransition(() => {
      addOptimistic({ type: "delete", id });
    });
    try {
      await onDeleteTask(id);
    } catch {
      // rollback handled by not syncing state; parent re-render will restore
    }
  }

  async function handleEdit(id: string, text: string) {
    const previous = optimisticTasks.find((t) => t.id === id)?.text ?? text;
    startTransition(() => {
      addOptimistic({ type: "edit", id, text });
    });
    try {
      await onEditTask(id, text);
    } catch {
      addOptimistic({ type: "edit", id, text: previous });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = optimisticTasks.findIndex((t) => t.id === active.id);
    const newIndex = optimisticTasks.findIndex((t) => t.id === over.id);
    startTransition(() => {
      addOptimistic({ type: "reorder", from: oldIndex, to: newIndex });
    });
    onReorder?.(String(active.id), String(over.id));
  }

  const incompleteCount = optimisticTasks.filter((t) => !t.completed).length;
  const completedCount = optimisticTasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-4">
      <QuickCapture onSubmit={handleAdd} />

      <div className="flex items-center justify-between px-1">
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {incompleteCount} remaining
          </span>
          {showClearCompleted && completedCount > 0 && onClearCompleted && (
            <button
              onClick={onClearCompleted}
              className="text-destructive hover:underline"
            >
              Clear {completedCount} completed
            </button>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={optimisticTasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul ref={listRef} className="space-y-2">
            <AnimatePresence initial={false}>
              {optimisticTasks.map((task) => (
                <div key={task.id} data-task-id={task.id}>
                  <TodoItem
                    task={task}
                    selected={selectedId === task.id}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onFocus={onFocusTask}
                  />
                </div>
              ))}
            </AnimatePresence>
          </ul>
        </SortableContext>
      </DndContext>

      {optimisticTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center"
        >
          <p className="text-sm font-medium">No tasks here yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Press <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">C</kbd> to add one.
          </p>
        </motion.div>
      )}
    </div>
  );
}
