import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

// Check for the environment variable
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// 1. Create the PostgreSQL Connection Pool
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// 2. Create the Drizzle DB client using the pool
// This exports 'db' which is needed by dbStorage.ts and seed.ts
export const db = drizzle(pool, { schema });

// NOTE: We are intentionally NOT exporting getDb() anymore.
// dbStorage.ts will need to be updated next.
