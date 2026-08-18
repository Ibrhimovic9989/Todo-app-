import { and, desc, eq, gt, gte, isNull, lte, or } from "drizzle-orm";
import { db } from "./index";
import { labels, projects, taskLabels, todos } from "./schema";

export type Todo = {
  id: string;
  userId: string;
  projectId: string | null;
  parentId: string | null;
  text: string;
  description: string | null;
  completed: boolean;
  priority: number;
  dueDate: number | null;
  startDate: number | null;
  position: string;
  recurrenceRule: string | null;
  completedAt: number | null;
  createdAt: number;
  projectName?: string | null;
  labelIds?: string[];
  labelNames?: string[];
};

export type Project = typeof projects.$inferSelect;
export type Label = typeof labels.$inferSelect;

const todoColumns = {
  id: todos.id,
  userId: todos.userId,
  projectId: todos.projectId,
  parentId: todos.parentId,
  text: todos.text,
  description: todos.description,
  completed: todos.completed,
  priority: todos.priority,
  dueDate: todos.dueDate,
  startDate: todos.startDate,
  position: todos.position,
  recurrenceRule: todos.recurrenceRule,
  completedAt: todos.completedAt,
  createdAt: todos.createdAt,
  projectName: projects.name,
};

function mapRow(row: any): Todo {
  return {
    id: row.id,
    userId: row.userId,
    projectId: row.projectId ?? null,
    parentId: row.parentId ?? null,
    text: row.text,
    description: row.description ?? null,
    completed: row.completed,
    priority: row.priority ?? 0,
    dueDate: row.dueDate ?? null,
    startDate: row.startDate ?? null,
    position: row.position,
    recurrenceRule: row.recurrenceRule ?? null,
    completedAt: row.completedAt ?? null,
    createdAt: row.createdAt,
    projectName: row.projectName ?? null,
  };
}

export async function getTodos(userId: string): Promise<Todo[]> {
  const rows = await db
    .select(todoColumns)
    .from(todos)
    .leftJoin(projects, eq(todos.projectId, projects.id))
    .where(and(eq(todos.userId, userId), isNull(todos.parentId)))
    .orderBy(todos.position, desc(todos.createdAt));
  return rows.map(mapRow);
}

export async function getInboxTodos(userId: string): Promise<Todo[]> {
  const rows = await db
    .select(todoColumns)
    .from(todos)
    .leftJoin(projects, eq(todos.projectId, projects.id))
    .where(
      and(
        eq(todos.userId, userId),
        isNull(todos.parentId),
        eq(todos.completed, false),
        isNull(todos.projectId),
        isNull(todos.dueDate)
      )
    )
    .orderBy(todos.position, desc(todos.createdAt));
  return rows.map(mapRow);
}

export async function getTodayTodos(userId: string): Promise<Todo[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const rows = await db
    .select(todoColumns)
    .from(todos)
    .leftJoin(projects, eq(todos.projectId, projects.id))
    .where(
      and(
        eq(todos.userId, userId),
        isNull(todos.parentId),
        or(
          eq(todos.completed, false),
          and(
            eq(todos.completed, true),
            gte(todos.completedAt, start.getTime())
          )
        ),
        or(
          and(
            gte(todos.dueDate, start.getTime()),
            lte(todos.dueDate, end.getTime())
          ),
          isNull(todos.dueDate)
        )
      )
    )
    .orderBy(todos.position, desc(todos.createdAt));
  return rows.map(mapRow);
}

export async function getUpcomingTodos(userId: string): Promise<Todo[]> {
  const now = Date.now();
  const rows = await db
    .select(todoColumns)
    .from(todos)
    .leftJoin(projects, eq(todos.projectId, projects.id))
    .where(
      and(
        eq(todos.userId, userId),
        isNull(todos.parentId),
        eq(todos.completed, false),
        gt(todos.dueDate, now)
      )
    )
    .orderBy(todos.dueDate, todos.position);
  return rows.map(mapRow);
}

