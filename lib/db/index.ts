import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Lazy-initialised Drizzle client.
 * The connection is created on first access so that importing this module
 * during `next build` (when no DB is available) does not crash the build.
 */
let _db: PostgresJsDatabase<typeof schema> | null = null;

function getDb(): PostgresJsDatabase<typeof schema> {
  if (!_db) {
    if (!process.env.DB_URL) {
      throw new Error(
        'DB_URL environment variable is not set. ' +
        'Create a .env.local file with DB_URL=postgresql://USER:PASS@HOST:5432/DB'
      );
    }
    const client = postgres(process.env.DB_URL);
    _db = drizzle(client, { schema });
  }
  return _db;
}

/** Proxy that lazily resolves to the real Drizzle instance on first property access */
export const db: PostgresJsDatabase<typeof schema> = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real, prop, receiver);
    return typeof value === 'function' ? value.bind(real) : value;
  },
});

