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

  const cols = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'todos'
    ORDER BY ordinal_position
  `;
  console.log("todos columns:", cols);
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
