import "dotenv/config";
import postgres from "postgres";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, {
    prepare: false,
    max: 1,
  });
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS todos (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      user_id text NOT NULL,
      text text NOT NULL,
      completed boolean DEFAULT false NOT NULL,
      created_at timestamp with time zone DEFAULT now() NOT NULL
    );
  `);
  console.log("todos table ready");
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
