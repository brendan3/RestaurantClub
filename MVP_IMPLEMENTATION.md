# RestaurantClub MVP Implementation Guide

## 🎉 Implementation Complete!

This document summarizes the MVP implementation of RestaurantClub with full authentication, club management, event creation, and RSVP functionality.

---

## 📋 Summary of Changes

### **Backend Changes**

#### 1. **Schema Updates** (`shared/schema.ts`)

**Users Table:**
- ✅ Added `email` (unique, not null) - for email-based authentication
- ✅ Renamed `password` → `passwordHash` - for clarity
- ✅ Made `username` optional - now used as display name
- ✅ Added `updatedAt` timestamp
- ✅ Added auth validation schemas: `signupSchema`, `loginSchema`

**No changes needed for:**
- `clubs` - already has all required fields
- `clubMembers` - already supports roles (owner, admin, member)
- `events` - already has all required fields
- `eventAttendees` - already supports RSVP status
- `eventTags` - ready for future use

#### 2. **Authentication System** (`server/auth.ts`)

**New Features:**
- ✅ JWT-based authentication (7-day expiration)
- ✅ bcrypt password hashing (10 rounds)
- ✅ Auth middleware: `requireAuth` and `optionalAuth`
- ✅ Token verification from Bearer header or cookies
- ✅ Secure password validation

**Endpoints:**
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Clear session (client-side token removal)
- `GET /api/user/me` - Get current user profile (protected)

#### 3. **Storage Layer Updates**

**New Methods Added:**
- `getUserByEmail(email)` - Find user by email
- `createClub(clubData)` - Create new club
- `addClubMember(clubId, userId, role)` - Add member to club
- `getClubMembers(clubId)` - Get all club members
- `createRsvp(eventId, userId, status)` - Create RSVP
- `updateRsvp(eventId, userId, status)` - Update existing RSVP
- `getEventRsvps(eventId)` - Get all RSVPs for event
- `getUserRsvp(eventId, userId)` - Get user's RSVP

#### 4. **API Routes** (`server/routes.ts`)

**Auth Routes:**
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`

**Club Routes (Protected):**
- `GET /api/clubs/me` - Get user's clubs with members
- `POST /api/clubs` - Create new club (enforces one club per user)
- `GET /api/clubs/:id` - Get club details with members

**Event Routes (Protected):**
- `GET /api/events` - Get all events for user's club
- `GET /api/events/upcoming` - Get upcoming events
- `GET /api/events/past` - Get past events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event with RSVPs

**RSVP Routes (Protected):**
- `POST /api/events/:id/rsvp` - Create/update RSVP (attending, declined, maybe)
- `GET /api/events/:id/rsvps` - Get all RSVPs for event
- `GET /api/events/:id/rsvp/me` - Get user's RSVP for event

#### 5. **Dependencies Added**
```json
{
  "bcryptjs": "^2.x",
  "jsonwebtoken": "^9.x",
  "cookie-parser": "^1.x",
  "@types/bcryptjs": "^2.x",
  "@types/jsonwebtoken": "^9.x",
  "@types/cookie-parser": "^1.x"
}
```

---

### **Frontend Changes**

#### 1. **Authentication Context** (`client/src/lib/auth-context.tsx`)

**Features:**
- React Context for global auth state
- Auto-loads user on app start
- Provides `user`, `isLoading`, `isAuthenticated`, `setUser`, `refreshUser`
- Used throughout the app for auth checks

#### 2. **API Client Updates** (`client/src/lib/api.ts`)

**New Functions:**
- `signup(email, password, name)` - Create account
- `login(email, password)` - Login
- `logout()` - Logout
- `isAuthenticated()` - Check auth status
- `getCurrentUser()` - Get current user
- `getUserClubs()` - Get user's clubs
- `createClub(name, type)` - Create club
- `getClubById(id)` - Get club details
- `createEvent(eventData)` - Create event
- `rsvpToEvent(eventId, status)` - RSVP to event
- `getEventRsvps(eventId)` - Get event RSVPs
- `getUserRsvp(eventId)` - Get user's RSVP

**Token Management:**
- Stores JWT in localStorage
- Automatically includes Bearer token in all requests
- Includes credentials for cookie support

#### 3. **New Pages**

**Login Page** (`client/src/pages/Login.tsx`)
- Combined login/signup form with tabs
- Email + password authentication
- Form validation
- Redirects to dashboard on success
- Beautiful gradient background

#### 4. **Updated Pages**

**App.tsx:**
- ✅ Added `AuthProvider` wrapper
- ✅ Added `ProtectedRoute` component
- ✅ All routes now require authentication
- ✅ Redirects to `/login` if not authenticated
- ✅ Shows loading spinner during auth check

**Profile Page:**
- ✅ Uses real user data from auth context
- ✅ Displays user stats (attendance, avg rating, etc.)
- ✅ Real logout functionality
- ✅ Clears token and redirects to login

**Club Page:**
- ✅ Loads user's clubs from API
- ✅ Shows "Create Club" prompt if no club
- ✅ Displays club members with roles
- ✅ Shows owner badge
- ✅ Real-time member count

**CreateClub Page:**
- ✅ Wired to real API
- ✅ Creates club on backend
- ✅ Enforces one club per user
- ✅ Redirects to club page on success

**Dashboard Page:**
- ✅ Loads upcoming events from API
- ✅ Shows next dinner with countdown
- ✅ RSVP functionality (I'm In / Can't Make It)
- ✅ Shows attendee count and avatars
- ✅ Displays user stats
- ✅ Real-time RSVP updates

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js >= 22.12.0
- PostgreSQL database (local or Railway)

### Setup Steps

1. **Install Dependencies**
```bash
npm install
```

2. **Set Environment Variables**

Create a `.env` file:
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=development
```

