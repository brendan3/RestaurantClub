import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Database connection
let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (db) return db;

  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.warn("⚠️  DATABASE_URL not set, using in-memory storage");
    return null;
  }

  try {
    const sql = neon(connectionString);
    db = drizzle(sql, { schema });
    console.log("✅ Database connected");
    return db;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return null;
  }
}

