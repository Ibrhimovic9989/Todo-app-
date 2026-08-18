import { randomUUID } from "node:crypto";
import {
  pgTable,
  text,
  boolean,
  bigint,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const projects = pgTable("projects", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  color: text("color").default("zinc"),
  archived: boolean("archived").notNull().default(false),
  createdAt: bigint("created_at", { mode: "number" })
    .notNull()
    .$defaultFn(() => Date.now()),
});

export const labels = pgTable("labels", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  color: text("color").default("zinc"),
  createdAt: bigint("created_at", { mode: "number" })
    .notNull()
    .$defaultFn(() => Date.now()),
});

export const todos = pgTable("todos", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id").notNull(),
  projectId: text("project_id"),
  parentId: text("parent_id"),
  text: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").notNull().default(false),
  priority: integer("priority").default(0), // 0=none, 1..4 = p1 highest
  dueDate: bigint("due_date", { mode: "number" }),
  startDate: bigint("start_date", { mode: "number" }),
  position: text("position").notNull().default("a"), // lexo rank
  recurrenceRule: text("recurrence_rule"),
  completedAt: bigint("completed_at", { mode: "number" }),
  createdAt: bigint("created_at", { mode: "number" })
    .notNull()
    .$defaultFn(() => Date.now()),
});

export const taskLabels = pgTable(
  "task_labels",
  {
    taskId: text("task_id").notNull(),
    labelId: text("label_id").notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.taskId, t.labelId] }),
  })
);

export const todosRelations = relations(todos, ({ one, many }) => ({
  project: one(projects, {
    fields: [todos.projectId],
    references: [projects.id],
  }),
  parent: one(todos, {
    fields: [todos.parentId],
    references: [todos.id],
  }),
  labels: many(taskLabels),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  todos: many(todos),
}));

export const labelsRelations = relations(labels, ({ many }) => ({
  tasks: many(taskLabels),
}));

export const taskLabelsRelations = relations(taskLabels, ({ one }) => ({
  task: one(todos, {
    fields: [taskLabels.taskId],
    references: [todos.id],
  }),
  label: one(labels, {
    fields: [taskLabels.labelId],
    references: [labels.id],
  }),
}));
