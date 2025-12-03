// drizzle.config.ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./shared/schema.ts",       // <- matches your repo structure
  out: "./drizzle",                   // where migrations/meta will go
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,   // uses the .env you just fixed
  },
  // NOTE: no `driver` field here – we let drizzle-kit choose the default
});
