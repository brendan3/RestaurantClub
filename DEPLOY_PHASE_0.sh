#!/bin/bash

# Phase 0 Deployment Script
# Run this to deploy UX fixes to Vercel

echo "🚀 Deploying Phase 0 UX Fixes..."
echo ""

cd /Users/BrendanPinder/RestaurantClub

# Check git status
echo "📊 Current git status:"
git status --short
echo ""

# Stage changes
echo "📦 Staging changes..."
git add .
echo ""

# Commit
echo "💾 Committing changes..."
git commit -m "Phase 0: Fix safe areas and improve button labels

- Add safe-area-inset support for bottom nav
- Improve content padding for notched devices
- Update button labels (New Post → Add Event)
- Camera and Plus buttons show Coming Soon toast"
echo ""

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push origin main
echo ""

echo "✅ Done! Vercel will auto-deploy in ~2 minutes"
echo ""
echo "📱 Test on iPhone after deployment completes"
echo "🌐 Check: https://restaurant-club-eight.vercel.app"

