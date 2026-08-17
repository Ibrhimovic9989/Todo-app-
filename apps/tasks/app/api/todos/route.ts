import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import {
  createTodo,
  deleteCompletedTodos,
  getTodos,
  updateTodoStatus,
  deleteTodoById,
} from "@/src/db/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireUser(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user.id;
}

export async function GET(req: NextRequest) {
  const userId = await requireUser(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const todos = await getTodos(userId);
  return NextResponse.json(todos);
}

export async function POST(req: NextRequest) {
  const userId = await requireUser(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "empty text" }, { status: 400 });
  }
  const todo = await createTodo(userId, text);
  return NextResponse.json(todo, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const userId = await requireUser(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const id = typeof body?.id === "string" ? body.id : undefined;
  const completed = body?.completed;
  if (!id || typeof completed !== "boolean") {
    return NextResponse.json({ error: "bad payload" }, { status: 400 });
  }
  await updateTodoStatus(userId, id, completed);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const userId = await requireUser(req);
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
