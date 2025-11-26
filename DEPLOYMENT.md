# RestaurantClub Deployment Guide

## Quick Deploy Options

### Option 1: Railway (Recommended - Easiest)

Railway is perfect for full-stack Node.js apps with PostgreSQL.

1. **Sign up**: Go to [railway.app](https://railway.app) and sign in with GitHub
2. **New Project**: Click "New Project" → "Deploy from GitHub repo"
3. **Select Repo**: Choose `jpiece3/RestaurantClub`
4. **Add PostgreSQL**: 
   - Click "+ New" → "Database" → "Add PostgreSQL"
   - Railway will automatically set the `DATABASE_URL` environment variable
5. **Configure**:
   - Railway will auto-detect your app and use the settings from `railway.json`
   - It will run `npm run build && npm start`
6. **Deploy**: Click "Deploy" - Railway will build and deploy automatically
7. **Get URL**: Once deployed, click "Settings" → "Generate Domain" to get your public URL

**Cost**: Free tier includes 500 hours/month and $5 credit

---

### Option 2: Render

1. **Sign up**: Go to [render.com](https://render.com) and sign in with GitHub
2. **New Web Service**: Click "New +" → "Web Service"
3. **Connect Repo**: Select `jpiece3/RestaurantClub`
4. **Configure**:
   - **Name**: restaurantclub
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. **Add PostgreSQL**:
   - Go to Dashboard → "New +" → "PostgreSQL"
   - Once created, copy the "Internal Database URL"
   - Go back to your Web Service → "Environment"
   - Add variable: `DATABASE_URL` = (paste the database URL)
6. **Deploy**: Click "Create Web Service"

**Cost**: Free tier available (spins down after inactivity)

---

### Option 3: Vercel + Neon (Serverless)

For a serverless approach:

1. **Database**: Sign up at [neon.tech](https://neon.tech) and create a PostgreSQL database
2. **Vercel**: 
   - Install Vercel CLI: `npm i -g vercel`
   - Run: `vercel`
   - Follow prompts to link your project
3. **Environment Variables**:
   - Add `DATABASE_URL` in Vercel dashboard
4. **Deploy**: `vercel --prod`

**Cost**: Both have generous free tiers

---

## After Deployment

1. **Get your URL**: e.g., `https://restaurantclub-production.up.railway.app`
2. **Test it**: Open in browser and verify it works
3. **Update iOS app**: Replace `http://localhost:5000` with your production URL in the iOS app

---

## Environment Variables Needed

- `DATABASE_URL`: PostgreSQL connection string (automatically set by Railway/Render)
- `PORT`: Automatically set by hosting provider
- `NODE_ENV`: Set to `production` (usually automatic)

---

## Troubleshooting

- **Build fails**: Check that all dependencies are in `package.json` (not just `devDependencies`)
- **Database connection fails**: Verify `DATABASE_URL` is set correctly
- **App won't start**: Check logs in Railway/Render dashboard

