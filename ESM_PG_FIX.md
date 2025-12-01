# 🔧 ESM + CommonJS Compatibility Fix

## The Problem

When deploying to Railway with esbuild bundling, we encountered:

```
SyntaxError: Named export 'Pool' not found. The requested module 'pg' is a CommonJS module, 
which may not support all module.exports as named exports.
```

## Root Cause

- **`pg` (node-postgres)** is a **CommonJS** module
- Our project uses **ESM** (`"type": "module"` in `package.json`)
- **esbuild** bundles our code but marks packages as `--packages=external`
- Node.js ESM can't do named imports from CommonJS modules by default

## The Solution

### ❌ Before (Broken)
```typescript
import { Pool } from "pg";
```

### ✅ After (Working)
```typescript
import pg from "pg";
const { Pool } = pg;
```

This uses the **default import** from the CommonJS module, then destructures what we need.

## Files Changed

### `server/db.ts`
```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

// CommonJS default import workaround for ESM + esbuild
const { Pool } = pg;

// Database connection
let db: ReturnType<typeof drizzle> | null = null;
let pool: Pool | null = null;

export function getDb() {
  if (db) return db;

  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.warn("⚠️  DATABASE_URL not set, using in-memory storage");
    return null;
  }

  try {
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });
    
    db = drizzle(pool, { schema });
    console.log("✅ Database connected");
    return db;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return null;
  }
}

export async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
}
```

## Node Version Requirements

We also updated the Node version requirements to satisfy Vite:

### `.nvmrc`
```
22.12.0
```

### `package.json`
```json
{
  "engines": {
    "node": ">=22.12.0",
    "npm": ">=10.0.0"
  }
}
```

## Why This Matters

1. **Railway uses esbuild** in production builds
2. **esbuild preserves external imports** but doesn't transpile them
3. **Node.js ESM loader** is strict about named exports from CommonJS
4. **Default import + destructure** is the universal workaround

## Testing

```bash
# Build locally
npm run build

# Start the built server
node dist/index.js

# Should start without import errors
```

## Alternative Approaches We Didn't Use

### Option A: Switch to `@neondatabase/serverless`
- ❌ Had DNS issues on Railway (`api.railway.internal` not resolving)
- ❌ Not reliable for Railway environment

### Option B: Use `drizzle-orm/neon-http`
- ❌ Same DNS issues as above
- ❌ Requires external API endpoint (not ideal for Railway internal networking)

### Option C: Configure esbuild to bundle `pg`
- ❌ `pg` has native dependencies that don't bundle well
- ❌ Would require complex platform-specific builds
- ❌ Not worth the complexity

### Option D: Use TypeScript `esModuleInterop`
- ❌ Only helps at compile time, not runtime
- ❌ esbuild ignores TypeScript config for imports
- ❌ Doesn't solve the Node.js ESM loader issue

## Final Architecture

```
┌─────────────────────────────────────┐
│  ESM Code (server/db.ts)            │
│  import pg from "pg"                 │
│  const { Pool } = pg                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  esbuild (bundles, external deps)   │
│  --format=esm --packages=external   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Node.js ESM Loader                 │
│  Loads external CJS modules         │
│  Default import works ✅            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  pg (CommonJS module)               │
│  module.exports = { Pool, Client }  │
└─────────────────────────────────────┘
```

## Verification

After deploying to Railway, you should see:

```bash
curl https://your-app.up.railway.app/api/health
# {"ok":true,"timestamp":"...","database":"connected"}

curl https://your-app.up.railway.app/api/events
# [... event data ...]
```

✅ No import errors
✅ Database connects successfully
✅ API endpoints work

---

**Last Updated**: December 1, 2025
**Status**: ✅ Fixed and deployed

