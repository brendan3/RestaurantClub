# RestaurantClub iOS App

This is a native iOS wrapper for the RestaurantClub web application using SwiftUI and WKWebView.

## 🚀 Quick Start

### Prerequisites
- macOS with Xcode 15+ installed
- RestaurantClub web app running (locally or deployed)

### Setup in Xcode

1. **Open Xcode** and create a new project:
   - File → New → Project
   - Choose **iOS** → **App**
   - Click **Next**

2. **Configure the project**:
   - **Product Name**: `RestaurantClubiOS`
   - **Team**: Select your Apple Developer account (or "None" for simulator only)
   - **Organization Identifier**: `com.yourname.restaurantclub` (or your preference)
   - **Interface**: **SwiftUI**
   - **Language**: **Swift**
   - **Storage**: None
   - **Include Tests**: Uncheck both
   - Click **Next** and save outside this repo (e.g., `~/RestaurantClubiOS`)

3. **Replace the default files**:
   - Delete the default `ContentView.swift` and `RestaurantClubiOSApp.swift`
   - Copy all `.swift` files from `ios/RestaurantClubiOS/RestaurantClubiOS/` to your Xcode project
   - Right-click your project in Xcode → "Add Files to RestaurantClubiOS"
   - Select all the Swift files you just copied

4. **Add Info.plist configuration**:
   - In Xcode, select your project → Target → Info tab
   - Add the App Transport Security settings from `ios/RestaurantClubiOS/RestaurantClubiOS/Info.plist`
   - Or replace the entire Info.plist file

5. **Update the web app URL**:
   - Open `Configuration.swift`
   - For production, update the `#else` block with your deployed URL:
     ```swift
     static let webAppURL = "https://your-app.railway.app"
     ```

6. **Run the app**:
   - Select a simulator (e.g., iPhone 15 Pro)
   - Press **⌘R** or click the Play button
   - The web app should load inside the native iOS shell!

---

## 📁 File Structure

```
ios/RestaurantClubiOS/RestaurantClubiOS/
├── RestaurantClubiOSApp.swift    # App entry point
├── ContentView.swift              # Main view (loads WebView)
├── WebView.swift                  # WKWebView wrapper
├── Configuration.swift            # URL configuration (dev/prod)
├── Info.plist                     # App configuration & permissions
└── Assets.xcassets/               # App icons and assets
```

---

## 🔧 Configuration

### Development vs Production URLs

The app uses different URLs based on build configuration:

- **DEBUG** (Simulator/Development): `http://localhost:5000`
- **RELEASE** (Production): Update in `Configuration.swift`

### App Transport Security (ATS)

The `Info.plist` allows:
- ✅ Local networking (for `localhost` during development)
- ❌ Arbitrary loads (for security)

For production with HTTPS, no changes needed. For HTTP in production (not recommended), you'll need to add exceptions.

---

## 🎨 Customization

### App Icon
1. Create app icons (1024x1024 PNG)
2. In Xcode: Assets.xcassets → AppIcon → Drag your icon

### App Name
- Change in `Info.plist`: `CFBundleDisplayName`

### Splash Screen
- Add a `LaunchScreen.storyboard` or use SwiftUI launch screen

---

## 🔌 Using SweetPad in Cursor

SweetPad lets you edit Swift code in Cursor while using Xcode for builds/signing.

### Install SweetPad

1. Open **Cursor**
2. Extensions (⌘⇧X) → Search "SweetPad"
3. Click **Install**

### Configure SweetPad

1. Open the iOS project folder in Cursor:
   ```bash
   cursor ~/RestaurantClubiOS
   ```

2. Open Command Palette (⌘⇧P) → Type:
   ```
   SweetPad: Select Xcode Workspace
   ```

3. Navigate to your `.xcodeproj` file and select it

4. SweetPad will now provide:
   - ✅ Swift syntax highlighting
   - ✅ Code completion
   - ✅ Build commands
   - ✅ Simulator control

### Workflow with SweetPad

- **Edit code**: Use Cursor with SweetPad
- **Build/Run**: Use SweetPad commands or Xcode
- **Signing/Capabilities**: Use Xcode
- **SwiftUI Previews**: Use Xcode (SweetPad doesn't support previews)

---

## 🚢 Deployment

### TestFlight (Beta Testing)

1. In Xcode, select **Any iOS Device** as the target
2. Product → Archive
3. Distribute App → App Store Connect
4. Upload to TestFlight
5. Add testers in App Store Connect

### App Store

1. Complete App Store Connect listing
2. Submit for review
3. Wait for approval (usually 1-3 days)

---

## 🐛 Troubleshooting

### "Cannot connect to localhost"
- Make sure your dev server is running: `npm run dev`
- Check the URL in `Configuration.swift`
- Verify ATS settings in `Info.plist`

### "No such module 'WebKit'"
- WebKit is a system framework, should work automatically
- Try: Product → Clean Build Folder (⌘⇧K)

### SweetPad not working
- Make sure you selected the correct `.xcodeproj` file
- Restart Cursor
- Check SweetPad extension is enabled

### Signing errors
- Select your Team in Xcode project settings
- For simulator testing, "None" is fine
- For device testing, you need an Apple Developer account

---

## 📚 Next Steps

1. ✅ Get the web app running locally
2. ✅ Create the iOS project in Xcode
3. ✅ Test on simulator
4. 🔄 Deploy web app to production
5. 🔄 Update `Configuration.swift` with production URL
6. 🔄 Test on real device
7. 🔄 Add app icon and splash screen
8. 🔄 Submit to TestFlight/App Store

---

## 💡 Tips

- **Keep Xcode open** for project settings and signing
- **Use Cursor + SweetPad** for day-to-day Swift editing
- **Test on real device** early to catch iOS-specific issues
- **Use HTTPS in production** for best security and performance

