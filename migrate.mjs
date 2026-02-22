import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const connectionString = process.env.DB_URL;
if (!connectionString) {
  console.error("DB_URL environment variable is not set, skipping migrations");
  process.exit(1);
}

const maxAttempts = parseInt(process.env.MIGRATE_RETRIES || "5", 10);

async function runMigrations() {
  let lastError = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let sql;
    try {
      console.log(`Migration attempt ${attempt}/${maxAttempts}...`);
      sql = postgres(connectionString, { max: 1 });
      const db = drizzle(sql);
      await migrate(db, { migrationsFolder: "./drizzle" });
      console.log("Migrations completed successfully");
      await sql.end();
      return 0;
    } catch (error) {
      lastError = error;
      const msg = error && error.message ? error.message : String(error);
      console.error(`Migration attempt ${attempt} failed:`, msg);
      if (attempt === maxAttempts) break;
      const delay = Math.min(10000, 2000 * attempt);
      console.log(`Waiting ${delay}ms before retrying...`);
      try {
        await new Promise((r) => setTimeout(r, delay));
      } catch (e) {}
    } finally {
      if (sql) {
        try {
          await sql.end();
        } catch (e) {}
      }
    }
  }

  console.error("Migrations failed after multiple attempts:", lastError);
  return 1;
}

const exitCode = await runMigrations();
process.exit(exitCode);