3. **Push Database Schema**
```bash
npm run db:push
```

This will create/update all tables:
- `users` (with email, passwordHash, etc.)
- `clubs`
- `club_members`
- `events`
- `event_attendees`
- `event_tags`

4. **Run Development Server**

**Option A: Full-stack (Frontend + Backend)**
```bash
npm run dev
```
Access at: http://localhost:5000

**Option B: API Only**
```bash
npm run dev:api
```
Access at: http://localhost:3000

**Option C: Frontend Only** (requires separate API server)
```bash
npm run dev:client
```
Access at: http://localhost:5000

5. **Build for Production**
```bash
npm run build
npm start
```

---

## 🧪 Testing the MVP

### 1. **Create an Account**
1. Go to http://localhost:5000/login
2. Click "Sign Up" tab
3. Enter name, email, password (min 8 chars)
4. Click "Sign Up"
5. You'll be logged in and redirected to dashboard

### 2. **Create a Club**
1. After signup, you'll see "Create Your Club" prompt
2. Click "Create Your Club"
3. Fill in club name (e.g., "The Burger Barons")
4. Choose privacy setting (Public/Private)
5. Click "Launch Club"
6. You'll be redirected to your club page

### 3. **Create an Event**
Currently events need to be created via API. Use this curl command:

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "restaurantName": "La Trattoria",
    "cuisine": "Italian",
    "eventDate": "2025-01-15T19:00:00Z",
    "location": "123 Main St, New York, NY"
  }'
```

Get your JWT token from localStorage after logging in, or from the login response.

### 4. **RSVP to Event**
1. Go to Dashboard
2. See the upcoming dinner card
3. Click "I'm In!" to RSVP as attending
4. See attendee count update
5. Click "Can't Make It" to change RSVP

### 5. **View Club Members**
1. Go to Club page (sidebar or mobile nav)
2. See all members with their roles
3. Owner has a crown badge

### 6. **Logout**
1. Go to Profile page
2. Click "Sign Out" button
3. You'll be logged out and redirected to login

---

## 🌐 Production Deployment

### Railway (Backend)

1. **Push to GitHub**
```bash
git add .
git commit -m "Implement MVP with auth, clubs, events, and RSVP"
git push origin main
```

2. **Railway will auto-deploy** if connected to GitHub

3. **Run Database Migration** (one-time)
```bash
# In Railway dashboard, run this command:
npm run db:push
```

4. **Set Environment Variables in Railway**
- `DATABASE_URL` - Auto-set by Railway Postgres
- `JWT_SECRET` - Generate a secure random string
- `NODE_ENV=production`

### Vercel (Frontend)

1. **Set Environment Variable**
```
VITE_API_BASE_URL=https://restaurantclub-production-*.up.railway.app
```

2. **Deploy**
```bash
vercel --prod
```

---

## 📝 API Documentation

### Authentication

**Signup**
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

Response: {
  "user": { "id", "email", "name", ... },
  "token": "jwt_token_here"
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: {
  "user": { "id", "email", "name", ... },
  "token": "jwt_token_here"
}
```

