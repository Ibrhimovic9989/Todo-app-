import "dotenv/config";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const parsed = new URL(url);
  const sql = postgres({
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 5432,
    username: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(parsed.pathname.replace(/^\/+/, "")),
    prepare: false,
    max: 1,
  });

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS projects (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      user_id text NOT NULL,
      name text NOT NULL,
      color text DEFAULT 'zinc',
      archived boolean DEFAULT false NOT NULL,
      created_at bigint NOT NULL DEFAULT extract(epoch from now()) * 1000
    );

    CREATE TABLE IF NOT EXISTS labels (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      user_id text NOT NULL,
      name text NOT NULL,
      color text DEFAULT 'zinc',
      created_at bigint NOT NULL DEFAULT extract(epoch from now()) * 1000
    );

    CREATE TABLE IF NOT EXISTS todos (
      id text PRIMARY KEY NOT NULL,
      user_id text NOT NULL,
      title text NOT NULL,
      completed boolean DEFAULT false NOT NULL,
      created_at bigint NOT NULL DEFAULT extract(epoch from now()) * 1000
    );

    CREATE TABLE IF NOT EXISTS task_labels (
      task_id text NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
      label_id uuid NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
      PRIMARY KEY (task_id, label_id)
    );

    -- Add columns if missing
    ALTER TABLE todos
      ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS parent_id text REFERENCES todos(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS description text,
      ADD COLUMN IF NOT EXISTS priority integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS due_date bigint,
      ADD COLUMN IF NOT EXISTS start_date bigint,
      ADD COLUMN IF NOT EXISTS position text DEFAULT 'a' NOT NULL,
      ADD COLUMN IF NOT EXISTS recurrence_rule text,
      ADD COLUMN IF NOT EXISTS completed_at bigint;

    -- Migrate legacy columns if they exist
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'todos' AND column_name = 'text'
      ) THEN
        UPDATE todos SET title = COALESCE(NULLIF(title,''), text) WHERE text IS NOT NULL;
      END IF;
    END $$;

    -- Convert priority text to integer if needed
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'todos' AND column_name = 'priority' AND data_type = 'text'
      ) THEN
        ALTER TABLE todos ADD COLUMN priority_int integer DEFAULT 0;
        UPDATE todos SET priority_int = CASE
          WHEN priority = 'high' THEN 1
          WHEN priority = 'medium' THEN 2
          WHEN priority = 'low' THEN 3
          ELSE 0
        END;
        ALTER TABLE todos DROP COLUMN priority;
        ALTER TABLE todos RENAME COLUMN priority_int TO priority;
      END IF;
    END $$;

    -- Convert due_date text to bigint if needed
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'todos' AND column_name = 'due_date' AND data_type = 'text'
      ) THEN
        ALTER TABLE todos ADD COLUMN due_date_int bigint;
        UPDATE todos SET due_date_int = NULLIF(due_date,'')::bigint WHERE due_date ~ '^[0-9]+$';
        ALTER TABLE todos DROP COLUMN due_date;
        ALTER TABLE todos RENAME COLUMN due_date_int TO due_date;
      END IF;
    END $$;

    -- Move notes into description
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'todos' AND column_name = 'notes'
      ) THEN
        UPDATE todos SET description = COALESCE(description, notes) WHERE notes IS NOT NULL AND notes <> '';
        ALTER TABLE todos DROP COLUMN IF EXISTS notes;
      END IF;
    END $$;

    -- Drop unused legacy columns
    ALTER TABLE todos DROP COLUMN IF EXISTS text;
    ALTER TABLE todos DROP COLUMN IF EXISTS category;

    -- Ensure not-null where required
    ALTER TABLE todos ALTER COLUMN title SET NOT NULL;

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
    CREATE INDEX IF NOT EXISTS idx_todos_project_id ON todos(project_id);
    CREATE INDEX IF NOT EXISTS idx_todos_parent_id ON todos(parent_id);
    CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
    CREATE INDEX IF NOT EXISTS idx_todos_position ON todos(position);
    CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_labels_user_id ON labels(user_id);
  `);

  console.log("database schema ready");
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
