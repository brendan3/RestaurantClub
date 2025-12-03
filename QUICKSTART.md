# 🚀 RestaurantClub MVP - Quick Start Guide

## Get Running in 5 Minutes

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Set Up Environment Variables

Create `.env` file in the root:
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your-super-secret-key-change-this-in-production
NODE_ENV=development
```

**Don't have a database?** Get a free PostgreSQL database from [Railway](https://railway.app) in 2 minutes:
1. Sign up at railway.app
2. Create new project → Add PostgreSQL
3. Copy the DATABASE_URL from the Connect tab

### 3️⃣ Initialize Database
```bash
# Push schema to database
npm run db:push

# Seed with test data (optional but recommended)
npm run db:seed
```

### 4️⃣ Start the App
```bash
npm run dev
```

Open http://localhost:5000 🎉

---

## 🧪 Test the App

### Option A: Use Seeded Test Data

If you ran `npm run db:seed`, login with:
- **Email:** `alex@example.com`
- **Password:** `password123`

You'll see:
- ✅ A club with 5 members
- ✅ An upcoming dinner (La Trattoria)
- ✅ Past dinners with ratings
- ✅ RSVP functionality

### Option B: Start Fresh

1. Go to http://localhost:5000/login
2. Click "Sign Up" tab
3. Create your account
4. Create your club
5. Start planning dinners!

---

## 📱 Key Features to Try

### ✅ Authentication
- Sign up with email/password
- Login/logout
- Protected routes

### ✅ Club Management
- Create a club (one per user in MVP)
- View members with roles
- See club stats

### ✅ Event Management
- View upcoming dinners
- See past dinners with ratings
- Countdown to next event

### ✅ RSVP System
- Click "I'm In!" to attend
- See who's attending
- Change your RSVP

---

## 🛠️ Development Commands

```bash
# Full-stack dev (frontend + backend)
npm run dev

# Backend only (API server)
npm run dev:api

# Frontend only (requires separate API)
npm run dev:client

# Build for production
npm run build

# Start production server
npm start

# Database commands
npm run db:push    # Push schema changes
npm run db:seed    # Seed test data

# Type checking
npm run check
```

---

## 🌐 API Endpoints

All endpoints (except auth) require `Authorization: Bearer {token}` header.

### Auth
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/user/me` - Get current user

### Clubs
- `GET /api/clubs/me` - Get my clubs
- `POST /api/clubs` - Create club
- `GET /api/clubs/:id` - Get club details

### Events
- `GET /api/events` - All events
- `GET /api/events/upcoming` - Upcoming events
- `GET /api/events/past` - Past events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Event details

### RSVPs
- `POST /api/events/:id/rsvp` - RSVP to event
- `GET /api/events/:id/rsvps` - Get all RSVPs
- `GET /api/events/:id/rsvp/me` - Get my RSVP

---

## 🐛 Common Issues

**"Authentication required" error**
- Make sure you're logged in
- Check JWT_SECRET is set in .env
- Token expires after 7 days - login again

**Database connection error**
- Verify DATABASE_URL is correct
- Check database is running
- Run `npm run db:push` to create tables

**Port already in use**
- Change PORT in .env
- Or kill the process: `lsof -ti:5000 | xargs kill`

**CORS errors**
- Check VITE_API_BASE_URL matches your backend
- Verify backend CORS settings

---

## 📚 More Info

- **Full Documentation:** See `MVP_IMPLEMENTATION.md`
- **Deployment Guide:** See `RAILWAY_DEPLOY_GUIDE.md`
- **Schema Details:** See `shared/schema.ts`

---

## 🎉 You're Ready!

Start inviting friends and planning dinners! 🍽️

**Need help?** Check the full documentation in `MVP_IMPLEMENTATION.md`

