"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  createTodo,
  deleteCompletedTodos,
  deleteTodoById,
  ensureLabel,
  ensureProject,
  getProjectByName,
  getProjects,
  getLabels,
  reorderTodo,
  updateTodo,
  updateTodoStatus,
} from "@/src/db/queries";
import { parseQuickCapture } from "@/lib/quick-capture";

async function requireUser() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("unauthorized");
  return userId;
}

export async function addTaskAction(formData: FormData) {
  const userId = await requireUser();
  const raw = formData.get("text");
  const input = typeof raw === "string" ? raw.trim() : "";
  if (!input) throw new Error("empty task");

  const parsed = parseQuickCapture(input);

  let projectId: string | undefined;
  if (parsed.projectName) {
    const project = await ensureProject(userId, parsed.projectName);
    projectId = project.id;
  }

  const labelIds: string[] = [];
  for (const name of parsed.labelNames) {
    const label = await ensureLabel(userId, name);
    labelIds.push(label.id);
  }

  const todo = await createTodo(userId, {
    text: parsed.text || input,
    projectId,
    priority: parsed.priority,
    dueDate: parsed.dueDate ? parsed.dueDate.getTime() : null,
    position: "a",
    labelIds,
  });

  revalidatePath("/");
  return todo;
}

export async function toggleTaskAction(id: string, completed: boolean) {
  const userId = await requireUser();
  await updateTodoStatus(userId, id, completed);
  revalidatePath("/");
}

export async function deleteTaskAction(id: string) {
  const userId = await requireUser();
  await deleteTodoById(userId, id);
  revalidatePath("/");
}

export async function clearCompletedAction() {
  const userId = await requireUser();
  await deleteCompletedTodos(userId);
  revalidatePath("/");
}

export async function editTaskAction(
  id: string,
  data: {
    text?: string;
    priority?: number;
    dueDate?: number | null;
    projectId?: string | null;
    labelNames?: string[];
  }
) {
  const userId = await requireUser();
  const labelIds: string[] = [];
  if (data.labelNames) {
    for (const name of data.labelNames) {
      const label = await ensureLabel(userId, name);
      labelIds.push(label.id);
    }
  }
  await updateTodo(userId, id, {
    text: data.text,
    priority: data.priority,
    dueDate: data.dueDate,
    projectId: data.projectId,
    labelIds,
  });
  revalidatePath("/");
}

export async function reorderTaskAction(id: string, beforeId?: string, afterId?: string) {
  const userId = await requireUser();
  await reorderTodo(userId, id, beforeId, afterId);
  revalidatePath("/");
}

export async function getProjectsAction() {
  const userId = await requireUser();
  return getProjects(userId);
}

export async function getLabelsAction() {
  const userId = await requireUser();
  return getLabels(userId);
}
