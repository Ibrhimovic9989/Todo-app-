"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Todo } from "@/src/db/queries";

export type View = "inbox" | "today" | "upcoming" | "completed" | `project:` | `label:`;

interface TaskState {
  view: { id: string; name: string };
  setView: (view: { id: string; name: string }) => void;
  focusTask: Todo | null;
  setFocusTask: (task: Todo | null) => void;
  focusOpen: boolean;
  setFocusOpen: (open: boolean) => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
}

export const useTaskStore = create<TaskState>()((set) => ({
  view: { id: "today", name: "Today" },
  setView: (view) => set({ view }),
  focusTask: null,
  setFocusTask: (focusTask) => set({ focusTask, focusOpen: focusTask !== null }),
  focusOpen: false,
  setFocusOpen: (focusOpen) => set({ focusOpen }),
  commandOpen: false,
  setCommandOpen: (commandOpen) => set({ commandOpen }),
}));
