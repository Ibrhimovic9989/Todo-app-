import { randomUUID } from "node:crypto";
import { pgTable, text, boolean, bigint } from "drizzle-orm/pg-core";

export const todos = pgTable("todos", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id"),
  text: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: bigint("created_at", { mode: "number" })
    .notNull()
    .$defaultFn(() => Date.now()),
});
