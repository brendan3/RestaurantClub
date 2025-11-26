# Frontend API Migration Guide

This guide shows how to replace mock data with real API calls.

## Overview

**Before:** Pages import from `@/lib/mockData`
**After:** Pages use `@/lib/api` with React Query for data fetching

## Step-by-Step Migration

### 1. Install React Query (Already Done ✅)

The project already has `@tanstack/react-query` installed.

### 2. Replace Mock Data Imports

**Before:**
```tsx
import { NEXT_EVENT, CURRENT_USER } from "@/lib/mockData";
```

**After:**
```tsx
import { useQuery } from "@tanstack/react-query";
import { getUpcomingEvents, getCurrentUser } from "@/lib/api";
```

### 3. Use Hooks for Data Fetching

**Before:**
```tsx
export default function Dashboard() {
  return (
    <div>
      <h1>{CURRENT_USER.name}</h1>
      <p>{NEXT_EVENT.restaurant}</p>
    </div>
  );
}
```

**After:**
```tsx
export default function Dashboard() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["upcomingEvents"],
    queryFn: getUpcomingEvents,
  });

  if (userLoading || eventsLoading) {
    return <div>Loading...</div>;
  }

  const nextEvent = events?.[0];

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{nextEvent?.restaurant}</p>
    </div>
  );
}
```

### 4. Handle Loading & Error States

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ["events"],
  queryFn: getEvents,
});

if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <NoData />;

return <EventsList events={data} />;
```

## Environment Variables

### Local Development (API on localhost:3000)

No environment variables needed - defaults to `http://localhost:3000`

### Local Development (API on different port)

Create `.env.local`:
```
VITE_API_BASE_URL=http://localhost:8080
```

### Production (API on Railway)

Set in Vercel environment variables:
```
VITE_API_BASE_URL=https://your-api.railway.app
```

## Migration Order (Recommended)

1. ✅ Dashboard page - Main user data
2. History page - Past events
3. Profile page - User stats
4. Social page - Feed data
5. Club page - Club details

## Testing Migration

1. Keep mock data imports alongside API calls initially
2. Use feature flag to switch between mock and real data
3. Test with `npm run dev:api` running on port 3000
4. Verify data matches expected structure

## Example: Gradual Migration Pattern

```tsx
const USE_API = import.meta.env.VITE_USE_API === "true";

export default function Dashboard() {
  // Mock data (fallback)
  const mockData = NEXT_EVENT;

  // API data
  const { data: apiData } = useQuery({
    queryKey: ["upcomingEvents"],
    queryFn: getUpcomingEvents,
    enabled: USE_API,
  });

  const event = USE_API ? apiData?.[0] : mockData;

  return <EventCard event={event} />;
}
```

## Next Steps

After migration:
1. Remove mock data files
2. Add proper loading skeletons
3. Add error boundaries
4. Implement retry logic
5. Add optimistic updates for mutations

