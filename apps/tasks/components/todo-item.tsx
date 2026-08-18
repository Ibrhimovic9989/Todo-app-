"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Calendar,
  Flag,
  Hash,
  MoreHorizontal,
  Trash2,
  Pencil,
  Focus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Todo } from "@/src/db/queries";
import { format } from "date-fns";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const priorityClasses: Record<number, string> = {
  1: "text-red-600 dark:text-red-400",
  2: "text-orange-500 dark:text-orange-400",
  3: "text-blue-500 dark:text-blue-400",
  4: "text-muted-foreground",
};

const priorityLabel: Record<number, string> = {
  1: "P1",
  2: "P2",
  3: "P3",
  4: "P4",
};

export function TodoItem({
  task,
  selected,
  onToggle,
  onDelete,
  onEdit,
  onFocus,
}: {
  task: Todo;
  selected?: boolean;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onFocus: (task: Todo) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const save = () => {
    const text = editText.trim();
    if (text && text !== task.text) {
      onEdit(task.id, text);
    }
    setEditing(false);
  };

  return (
    <motion.li
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        "group flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all focus-within:border-ring",
        task.completed ? "opacity-60" : "",
        selected ? "border-ring bg-accent/40" : "border-border bg-card/50 hover:border-muted-foreground/30",
        isDragging && "shadow-lg opacity-80"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <circle cx="2" cy="3" r="1.2" />
          <circle cx="10" cy="3" r="1.2" />
          <circle cx="2" cy="9" r="1.2" />
          <circle cx="10" cy="9" r="1.2" />
        </svg>
      </button>

      <button
        onClick={() => onToggle(task.id, !task.completed)}
        className={cn(
          "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-colors",
          task.completed
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-background hover:border-foreground"
        )}
        aria-label={task.completed ? "Mark active" : "Mark completed"}
      >
        {task.completed && <Check className="h-3 w-3" />}
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <input
              ref={inputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={save}
              onKeyDown={(e) => {
                if (e.key === "Escape") setEditing(false);
              }}
              className="w-full bg-transparent text-sm outline-none"
            />
          </form>
        ) : (
          <div className="flex flex-col gap-0.5">
            <span
              onClick={() => setEditing(true)}
              className={cn(
                "cursor-text text-sm transition-all",
                task.completed
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              )}
            >
              {task.text}
            </span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {task.dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(task.dueDate, "MMM d")}
                </span>
              )}
              {task.projectName && (
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {task.projectName}
                </span>
              )}
              {task.priority > 0 && (
                <span className={cn("flex items-center gap-1 font-medium", priorityClasses[task.priority])}>
                  <Flag className="h-3 w-3" />
                  {priorityLabel[task.priority]}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          onClick={() => onFocus(task)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Focus mode"
        >
          <Focus className="h-4 w-4" />
        </button>
        <button
          onClick={() => setEditing(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Edit task"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.li>
  );
}
