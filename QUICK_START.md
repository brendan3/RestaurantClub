# ⚡ Quick Start Checklist

Use this as your step-by-step guide to get your iPhone app running!

---

## ✅ Completed

- [x] Fixed server error (removed `reusePort` option)
- [x] Web app running on `http://localhost:5000`
- [x] Created all iOS Swift files
- [x] Set up deployment configurations
- [x] Created comprehensive documentation

---

## 📋 Your Next Steps

### Step 1: Test the Web App (5 minutes)

1. **Open browser**: Go to `http://localhost:5000`
2. **Test on mobile size**: 
   - Chrome: Press F12 → Click device icon (or Ctrl+Shift+M)
   - Choose iPhone 14 Pro or similar
3. **Verify it looks good**: Check layout, buttons, navigation

---

### Step 2: Deploy Web App (10 minutes)

**Choose Railway (easiest):**

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `jpiece3/RestaurantClub`
5. Click "+ New" → "Database" → "Add PostgreSQL"
6. Wait for deployment (~2-3 minutes)
7. Click "Settings" → "Generate Domain"
8. **Copy your URL** (e.g., `https://restaurantclub-production.up.railway.app`)

✅ **Done!** Your web app is live.

---

### Step 3: Create iOS Project in Xcode (10 minutes)

1. **Open Xcode**
2. **File** → **New** → **Project**
3. Choose **iOS** → **App**
4. Configure:
   - Product Name: `RestaurantClubiOS`
   - Team: Your Apple ID (or None for simulator)
   - Organization Identifier: `com.yourname.restaurantclub`
   - Interface: **SwiftUI**
   - Language: **Swift**
5. Save to `~/RestaurantClubiOS` (outside this repo)

---

### Step 4: Add Swift Files (5 minutes)

1. **In Finder**: Navigate to:
   ```
   /Users/BrendanPinder/RestaurantClub/ios/RestaurantClubiOS/RestaurantClubiOS/
   ```

2. **Copy these 4 files**:
   - `RestaurantClubiOSApp.swift`
   - `ContentView.swift`
   - `WebView.swift`
   - `Configuration.swift`

3. **In Xcode**:
   - Delete the default `ContentView.swift` and `RestaurantClubiOSApp.swift`
   - Right-click `RestaurantClubiOS` folder → "Add Files to RestaurantClubiOS..."
   - Select the 4 files you copied
   - Check "Copy items if needed"
   - Click **Add**

---

### Step 5: Configure Info.plist (3 minutes)

1. In Xcode, select your **project** (top of sidebar)
2. Select **Target** → **Info** tab
3. Right-click → "Add Row"
4. Add:
   ```
   App Transport Security Settings (Dictionary)
     └─ Allow Local Networking (Boolean) = YES
   ```

---

### Step 6: Update Production URL (2 minutes)

1. Open `Configuration.swift` in Xcode
2. Find line ~17 (the `#else` block)
3. Replace with your Railway URL:
   ```swift
   #else
   static let webAppURL = "https://your-app.railway.app"
   #endif
   ```

---

### Step 7: Run on Simulator (2 minutes)

1. In Xcode, select **iPhone 15 Pro** (or any iPhone)
2. Press **⌘R** (or click Play button)
3. Wait for build (~30 seconds first time)
4. **Your app launches!** 🎉

---

### Step 8: Test on Real Device (5 minutes)

1. Connect iPhone via USB
2. Select your iPhone in Xcode device menu
3. If signing error:
   - Go to **Signing & Capabilities**
   - Check "Automatically manage signing"
   - Select your Team (Apple ID)
4. Press **⌘R**
5. On iPhone: **Settings** → **General** → **VPN & Device Management**
   - Trust your developer certificate
6. **Launch app on your phone!** 📱

---

### Step 9: Install SweetPad (Optional, 5 minutes)

1. In **Cursor**: Press **⌘⇧X**
2. Search "SweetPad"
3. Click **Install**
4. Press **⌘⇧P** → Type: `SweetPad: Select Xcode Workspace`
5. Navigate to `~/RestaurantClubiOS/RestaurantClubiOS.xcodeproj`
6. Select it

Now you can edit Swift in Cursor! 🎨

---

## 🎯 Total Time: ~45 minutes

---

## 📚 Need More Details?

| If you need help with... | Read this guide... |
|--------------------------|-------------------|
| Deployment options | [DEPLOYMENT.md](DEPLOYMENT.md) |
| iOS setup details | [IOS_SETUP_GUIDE.md](IOS_SETUP_GUIDE.md) |
| SweetPad configuration | [SWEETPAD_SETUP.md](SWEETPAD_SETUP.md) |
| iOS-specific info | [ios/README.md](ios/README.md) |

---

## 🐛 Common Issues

### "Cannot connect to localhost"
- Make sure dev server is running: `npm run dev`
- Check URL in `Configuration.swift`

### Signing errors
- Add Apple ID: Xcode Preferences → Accounts
- Enable "Automatically manage signing"

### SweetPad not working
- Make sure you selected the `.xcodeproj` file
- Restart Cursor

---

## ✨ What You'll Have

After completing these steps:

- ✅ Web app deployed and accessible from anywhere
- ✅ Native iPhone app wrapping your web app
- ✅ App running on simulator
- ✅ App running on your real iPhone
- ✅ SweetPad configured for Swift development in Cursor

---

## 🎉 You Did It!

You now have a complete iPhone app built from your web app!

**Next steps:**
- Add app icon (see [IOS_SETUP_GUIDE.md](IOS_SETUP_GUIDE.md))
- Customize splash screen
- Add native features (notifications, etc.)
- Submit to TestFlight for beta testing
- Publish to App Store!

---

## 💡 Pro Tips

1. **Keep dev server running** while testing on simulator
2. **Use production URL** for real device testing
3. **Test on real device early** to catch iOS-specific issues
4. **Use SweetPad** to stay in Cursor for most development
5. **Keep Xcode open** for project settings and previews

---

**Ready? Start with Step 1!** 🚀

