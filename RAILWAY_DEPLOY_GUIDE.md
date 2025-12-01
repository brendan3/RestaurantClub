# 🚂 Railway Deployment Guide

Complete step-by-step guide to deploy RestaurantClub backend to Railway.

---

## ✅ What We've Prepared

1. **Database Schema** - Complete PostgreSQL schema in `shared/schema.ts`
2. **Database Storage** - Drizzle ORM implementation in `server/dbStorage.ts`
3. **API Routes** - Updated to use database or mock data
4. **Seed Script** - Populate database with test data
5. **CORS** - Configured for Vercel frontend
6. **Auto-switching** - Uses DB if `DATABASE_URL` set, otherwise uses mocks

---

## 📋 Step 1: Push Code to GitHub

First, let's commit all our backend changes:

```bash
cd /Users/BrendanPinder/RestaurantClub

# Install new dependencies
npm install

# Stage all changes
git add .

# Commit
git commit -m "Phase 1: Complete backend with PostgreSQL support

- Add complete database schema (users, clubs, events, attendees, tags)
- Implement DatabaseStorage with Drizzle ORM
- Add seed script for test data
- Update API routes to use database
- Add CORS support for Vercel frontend
- Auto-switch between DB and mock data based on DATABASE_URL"

# Push to GitHub
git push origin main
```

---

## 📋 Step 2: Deploy to Railway

### 2.1 Create Railway Account

1. Go to **https://railway.app**
2. Click **"Login"** → **"Login with GitHub"**
3. Authorize Railway to access your GitHub repos

### 2.2 Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose **"brendan3/RestaurantClub"**
4. Railway will:
   - Detect Node.js project
   - Auto-configure build settings
   - Start initial deployment

### 2.3 Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Railway will:
   - Create PostgreSQL database
   - Automatically set `DATABASE_URL` environment variable
   - Link it to your service

### 2.4 Configure Environment Variables

Railway should auto-detect these, but verify:

| Variable | Value | Source |
|----------|-------|--------|
| `DATABASE_URL` | (auto-set) | PostgreSQL plugin |
| `NODE_ENV` | `production` | Auto-set by Railway |
| `PORT` | (auto-set) | Railway assigns dynamically |

**No manual configuration needed!** ✅

### 2.5 Verify Build Settings

Click on your service → **Settings** tab:

- **Build Command**: Should be `npm run build`
- **Start Command**: Should be `npm start`
- **Root Directory**: `/`

If not auto-detected, set them manually.

### 2.6 Wait for Deployment

Railway will:
1. Install dependencies (`npm install`)
2. Build your project (`npm run build`)
3. Push database schema (`npm run db:push`) - if configured
4. Start the server (`npm start`)

Watch the deployment logs in real-time!

---

## 📋 Step 3: Push Database Schema

Once deployed, push the schema to your Railway PostgreSQL:

### Option A: Using Railway CLI (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Push schema
railway run npm run db:push
```

### Option B: Set DATABASE_URL Locally

1. In Railway → PostgreSQL service → **Connect** tab
2. Copy the **Database URL**
3. In your local terminal:

```bash
cd /Users/BrendanPinder/RestaurantClub

# Set DATABASE_URL temporarily
export DATABASE_URL="postgresql://..."

# Push schema
npm run db:push

# Clear the variable
unset DATABASE_URL
```

---

## 📋 Step 4: Seed the Database

Populate with test data:

### Option A: Using Railway CLI

```bash
railway run npm run db:seed
```

### Option B: With DATABASE_URL

```bash
export DATABASE_URL="postgresql://..."
npm run db:seed
unset DATABASE_URL
```

You should see:
```
🌱 Seeding database...
✅ Created 5 users
✅ Created club: Downtown Foodies
✅ Added 5 members to club
✅ Created 3 events
✅ Added attendees to events
✅ Added tags to events
🎉 Database seeded successfully!
```

---

## 📋 Step 5: Get Your Railway URL

1. In Railway → Your service → **Settings** tab
2. Scroll to **Domains** section
3. Click **"Generate Domain"**
4. Copy your URL: `https://restaurantclub-production-XXXX.up.railway.app`

