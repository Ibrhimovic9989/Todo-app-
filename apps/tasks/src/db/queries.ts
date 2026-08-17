import { and, eq } from "drizzle-orm";
import { db } from "./index";
import { todos } from "./schema";

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

export async function getTodos(userId: string): Promise<Todo[]> {
  return db.query.todos.findMany({
    where: eq(todos.userId, userId),
    orderBy: (t, { desc }) => desc(t.createdAt),
  });
}

export async function createTodo(userId: string, text: string): Promise<Todo> {
  const rows = await db
    .insert(todos)
    .values({ userId, text, completed: false })
    .returning();
  return rows[0];
}

export async function updateTodoStatus(
  userId: string,
  id: string,
  completed: boolean
) {
  await db
    .update(todos)
    .set({ completed })
    .where(and(eq(todos.userId, userId), eq(todos.id, id)));
}

export async function deleteTodoById(userId: string, id: string) {
  await db.delete(todos).where(and(eq(todos.userId, userId), eq(todos.id, id)));
}

export async function deleteCompletedTodos(userId: string) {
  await db
    .delete(todos)
    .where(and(eq(todos.userId, userId), eq(todos.completed, true)));
}
