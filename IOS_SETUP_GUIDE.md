# 📱 Complete iOS App Setup Guide

This guide will walk you through creating your iPhone app from the RestaurantClub web app.

---

## ✅ What We've Done So Far

1. ✅ **Fixed the server** - Removed macOS-incompatible `reusePort` option
2. ✅ **Web app is running** - Server running on `http://localhost:5000`
3. ✅ **Created deployment configs** - Ready for Railway/Render/Vercel
4. ✅ **Generated iOS Swift files** - All necessary code is in `ios/` folder

---

## 🎯 Next Steps (Do These Now)

### Step 1: Deploy Your Web App (Choose One)

#### Option A: Railway (Recommended - Easiest)

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select `jpiece3/RestaurantClub`
5. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
6. Railway auto-sets `DATABASE_URL` - no config needed!
7. Click **"Deploy"**
8. Once deployed: **Settings** → **"Generate Domain"**
9. Copy your URL (e.g., `https://restaurantclub-production.up.railway.app`)

**That's it!** Railway handles everything automatically.

#### Option B: Render

1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. **"New +"** → **"Web Service"**
4. Select `jpiece3/RestaurantClub`
5. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Create a PostgreSQL database: **"New +"** → **"PostgreSQL"**
7. Copy the **Internal Database URL**
8. Add to Web Service → **Environment**: `DATABASE_URL` = (paste URL)
9. Click **"Create Web Service"**
10. Copy your app URL once deployed

---

### Step 2: Create iOS Project in Xcode

1. **Open Xcode**
2. **File** → **New** → **Project**
3. Choose **iOS** → **App** → **Next**
4. Configure:
   - **Product Name**: `RestaurantClubiOS`
   - **Team**: Your Apple ID (or "None" for simulator only)
   - **Organization Identifier**: `com.yourname.restaurantclub`
   - **Interface**: **SwiftUI**
   - **Language**: **Swift**
   - Uncheck "Include Tests"
5. **Next** → Save somewhere like `~/RestaurantClubiOS` (outside this repo)

---

### Step 3: Add the Swift Files

You have two options:

#### Option A: Copy Files Manually (Easier)

1. Open Finder and navigate to:
   ```
   /Users/BrendanPinder/RestaurantClub/ios/RestaurantClubiOS/RestaurantClubiOS/
   ```

2. Copy these files:
   - `RestaurantClubiOSApp.swift`
   - `ContentView.swift`
   - `WebView.swift`
   - `Configuration.swift`

3. In Xcode:
   - Delete the default `ContentView.swift` and `RestaurantClubiOSApp.swift`
   - Right-click on the `RestaurantClubiOS` folder (yellow folder icon)
   - Choose **"Add Files to RestaurantClubiOS..."**
   - Select the 4 Swift files you copied
   - Make sure **"Copy items if needed"** is checked
   - Click **Add**

#### Option B: Use Xcode Directly

1. In Xcode, delete the default files
2. **File** → **New** → **File** → **Swift File**
3. Create each file and paste the contents from the `ios/` folder

---

### Step 4: Configure Info.plist

1. In Xcode, select your project (top of left sidebar)
2. Select the **Target** → **Info** tab
3. Right-click in the list → **"Add Row"**
4. Add these keys:

```xml
App Transport Security Settings (Dictionary)
  └─ Allow Local Networking (Boolean) = YES
```

Or copy the entire `Info.plist` from `ios/RestaurantClubiOS/RestaurantClubiOS/Info.plist`

---

### Step 5: Update Production URL

1. Open `Configuration.swift` in Xcode
2. Find the `#else` block (around line 17)
3. Replace the URL with your deployed URL:

```swift
#else
// Production
static let webAppURL = "https://restaurantclub-production.up.railway.app"
#endif
```

---

### Step 6: Run on Simulator

1. In Xcode, select a simulator: **iPhone 15 Pro** (or any iPhone)
2. Press **⌘R** or click the **Play** button
3. Wait for build to complete
4. Your app should launch with the web app inside! 🎉

---

### Step 7: Test on Real Device (Optional but Recommended)