---

## 📋 Step 6: Test Your API

Test the deployed API:

```bash
# Replace with your Railway URL
RAILWAY_URL="https://your-app.up.railway.app"

# Health check
curl $RAILWAY_URL/api/health

# Should return:
# {"ok":true,"timestamp":"...","database":"connected"}

# Get events
curl $RAILWAY_URL/api/events

# Get upcoming events
curl $RAILWAY_URL/api/events/upcoming

# Get past events
curl $RAILWAY_URL/api/events/past
```

If you see data, **it's working!** 🎉

---

## 📋 Step 7: Connect Vercel Frontend

Now connect your Vercel frontend to the Railway backend:

1. Go to **https://vercel.com**
2. Select your **restaurant-club-eight** project
3. Go to **Settings** → **Environment Variables**
4. Add:
   ```
   VITE_API_BASE_URL = https://your-railway-url.up.railway.app
   ```
5. Click **Save**
6. **Redeploy** (Vercel auto-redeploys when you change env vars)

---

## 🧪 Testing End-to-End

1. Wait for Vercel to finish deploying (~2 min)
2. Open your iPhone app (it loads the Vercel URL)
3. Navigate to **History** page
4. You should see **real data from Railway database!**

**Data flow:**
```
iPhone App → Vercel Frontend → Railway Backend → PostgreSQL Database
```

---

## 🎯 Verification Checklist

- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] Service deployed successfully
- [ ] Database schema pushed (`db:push`)
- [ ] Database seeded with test data (`db:seed`)
- [ ] Railway URL obtained
- [ ] API endpoints return data (curl tests pass)
- [ ] Vercel env var set (`VITE_API_BASE_URL`)
- [ ] Vercel redeployed
- [ ] iPhone app shows real data

---

## 🐛 Troubleshooting

### Build Fails

**Error**: Dependencies not installing
**Fix**: Check `package.json` is committed and pushed

### Database Connection Error

**Error**: `DATABASE_URL not set`
**Fix**: 
1. Make sure PostgreSQL service is created
2. Check it's linked to your main service
3. Restart the service

### API Returns Empty Array

**Error**: `/api/events` returns `[]`
**Fix**: Run the seed script (`npm run db:seed`)

### CORS Error from Frontend

**Error**: `Access-Control-Allow-Origin` error
**Fix**: 
1. Check CORS configuration in `server/index.ts`
2. Make sure Vercel URL is in allowed origins
3. Redeploy Railway service

### Schema Push Fails

**Error**: `drizzle-kit push` fails
**Fix**:
1. Make sure `DATABASE_URL` is set correctly
2. Check PostgreSQL is running
3. Verify `drizzle.config.ts` is correct

---

## 💡 Pro Tips

1. **Watch Logs**: Railway provides real-time logs - watch them during deployment
2. **Database Browser**: Railway has a built-in database viewer
3. **Auto Deploys**: Railway auto-deploys when you push to GitHub
4. **Rollback**: Can easily rollback to previous deployments
5. **Environment**: Separate staging/production environments easily

---

## 📊 Expected Costs

**Free Tier includes:**
- 500 hours of compute/month
- $5 in usage credits
- Unlimited projects
- PostgreSQL database

**For RestaurantClub:**
- Estimate: $0-5/month (well within free tier)
- Can upgrade if needed later

---

## 🎉 Success!

Once everything is deployed and connected, you'll have:
- ✅ Backend API on Railway with PostgreSQL
- ✅ Frontend on Vercel
- ✅ iOS app loading real data
- ✅ Complete full-stack application!

**Ready to deploy? Start with Step 1!** 🚀

