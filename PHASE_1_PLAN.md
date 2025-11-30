# Phase 1: Backend MVP Implementation Plan

**Status:** Ready to Execute (After Phase 0 deployment)

---

## 🎯 Overview

Deploy Express + Drizzle backend to Railway with PostgreSQL, then connect ONE frontend screen to real data.

---

## 📋 PART 1: Deploy Backend to Railway

### Step 1.1: Create Railway Project

1. **Go to:** https://railway.app
2. **Click:** "New Project"
3. **Select:** "Deploy from GitHub repo"
4. **Choose:** `brendan3/RestaurantClub`
5. **Railway will:** Auto-detect Node.js and use existing config

### Step 1.2: Add PostgreSQL Database

1. **In Railway Project:**
   - Click **"+ New"**
   - Select **"Database"**
   - Choose **"PostgreSQL"**

2. **Railway automatically:**
   - Creates database
   - Sets `DATABASE_URL` environment variable
   - Connects it to your service

### Step 1.3: Configure Build Settings

**Check Railway auto-detected these:**
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Root Directory:** `/`

**If not auto-detected, set manually in Railway settings.**

### Step 1.4: Set Environment Variables

**In Railway → Variables:**

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Auto-set by Railway |
| `DATABASE_URL` | (auto-set) | PostgreSQL connection string |
| `PORT` | (auto-set) | Railway assigns this |
| `API_ONLY` | `false` | We want full-stack mode initially |

### Step 1.5: Deploy & Get URL

1. **Railway deploys automatically**
2. **Get your URL:**
   - Click **"Settings"** → **"Domains"**
   - Click **"Generate Domain"**
   - Copy URL: `https://restaurantclub-production-XXXX.up.railway.app`

### Step 1.6: Test API Endpoints

```bash
# Health check
curl https://your-railway-url.railway.app/api/health

# Events
curl https://your-railway-url.railway.app/api/events

# Upcoming events
curl https://your-railway-url.railway.app/api/events/upcoming
```

**Expected:** JSON responses with mock data (currently)

---

## 📋 PART 2: Database Schema Setup

### Step 2.1: Create Database Schema

**File to create:** `shared/schema.ts` (expand existing)

**Tables needed:**

```typescript
// Events table
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantName: text("restaurant_name").notNull(),
  cuisine: text("cuisine").notNull(),
  eventDate: timestamp("event_date").notNull(),
  location: text("location"),
  status: text("status").notNull(), // 'pending' | 'confirmed' | 'past'
  rating: integer("rating"),
  totalBill: integer("total_bill"),
  pickerId: varchar("picker_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Attendees (many-to-many)
export const eventAttendees = pgTable("event_attendees", {
  eventId: varchar("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
});

// Clubs table
export const clubs = pgTable("clubs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'private' | 'public'
  createdAt: timestamp("created_at").defaultNow(),
});

// Club members
export const clubMembers = pgTable("club_members", {
  clubId: varchar("club_id").notNull().references(() => clubs.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role").default("member"), // 'owner' | 'admin' | 'member'
});
```

### Step 2.2: Run Database Migration

```bash
# Local (to test)
npm run db:push

# Railway (automatic)
# Railway will run migrations on deployment
```

### Step 2.3: Seed Initial Data

**Create:** `server/seed.ts`

Populate database with:
- Test users
- Sample clubs
- Sample events (past and upcoming)

---

## 📋 PART 3: Replace Mock Data with DB Queries

### Step 3.1: Update Storage Interface

**File:** `server/storage.ts`

Add methods:
```typescript
export interface IStorage {
  // Existing user methods...
  
  // Events
  getEvents(): Promise<Event[]>;
  getUpcomingEvents(): Promise<Event[]>;
  getPastEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // Clubs
  getUserClubs(userId: string): Promise<Club[]>;
  
  // Stats
  getUserStats(userId: string): Promise<UserStats>;
}
```

### Step 3.2: Implement Drizzle Queries

**Replace** `MemStorage` with `PostgresStorage`:

```typescript
export class PostgresStorage implements IStorage {
  async getEvents(): Promise<Event[]> {
    return db.select().from(events)
      .orderBy(desc(events.eventDate));
  }
  
  async getUpcomingEvents(): Promise<Event[]> {
    return db.select().from(events)
      .where(eq(events.status, 'confirmed'))
      .orderBy(asc(events.eventDate));
  }
  
  async getPastEvents(): Promise<Event[]> {
    return db.select().from(events)
      .where(eq(events.status, 'past'))
      .orderBy(desc(events.eventDate));
  }
}
```

### Step 3.3: Update Routes to Use DB