export async function getCompletedTodos(userId: string, limit = 100): Promise<Todo[]> {
  const rows = await db
    .select(todoColumns)
    .from(todos)
    .leftJoin(projects, eq(todos.projectId, projects.id))
    .where(and(eq(todos.userId, userId), isNull(todos.parentId), eq(todos.completed, true)))
    .orderBy(desc(todos.completedAt), desc(todos.createdAt))
    .limit(limit);
  return rows.map(mapRow);
}

export async function getProjectTodos(userId: string, projectId: string): Promise<Todo[]> {
  const rows = await db
    .select(todoColumns)
    .from(todos)
    .leftJoin(projects, eq(todos.projectId, projects.id))
    .where(
      and(
        eq(todos.userId, userId),
        isNull(todos.parentId),
        eq(todos.projectId, projectId)
      )
    )
    .orderBy(todos.position, desc(todos.createdAt));
  return rows.map(mapRow);
}

export async function getLabelTodos(userId: string, labelId: string): Promise<Todo[]> {
  const rows = await db
    .select({ ...todoColumns })
    .from(todos)
    .innerJoin(taskLabels, eq(todos.id, taskLabels.taskId))
    .leftJoin(projects, eq(todos.projectId, projects.id))
    .where(
      and(
        eq(todos.userId, userId),
        isNull(todos.parentId),
        eq(taskLabels.labelId, labelId)
      )
    )
    .orderBy(todos.position, desc(todos.createdAt));
  return rows.map(mapRow);
}

export async function getTodoLabels(taskId: string): Promise<Label[]> {
  return db
    .select({ id: labels.id, name: labels.name, color: labels.color, userId: labels.userId, createdAt: labels.createdAt })
    .from(labels)
    .innerJoin(taskLabels, eq(labels.id, taskLabels.labelId))
    .where(eq(taskLabels.taskId, taskId));
}

export async function getProjects(userId: string): Promise<Project[]> {
  return db
    .select()
    .from(projects)
    .where(and(eq(projects.userId, userId), eq(projects.archived, false)))
    .orderBy(projects.name);
}

export async function getLabels(userId: string): Promise<Label[]> {
  return db
    .select()
    .from(labels)
    .where(eq(labels.userId, userId))
    .orderBy(labels.name);
}

export async function getProjectByName(userId: string, name: string): Promise<Project | undefined> {
  const rows = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.userId, userId),
        eq(projects.archived, false),
        eq(projects.name, name)
      )
    )
    .limit(1);
  return rows[0];
}

export async function ensureProject(userId: string, name: string, color = "zinc"): Promise<Project> {
  const existing = await getProjectByName(userId, name);
  if (existing) return existing;
  const rows = await db
    .insert(projects)
    .values({ userId, name, color })
    .returning();
  return rows[0];
}

export async function getLabelByName(userId: string, name: string): Promise<Label | undefined> {
  const rows = await db
    .select()
    .from(labels)
    .where(and(eq(labels.userId, userId), eq(labels.name, name)))
    .limit(1);
  return rows[0];
}

export async function ensureLabel(userId: string, name: string, color = "zinc"): Promise<Label> {
  const existing = await getLabelByName(userId, name);
  if (existing) return existing;
  const rows = await db.insert(labels).values({ userId, name, color }).returning();
  return rows[0];
}

export async function createTodo(
  userId: string,
  data: {
    text: string;
    projectId?: string;
    priority?: number;
    dueDate?: number | null;
    position?: string;
    labelIds?: string[];
  }
): Promise<Todo> {
  const values: any = {
    userId,
    text: data.text,
    completed: false,
    priority: data.priority ?? 0,
    dueDate: data.dueDate ?? null,
    position: data.position ?? "a",
    projectId: data.projectId ?? null,
    parentId: null,
    description: null,
    startDate: null,
    recurrenceRule: null,
    completedAt: null,
  };

  const rows = await db.insert(todos).values(values).returning();
  const todo = rows[0];

  if (data.labelIds && data.labelIds.length > 0) {
    await db
      .insert(taskLabels)
      .values(data.labelIds.map((labelId) => ({ taskId: todo.id, labelId })))
      .onConflictDoNothing();
  }

  return {
    id: todo.id,
    userId: todo.userId,
    projectId: todo.projectId ?? null,
    parentId: todo.parentId ?? null,
    text: todo.text,
    description: todo.description ?? null,
    completed: todo.completed,
    priority: todo.priority ?? 0,
    dueDate: todo.dueDate ?? null,
    startDate: todo.startDate ?? null,
    position: todo.position,
    recurrenceRule: todo.recurrenceRule ?? null,
    completedAt: todo.completedAt ?? null,
    createdAt: todo.createdAt,
    projectName: null,
  };
}