1. Connect your iPhone via USB
2. In Xcode, select your iPhone from the device menu
3. If you see signing errors:
   - Select your project → Target → **Signing & Capabilities**
   - Check **"Automatically manage signing"**
   - Select your **Team** (Apple ID)
4. Press **⌘R** to build and run
5. On your iPhone, you may need to:
   - **Settings** → **General** → **VPN & Device Management**
   - Trust your developer certificate

---

## 🔌 Setting Up SweetPad (Optional but Recommended)

SweetPad lets you edit Swift code in Cursor with full IDE features.

### Install SweetPad

1. Open **Cursor**
2. Press **⌘⇧X** (Extensions)
3. Search for **"SweetPad"**
4. Click **Install**

### Configure SweetPad

1. In Cursor, open your iOS project:
   ```bash
   File → Open Folder → Navigate to ~/RestaurantClubiOS
   ```

2. Press **⌘⇧P** (Command Palette)
3. Type: `SweetPad: Select Xcode Workspace`
4. Navigate to your `RestaurantClubiOS.xcodeproj` file
5. Select it

### Using SweetPad

Now you can:
- ✅ Edit Swift code in Cursor with autocomplete
- ✅ Build from Cursor: **⌘⇧P** → `SweetPad: Build`
- ✅ Run on simulator: **⌘⇧P** → `SweetPad: Run`
- ✅ Get AI help with Swift code in Cursor

**Keep Xcode open for:**
- Project settings
- Signing & capabilities
- SwiftUI previews
- Initial project setup

---

## 🎨 Customization (Later)

### Add App Icon

1. Create a 1024x1024 PNG icon
2. In Xcode: **Assets.xcassets** → **AppIcon**
3. Drag your icon into the 1024x1024 slot
4. Xcode generates all sizes automatically

### Add Splash Screen

1. Create a `LaunchScreen.storyboard`
2. Or use SwiftUI launch screen (iOS 14+)

### Change App Name

Edit `Info.plist`:
```xml
<key>CFBundleDisplayName</key>
<string>RestaurantClub</string>
```

---

## 🚢 Deploying to App Store (Later)

### TestFlight (Beta Testing)

1. In Xcode: **Product** → **Archive**
2. **Distribute App** → **App Store Connect**
3. Upload
4. In [App Store Connect](https://appstoreconnect.apple.com):
   - Add testers
   - Send invites

### App Store Release

1. Complete app listing in App Store Connect
2. Submit for review
3. Wait 1-3 days for approval
4. Release!

---

## 🐛 Troubleshooting

### "Cannot connect to localhost"
- ✅ Make sure web app is running: `npm run dev`
- ✅ Check URL in `Configuration.swift`
- ✅ Verify Info.plist has "Allow Local Networking"

### "No such module 'WebKit'"
- ✅ Clean build: **⌘⇧K**
- ✅ Restart Xcode

### Signing Errors
- ✅ Add your Apple ID in Xcode Preferences → Accounts
- ✅ Enable "Automatically manage signing"
- ✅ For simulator only, "None" team is fine

### SweetPad Not Working
- ✅ Make sure you selected the `.xcodeproj` file
- ✅ Restart Cursor
- ✅ Check extension is enabled

---

## 📋 Checklist

- [ ] Deploy web app to Railway/Render
- [ ] Create iOS project in Xcode
- [ ] Copy Swift files from `ios/` folder
- [ ] Configure Info.plist
- [ ] Update production URL in `Configuration.swift`
- [ ] Test on simulator
- [ ] Test on real device
- [ ] Install SweetPad in Cursor
- [ ] Configure SweetPad with your Xcode project
- [ ] Add app icon
- [ ] Submit to TestFlight

---

## 🎉 You're Done!

You now have:
- ✅ A working web app
- ✅ Deployment ready configuration
- ✅ Complete iOS wrapper code
- ✅ SweetPad setup for Cursor + Swift development

**Questions?** Check the detailed guides:
- `DEPLOYMENT.md` - Web app deployment
- `ios/README.md` - iOS-specific details

**Next:** Deploy your web app, create the Xcode project, and you'll have a native iPhone app! 📱