**Get Current User**
```http
GET /api/user/me
Authorization: Bearer {token}

Response: {
  "id", "email", "name", "username", "avatar", "memberSince",
  "stats": { "attendance", "avgRating", "totalDinners", "avgBill" }
}
```

### Clubs

**Get My Clubs**
```http
GET /api/clubs/me
Authorization: Bearer {token}

Response: [{
  "id", "name", "type", "createdAt",
  "members": 5,
  "membersList": [{ "id", "name", "avatar", "role" }]
}]
```

**Create Club**
```http
POST /api/clubs
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "The Burger Barons",
  "type": "private"
}

Response: { "id", "name", "type", "createdAt" }
```

### Events

**Get Upcoming Events**
```http
GET /api/events/upcoming
Authorization: Bearer {token}

Response: [{
  "id", "clubId", "restaurantName", "cuisine", "eventDate",
  "location", "status", "pickerId", "imageUrl", "createdAt"
}]
```

**Create Event**
```http
POST /api/events
Authorization: Bearer {token}
Content-Type: application/json

{
  "restaurantName": "La Trattoria",
  "cuisine": "Italian",
  "eventDate": "2025-01-15T19:00:00Z",
  "location": "123 Main St"
}

Response: { event object }
```

### RSVPs

**RSVP to Event**
```http
POST /api/events/{eventId}/rsvp
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "attending" // or "declined" or "maybe"
}

Response: { "message": "RSVP saved successfully", "status": "attending" }
```

**Get Event RSVPs**
```http
GET /api/events/{eventId}/rsvps
Authorization: Bearer {token}

Response: [{
  "id", "name", "email", "avatar", "status", "rsvpAt"
}]
```

---

## 🔐 Security Features

1. **Password Hashing**: bcrypt with 10 rounds
2. **JWT Tokens**: 7-day expiration, signed with secret
3. **Protected Routes**: All club/event/RSVP endpoints require authentication
4. **Input Validation**: Zod schemas for all user inputs
5. **SQL Injection Protection**: Drizzle ORM with parameterized queries
6. **CORS**: Configured for production domain
7. **HTTP-Only Cookies**: Supported for additional security

---

## 🎯 MVP Features Implemented

✅ **Phase 1: Authentication**
- Email + password signup/login
- JWT token management
- Protected routes
- User sessions

✅ **Phase 2: Club Management**
- Create club (one per user)
- View club members
- Role-based membership (owner, admin, member)
- Member avatars and details

✅ **Phase 3: Event Management**
- Create events (monthly dinners)
- View upcoming events
- View past events
- Event details with picker

✅ **Phase 4: RSVP System**
- RSVP to events (attending/declined/maybe)
- View attendee list
- Real-time attendee count
- User's RSVP status display

✅ **Phase 5: Logout**
- Real logout functionality
- Token clearing
- Redirect to login

---

## 🚧 Future Enhancements

**Near-term:**
- Event creation UI (currently API-only)
- Invite members to club
- Event editing/deletion
- Profile editing
- Avatar upload

**Medium-term:**
- Multiple clubs per user
- Club discovery
- Event comments/discussion
- Photo uploads for events
- Restaurant wishlist voting
- Push notifications

**Long-term:**
- Social feed with real posts
- Badges and achievements
- Restaurant recommendations
- Bill splitting
- Calendar integration

---

## 🐛 Troubleshooting

**"Authentication required" error:**
- Check that JWT_SECRET is set
- Verify token is being sent in Authorization header
- Check token hasn't expired (7 days)

**"You already belong to a club" error:**
- MVP enforces one club per user
- Check existing club at `/club` page
- Future: support multiple clubs

**Database connection errors:**
- Verify DATABASE_URL is correct
- Check database is running
- Run `npm run db:push` to create tables

**CORS errors:**
- Check VITE_API_BASE_URL matches backend URL
- Verify CORS settings in `server/index.ts`
- Check credentials: true is set

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review error logs in browser console
3. Check server logs for API errors
4. Verify environment variables are set

---

## 🎉 Congratulations!

You now have a fully functional RestaurantClub MVP with:
- ✅ User authentication
- ✅ Club management
- ✅ Event creation
- ✅ RSVP functionality
- ✅ Real-time updates

Time to gather your friends and start dining! 🍽️