export async function updateTodoStatus(
  userId: string,
  id: string,
  completed: boolean
) {
  await db
    .update(todos)
    .set({
      completed,
      completedAt: completed ? Date.now() : null,
    })
    .where(and(eq(todos.userId, userId), eq(todos.id, id)));
}

export async function updateTodo(
  userId: string,
  id: string,
  data: Partial<{
    text: string;
    completed: boolean;
    priority: number;
    dueDate: number | null;
    projectId: string | null;
    position: string;
    labelIds: string[];
  }>
) {
  const set: any = {};
  if (data.text !== undefined) set.text = data.text;
  if (data.completed !== undefined) {
    set.completed = data.completed;
    set.completedAt = data.completed ? Date.now() : null;
  }
  if (data.priority !== undefined) set.priority = data.priority;
  if (data.dueDate !== undefined) set.dueDate = data.dueDate;
  if (data.projectId !== undefined) set.projectId = data.projectId;
  if (data.position !== undefined) set.position = data.position;

  await db.update(todos).set(set).where(and(eq(todos.userId, userId), eq(todos.id, id)));

  if (data.labelIds) {
    await db.delete(taskLabels).where(eq(taskLabels.taskId, id));
    if (data.labelIds.length > 0) {
      await db
        .insert(taskLabels)
        .values(data.labelIds.map((labelId) => ({ taskId: id, labelId })))
        .onConflictDoNothing();
    }
  }
}

export async function deleteTodoById(userId: string, id: string) {
  await db.delete(todos).where(and(eq(todos.userId, userId), eq(todos.id, id)));
}

export async function deleteCompletedTodos(userId: string) {
  await db
    .delete(todos)
    .where(and(eq(todos.userId, userId), eq(todos.completed, true)));
}

export async function reorderTodo(userId: string, id: string, beforeId?: string, afterId?: string) {
  const [before, after] = await Promise.all([
    beforeId ? db.select({ position: todos.position }).from(todos).where(eq(todos.id, beforeId)).limit(1) : Promise.resolve([]),
    afterId ? db.select({ position: todos.position }).from(todos).where(eq(todos.id, afterId)).limit(1) : Promise.resolve([]),
  ]);
  const beforePos = before[0]?.position;
  const afterPos = after[0]?.position;
  const newPos = mid(beforePos, afterPos);
  await db
    .update(todos)
    .set({ position: newPos })
    .where(and(eq(todos.userId, userId), eq(todos.id, id)));
  return newPos;
}

function mid(a?: string, b?: string): string {
  if (!a && !b) return "a";
  if (!a) return decrement(b!);
  if (!b) return increment(a);
  // Simple lexicographic midpoint; good enough for typical lists
  const len = Math.max(a.length, b.length);
  const ac = a.padEnd(len, "a");
  const bc = b.padEnd(len, "a");
  const ai = toNum(ac);
  const bi = toNum(bc);
  const mi = Math.floor((ai + bi) / 2);
  return fromNum(mi, len);
}

function toNum(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    n = n * 26 + (s.charCodeAt(i) - 97);
  }
  return n;
}

function fromNum(n: number, len: number): string {
  let s = "";
  for (let i = 0; i < len; i++) {
    s = String.fromCharCode((n % 26) + 97) + s;
    n = Math.floor(n / 26);
  }
  return s;
}

function increment(s: string): string {
  return fromNum(toNum(s) + 1, s.length);
}

function decrement(s: string): string {
  const n = toNum(s);
  if (n <= 0) return "a" + decrement(s + "a"); // shouldn't happen in practice
  return fromNum(n - 1, s.length);
}
