import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import {
  createTodo,
  deleteCompletedTodos,
  deleteTodoById,
  ensureLabel,
  ensureProject,
  getCompletedTodos,
  getInboxTodos,
  getLabelTodos,
  getProjectTodos,
  getTodayTodos,
  getUpcomingTodos,
  getTodos,
  updateTodoStatus,
  updateTodo,
} from "@/src/db/queries";
import { parseQuickCapture } from "@/lib/quick-capture";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user.id;
}

export async function GET(req: NextRequest) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view");
  const projectId = searchParams.get("project");
  const labelId = searchParams.get("label");

  let todos: any[] = [];
  if (projectId) todos = await getProjectTodos(userId, projectId);
  else if (labelId) todos = await getLabelTodos(userId, labelId);
  else if (view === "inbox") todos = await getInboxTodos(userId);
  else if (view === "today") todos = await getTodayTodos(userId);
  else if (view === "upcoming") todos = await getUpcomingTodos(userId);
  else if (view === "completed") todos = await getCompletedTodos(userId);
  else todos = await getTodayTodos(userId);

  return NextResponse.json(todos);
}

export async function POST(req: NextRequest) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const input = typeof body?.text === "string" ? body.text.trim() : "";
  if (!input) {
    return NextResponse.json({ error: "empty text" }, { status: 400 });
  }

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
    labelIds,
  });
  return NextResponse.json(todo, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const id = typeof body?.id === "string" ? body.id : undefined;
  if (!id) {
    return NextResponse.json({ error: "bad payload" }, { status: 400 });
  }

  if (typeof body?.completed === "boolean") {
    await updateTodoStatus(userId, id, body.completed);
  } else {
    await updateTodo(userId, id, {
      text: body.text,
      priority: body.priority,
      dueDate: body.dueDate,
      projectId: body.projectId,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  if (body?.action === "clear-completed") {
    await deleteCompletedTodos(userId);
    return NextResponse.json({ ok: true });
  }
  const id = typeof body?.id === "string" ? body.id : undefined;
  if (!id) {
    return NextResponse.json({ error: "bad payload" }, { status: 400 });
  }
  await deleteTodoById(userId, id);
  return NextResponse.json({ ok: true });
}
