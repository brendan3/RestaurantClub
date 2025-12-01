import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

// CommonJS default import workaround for ESM + esbuild
// This is necessary because Drizzle/ESM might struggle with default exports
const { Pool } = pg;

// Database connection state
let db: ReturnType<typeof drizzle> | null = null;
let pool: pg.Pool | null = null;

export function getDb() {
  // Return existing connection if available
  if (db) return db;

  const connectionString = process.env.DATABASE_URL;
  
  // Graceful fallback if URL is missing (your original logic)
  if (!connectionString) {
    console.warn("⚠️  DATABASE_URL not set, using in-memory storage");
    return null;
  }

  try {
    // 💡 FIX: Use standard pg.Pool for TCP connection (your original code already used this,
    // but we ensure the correct 'pg' import and the necessary SSL config)
    pool = new Pool({
      connectionString,
      // 💡 FIX: Add SSL configuration required for Railway/Neon when connecting locally or container-to-container
      // The `rejectUnauthorized: false` is often needed for development/self-signed certs in containers.
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });
    
    // 💡 FIX: drizzle import is correct now: drizzle-orm/node-postgres
    db = drizzle(pool, { schema });
    console.log("✅ Database connected");
    return db;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    // In a real application, you might want to throw the error here instead of returning null
    return null;
  }
}

// Clean up function
export async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
    console.log("Database connection pool closed.");
  }
}