**File:** `server/routes.ts`

**Replace mock imports** with storage calls:

```typescript
// BEFORE
import { mockEvents } from "./mockData";
app.get("/api/events", (_req, res) => {
  res.json(mockEvents);
});

// AFTER
app.get("/api/events", async (_req, res) => {
  const events = await storage.getEvents();
  res.json(events);
});
```

---

## 📋 PART 4: Connect Frontend to Backend API

### Target Screen: **History Page** (Easiest to Migrate)

**Why History?**
- Simple list of past events
- Read-only (no mutations)
- Good visual feedback
- Uses existing API endpoint `/api/events/past`

### Step 4.1: Set Vercel Environment Variable

**In Vercel Dashboard:**

1. Go to **Project Settings** → **Environment Variables**
2. Add:
   ```
   Key: VITE_API_BASE_URL
   Value: https://your-railway-url.railway.app
   ```
3. **Redeploy** (Vercel auto-redeploys on setting change)

### Step 4.2: Update History Page

**File:** `client/src/pages/History.tsx`

**Current state:** Imports `PAST_EVENTS` from mockData

**Migration steps:**

```typescript
// BEFORE (lines ~1-3)
import { PAST_EVENTS } from "@/lib/mockData";

// AFTER
import { useQuery } from "@tanstack/react-query";
import { getPastEvents } from "@/lib/api";
```

**Then in component:**

```typescript
// BEFORE
export default function History() {
  const events = PAST_EVENTS;
  // ... render events
}

// AFTER
export default function History() {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ["pastEvents"],
    queryFn: getPastEvents,
  });

  if (isLoading) {
    return <div className="text-center py-20">Loading history...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">Error loading events</div>;
  }

  if (!events || events.length === 0) {
    return <div className="text-center py-20">No past events yet</div>;
  }

  // ... render events (same as before)
}
```

### Step 4.3: Test End-to-End

**Test flow:**

1. **Backend:** Railway API returns DB data
2. **Frontend:** Vercel calls Railway API
3. **iOS App:** Loads Vercel app, which fetches from Railway
4. **Result:** Real data flows through entire stack! 🎉

---

## 📊 Migration Order (After History)

Once History works, migrate in this order:

1. ✅ **History** - Past events list
2. **Dashboard** - Upcoming event + stats
3. **Profile** - User stats
4. **Social** - Feed data
5. **Club** - Club details

---

## 🧪 Testing Plan

### Local Testing

```bash
# Terminal 1: API server
npm run dev:api

# Terminal 2: Test API
curl http://localhost:3000/api/events/past

# Terminal 3: Frontend (with env var)
VITE_API_BASE_URL=http://localhost:3000 npm run dev:client
```

### Production Testing

1. **Deploy backend** to Railway
2. **Set env var** in Vercel
3. **Redeploy** Vercel
4. **Test on iPhone** - should show real data!

---

## 🚨 Potential Issues & Solutions

### Issue 1: CORS Errors

**Solution:** Add CORS middleware in `server/index.ts`:

```typescript
import cors from "cors";

app.use(cors({
  origin: ["https://restaurant-club-eight.vercel.app"],
  credentials: true,
}));
```

### Issue 2: Database Connection Fails

**Check:**
- `DATABASE_URL` is set in Railway
- Drizzle config points to correct database
- Database is in same region as Railway service

### Issue 3: API Returns Empty Data

**Solution:** Run seed script to populate database

### Issue 4: Frontend Shows Loading Forever

**Check:**
- `VITE_API_BASE_URL` is set correctly
- Railway service is running
- API endpoints return valid JSON

---

## 📦 Dependencies to Add

**Backend:**
```bash
npm install cors
npm install --save-dev @types/cors
```

**Frontend:**
No new dependencies needed! Already has React Query.

---

## ⏱️ Time Estimates

- **Railway Deployment:** 10-15 minutes
- **Database Schema:** 20-30 minutes
- **Update Routes:** 15-20 minutes
- **Migrate History Page:** 10-15 minutes
- **Testing & Debugging:** 30-60 minutes

**Total:** ~2-3 hours for complete MVP

---

## ✅ Success Criteria

Phase 1 is complete when:

1. ✅ Backend deployed to Railway with PostgreSQL
2. ✅ Database has schema and seed data
3. ✅ API endpoints return DB data (not mocks)
4. ✅ History page shows real data from database
5. ✅ iOS app displays real data on iPhone
6. ✅ No console errors or API failures

---

## 🚀 Ready to Execute

**Next command:** Deploy to Railway!

All planning is complete. Ready to implement when you are.

